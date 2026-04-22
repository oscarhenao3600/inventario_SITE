# --- DOCKERFILE PARA EL BACKEND (SERVER) ---

# Usamos la imagen oficial de Node.js como base
FROM node:20-slim

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de definición de dependencias
COPY package*.json ./

# Instalamos solo las dependencias de producción para mantener la imagen ligera
RUN npm install --omit=dev

# Copiamos el resto del código de la aplicación
# El directorio 'uploads' debe ser manejado preferiblemente por un volumen en docker-compose
COPY . .

# Creamos la carpeta de uploads si no existe y damos permisos
RUN mkdir -p uploads && chmod 777 uploads

# El puerto 3001 es el que configuramos en index.js por defecto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["node", "index.js"]
