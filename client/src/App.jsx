import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, AlertCircle, FileSpreadsheet, Filter, Check, X, Trash2, PieChart, FileUp, Download, LogOut, Lock, User, Users } from 'lucide-react';

const noSerialTypes = [
  "Servidor Portable de Aula SITE Sistema Cloud",
  "Soporte Electrónico Pantalla Interactiva Táctil",
  "Carro Cargador de Tabletas",
  "Silla De Mesa interactiva"
];

const App = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [isChief, setIsChief] = useState(localStorage.getItem('isChief') === 'true');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dispositivos, setDispositivos] = useState([]);
  const [duplicados, setDuplicados] = useState([]);
  const [filtroSede, setFiltroSede] = useState('');
  const [appliedFiltroSede, setAppliedFiltroSede] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [dupField, setDupField] = useState('placa');
  const [filtroTipoDup, setFiltroTipoDup] = useState('');
  const [appliedFiltroTipoDup, setAppliedFiltroTipoDup] = useState('');
  const [stats, setStats] = useState({ 
    total: 0, 
    totalSedes: 0, 
    totalInstituciones: 0, 
    totalDuplicadosPlaca: 0, 
    totalDuplicadosSerial: 0,
    sedes: [],
    instituciones: []
  });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStats, setImportStats] = useState(null);
  const [tiposDispositivo, setTiposDispositivo] = useState([]);
  const [showOtroInput, setShowOtroInput] = useState(false);
  const [convenios, setConvenios] = useState([]);
  const [filtroConvenio, setFiltroConvenio] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 100;
  
  // Advanced filters
  const [filtroInstitucion, setFiltroInstitucion] = useState('');
  const [filtroSedeSearch, setFiltroSedeSearch] = useState('');
  const [filtroAulaSearch, setFiltroAulaSearch] = useState('');
  const [filtroTipoSearch, setFiltroTipoSearch] = useState('');
  const [filtroVerificacion, setFiltroVerificacion] = useState('');
  
  const [aulasSearch, setAulasSearch] = useState([]);
  const [aulasDup, setAulasDup] = useState([]);
  const [filtroAulaDup, setFiltroAulaDup] = useState('');
  const [appliedFiltroAulaDup, setAppliedFiltroAulaDup] = useState('');
  const [includeGeneric, setIncludeGeneric] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    placa: '', serial: '', dispositivo: '', institucion: '', sede: '', aula: '', modelo: '', convenio: '', notas: ''
  });
  const [validationError, setValidationError] = useState('');
  
  // ── Loading states ──────────────────────────────────────────────────────────
  const [loadingSearch, setLoadingSearch]       = useState(false);
  const [loadingDupes, setLoadingDupes]         = useState(false);
  const [loadingSave, setLoadingSave]           = useState(false);
  const [loadingExport, setLoadingExport]       = useState(false);
  const [loadingExportTotal, setLoadingExportTotal] = useState(false);
  const [loadingMsg, setLoadingMsg]             = useState('');
  // ────────────────────────────────────────────────────────────────────────────

  // Comparative Dashboard State
  const [showCompModal, setShowCompModal] = useState(false);
  const [compSede, setCompSede] = useState('');
  const [compData, setCompData] = useState([]);
  const [matchedExcelSede, setMatchedExcelSede] = useState('');
  const [loadingComp, setLoadingComp] = useState(false);
  const [compError, setCompError] = useState('');

  // Role Assignment State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleForm, setRoleForm] = useState({ targetUsername: '', isAdmin: false, isLector: true, isChief: false });
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState('');
  const [roleSuccess, setRoleSuccess] = useState('');

  // Plaque Generator State
  const [showPlacasModal, setShowPlacasModal] = useState(false);
  const [lotePlacas, setLotePlacas] = useState([]);
  const [placasConfig, setPlacasConfig] = useState({ inicio: '', prefijo: '' });
  const [placasForm, setPlacasForm] = useState({ tipo: '', cantidad: '' });
  const [generatingPlacas, setGeneratingPlacas] = useState(false);

  // Configurar Interceptor de Axios para incluir el Token
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar errores 401/403 (token expirado)
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchTipos();
      fetchConvenios();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      const fetchAulas = async () => {
        try {
          const res = await axios.get(`/api/aulas${filtroSedeSearch ? `?sede=${encodeURIComponent(filtroSedeSearch)}` : ''}`);
          setAulasSearch(res.data);
        } catch (err) { console.error("Error fetching aulas search", err); }
      };
      fetchAulas();
    }
  }, [filtroSedeSearch, token]);

  useEffect(() => {
    if (token) {
      const fetchAulas = async () => {
        try {
          const res = await axios.get(`/api/aulas${filtroSede ? `?sede=${encodeURIComponent(filtroSede)}` : ''}`);
          setAulasDup(res.data);
        } catch (err) { console.error("Error fetching aulas dup", err); }
      };
      fetchAulas();
    }
  }, [filtroSede, token]);

  const fetchTipos = async () => {
    try {
      const res = await axios.get('/api/tipos');
      setTiposDispositivo(res.data);
    } catch (err) {
      console.error("Error fetching types", err);
    }
  };

  const fetchConvenios = async () => {
    try {
      const res = await axios.get('/api/convenios');
      setConvenios(res.data);
    } catch (err) {
      console.error("Error fetching convenios", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/stats');
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats", err);
    }
  };

  const handleSearch = async () => {
    setLoadingSearch(true);
    setLoadingMsg('Consultando inventario...');
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (filtroTipoSearch) params.append('tipo', filtroTipoSearch);
      if (filtroInstitucion) params.append('institucion', filtroInstitucion);
      if (filtroSedeSearch) params.append('sede', filtroSedeSearch);
      if (filtroAulaSearch) params.append('aula', filtroAulaSearch);
      if (filtroVerificacion) params.append('verificacion', filtroVerificacion);
      if (filtroConvenio) params.append('convenio', filtroConvenio);

      const res = await axios.get(`/api/dispositivos?${params.toString()}`);
      setDispositivos(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error searching", err);
    } finally {
      setLoadingSearch(false);
      setLoadingMsg('');
    }
  };

  const fetchDuplicados = async () => {
    setLoadingDupes(true);
    setLoadingMsg('Buscando duplicados...');
    try {
      const res = await axios.get(`/api/duplicados?campo=${dupField}&sede=${filtroSede}&tipo=${filtroTipoDup}&aula=${filtroAulaDup}&includeGeneric=${includeGeneric}`);
      setDuplicados(res.data);
      // Aplicar filtros a la vista solo cuando se realiza la consulta
      setAppliedFiltroSede(filtroSede);
      setAppliedFiltroTipoDup(filtroTipoDup);
      setAppliedFiltroAulaDup(filtroAulaDup);
    } catch (err) {
      console.error("Error fetching duplicates", err);
    } finally {
      setLoadingDupes(false);
      setLoadingMsg('');
    }
  };

  const isGeneric = (val) => {
    if (!val || val === "SIN DATO") return true;
    const genericValues = ["0", "N/A", "SIN SERIAL", "S/N", "SIN PLACA", "NONE", "NA", ".", "-", "PENDIENTE", "PENDIENTES"];
    return genericValues.includes(val.toString().toUpperCase().trim());
  };

  const hasTemporalSuffix = (val) => {
    if (!val) return false;
    return /-\d+$/.test(val.toString().trim());
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este dispositivo?')) {
      try {
        await axios.delete(`/api/dispositivos/${id}`);
        activeTab === 'search' ? handleSearch() : fetchDuplicados();
        fetchStats();
      } catch (err) {
        console.error("Error deleting", err);
      }
    }
  };

  const openModal = (device = null) => {
    if (device) {
      setEditingDevice(device);
      setFormData({ ...device });
      const isCustom = device.dispositivo && !tiposDispositivo.includes(device.dispositivo);
      setShowOtroInput(isCustom);
    } else {
      setEditingDevice(null);
      setFormData({ placa: '', serial: '', dispositivo: '', institucion: '', sede: '', aula: '', modelo: '', convenio: '', notas: '' });
      setShowOtroInput(false);
    }
    setValidationError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoadingSave(true);
    setLoadingMsg(editingDevice ? 'Actualizando dispositivo...' : 'Guardando dispositivo...');
    
    // Validar duplicados antes de guardar
    try {
      const validRes = await axios.post('/api/validar', {
        placa: formData.placa,
        serial: formData.serial,
        id: editingDevice ? editingDevice._id : null
      });

      if (!validRes.data.available) {
        setValidationError(`Atención: Ya existe un registro con esta ${validRes.data.reason}.`);
        setLoadingSave(false);
        setLoadingMsg('');
        return;
      }

      let savedDevice;
      if (editingDevice) {
        await axios.put(`/api/dispositivos/${editingDevice._id}`, formData);
        savedDevice = { ...formData, _id: editingDevice._id };
        setDispositivos(prev => prev.map(d => d._id === editingDevice._id ? savedDevice : d));
      } else {
        const postRes = await axios.post('/api/dispositivos', formData);
        const insertedId = postRes.data.insertedId || postRes.data._id;
        savedDevice = { ...formData, _id: insertedId };
        setDispositivos(prev => [savedDevice, ...prev]);
      }
      
      setShowModal(false);
      if (activeTab === 'dupes') {
        fetchDuplicados();
      }
      fetchStats();
      fetchTipos();
      fetchConvenios();
    } catch (err) {
      console.error("Error saving", err);
    } finally {
      setLoadingSave(false);
      setLoadingMsg('');
    }
  };

  const exportToExcel = async (data = dispositivos) => {
    setLoadingExport(true);
    setLoadingMsg('Generando archivo Excel...');
    try {
      const response = await axios.post('/api/exportar', { dispositivos: data }, { 
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventario_seleccion.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Error exporting", err);
      const msg = err.response?.data?.error || "Error al exportar a Excel.";
      alert(msg);
    } finally {
      setLoadingExport(false);
      setLoadingMsg('');
    }
  };

  const handleExportTotal = async () => {
    setLoadingExportTotal(true);
    setLoadingMsg('Exportando inventario completo...');
    try {
      const response = await axios.get('/api/exportar-total', { 
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventario_total_estructurado.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Error exporting total", err);
      alert("Error al exportar todo el inventario.");
    } finally {
      setLoadingExportTotal(false);
      setLoadingMsg('');
    }
  };

  const handleExportAula = (aulaName, items) => {
    // Recopilar todos los documentos del aula y sus duplicados
    const docsToExport = [];
    const seenIds = new Set();

    items.forEach(item => {
      // Agregar el dispositivo local
      if (!seenIds.has(item.device._id)) {
        docsToExport.push(item.device);
        seenIds.add(item.device._id);
      }
      // Agregar sus duplicados externos
      item.allDuplicates.forEach(dup => {
        if (!seenIds.has(dup._id)) {
          docsToExport.push(dup);
          seenIds.add(dup._id);
        }
      });
    });

    exportToExcel(docsToExport);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(endpoint, authForm);
      
      if (authMode === 'login') {
        const { token, username, role, isChief: chiefStatus } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', username);
        localStorage.setItem('role', role);
        localStorage.setItem('isChief', chiefStatus);
        setToken(token);
        setUser(username);
        setRole(role);
        setIsChief(chiefStatus);
      } else {
        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        setAuthMode('login');
        setAuthForm({ username: '', password: '' });
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || "Error en la autenticación");
    }
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();
    setRoleError('');
    setRoleSuccess('');
    
    if (!roleForm.targetUsername.trim()) {
      setRoleError('El nombre de usuario es requerido.');
      return;
    }

    setRoleLoading(true);
    try {
      const selectedRole = roleForm.isAdmin ? 'admin' : 'lector';
      const payload = {
        targetUsername: roleForm.targetUsername.trim(),
        role: selectedRole,
        isChief: roleForm.isChief
      };

      const res = await axios.post('/api/auth/assign-role', payload);
      setRoleSuccess(res.data.message || 'Permisos actualizados con éxito.');
      setRoleForm({ targetUsername: '', isAdmin: false, isLector: true, isChief: false });
    } catch (err) {
      setRoleError(err.response?.data?.error || "Error al asignar roles.");
    } finally {
      setRoleLoading(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar extensión
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (fileExt !== 'xlsx') {
      alert("Por favor, sube un archivo Excel (.xlsx)");
      e.target.value = ''; // Limpiar input
      return;
    }

    const confirmImport = window.confirm(`¿Estás seguro de importar el archivo "${file.name}"? Se actualizarán registros existentes y se insertarán los nuevos.`);
    if (!confirmImport) {
      e.target.value = '';
      return;
    }

    setImporting(true);
    setImportStats(null);
    setLoadingMsg('Procesando archivo Excel...');

    const formData = new FormData();
    formData.append('archivo', file);

    try {
      // Nota: El interceptor de axios ya añade el Header Authorization
      const res = await axios.post('/api/importar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setImportStats(res.data);
      fetchStats();
      fetchTipos();
      fetchConvenios();
      if (activeTab === 'search' && searchTerm) handleSearch();
    } catch (err) {
      console.error("Error importing file", err);
      const errorMsg = err.response?.data?.error || "Error al procesar el archivo Excel. Verifica el formato.";
      alert(errorMsg);
    } finally {
      setImporting(false);
      setLoadingMsg('');
      e.target.value = ''; // Limpiar para permitir subir el mismo archivo si es necesario
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('isChief');
    setToken(null);
    setUser(null);
    setRole(null);
    setIsChief(false);
    setDispositivos([]);
    setDuplicados([]);
    setCurrentPage(1);
  };

  const fetchComparativo = async () => {
    if (!compSede) return;
    setLoadingComp(true);
    setCompError('');
    try {
      const res = await axios.get(`/api/comparativo?sede=${encodeURIComponent(compSede)}`);
      setCompData(res.data.comparativo);
      setMatchedExcelSede(res.data.excelSede);
    } catch (err) {
      console.error("Error fetching comparativo", err);
      setCompError(err.response?.data?.error || "Error al obtener la comparación.");
    } finally {
      setLoadingComp(false);
    }
  };

  const openPlacasModal = async () => {
    setLotePlacas([]);
    setPlacasForm({ tipo: '', cantidad: '' });
    setPlacasConfig({ inicio: '', prefijo: '' });
    setShowPlacasModal(true);
    try {
      const res = await axios.get('/api/placas/next-available');
      setPlacasConfig({ inicio: res.data.nextPlaca.toString(), prefijo: '' });
    } catch (err) {
      console.error("Error fetching next available plaque", err);
    }
  };

  const totalPages = Math.ceil(dispositivos.length / ITEMS_PER_PAGE) || 1;
  const activePage = Math.max(1, Math.min(currentPage, totalPages));
  const currentDispositivos = dispositivos.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

  // ── Componente overlay reutilizable ─────────────────────────────────────────
  const isGlobalLoading = loadingSearch || loadingDupes || loadingSave || loadingExport || loadingExportTotal || importing;

  const LoadingOverlay = () => (
    <div className="loading-overlay">
      <div className="loading-overlay__card">
        <div className="spinner spinner-lg"></div>
        <p className="loading-overlay__text">{loadingMsg || 'Procesando...'}</p>
      </div>
    </div>
  );
  // ────────────────────────────────────────────────────────────────────────────

  if (!token) {
    return (
      <div className="container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem'}}>
        <div className="glass-card" style={{maxWidth: '400px', width: '100%', padding: '2rem'}}>
          <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <div style={{background: 'var(--primary)', width: '64px', height: '64px', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'}}>
              <Lock size={32} color="white" />
            </div>
            <h2 style={{fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem'}}>Inventario Aulas Site</h2>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>{authMode === 'login' ? 'Inicia sesión para continuar' : 'Crea una cuenta nueva'}</p>
          </div>

          <form onSubmit={handleAuth}>
            <div className="form-group">
              <label>Usuario</label>
              <div style={{position: 'relative'}}>
                <User size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, color: 'var(--text-main)'}} />
                <input 
                  required 
                  style={{paddingLeft: '2.75rem'}}
                  value={authForm.username} 
                  onChange={e => setAuthForm({...authForm, username: e.target.value})} 
                  placeholder="Tu usuario"
                />
              </div>
            </div>
            <div className="form-group" style={{marginTop: '1rem'}}>
              <label>Contraseña</label>
              <div style={{position: 'relative'}}>
                <Lock size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, color: 'var(--text-main)'}} />
                <input 
                  required 
                  type="password"
                  style={{paddingLeft: '2.75rem'}}
                  value={authForm.password} 
                  onChange={e => setAuthForm({...authForm, password: e.target.value})} 
                  placeholder="••••••••"
                />
              </div>
            </div>

            {authError && (
              <div style={{color: 'var(--danger)', marginTop: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.5rem'}}>
                <AlertCircle size={16} /> {authError}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '2rem', height: '48px', fontSize: '1rem'}}>
              {authMode === 'login' ? 'Entrar al Sistema' : 'Registrarse'}
            </button>
            
            <div style={{textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem'}}>
              <span style={{color: 'var(--text-muted)'}}>
                {authMode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              </span>
              <button 
                type="button"
                onClick={() => {setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError('');}}
                style={{background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', marginLeft: '0.5rem'}}
              >
                {authMode === 'login' ? 'Regístrate aquí' : 'Inicia sesión'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Overlay global de carga */}
      {isGlobalLoading && <LoadingOverlay />}
      <header>
        {/* Marca / título */}
        <div className="header-brand">
          <div className="header-logo">
            <FileSpreadsheet size={24} color="white" />
          </div>
          <div>
            <h1>Inventario Aulas Site</h1>
            <p style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>
              Bienvenido, <strong style={{color: 'var(--text-main)'}}>{user}</strong>
            </p>
          </div>
        </div>

        {/* Acciones del header */}
        <div className="header-actions">
          {isChief && (
            <div className="header-action-group">
              <button
                className="btn btn-chief"
                onClick={() => { setShowCompModal(true); setCompData([]); setCompSede(''); }}
              >
                <PieChart size={16} /><span>Referencia</span>
              </button>
              <button
                className="btn btn-outline btn-chief-outline"
                onClick={() => { setShowRoleModal(true); setRoleError(''); setRoleSuccess(''); setRoleForm({ targetUsername: '', isAdmin: false, isLector: true, isChief: false }); }}
              >
                <Users size={16} /><span>Roles</span>
              </button>
            </div>
          )}
          {role === 'admin' && (
            <div className="header-action-group">
              <button className="btn btn-outline" onClick={handleExportTotal} title="Exportar todo el inventario">
                <Download size={16} /><span className="hide-mobile">Exportar Todo</span>
              </button>
              <button className="btn btn-outline" onClick={() => setShowImportModal(true)} title="Importar desde Excel">
                <FileUp size={16} /><span className="hide-mobile">Importar</span>
              </button>
              <button className="btn btn-outline" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }} onClick={openPlacasModal} title="Generar placas en lote">
                <FileSpreadsheet size={16} /><span>Generar Placas</span>
              </button>
              <button className="btn btn-primary" onClick={() => openModal()}>
                <Plus size={16} /><span>Nuevo</span>
              </button>
            </div>
          )}
          <button className="btn btn-logout" onClick={handleLogout} title="Cerrar sesión">
            <LogOut size={16} />
          </button>
        </div>
      </header>
      
      <div className="stats-grid" style={{marginBottom: '2.5rem'}}>
        <div className="glass-card stat-item">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)'}}>Total Dispositivos</span>
            <PieChart size={20} color="var(--primary)" />
          </div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="glass-card stat-item">
          <span style={{fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)'}}>Instituciones</span>
          <div className="stat-value">{stats.totalInstituciones}</div>
        </div>
        <div className="glass-card stat-item">
          <span style={{fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)'}}>Sedes</span>
          <div className="stat-value">{stats.totalSedes}</div>
        </div>
        <div className="glass-card stat-item" style={{borderLeft: `4px solid ${stats.totalDuplicadosPlaca > 0 ? 'var(--danger)' : 'var(--success)'}`}}>
          <span style={{fontSize: '0.85rem', fontWeight: '600', color: stats.totalDuplicadosPlaca > 0 ? 'var(--danger)' : 'var(--text-muted)'}}>Duplicados (Placa)</span>
          <div className="stat-value" style={{color: stats.totalDuplicadosPlaca > 0 ? 'var(--danger)' : 'var(--success)'}}>
            {stats.totalDuplicadosPlaca}
          </div>
        </div>
        <div className="glass-card stat-item" style={{borderLeft: `4px solid ${stats.totalDuplicadosSerial > 0 ? 'var(--danger)' : 'var(--success)'}`}}>
          <span style={{fontSize: '0.85rem', fontWeight: '600', color: stats.totalDuplicadosSerial > 0 ? 'var(--danger)' : 'var(--text-muted)'}}>Duplicados (Serial)</span>
          <div className="stat-value" style={{color: stats.totalDuplicadosSerial > 0 ? 'var(--danger)' : 'var(--success)'}}>
            {stats.totalDuplicadosSerial}
          </div>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >🔍 Buscador</button>
        <button 
          className={`tab-btn ${activeTab === 'dupes' ? 'active' : ''}`}
          onClick={() => setActiveTab('dupes')}
        >⚠️ Duplicados</button>
      </div>

      {activeTab === 'search' ? (
        <section className="glass-card">
          <div className="search-container" style={{marginBottom: '2rem'}}>
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Buscar por placa o serial..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button className={`btn btn-primary${loadingSearch ? ' btn-loading' : ''}`} onClick={() => handleSearch()} style={{minWidth: '160px'}} disabled={loadingSearch}>
              {loadingSearch ? <span className="spinner spinner-sm"></span> : <Search size={18} />}
              {loadingSearch ? 'Consultando...' : 'Consultar'}
            </button>
          </div>

          <div className="glass-card" style={{padding: '1.25rem', marginBottom: '2rem', background: 'var(--border)'}}>
             <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                <div style={{flex: 1, minWidth: '200px'}}>
                  <label style={{fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem'}}>Filtrar por Institución</label>
                  <input 
                    className="search-input" 
                    list="instituciones-list"
                    style={{margin: 0, padding: '0.5rem'}} 
                    placeholder="Ej: I.E Santa Maria..."
                    value={filtroInstitucion}
                    onChange={(e) => setFiltroInstitucion(e.target.value.toUpperCase())}
                  />
                </div>
                <div style={{flex: 1, minWidth: '200px'}}>
                  <label style={{fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem'}}>Filtrar por Sede</label>
                  <input 
                    className="search-input" 
                    list="sedes-list"
                    style={{margin: 0, padding: '0.5rem'}} 
                    placeholder="Ej: Sede Principal..."
                    value={filtroSedeSearch}
                    onChange={(e) => setFiltroSedeSearch(e.target.value.toUpperCase())}
                  />
                </div>
                <div style={{flex: 1, minWidth: '200px'}}>
                  <label style={{fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem'}}>Filtrar por Aula</label>
                  <input 
                    className="search-input" 
                    list="aulas-search-list"
                    style={{margin: 0, padding: '0.5rem'}} 
                    placeholder="Ej: Sistemas 1..."
                    value={filtroAulaSearch}
                    onChange={(e) => setFiltroAulaSearch(e.target.value.toUpperCase())}
                  />
                </div>
                <div style={{flex: 1, minWidth: '200px'}}>
                  <label style={{fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: '600'}}>Tipo de Dispositivo</label>
                  <select 
                    className="search-input" 
                    style={{margin: 0, padding: '0.6rem 1rem', width: '100%'}} 
                    value={filtroTipoSearch}
                    onChange={(e) => setFiltroTipoSearch(e.target.value)}
                  >
                    <option value="">Todos los tipos</option>
                    {tiposDispositivo.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                <div style={{flex: 1, minWidth: '200px'}}>
                  <label style={{fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: '600'}}>Estado de Verificación (-1)</label>
                  <select 
                    className="search-input" 
                    style={{margin: 0, padding: '0.6rem 1rem', width: '100%'}} 
                    value={filtroVerificacion}
                    onChange={(e) => setFiltroVerificacion(e.target.value)}
                  >
                    <option value="">Todos los dispositivos</option>
                    <option value="todos">Equipos Temporales (Placa/Serial '-1')</option>
                    <option value="pendientes">Temporales - Por Verificar (Notas)</option>
                    <option value="verificados">Temporales - Ya Verificados (Notas)</option>
                  </select>
                </div>
                <div style={{flex: 1, minWidth: '200px'}}>
                  <label style={{fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: '600'}}>Convenio</label>
                  <select 
                    className="search-input" 
                    style={{margin: 0, padding: '0.6rem 1rem', width: '100%'}} 
                    value={filtroConvenio}
                    onChange={(e) => setFiltroConvenio(e.target.value)}
                  >
                    <option value="">Todos los convenios</option>
                    {convenios.map(conv => (
                      <option key={conv} value={conv}>{conv}</option>
                    ))}
                  </select>
                </div>
                <div style={{display: 'flex', alignItems: 'flex-end'}}>
                  <button className="btn btn-outline" onClick={() => {setFiltroInstitucion(''); setFiltroSedeSearch(''); setFiltroAulaSearch(''); setFiltroTipoSearch(''); setFiltroVerificacion(''); setFiltroConvenio(''); setSearchTerm('');}}>
                    Limpiar Filtros
                  </button>
                </div>
             </div>
          </div>

          {(filtroInstitucion || filtroSedeSearch) && dispositivos.length > 0 && (
            <div className="glass-card" style={{padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--primary)', background: 'var(--bg-input)'}}>
              <h4 style={{marginBottom: '1.25rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem'}}>
                <PieChart size={18} color="var(--primary)" />
                Resumen de Equipos {filtroSedeSearch ? `en Sede: ${filtroSedeSearch}` : `en Institución: ${filtroInstitucion}`}
              </h4>
              <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                {Object.entries(
                  dispositivos.reduce((acc, d) => {
                    const tipo = d.dispositivo || 'Desconocido';
                    acc[tipo] = (acc[tipo] || 0) + 1;
                    return acc;
                  }, {})
                ).sort((a, b) => b[1] - a[1]).map(([tipo, count]) => (
                  <div key={tipo} style={{background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: '0.75rem', flex: '1 1 200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'}}>
                    <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500'}}>{tipo}</span>
                    <span style={{fontWeight: '800', color: 'var(--primary)', fontSize: '1.1rem', background: 'rgba(99, 102, 241, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '0.5rem'}}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem'}}>
            <h3 style={{color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600'}}>{dispositivos.length} resultados encontrados</h3>
            <button className="btn btn-outline btn-mobile-full" onClick={() => exportToExcel()}>
              <FileSpreadsheet size={18} /> Exportar Selección
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Serial</th>
                  <th>Dispositivo</th>
                  <th>Convenio</th>
                  <th>Institución / Sede</th>
                  <th>Aula</th>
                  {role === 'admin' && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {loadingSearch ? (
                  // Skeleton rows mientras carga
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skel-${i}`} className="skeleton-row">
                      <td><div className="skeleton-cell" style={{width: '80px'}}></div></td>
                      <td><div className="skeleton-cell" style={{width: '120px'}}></div></td>
                      <td><div className="skeleton-cell" style={{width: '160px'}}></div></td>
                      <td><div className="skeleton-cell" style={{width: '100px'}}></div></td>
                      <td><div className="skeleton-cell" style={{width: '200px'}}></div></td>
                      <td><div className="skeleton-cell" style={{width: '100px'}}></div></td>
                      {role === 'admin' && <td><div className="skeleton-cell" style={{width: '60px'}}></div></td>}
                    </tr>
                  ))
                ) : (
                  currentDispositivos.map(d => (
                  <tr key={d._id}>
                    <td>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '0.2rem'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          <span style={{fontWeight: '700', color: hasTemporalSuffix(d.placa) ? 'var(--warning)' : 'var(--primary)'}}>{d.placa}</span>
                          {(d.notas || d.notes) && (d.notas || d.notes).trim() !== '' && (
                            <Check size={14} color="var(--success)" title="Tiene notas" />
                          )}
                        </div>
                        {hasTemporalSuffix(d.placa) && (
                          <span style={{fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 'bold'}}>⚠️ Placa Temp</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '0.2rem'}}>
                        <span style={{color: hasTemporalSuffix(d.serial) ? 'var(--warning)' : 'inherit', fontWeight: hasTemporalSuffix(d.serial) ? '700' : 'normal'}}>{d.serial}</span>
                        {hasTemporalSuffix(d.serial) && (
                          <span style={{fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 'bold'}}>⚠️ Serial Temp</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>{d.dispositivo}</div>
                      {(d.notas || d.notes) && (d.notas || d.notes).trim() !== '' && (
                        <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.2rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={d.notas || d.notes}>
                          📝 {d.notas || d.notes}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{fontWeight: d.convenio ? '600' : 'normal'}}>{d.convenio || '-'}</span>
                    </td>
                    <td>
                      <div style={{fontSize: '0.9rem'}}>{d.institucion}</div>
                      <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{d.sede}</div>
                    </td>
                    <td>{d.aula}</td>
                    {role === 'admin' && (
                      <td>
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                          <button className="btn btn-outline" style={{padding: '0.4rem'}} onClick={() => openModal(d)}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn btn-outline" style={{padding: '0.4rem', borderColor: 'var(--danger)', color: 'var(--danger)'}} onClick={() => handleDelete(d._id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap'}}>
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                  const el = document.querySelector('.table-container');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} 
                disabled={activePage === 1}
                style={{padding: '0.4rem 1rem', fontSize: '0.85rem'}}
              >
                Anterior
              </button>
              <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500'}}>
                Página <strong>{activePage}</strong> de {totalPages} ({dispositivos.length} resultados)
              </span>
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  const el = document.querySelector('.table-container');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} 
                disabled={activePage === totalPages}
                style={{padding: '0.4rem 1rem', fontSize: '0.85rem'}}
              >
                Siguiente
              </button>
            </div>
          )}
        </section>
      ) : (
        <section>
          <div className="stats-grid">
            <div className={`glass-card stat-item ${dupField === 'placa' ? 'active-border' : ''}`} onClick={() => setDupField('placa')} style={{cursor: 'pointer'}}>
              <h4 style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Placas Repetidas</h4>
              <p style={{fontSize: '1.75rem', fontWeight: '800'}}>{stats.totalDuplicadosPlaca}</p>
            </div>
            <div className={`glass-card stat-item ${dupField === 'serial' ? 'active-border' : ''}`} onClick={() => setDupField('serial')} style={{cursor: 'pointer'}}>
              <h4 style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Seriales Repetidos</h4>
              <p style={{fontSize: '1.75rem', fontWeight: '800'}}>{stats.totalDuplicadosSerial}</p>
            </div>
          </div>

          <div className="glass-card" style={{marginBottom: '2rem'}}>
            <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end'}}>
              <div style={{flex: 1, minWidth: '200px'}}>
                <label style={{fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem'}}>Filtrar por Sede</label>
                <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                  <Filter size={18} color="var(--text-muted)" style={{position: 'absolute', left: '10px'}} />
                  <input 
                    type="text" 
                    className="search-input" 
                    list="sedes-list"
                    style={{marginBottom: 0, padding: '0.5rem 1rem 0.5rem 2.5rem', width: '100%'}}
                    placeholder="Ej: Sede Principal..." 
                    value={filtroSede}
                    onChange={(e) => setFiltroSede(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && fetchDuplicados()}
                  />
                </div>
              </div>
              <div style={{flex: 1, minWidth: '200px'}}>
                <label style={{fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem'}}>Filtrar por Aula</label>
                <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                  <Filter size={18} color="var(--text-muted)" style={{position: 'absolute', left: '10px'}} />
                  <input 
                    type="text" 
                    className="search-input" 
                    list="aulas-dup-list"
                    style={{marginBottom: 0, padding: '0.5rem 1rem 0.5rem 2.5rem', width: '100%'}}
                    placeholder="Ej: Sistemas 1..." 
                    value={filtroAulaDup}
                    onChange={(e) => setFiltroAulaDup(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && fetchDuplicados()}
                  />
                </div>
              </div>
              <div style={{flex: 1, minWidth: '200px'}}>
                <label style={{fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: '600'}}>Tipo de Dispositivo</label>
                <select 
                  className="search-input" 
                  style={{margin: 0, padding: '0.6rem 1rem', width: '100%'}} 
                  value={filtroTipoDup}
                  onChange={(e) => setFiltroTipoDup(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchDuplicados()}
                >
                  <option value="">Todos los tipos</option>
                  {tiposDispositivo.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', width: '100%'}}>
                <button className={`btn btn-primary btn-mobile-full${loadingDupes ? ' btn-loading' : ''}`} onClick={fetchDuplicados} style={{minWidth: '200px'}} disabled={loadingDupes}>
                  {loadingDupes ? <span className="spinner spinner-sm"></span> : null}
                  {loadingDupes ? 'Consultando...' : 'Consultar Duplicados'}
                </button>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500'}}>
                  <input 
                    type="checkbox" 
                    checked={includeGeneric} 
                    onChange={(e) => setIncludeGeneric(e.target.checked)} 
                    style={{width: 'auto', cursor: 'pointer'}}
                  />
                  Incluir Pendientes y N/A
                </label>
                <button className="btn btn-outline btn-mobile-full" onClick={() => {
                  setFiltroSede(''); 
                  setFiltroTipoDup('');
                  setFiltroAulaDup('');
                  setAppliedFiltroSede('');
                  setAppliedFiltroTipoDup('');
                  setAppliedFiltroAulaDup('');
                  setIncludeGeneric(false);
                }}>
                  Limpiar Filtros
                </button>
              </div>
            </div>
            <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.8rem'}}>
              Tip: Servidores, carros de carga y soportes suelen no tener serial. Puedes filtrarlos para limpiar la vista.
            </p>
          </div>

          {dupField === 'serial' && noSerialTypes.includes(appliedFiltroTipoDup) && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)', 
              borderLeft: '4px solid #f59e0b', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#fbbf24'
            }}>
              <AlertCircle size={20} />
              <div style={{fontSize: '0.9rem'}}>
                <strong>Atención:</strong> Estos dispositivos generalmente no cuentan con número de serial. 
                Se recomienda usar el filtro de <strong>Placas Repetidas</strong> para estos casos o simplemente filtrarlos de esta vista.
              </div>
            </div>
          )}

          {/* Visualización agrupada por Aula con Exportación */}
          {(() => {
            const groupedByAula = {};
            duplicados.forEach(group => {
              group.docs.forEach(doc => {
                const matchSede = !appliedFiltroSede || doc.sede?.toLowerCase().includes(appliedFiltroSede.toLowerCase());
                const matchAula = !appliedFiltroAulaDup || doc.aula?.toLowerCase().includes(appliedFiltroAulaDup.toLowerCase());
                if (matchSede && matchAula) {
                  const aulaKey = doc.aula || 'Sin Aula';
                  if (!groupedByAula[aulaKey]) groupedByAula[aulaKey] = [];
                  
                  groupedByAula[aulaKey].push({
                    device: doc,
                    duplicateId: group._id, 
                    allDuplicates: group.docs.filter(d => d._id !== doc._id)
                  });
                }
              });
            });

            const aulas = Object.keys(groupedByAula).sort();

            if (aulas.length === 0) {
              return <div style={{textAlign: 'center', padding: '3rem', opacity: 0.5}}>No se encontraron duplicados con los filtros actuales.</div>;
            }

            return aulas.map(aulaName => (
              <div className="glass-card" key={aulaName} style={{marginBottom: '2.5rem', borderTop: '4px solid var(--primary)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                    <div style={{background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)'}}>
                      <Check size={20} color="white" />
                    </div>
                    <div>
                      <h3 style={{fontSize: '1.25rem', fontWeight: '800'}}>Aula: {aulaName}</h3>
                      <span style={{fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600'}}>
                        {groupedByAula[aulaName].length} registros identificados
                      </span>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary btn-mobile-full" 
                    style={{fontSize: '0.85rem'}}
                    onClick={() => handleExportAula(aulaName, groupedByAula[aulaName])}
                  >
                    <Download size={14} /> Exportar Reporte de esta Aula
                  </button>
                </div>

                {groupedByAula[aulaName].map((item, idx) => (
                  <div key={`${aulaName}-${idx}`} style={{
                    background: 'var(--bg-input)', 
                    borderRadius: '1rem', 
                    padding: '1.5rem', 
                    marginBottom: '1.5rem',
                    borderLeft: `4px solid ${isGeneric(item.duplicateId) ? 'var(--warning)' : 'var(--danger)'}`,
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem'}}>
                      <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
                        <div>
                          <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800', marginBottom: '0.25rem'}}>Equipo Local en Aula</div>
                          <div style={{fontWeight: '800', fontSize: '1.25rem', color: 'var(--text-main)'}}>
                            {item.device.dispositivo} - <span style={{color: 'var(--primary)'}}>{item.device.placa}</span>
                          </div>
                          <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500'}}>Sede: {item.device.sede} | Aula: {item.device.aula} | Convenio: {item.device.convenio || '-'}</div>
                        </div>
                        <div style={{borderLeft: '2px solid var(--border)', paddingLeft: '1.5rem'}}>
                           <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800', marginBottom: '0.25rem'}}>Identificación Recibida</div>
                           <div style={{fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)'}}>{item.device.serial || item.device.placa}</div>
                        </div>
                      </div>
                      {role === 'admin' && (
                        <button className="btn btn-outline" style={{padding: '0.6rem'}} onClick={() => openModal(item.device)} title="Editar Equipo Local">
                          <Edit2 size={18} />
                        </button>
                      )}
                    </div>

                    <div style={{marginTop: '1.5rem', background: isGeneric(item.duplicateId) ? 'rgba(245, 158, 11, 0.05)' : 'rgba(239, 68, 68, 0.02)', borderRadius: '6px', padding: '0.75rem'}}>
                      <div style={{fontSize: '0.75rem', color: isGeneric(item.duplicateId) ? 'var(--warning)' : '#f87171', fontWeight: '800', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.50rem'}}>
                        <AlertCircle size={16} /> 
                        {isGeneric(item.duplicateId) 
                          ? (item.duplicateId === "SIN DATO" ? 'SERIAL FALTANTE (DEBE TENERLO)' : 'VALOR GENÉRICO / PENDIENTE EN OTROS LUGARES') 
                          : 'REGISTROS CONFLICTIVOS EN OTROS LUGARES'} ({item.allDuplicates.length})
                      </div>
                      <div style={{overflowX: 'auto'}}>
                        <table style={{fontSize: '0.85rem', border: `1px solid ${isGeneric(item.duplicateId) ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.1)'}`}}>
                          <thead>
                            <tr style={{background: isGeneric(item.duplicateId) ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'}}>
                              <th>Institución / Sede</th>
                              <th style={{textAlign: 'center'}}>Aula</th>
                              <th style={{textAlign: 'center'}}>Placa / Serial</th>
                              <th>Tipo</th>
                              <th>Convenio</th>
                              {role === 'admin' && <th style={{textAlign: 'center'}}>Acción</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {item.allDuplicates.map(dup => (
                              <tr key={dup._id} style={{background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                                <td style={{padding: '0.75rem'}}>
                                  <div style={{fontWeight: '900', color: 'white', fontSize: '0.95rem'}}>{dup.institucion}</div>
                                  <div style={{fontSize: '0.8rem', color: 'var(--accent)', fontWeight: '700'}}>{dup.sede}</div>
                                </td>
                                <td style={{textAlign: 'center', fontWeight: '900', fontSize: '1rem', color: 'white', background: 'rgba(255,255,255,0.05)'}}>
                                  {dup.aula}
                                </td>
                                <td style={{textAlign: 'center'}}>
                                  <div style={{color: 'var(--text-muted)', fontWeight: 'bold'}}>{dup.placa}</div>
                                  <div style={{fontSize: '0.7rem', opacity: 0.6}}>{dup.serial}</div>
                                </td>
                                <td>{dup.dispositivo}</td>
                                <td>{dup.convenio || '-'}</td>
                                {role === 'admin' && (
                                  <td style={{textAlign: 'center'}}>
                                    <button className="btn btn-outline" style={{padding: '0.3rem'}} onClick={() => openModal(dup)} title="Editar Registro Remoto">
                                      <Edit2 size={12} />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ));
          })()}
        </section>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal glass-card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
              <h2 style={{fontSize: '1.5rem', fontWeight: '800'}}>{editingDevice ? 'Editar Dispositivo' : 'Nuevo Dispositivo'}</h2>
              <button onClick={() => setShowModal(false)} style={{background: 'var(--bg-input)', border: 'none', color: 'var(--text-main)', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)'}}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Placa *</label>
                  <input required value={formData.placa} onChange={e => setFormData({...formData, placa: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Serial</label>
                  <input value={formData.serial} onChange={e => setFormData({...formData, serial: e.target.value})} />
                </div>
              </div>

              {validationError && (
                <div style={{color: 'var(--danger)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <AlertCircle size={16} /> {validationError}
                </div>
              )}

              <div className="form-group">
                <label>Tipo de Dispositivo</label>
                <select 
                  value={showOtroInput ? 'OTRO' : formData.dispositivo} 
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'OTRO') {
                      setShowOtroInput(true);
                      setFormData({...formData, dispositivo: ''});
                    } else {
                      setShowOtroInput(false);
                      setFormData({...formData, dispositivo: val});
                    }
                  }} 
                >
                  <option value="">Seleccione un tipo...</option>
                  {tiposDispositivo.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                  <option value="OTRO">-- Otro (Escribir abajo) --</option>
                </select>
                {showOtroInput && (
                  <input 
                    style={{marginTop: '0.5rem'}}
                    placeholder="Escriba el nuevo tipo..." 
                    value={formData.dispositivo}
                    onChange={e => setFormData({...formData, dispositivo: e.target.value})} 
                  />
                )}
              </div>

              <div className="form-group">
                <label>Institución Educativa</label>
                <input 
                  list="instituciones-list" 
                  value={formData.institucion} 
                  onChange={e => setFormData({...formData, institucion: e.target.value.toUpperCase()})} 
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Sede</label>
                  <input 
                    list="sedes-list" 
                    value={formData.sede} 
                    onChange={e => setFormData({...formData, sede: e.target.value.toUpperCase()})} 
                  />
                </div>
                <div className="form-group">
                  <label>Aula</label>
                  <input value={formData.aula} onChange={e => setFormData({...formData, aula: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>Convenio</label>
                <input 
                  value={formData.convenio || ''} 
                  onChange={e => setFormData({...formData, convenio: e.target.value})} 
                  disabled={role !== 'admin'}
                  placeholder="Ej: Convenio Aulas SITE"
                />
              </div>
              <div className="form-group">
                <label>Notas / Observaciones</label>
                <textarea rows="3" value={formData.notes || formData.notas || ''} onChange={e => setFormData({...formData, notas: e.target.value})} />
              </div>

              <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>
                  <Check size={18} /> {editingDevice ? 'Actualizar y Validar' : 'Guardar Dispositivo'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal glass-card" style={{maxWidth: '500px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
              <h2 style={{fontSize: '1.5rem', fontWeight: '800'}}>Importar desde Excel</h2>
              <button 
                onClick={() => {setShowImportModal(false); setImportStats(null);}} 
                style={{background: 'var(--bg-input)', border: 'none', color: 'var(--text-main)', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
              >
                <X size={20} />
              </button>
            </div>

            {!importStats ? (
              <div>
                <p style={{marginBottom: '1.5rem', color: 'var(--text-muted)'}}>
                  Sube un archivo Excel (.xlsx) con las columnas en este orden:
                  <br /><br />
                  <code style={{fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '5px', borderRadius: '4px'}}>
                    Dispositivo, Aula, Placa, Serial, Institución, Sede, Modelo, Convenio, Notas
                  </code>
                </p>
                
                <div style={{
                  border: '2px dashed rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '2rem',
                  textAlign: 'center',
                  marginBottom: '1.5rem'
                }}>
                  {importing ? (
                    <div>
                      <div className="spinner" style={{marginBottom: '1rem'}}></div>
                      <p>Procesando archivo... por favor espera.</p>
                    </div>
                  ) : (
                    <div>
                      <FileUp size={48} color="var(--accent)" style={{marginBottom: '1rem', opacity: 0.5}} />
                      <p style={{marginBottom: '1rem'}}>Selecciona tu archivo de inventario</p>
                      <input 
                        type="file" 
                        accept=".xlsx" 
                        onChange={handleImport}
                        style={{display: 'none'}}
                        id="excel-upload"
                      />
                      <label htmlFor="excel-upload" className="btn btn-primary" style={{cursor: 'pointer'}}>
                        Seleccionar Archivo
                      </label>
                    </div>
                  )}
                </div>

                <div style={{background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent)'}}>
                   <p style={{fontSize: '0.85rem', color: 'var(--accent)'}}>
                     <strong>Nota:</strong> Si la placa o el serial ya existen, el sistema actualizará la información del dispositivo en lugar de crear un duplicado.
                   </p>
                </div>
              </div>
            ) : (
              <div style={{textAlign: 'center', padding: '1rem'}}>
                <div style={{
                  width: '60px', 
                  height: '60px', 
                  background: 'var(--success)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <Check size={32} color="white" />
                </div>
                <h3 style={{marginBottom: '1rem'}}>¡Carga Completada!</h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem'}}>
                   <div className="glass-card" style={{padding: '1rem'}}>
                      <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)'}}>{importStats.updates}</div>
                      <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Actualizados</div>
                   </div>
                   <div className="glass-card" style={{padding: '1rem'}}>
                      <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)'}}>{importStats.inserts}</div>
                      <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Nuevos</div>
                   </div>
                </div>
                {importStats.errors > 0 && (
                  <p style={{color: 'var(--danger)', marginBottom: '1.5rem'}}>
                    Se encontraron {importStats.errors} errores durante el proceso.
                  </p>
                )}
                <button className="btn btn-primary" style={{width: '100%'}} onClick={() => {setShowImportModal(false); setImportStats(null);}}>
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <datalist id="instituciones-list">
        {stats.instituciones?.map(inst => (
          <option key={inst} value={inst} />
        ))}
      </datalist>
      <datalist id="sedes-list">
        {stats.sedes?.map(sede => (
          <option key={sede} value={sede} />
        ))}
      </datalist>
      <datalist id="aulas-search-list">
        {aulasSearch?.map(aula => (
          <option key={aula} value={aula} />
        ))}
      </datalist>
      <datalist id="aulas-dup-list">
        {aulasDup?.map(aula => (
          <option key={aula} value={aula} />
        ))}
      </datalist>

      {/* Modal Comparativo para oscarhenao */}
      {showCompModal && (
        <div className="modal-overlay">
          <div className="modal glass-card" style={{maxWidth: '800px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
              <div>
                <h2 style={{fontSize: '1.5rem', fontWeight: '800'}}>Dashboard Comparativo (JEFE)</h2>
                <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Comparación de inventario Físico vs Excel</p>
              </div>
              <button onClick={() => setShowCompModal(false)} style={{background: 'var(--bg-input)', border: 'none', color: 'var(--text-main)', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <X size={20} />
              </button>
            </div>

            <div className="glass-card" style={{padding: '1.5rem', marginBottom: '2rem', background: 'var(--bg-input)'}}>
              <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap'}}>
                <div style={{flex: 1, minWidth: '250px'}}>
                  <label style={{fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block'}}>Seleccionar Sede Educativa</label>
                  <input 
                    list="sedes-list"
                    className="search-input"
                    placeholder="Escribe el nombre de la sede..."
                    value={compSede}
                    onChange={(e) => setCompSede(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && fetchComparativo()}
                  />
                </div>
                <button className="btn btn-primary btn-mobile-full" onClick={fetchComparativo} disabled={loadingComp || !compSede}>
                  {loadingComp ? 'Analizando...' : 'Generar Comparativa'}
                </button>
              </div>
            </div>

            {compError && (
              <div style={{color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <AlertCircle size={18} /> {compError}
              </div>
            )}

            {compData.length > 0 && (
              <div style={{marginBottom: '1.5rem', padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(139, 92, 246, 0.2)'}}>
                <p style={{fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <Check size={18} color="var(--success)" /> 
                  Comparando contra fila de Excel: <strong>{matchedExcelSede}</strong>
                </p>
              </div>
            )}

            {compData.length > 0 && (
              <div className="table-container">
                <table style={{ minWidth: 'unset' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.75rem' }}>Dispositivo</th>
                      <th style={{ textAlign: 'center', padding: '0.75rem' }}>Esperado</th>
                      <th style={{ textAlign: 'center', padding: '0.75rem' }}>En BD</th>
                      <th style={{ textAlign: 'center', padding: '0.75rem' }}>Diferencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compData.map((item, idx) => (
                      <tr key={idx} style={item.esCalculado ? { background: 'rgba(139, 92, 246, 0.06)', borderTop: '2px solid rgba(139, 92, 246, 0.2)' } : {}}>
                        <td style={{ fontWeight: '600', fontSize: '0.85rem', padding: '0.75rem' }}>
                          {item.tipo}
                          {item.esCalculado && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '400', marginTop: '0.2rem' }}>
                              Calculado: 4 sillas por cada mesa en BD
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', fontSize: '1rem', fontWeight: '700', padding: '0.75rem' }}>{item.excel}</td>
                        <td style={{ textAlign: 'center', fontSize: '1rem', fontWeight: '700', color: 'var(--primary)', padding: '0.75rem' }}>{item.db}</td>
                        <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '0.4rem',
                            fontWeight: '800',
                            fontSize: '0.75rem',
                            background: item.diferencia === 0 ? 'rgba(16, 185, 129, 0.1)' : (item.diferencia > 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
                            color: item.diferencia === 0 ? 'var(--success)' : (item.diferencia > 0 ? '#3b82f6' : 'var(--danger)')
                          }}>
                            {item.diferencia === 0 ? <Check size={14} /> : (item.diferencia > 0 ? <Plus size={14} /> : <AlertCircle size={14} />)}
                            <span className="hide-mobile">{item.diferencia === 0 ? 'COMPLETO' : (item.diferencia > 0 ? `+${item.diferencia} EXTRA` : `${item.diferencia} FALTANTE`)}</span>
                            <span className="show-mobile-only">{item.diferencia === 0 ? 'OK' : item.diferencia}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div style={{marginTop: '2rem', textAlign: 'right'}}>
              <button className="btn btn-outline" onClick={() => setShowCompModal(false)}>Cerrar Dashboard</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Asignación de Roles */}
      {showRoleModal && (
        <div className="modal-overlay">
          <div className="modal glass-card" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '700' }}>Asignar Roles de Usuario</h2>
              <button 
                onClick={() => { setShowRoleModal(false); setRoleError(''); setRoleSuccess(''); }} 
                style={{ background: 'var(--bg-input)', border: 'none', color: 'var(--text-main)', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                disabled={roleLoading}
              >
                <X size={18} />
              </button>
            </div>

            {roleError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: '600' }}>
                Error: {roleError}
              </div>
            )}

            {roleSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: '600' }}>
                {roleSuccess}
              </div>
            )}

            {roleLoading && (
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: '700', textAlign: 'center' }}>
                Trabajando... Por favor, espere y evite hacer múltiples clics.
              </div>
            )}

            <form onSubmit={handleAssignRole}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                  Nombre de Usuario (Username)
                </label>
                <input 
                  type="text" 
                  className="form-control"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  placeholder="Ej: AndresBedoya" 
                  value={roleForm.targetUsername}
                  onChange={(e) => setRoleForm({ ...roleForm, targetUsername: e.target.value })}
                  disabled={roleLoading}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                  Seleccione los Roles / Permisos:
                </label>
                
                {/* Checkbox Admin */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <input 
                    type="checkbox" 
                    id="chkAdmin"
                    checked={roleForm.isAdmin}
                    onChange={(e) => setRoleForm({ ...roleForm, isAdmin: e.target.checked, isLector: !e.target.checked })}
                    disabled={roleLoading}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="chkAdmin" style={{ fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500' }}>
                    Administrador (Acceso total al inventario y cargas)
                  </label>
                </div>

                {/* Checkbox Lector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <input 
                    type="checkbox" 
                    id="chkLector"
                    checked={roleForm.isLector}
                    onChange={(e) => setRoleForm({ ...roleForm, isLector: e.target.checked, isAdmin: !e.target.checked })}
                    disabled={roleLoading}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="chkLector" style={{ fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500' }}>
                    Lector (Solo visualización de inventario)
                  </label>
                </div>

                {/* Checkbox isChief */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                  <input 
                    type="checkbox" 
                    id="chkChief"
                    checked={roleForm.isChief}
                    onChange={(e) => setRoleForm({ ...roleForm, isChief: e.target.checked })}
                    disabled={roleLoading}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="chkChief" style={{ fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600', color: 'var(--primary)' }}>
                    Personal Directivo (Acceso a Dashboard Jefe y gestión de roles)
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ flex: 1 }}
                  onClick={() => { setShowRoleModal(false); setRoleError(''); setRoleSuccess(''); }}
                  disabled={roleLoading}
                >
                  Cerrar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1, background: 'linear-gradient(to right, #8b5cf6, #ec4899)', border: 'none' }}
                  disabled={roleLoading}
                >
                  {roleLoading ? 'Actualizando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Generación de Placas */}
      {showPlacasModal && (
        <div className="modal-overlay">
          <div className="modal glass-card" style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Generar Placas en Lote</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>Calcula placas consecutivas sin duplicados y descarga el Excel</p>
              </div>
              <button onClick={() => setShowPlacasModal(false)} style={{ background: 'var(--bg-input)', border: 'none', color: 'var(--text-main)', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} />
              </button>
            </div>

            <div className="form-grid-2" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>Número Inicial *</label>
                <input 
                  type="number" 
                  value={placasConfig.inicio} 
                  onChange={e => setPlacasConfig({ ...placasConfig, inicio: e.target.value })} 
                  placeholder="Ej: 71053"
                />
              </div>
              <div className="form-group">
                <label>Prefijo Opcional</label>
                <input 
                  type="text" 
                  value={placasConfig.prefijo} 
                  onChange={e => setPlacasConfig({ ...placasConfig, prefijo: e.target.value })} 
                  placeholder="Ej: SITE-"
                />
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', background: 'var(--bg-input)', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>Añadir Dispositivos al Lote</h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: '200px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Tipo de Dispositivo</label>
                  <select 
                    value={placasForm.tipo} 
                    onChange={e => setPlacasForm({ ...placasForm, tipo: e.target.value })}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '0.6rem', 
                      background: 'var(--bg-input)', 
                      border: '1px solid var(--border)', 
                      color: 'var(--text-main)',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="">Seleccione un tipo...</option>
                    {tiposDispositivo.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Cantidad</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={placasForm.cantidad} 
                    onChange={e => setPlacasForm({ ...placasForm, cantidad: e.target.value })}
                    placeholder="Cant."
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '0.6rem', 
                      background: 'var(--bg-input)', 
                      border: '1px solid var(--border)', 
                      color: 'var(--text-main)', 
                      margin: 0,
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <button 
                  type="button" 
                  className="btn btn-outline"
                  style={{ padding: '0.75rem 1.2rem', height: '47px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => {
                    if (!placasForm.tipo || !placasForm.cantidad || parseInt(placasForm.cantidad) <= 0) {
                      alert("Por favor seleccione un tipo y cantidad válida.");
                      return;
                    }
                    setLotePlacas(prev => {
                      const existing = prev.find(item => item.tipo === placasForm.tipo);
                      if (existing) {
                        return prev.map(item => item.tipo === placasForm.tipo ? { ...item, cantidad: item.cantidad + parseInt(placasForm.cantidad) } : item);
                      }
                      return [...prev, { tipo: placasForm.tipo, cantidad: parseInt(placasForm.cantidad) }];
                    });
                    setPlacasForm({ tipo: '', cantidad: '' });
                  }}
                >
                  Agregar
                </button>
              </div>
            </div>

            {lotePlacas.length > 0 && (
              <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                <table style={{ minWidth: '100%' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-input)' }}>
                      <th style={{ padding: '0.75rem' }}>Dispositivo</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Cantidad</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lotePlacas.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: '0.75rem', fontWeight: '600' }}>{item.tipo}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '700' }}>{item.cantidad}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <button 
                            type="button" 
                            className="btn btn-outline" 
                            style={{ padding: '0.3rem 0.5rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                            onClick={() => setLotePlacas(prev => prev.filter((_, i) => i !== idx))}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {generatingPlacas && (
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: '700', textAlign: 'center' }}>
                Generando placas y registrando reservas... Por favor espera.
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ flex: 1 }}
                onClick={() => setShowPlacasModal(false)}
                disabled={generatingPlacas}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ flex: 1 }}
                disabled={generatingPlacas || lotePlacas.length === 0 || !placasConfig.inicio}
                onClick={async () => {
                  setGeneratingPlacas(true);
                  try {
                    const response = await axios.post('/api/placas/generar-y-registrar', {
                      dispositivos: lotePlacas,
                      inicio: parseInt(placasConfig.inicio),
                      prefijo: placasConfig.prefijo
                    }, {
                      responseType: 'blob'
                    });
                    
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'placas_generadas.xlsx');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    
                    alert("Placas generadas y registradas con éxito en la base de datos.");
                    setShowPlacasModal(false);
                    fetchStats();
                    fetchConvenios();
                    if (activeTab === 'search' && searchTerm) {
                      handleSearch();
                    }
                  } catch (err) {
                    console.error("Error generating plaques", err);
                    alert("Ocurrió un error al generar las placas.");
                  } finally {
                    setGeneratingPlacas(false);
                  }
                }}
              >
                Generar y Descargar Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
