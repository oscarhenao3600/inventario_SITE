import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, AlertCircle, FileSpreadsheet, Filter, Check, X, Trash2, PieChart, FileUp, Download, LogOut, Lock, User } from 'lucide-react';

const noSerialTypes = [
  "Servidor Portable de Aula SITE Sistema Cloud",
  "Soporte Electrónico Pantalla Interactiva Táctil",
  "Carro Cargador de Tabletas"
];

const App = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [role, setRole] = useState(localStorage.getItem('role'));
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
  const [stats, setStats] = useState({ total: 0, totalSedes: 0, totalInstituciones: 0, totalDuplicadosPlaca: 0, totalDuplicadosSerial: 0 });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStats, setImportStats] = useState(null);
  const [tiposDispositivo, setTiposDispositivo] = useState([]);
  
  // Advanced filters
  const [filtroInstitucion, setFiltroInstitucion] = useState('');
  const [filtroSedeSearch, setFiltroSedeSearch] = useState('');
  const [filtroTipoSearch, setFiltroTipoSearch] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    placa: '', serial: '', dispositivo: '', institucion: '', sede: '', aula: '', modelo: '', notas: ''
  });
  const [validationError, setValidationError] = useState('');

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
    }
  }, [token]);

  const fetchTipos = async () => {
    try {
      const res = await axios.get('/api/tipos');
      setTiposDispositivo(res.data);
    } catch (err) {
      console.error("Error fetching types", err);
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

  // Deshabilitado auto-fetch al cambiar de pestaña para cumplir con requerimiento:
  // "consulta de los duplicados se realice solo y unicamente cuando se de click en el boton consultar"
  /*
  useEffect(() => {
    if (activeTab === 'dupes' && duplicados.length === 0) {
      fetchDuplicados();
    }
  }, [activeTab]);
  */

  const handleSearch = async () => {
    try {
      let url = `/api/dispositivos?q=${searchTerm}&tipo=${filtroTipoSearch}`;
      const res = await axios.get(url);
      
      let filtered = res.data;
      if (filtroInstitucion) {
        filtered = filtered.filter(d => d.institucion?.toLowerCase().includes(filtroInstitucion.toLowerCase()));
      }
      if (filtroSedeSearch) {
        filtered = filtered.filter(d => d.sede?.toLowerCase().includes(filtroSedeSearch.toLowerCase()));
      }
      
      setDispositivos(filtered);
    } catch (err) {
      console.error("Error searching", err);
    }
  };

  const fetchDuplicados = async () => {
    try {
      const res = await axios.get(`/api/duplicados?campo=${dupField}&sede=${filtroSede}&tipo=${filtroTipoDup}`);
      setDuplicados(res.data);
      // Aplicar filtros a la vista solo cuando se realiza la consulta
      setAppliedFiltroSede(filtroSede);
      setAppliedFiltroTipoDup(filtroTipoDup);
    } catch (err) {
      console.error("Error fetching duplicates", err);
    }
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
    } else {
      setEditingDevice(null);
      setFormData({ placa: '', serial: '', dispositivo: '', institucion: '', sede: '', aula: '', modelo: '', notas: '' });
    }
    setValidationError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validar duplicados antes de guardar
    try {
      const validRes = await axios.post('/api/validar', {
        placa: formData.placa,
        serial: formData.serial,
        id: editingDevice ? editingDevice._id : null
      });

      if (!validRes.data.available) {
        setValidationError(`Atención: Ya existe un registro con esta ${validRes.data.reason}.`);
        return;
      }

      if (editingDevice) {
        await axios.put(`/api/dispositivos/${editingDevice._id}`, formData);
      } else {
        await axios.post('/api/dispositivos', formData);
      }
      
      setShowModal(false);
      activeTab === 'search' ? handleSearch() : fetchDuplicados();
      fetchStats();
      fetchTipos();
    } catch (err) {
      console.error("Error saving", err);
    }
  };

  const exportToExcel = async (data = dispositivos) => {
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
    }
  };

  const handleExportTotal = async () => {
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
        const { token, username, role } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', username);
        localStorage.setItem('role', role);
        setToken(token);
        setUser(username);
        setRole(role);
      } else {
        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        setAuthMode('login');
        setAuthForm({ username: '', password: '' });
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || "Error en la autenticación");
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
      if (activeTab === 'search' && searchTerm) handleSearch();
    } catch (err) {
      console.error("Error importing file", err);
      const errorMsg = err.response?.data?.error || "Error al procesar el archivo Excel. Verifica el formato.";
      alert(errorMsg);
    } finally {
      setImporting(false);
      e.target.value = ''; // Limpiar para permitir subir el mismo archivo si es necesario
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
    setRole(null);
    setDispositivos([]);
    setDuplicados([]);
  };

  if (!token) {
    return (
      <div className="container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh'}}>
        <div className="glass-card" style={{maxWidth: '400px', width: '100%', padding: '2.5rem'}}>
          <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <div style={{background: 'var(--accent)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'}}>
              <Lock size={30} color="white" />
            </div>
            <h2>Inventario Aulas Site</h2>
            <p style={{color: 'var(--text-muted)'}}>{authMode === 'login' ? 'Inicia sesión para continuar' : 'Crea una cuenta nueva'}</p>
          </div>

          <form onSubmit={handleAuth}>
            <div className="form-group">
              <label>Usuario</label>
              <div style={{position: 'relative'}}>
                <User size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5}} />
                <input 
                  required 
                  style={{paddingLeft: '2.5rem'}}
                  value={authForm.username} 
                  onChange={e => setAuthForm({...authForm, username: e.target.value})} 
                  placeholder="Tu usuario"
                />
              </div>
            </div>
            <div className="form-group" style={{marginTop: '1rem'}}>
              <label>Contraseña</label>
              <div style={{position: 'relative'}}>
                <Lock size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5}} />
                <input 
                  required 
                  type="password"
                  style={{paddingLeft: '2.5rem'}}
                  value={authForm.password} 
                  onChange={e => setAuthForm({...authForm, password: e.target.value})} 
                  placeholder="••••••••"
                />
              </div>
            </div>

            {authError && (
              <div style={{color: 'var(--danger)', marginTop: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <AlertCircle size={16} /> {authError}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '2rem', height: '45px'}}>
              {authMode === 'login' ? 'Entrar al Sistema' : 'Registrarse'}
            </button>
            
            <div style={{textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem'}}>
              <span style={{color: 'var(--text-muted)'}}>
                {authMode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              </span>
              <button 
                type="button"
                onClick={() => {setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError('');}}
                style={{background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 'bold', cursor: 'pointer', marginLeft: '0.5rem'}}
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
      <header>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <div style={{background: 'var(--accent)', padding: '0.5rem', borderRadius: '8px'}}>
             <FileUp size={24} color="white" />
          </div>
          <div>
            <h1>Inventario Aulas Site</h1>
            <p style={{color: 'var(--text-muted)'}}>Bienvenido, <strong>{user}</strong></p>
          </div>
        </div>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          {role === 'admin' && (
            <>
              <button className="btn btn-outline" onClick={handleExportTotal} title="Descargar todo el inventario agrupado">
                <Download size={18} /> Exportar Todo
              </button>
              <button className="btn btn-outline" onClick={() => setShowImportModal(true)}>
                <FileUp size={18} /> Importar
              </button>
              <button className="btn btn-primary" onClick={() => openModal()}>
                <Plus size={18} /> Nuevo
              </button>
            </>
          )}
          <button className="btn btn-outline" style={{borderColor: 'var(--danger)', color: 'var(--danger)'}} onClick={handleLogout} title="Cerrar Sesión">
            <LogOut size={18} />
          </button>
        </div>
      </header>
      
      <div className="stats-grid" style={{marginBottom: '2rem'}}>
        <div className="glass-card stat-item">
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span>Total Dispositivos</span>
            <PieChart size={20} color="var(--accent)" />
          </div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="glass-card stat-item">
          <span>Instituciones</span>
          <div className="stat-value">{stats.totalInstituciones}</div>
        </div>
        <div className="glass-card stat-item">
          <span>Sedes</span>
          <div className="stat-value">{stats.totalSedes}</div>
        </div>
        <div className="glass-card stat-item" style={{borderColor: stats.totalDuplicadosPlaca > 0 ? 'var(--danger)' : 'var(--success)'}}>
          <span style={{color: stats.totalDuplicadosPlaca > 0 ? 'var(--danger)' : 'inherit'}}>Duplicados (Placa)</span>
          <div className="stat-value" style={{color: stats.totalDuplicadosPlaca > 0 ? 'var(--danger)' : 'var(--success)'}}>
            {stats.totalDuplicadosPlaca}
          </div>
        </div>
        <div className="glass-card stat-item" style={{borderColor: stats.totalDuplicadosSerial > 0 ? 'var(--danger)' : 'var(--success)'}}>
          <span style={{color: stats.totalDuplicadosSerial > 0 ? 'var(--danger)' : 'inherit'}}>Duplicados (Serial)</span>
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
          <div className="search-container" style={{display: 'flex', gap: '1rem'}}>
            <div style={{position: 'relative', flex: 1}}>
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
            <button className="btn btn-primary" onClick={() => handleSearch()} style={{height: 'unset', padding: '0 2rem'}}>
              Consultar
            </button>
          </div>

          <div className="glass-card" style={{padding: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)'}}>
             <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                <div style={{flex: 1, minWidth: '200px'}}>
                  <label style={{fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem'}}>Filtrar por Institución</label>
                  <input 
                    className="search-input" 
                    style={{margin: 0, padding: '0.5rem'}} 
                    placeholder="Ej: I.E Santa Maria..."
                    value={filtroInstitucion}
                    onChange={(e) => setFiltroInstitucion(e.target.value)}
                  />
                </div>
                <div style={{flex: 1, minWidth: '200px'}}>
                  <label style={{fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem'}}>Filtrar por Sede</label>
                  <input 
                    className="search-input" 
                    style={{margin: 0, padding: '0.5rem'}} 
                    placeholder="Ej: Sede Principal..."
                    value={filtroSedeSearch}
                    onChange={(e) => setFiltroSedeSearch(e.target.value)}
                  />
                </div>
                <div style={{flex: 1, minWidth: '200px'}}>
                  <label style={{fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem'}}>Tipo de Dispositivo</label>
                  <select 
                    className="search-input" 
                    style={{margin: 0, padding: '0.5rem', width: '100%', background: 'var(--bg-card)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px'}} 
                    value={filtroTipoSearch}
                    onChange={(e) => setFiltroTipoSearch(e.target.value)}
                  >
                    <option value="">Todos los tipos</option>
                    {tiposDispositivo.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                <div style={{display: 'flex', alignItems: 'flex-end'}}>
                  <button className="btn btn-outline" onClick={() => {setFiltroInstitucion(''); setFiltroSedeSearch(''); setFiltroTipoSearch(''); setSearchTerm('');}}>
                    Limpiar Filtros
                  </button>
                </div>
             </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
            <h3 style={{color: 'var(--text-muted)'}}>{dispositivos.length} resultados encontrados</h3>
            <button className="btn btn-outline" onClick={() => exportToExcel()}>
              <FileSpreadsheet size={18} /> Exportar Selección
            </button>
          </div>

          <div style={{overflowX: 'auto'}}>
            <table>
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Serial</th>
                  <th>Dispositivo</th>
                  <th>Institución / Sede</th>
                  <th>Aula</th>
                  {role === 'admin' && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {dispositivos.map(d => (
                  <tr key={d._id}>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <span style={{fontWeight: 'bold', color: 'var(--accent)'}}>{d.placa}</span>
                        {d.notas && d.notas.trim() !== '' && (
                          <Check size={14} color="var(--success)" title="Revisado (con notas)" />
                        )}
                      </div>
                    </td>
                    <td>{d.serial}</td>
                    <td>{d.dispositivo}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section>
          <div className="stats-grid">
            <div className={`glass-card ${dupField === 'placa' ? 'active-border' : ''}`} onClick={() => setDupField('placa')} style={{cursor: 'pointer'}}>
              <h4 style={{color: 'var(--text-muted)'}}>Placas Repetidas</h4>
              <p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{stats.totalDuplicadosPlaca}</p>
            </div>
            <div className={`glass-card ${dupField === 'serial' ? 'active-border' : ''}`} onClick={() => setDupField('serial')} style={{cursor: 'pointer'}}>
              <h4 style={{color: 'var(--text-muted)'}}>Seriales Repetidos</h4>
              <p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{stats.totalDuplicadosSerial}</p>
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
                    style={{marginBottom: 0, padding: '0.5rem 1rem 0.5rem 2.5rem', width: '100%'}}
                    placeholder="Ej: Sede Principal..." 
                    value={filtroSede}
                    onChange={(e) => setFiltroSede(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchDuplicados()}
                  />
                </div>
              </div>
              <div style={{flex: 1, minWidth: '200px'}}>
                <label style={{fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem'}}>Tipo de Dispositivo</label>
                <select 
                  className="search-input" 
                  style={{margin: 0, padding: '0.5rem', width: '100%', background: 'var(--bg-card)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px'}} 
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
              <div style={{display: 'flex', gap: '1rem'}}>
                <button className="btn btn-primary" onClick={fetchDuplicados} style={{height: 'unset', padding: '0.6rem 2rem'}}>
                  Consultar Duplicados
                </button>
                <button className="btn btn-outline" onClick={() => {
                  setFiltroSede(''); 
                  setFiltroTipoDup('');
                  setAppliedFiltroSede('');
                  setAppliedFiltroTipoDup('');
                }}>
                  Limpiar
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
                if (!appliedFiltroSede || doc.sede?.toLowerCase().includes(appliedFiltroSede.toLowerCase())) {
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
              <div className="glass-card" key={aulaName} style={{marginBottom: '2.5rem', borderTop: '4px solid var(--accent)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                    <div style={{background: 'var(--accent)', padding: '0.4rem', borderRadius: '6px'}}>
                      <Check size={18} color="white" />
                    </div>
                    <h3 style={{fontSize: '1.3rem'}}>Aula: {aulaName}</h3>
                    <span className="badge" style={{background: 'rgba(255,255,255,0.1)', fontSize: '0.8rem'}}>
                      {groupedByAula[aulaName].length} dispositivos con conflictos
                    </span>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{fontSize: '0.85rem', padding: '0.5rem 1rem'}}
                    onClick={() => handleExportAula(aulaName, groupedByAula[aulaName])}
                  >
                    <Download size={14} /> Exportar Reporte de esta Aula
                  </button>
                </div>

                {groupedByAula[aulaName].map((item, idx) => (
                  <div key={`${aulaName}-${idx}`} style={{
                    background: 'rgba(255,255,255,0.02)', 
                    borderRadius: '8px', 
                    padding: '1.2rem', 
                    marginBottom: '1.2rem',
                    borderLeft: '4px solid var(--danger)'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-start'}}>
                      <div style={{display: 'flex', gap: '1.5rem', flexWrap: 'wrap'}}>
                        <div>
                          <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Equipo Local en Aula</div>
                          <div style={{fontWeight: 'bold', fontSize: '1.2rem'}}>
                            {item.device.dispositivo} - <span style={{color: 'var(--accent)'}}>{item.device.placa}</span>
                          </div>
                          <div style={{fontSize: '0.85rem', opacity: 0.9}}>Sede: {item.device.sede} | Aula: {item.device.aula}</div>
                        </div>
                        <div style={{borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem'}}>
                           <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase'}}>Identificación Recibida</div>
                           <div style={{fontSize: '1rem', fontWeight: 'bold'}}>{item.device.serial || item.device.placa}</div>
                        </div>
                      </div>
                      {role === 'admin' && (
                        <button className="btn btn-outline" style={{padding: '0.5rem'}} onClick={() => openModal(item.device)} title="Editar Equipo Local">
                          <Edit2 size={16} />
                        </button>
                      )}
                    </div>

                    <div style={{marginTop: '1.5rem', background: 'rgba(239, 68, 68, 0.02)', borderRadius: '6px', padding: '0.75rem'}}>
                      <div style={{fontSize: '0.75rem', color: '#f87171', fontWeight: '800', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.50rem'}}>
                        <AlertCircle size={16} /> REGISTROS CONFLICTIVOS EN OTROS LUGARES ({item.allDuplicates.length})
                      </div>
                      <div style={{overflowX: 'auto'}}>
                        <table style={{fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.1)'}}>
                          <thead>
                            <tr style={{background: 'rgba(239, 68, 68, 0.1)'}}>
                              <th>Institución / Sede</th>
                              <th style={{textAlign: 'center'}}>Aula</th>
                              <th style={{textAlign: 'center'}}>Placa / Serial</th>
                              <th>Tipo</th>
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
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
              <h2>{editingDevice ? 'Editar Dispositivo' : 'Nuevo Dispositivo'}</h2>
              <button onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer'}}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
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
                  value={formData.dispositivo} 
                  onChange={e => setFormData({...formData, dispositivo: e.target.value})}
                  style={{width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px'}}
                >
                  <option value="">Seleccione un tipo...</option>
                  {tiposDispositivo.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                  <option value="OTRO">-- Otro (Escribir abajo) --</option>
                </select>
                {formData.dispositivo === 'OTRO' && (
                  <input 
                    style={{marginTop: '0.5rem'}}
                    placeholder="Escriba el nuevo tipo..." 
                    onChange={e => setFormData({...formData, dispositivo: e.target.value})} 
                  />
                )}
              </div>

              <div className="form-group">
                <label>Institución Educativa</label>
                <input value={formData.institucion} onChange={e => setFormData({...formData, institucion: e.target.value})} />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className="form-group">
                  <label>Sede</label>
                  <input value={formData.sede} onChange={e => setFormData({...formData, sede: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Aula</label>
                  <input value={formData.aula} onChange={e => setFormData({...formData, aula: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>Notas / Observaciones</label>
                <textarea rows="3" value={formData.notas || ''} onChange={e => setFormData({...formData, notas: e.target.value})} />
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
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
              <h2>Importar desde Excel</h2>
              <button 
                onClick={() => {setShowImportModal(false); setImportStats(null);}} 
                style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer'}}
              >
                <X size={24} />
              </button>
            </div>

            {!importStats ? (
              <div>
                <p style={{marginBottom: '1.5rem', color: 'var(--text-muted)'}}>
                  Sube un archivo Excel (.xlsx) con las columnas en este orden:
                  <br /><br />
                  <code style={{fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '5px', borderRadius: '4px'}}>
                    Dispositivo, Aula, Placa, Serial, Institución, Sede, Modelo, Notas
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
    </div>
  );
};

export default App;
