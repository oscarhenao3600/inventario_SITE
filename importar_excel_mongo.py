#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para importar y actualizar la base de datos MongoDB del proyecto Inventario SITE
desde un archivo Excel (.xlsx).

Características:
- Lee automáticamente la configuración desde el archivo .env del proyecto.
- Detecta dinámicamente la hoja de inventario (ej. 'Inventario Total' o primera hoja válida)
  y mapea las columnas por su encabezado (sin importar el orden o tildes).
- Crea un respaldo automático (colección `dispositivos_backup_YYYYMMDD_HHMMSS`) antes de
  reemplazar los datos.
- Sincroniza automáticamente la colección `instituciones` (instituciones y sedes) y recrea
  los índices de búsqueda en `dispositivos`.

Uso:
  python importar_excel_mongo.py "ruta/al/archivo.xlsx"
  python importar_excel_mongo.py "ruta/al/archivo.xlsx" --dry-run
  python importar_excel_mongo.py "ruta/al/archivo.xlsx" --sheet "Inventario Total"
  python importar_excel_mongo.py "ruta/al/archivo.xlsx" --modo upsert
"""

import argparse
import os
import sys
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote_plus

try:
    import openpyxl
except ImportError:
    print("[ERROR] Falta la librería 'openpyxl'. Instálala con: pip install openpyxl")
    sys.exit(1)

try:
    from pymongo import MongoClient, UpdateOne
except ImportError:
    print("[ERROR] Falta la librería 'pymongo'. Instálala con: pip install pymongo")
    sys.exit(1)


def normalize_text(text: str) -> str:
    """Elimina tildes, pasa a minúsculas y limpia espacios extras."""
    if text is None:
        return ""
    s = str(text).strip().lower()
    return "".join(
        c for c in unicodedata.normalize("NFD", s)
        if unicodedata.category(c) != "Mn"
    )


def clean_cell(val) -> str:
    """Convierte el valor de una celda de Excel a string limpio."""
    if val is None:
        return ""
    if isinstance(val, float) and val.is_integer():
        return str(int(val)).strip()
    return str(val).strip()


def parse_date(val, default_dt: datetime) -> datetime:
    """Intenta parsear una fecha de Excel o devuelve default_dt."""
    if isinstance(val, datetime):
        return val
    if not val:
        return default_dt
    s = str(val).strip()
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d", "%d/%m/%Y %H:%M:%S", "%d/%m/%Y"):
        try:
            return datetime.strptime(s[:19], fmt)
        except ValueError:
            continue
    return default_dt


def load_env_file(env_path: Path) -> dict:
    """Lee variables clave=valor desde el archivo .env sin requerir python-dotenv."""
    env_vars = {}
    if not env_path.exists():
        return env_vars
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env_vars[k.strip()] = v.strip().strip("'").strip('"')
    return env_vars


def get_mongo_connection(custom_uri: str = None, custom_db: str = None):
    """Obtiene el cliente de MongoDB y la base de datos leyendo .env automáticamente."""
    project_root = Path(__file__).resolve().parent
    env_path = project_root / ".env"
    if not env_path.exists() and (project_root.parent / ".env").exists():
        env_path = project_root.parent / ".env"

    env_vars = load_env_file(env_path)
    db_name = custom_db or os.environ.get("DB_NAME") or env_vars.get("DB_NAME", "inventario_educativo")

    if custom_uri:
        client = MongoClient(custom_uri, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")
        return client, client[db_name]

    # Construir candidatas de conexión (primero puerto externo Docker en localhost, luego local 27017)
    user = os.environ.get("MONGO_ROOT_USER") or env_vars.get("MONGO_ROOT_USER", "")
    password = os.environ.get("MONGO_ROOT_PASSWORD") or env_vars.get("MONGO_ROOT_PASSWORD", "")
    ext_port = os.environ.get("MONGO_EXTERNAL_PORT") or env_vars.get("MONGO_EXTERNAL_PORT", "49152")

    candidate_uris = []
    if user and password:
        encoded_user = quote_plus(user)
        encoded_pass = quote_plus(password)
        candidate_uris.append(
            f"mongodb://{encoded_user}:{encoded_pass}@localhost:{ext_port}/{db_name}?authSource=admin"
        )
        candidate_uris.append(
            f"mongodb://{encoded_user}:{encoded_pass}@localhost:27017/{db_name}?authSource=admin"
        )

    candidate_uris.append(f"mongodb://localhost:{ext_port}/{db_name}")
    candidate_uris.append(f"mongodb://localhost:27017/{db_name}")

    last_err = None
    for uri in candidate_uris:
        try:
            client = MongoClient(uri, serverSelectionTimeoutMS=4000)
            client.admin.command("ping")
            # Ocultar contraseña al imprimir
            safe_uri = uri.split("@")[-1] if "@" in uri else uri
            print(f"[OK] Conectado a MongoDB en: {safe_uri} (Base de datos: '{db_name}')")
            return client, client[db_name]
        except Exception as e:
            last_err = e

    print(f"[ERROR] No se pudo conectar a MongoDB. Verifica que el contenedor Docker esté activo.")
    print(f"Detalle del error: {last_err}")
    sys.exit(1)


# Diccionario de sinónimos de columnas (normalizados sin tildes y en minúsculas)
HEADER_ALIASES = {
    "dispositivo": ["dispositivo", "elemento", "tipo", "equipo", "tipo de dispositivo"],
    "institucion": ["institucion", "instutucion", "ie", "institucion educativa", "colegio"],
    "sede": ["sede"],
    "aula": ["aula", "ubicacion", "salon"],
    "placa": ["placa", "inventario"],
    "serial": ["serial", "serie", "no serie", "numero de serie"],
    "modelo": ["modelo", "marca"],
    "convenio": ["convenio", "contrato"],
    "notas": ["notas", "notes", "observaciones", "observacion", "nota"],
    "updatedBy": ["actualizado por", "updatedby", "modificado por", "usuario"],
    "createdAt": ["fecha de creacion", "createdat", "creado"],
    "updatedAt": ["fecha de actualizacion", "updatedat", "actualizado"],
}


def map_headers(row_values: list) -> dict:
    """
    Recibe una lista de valores de una fila y devuelve un mapeo {campo_bd: indice_columna_0_based}
    si la fila parece ser un encabezado válido.
    """
    normalized_row = [normalize_text(v) for v in row_values]
    col_map = {}

    for field, aliases in HEADER_ALIASES.items():
        for idx, cell_text in enumerate(normalized_row):
            if cell_text in aliases:
                col_map[field] = idx
                break

    return col_map


def find_target_sheet_and_headers(wb, preferred_sheet: str = None):
    """
    Busca la hoja adecuada y la fila donde están los encabezados.
    Prioriza 'preferred_sheet', luego 'Inventario Total', y si no, inspecciona las hojas.
    """
    sheet_candidates = []
    if preferred_sheet:
        if preferred_sheet in wb.sheetnames:
            sheet_candidates.append(wb[preferred_sheet])
        else:
            print(f"[ERROR] La hoja '{preferred_sheet}' no existe. Hojas disponibles: {wb.sheetnames}")
            sys.exit(1)
    else:
        # Priorizar 'Inventario Total' si existe
        for name in wb.sheetnames:
            if normalize_text(name) in ("inventario total", "inventario", "dispositivos", "bd"):
                sheet_candidates.append(wb[name])
        for name in wb.sheetnames:
            if wb[name] not in sheet_candidates:
                sheet_candidates.append(wb[name])

    for ws in sheet_candidates:
        # Revisar las primeras 10 filas buscando la fila de encabezados
        for row_idx, row in enumerate(ws.iter_rows(min_row=1, max_row=10, values_only=True), start=1):
            col_map = map_headers(list(row))
            # Consideramos válida una hoja si tiene al menos 'dispositivo' y ('placa' o 'serial' o 'institucion')
            if "dispositivo" in col_map and ("placa" in col_map or "serial" in col_map or "institucion" in col_map):
                return ws, row_idx, col_map

    print(f"[ERROR] No se encontró una tabla con encabezados válidos (Dispositivo, Placa, Serial, etc.).")
    print(f"Hojas inspeccionadas: {wb.sheetnames}")
    sys.exit(1)


def read_excel_records(excel_path: Path, sheet_name: str = None, username: str = "import_script_python"):
    """Lee todos los dispositivos del archivo Excel y devuelve la lista de documentos listos para MongoDB."""
    print(f"[INFO] Abriendo archivo Excel: {excel_path.name} ...")
    wb = openpyxl.load_workbook(excel_path, read_only=True, data_only=True)

    ws, header_row_idx, col_map = find_target_sheet_and_headers(wb, sheet_name)
    print(f"[INFO] Hoja seleccionada: '{ws.title}' (Encabezados en fila {header_row_idx})")
    print(f"[INFO] Columnas detectadas: {', '.join(f'{k}->Col {v+1}' for k, v in col_map.items())}")

    now = datetime.now(timezone.utc)
    records = []
    skipped_empty = 0

    for row_idx, row in enumerate(ws.iter_rows(min_row=header_row_idx + 1, values_only=True), start=header_row_idx + 1):
        if not row or all(cell is None or str(cell).strip() == "" for cell in row):
            skipped_empty += 1
            continue

        def get_field(field_name: str) -> str:
            idx = col_map.get(field_name)
            if idx is None or idx >= len(row):
                return ""
            return clean_cell(row[idx])

        dispositivo = get_field("dispositivo")
        placa = get_field("placa")
        serial = get_field("serial")
        institucion = get_field("institucion").upper()
        sede = get_field("sede").upper()
        aula = get_field("aula").upper()
        modelo = get_field("modelo")
        convenio = get_field("convenio")
        notas = get_field("notas")
        updated_by = get_field("updatedBy") or username

        # Ignorar filas vacías o de totales que no tienen dispositivo ni placa ni serial
        if not dispositivo and not placa and not serial:
            skipped_empty += 1
            continue

        raw_created = row[col_map["createdAt"]] if "createdAt" in col_map and col_map["createdAt"] < len(row) else None
        raw_updated = row[col_map["updatedAt"]] if "updatedAt" in col_map and col_map["updatedAt"] < len(row) else None

        doc = {
            "dispositivo": dispositivo,
            "aula": aula,
            "placa": placa,
            "serial": serial,
            "institucion": institucion,
            "sede": sede,
            "modelo": modelo,
            "convenio": convenio,
            "notas": notas,
            "createdBy": updated_by,
            "updatedBy": updated_by,
            "createdAt": parse_date(raw_created, now),
            "updatedAt": parse_date(raw_updated, now),
        }
        records.append(doc)

    wb.close()
    print(f"[INFO] Se leyeron {len(records):,} registros válidos del Excel (filas vacías omitidas: {skipped_empty}).")
    return records


def sync_instituciones(db, records: list, replace_mode: bool = True):
    """Sincroniza la colección 'instituciones' a partir de los dispositivos cargados."""
    inst_sedes = defaultdict(set)
    for r in records:
        inst = r.get("institucion", "").strip().upper()
        sede = r.get("sede", "").strip().upper()
        if inst:
            if sede:
                inst_sedes[inst].add(sede)
            else:
                inst_sedes[inst]  # asegura que exista la clave

    coll = db["instituciones"]
    now = datetime.now(timezone.utc)

    if replace_mode:
        coll.delete_many({})
        docs = [
            {
                "nombre": inst,
                "sedes": sorted(list(sedes)),
                "createdAt": now,
                "updatedAt": now,
            }
            for inst, sedes in sorted(inst_sedes.items())
        ]
        if docs:
            coll.insert_many(docs)
        print(f"[OK] Colección 'instituciones' actualizada con {len(docs)} instituciones.")
    else:
        for inst, sedes in inst_sedes.items():
            update_doc = {
                "$set": {"nombre": inst, "updatedAt": now},
                "$setOnInsert": {"createdAt": now},
            }
            if sedes:
                update_doc["$addToSet"] = {"sedes": {"$each": sorted(list(sedes))}}
            coll.update_one({"nombre": inst}, update_doc, upsert=True)
        print(f"[OK] Colección 'instituciones' sincronizada ({len(inst_sedes)} instituciones procesadas).")


def ensure_indexes(db):
    """Asegura que los índices de la colección 'dispositivos' estén creados."""
    coll = db["dispositivos"]
    coll.create_index([("placa", 1)])
    coll.create_index([("serial", 1)])
    coll.create_index([("sede", 1)])
    coll.create_index([("aula", 1)])
    print("[OK] Índices verificados en 'dispositivos' (placa, serial, sede, aula).")


def print_summary(records: list):
    """Muestra un resumen en consola de los datos cargados."""
    by_conv = Counter(r.get("convenio") or "SIN_CONVENIO" for r in records)
    by_dev = Counter(r.get("dispositivo") or "SIN_TIPO" for r in records)
    insts = {r.get("institucion") for r in records if r.get("institucion")}
    sedes = {(r.get("institucion"), r.get("sede")) for r in records if r.get("sede")}

    print("\n" + "=" * 65)
    print(" RESUMEN DE DATOS DEL EXCEL")
    print("=" * 65)
    print(f"  Total dispositivos : {len(records):,}")
    print(f"  Instituciones      : {len(insts)}")
    print(f"  Sedes              : {len(sedes)}")
    print("\n  --- Por Convenio ---")
    for conv, cnt in sorted(by_conv.items()):
        print(f"    {conv:<25} : {cnt:,}")
    print("\n  --- Por Tipo de Dispositivo ---")
    for dev, cnt in sorted(by_dev.items(), key=lambda x: (-x[1], x[0])):
        print(f"    {dev:<50} : {cnt:,}")
    print("=" * 65 + "\n")


def select_file_dialog() -> str:
    """Abre una ventana de selección de archivo si no se pasó ruta por argumento."""
    try:
        import tkinter as tk
        from tkinter import filedialog
        root = tk.Tk()
        root.withdraw()
        root.attributes("-topmost", True)
        file_path = filedialog.askopenfilename(
            title="Selecciona el archivo Excel actualizado para subir a MongoDB",
            filetypes=[("Archivos de Excel", "*.xlsx")],
        )
        root.destroy()
        return file_path
    except Exception:
        return ""


def main():
    parser = argparse.ArgumentParser(
        description="Importa y actualiza los dispositivos en MongoDB desde un archivo Excel (.xlsx)."
    )
    parser.add_argument(
        "archivo",
        nargs="?",
        help="Ruta al archivo Excel (.xlsx). Si no se indica, se abrirá un selector de archivos.",
    )
    parser.add_argument(
        "--sheet",
        default=None,
        help="Nombre exacto de la hoja de Excel a leer (por defecto detecta 'Inventario Total' o la primera válida).",
    )
    parser.add_argument(
        "--modo",
        choices=["reemplazar", "upsert"],
        default="reemplazar",
        help="'reemplazar' (por defecto) hace backup y reemplaza toda la colección; 'upsert' actualiza por placa/serial.",
    )
    parser.add_argument(
        "--no-backup",
        action="store_true",
        help="No crear colección de respaldo antes de reemplazar.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simula la lectura del Excel y muestra las estadísticas sin modificar la base de datos.",
    )
    parser.add_argument(
        "--uri",
        default=None,
        help="URI de MongoDB personalizada (por defecto se lee de .env).",
    )
    parser.add_argument(
        "--db",
        default=None,
        help="Nombre de la base de datos (por defecto 'inventario_educativo').",
    )

    args = parser.parse_args()

    archivo_str = args.archivo
    if not archivo_str:
        print("[INFO] No se especificó ruta por consola. Abriendo selector de archivo...")
        archivo_str = select_file_dialog()
        if not archivo_str:
            print("[ERROR] Debes indicar la ruta del archivo Excel.")
            print('Ejemplo: python importar_excel_mongo.py "mi_archivo.xlsx"')
            sys.exit(1)

    excel_path = Path(archivo_str).expanduser().resolve()
    if not excel_path.exists():
        print(f"[ERROR] El archivo no existe: {excel_path}")
        sys.exit(1)

    # 1. Leer y validar el Excel
    records = read_excel_records(excel_path, sheet_name=args.sheet)
    if not records:
        print("[ERROR] No se encontraron registros para importar. Operación cancelada.")
        sys.exit(1)

    print_summary(records)

    if args.dry_run:
        print("[DRY-RUN] Simulación completada con éxito. No se realizaron cambios en MongoDB.")
        return

    # 2. Conectar a MongoDB
    client, db = get_mongo_connection(custom_uri=args.uri, custom_db=args.db)
    coll = db["dispositivos"]

    try:
        existing_count = coll.count_documents({})
        print(f"[INFO] Documentos actuales en 'dispositivos': {existing_count:,}")

        if args.modo == "reemplazar":
            # Crear respaldo previo en la base de datos
            if not args.no_backup and existing_count > 0:
                backup_name = f"dispositivos_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                print(f"[BACKUP] Creando respaldo de seguridad en colección '{backup_name}' ...")
                coll.aggregate([{"$match": {}}, {"$out": backup_name}])
                print(f"[OK] Respaldo creado exitosamente ({db[backup_name].count_documents({}):,} documentos).")

                # Limpiar backups antiguos dejando solo los 3 más recientes para no llenar el disco
                backup_colls = sorted(
                    [name for name in db.list_collection_names() if name.startswith("dispositivos_backup_")]
                )
                while len(backup_colls) > 3:
                    old_bkp = backup_colls.pop(0)
                    db[old_bkp].drop()
                    print(f"[INFO] Respaldo antiguo eliminado: {old_bkp}")

            # Reemplazar todos los documentos en lotes
            print("[INFO] Limpiando colección 'dispositivos' actual...")
            coll.delete_many({})

            batch_size = 5000
            total_inserted = 0
            print(f"[INFO] Insertando {len(records):,} dispositivos en MongoDB...")
            for i in range(0, len(records), batch_size):
                batch = records[i : i + batch_size]
                res = coll.insert_many(batch, ordered=False)
                total_inserted += len(res.inserted_ids)
                print(f"  -> Progreso: {total_inserted:,} / {len(records):,}")

            ensure_indexes(db)
            sync_instituciones(db, records, replace_mode=True)
            print(f"\n[ÉXITO] Se reemplazó el inventario con {total_inserted:,} dispositivos actualizados.")

        else:
            # Modo Upsert por placa o serial
            print(f"[INFO] Ejecutando modo UPSERT para {len(records):,} registros...")
            generic_values = {"", "0", "N/A", "SIN SERIAL", "S/N", "SIN PLACA", "NONE", "NA", ".", "-", "PENDIENTE", "PENDIENTES"}
            ops = []
            inserts_direct = []

            for r in records:
                placa = r["placa"].upper()
                serial = r["serial"].upper()
                update_fields = {k: v for k, v in r.items() if k != "createdAt"}

                if placa and placa not in generic_values:
                    ops.append(
                        UpdateOne(
                            {"placa": r["placa"]},
                            {"$set": update_fields, "$setOnInsert": {"createdAt": r["createdAt"]}},
                            upsert=True,
                        )
                    )
                elif serial and serial not in generic_values:
                    ops.append(
                        UpdateOne(
                            {"serial": r["serial"]},
                            {"$set": update_fields, "$setOnInsert": {"createdAt": r["createdAt"]}},
                            upsert=True,
                        )
                    )
                else:
                    inserts_direct.append(r)

            matched = modified = upserted = 0
            batch_size = 2000
            for i in range(0, len(ops), batch_size):
                res = coll.bulk_write(ops[i : i + batch_size], ordered=False)
                matched += res.matched_count
                modified += res.modified_count
                upserted += res.upserted_count
                print(f"  -> Procesados {min(i + batch_size, len(ops)):,} / {len(ops):,} upserts...")

            if inserts_direct:
                coll.insert_many(inserts_direct, ordered=False)

            ensure_indexes(db)
            sync_instituciones(db, records, replace_mode=False)
            print(
                f"\n[ÉXITO] Upsert finalizado: {modified:,} actualizados, "
                f"{upserted + len(inserts_direct):,} nuevos insertados, {matched:,} coincidencias."
            )

        final_count = coll.count_documents({})
        print(f"[VERIFICACIÓN] Total de documentos ahora en 'dispositivos': {final_count:,}")

    finally:
        client.close()


if __name__ == "__main__":
    main()
