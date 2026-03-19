import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, AlertCircle, FileSpreadsheet, Filter, Check, X, Trash2, PieChart } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [dispositivos, setDispositivos] = useState([]);
  const [duplicados, setDuplicados] = useState([]);
  const [filtroSede, setFiltroSede] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [dupField, setDupField] = useState('placa');
  const [stats, setStats] = useState({ total: 0, totalSedes: 0, totalInstituciones: 0, totalDuplicadosPlaca: 0, totalDuplicadosSerial: 0 });
  
  // Advanced filters
  const [filtroInstitucion, setFiltroInstitucion] = useState('');
  const [filtroSedeSearch, setFiltroSedeSearch] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    placa: '', serial: '', dispositivo: '', institucion: '', sede: '', aula: '', modelo: '', notas: ''
  });
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/stats');
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'dupes') {
      fetchDuplicados();
    }
  }, [activeTab, dupField, filtroSede]);

  const handleSearch = async () => {
    try {
      let url = `/api/dispositivos?q=${searchTerm}`;
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
      const res = await axios.get(`/api/duplicados?campo=${dupField}&sede=${filtroSede}`);
      setDuplicados(res.data);
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
    } catch (err) {
      console.error("Error saving", err);
    }
  };

  const exportToExcel = async (data = dispositivos) => {
    try {
      const response = await axios.post('/api/exportar', { dispositivos: data }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventario_export.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Error exporting", err);
    }
  };

  return (
    <div className="container">
      <header>
        <div>
          <h1>Inventario Aulas Site</h1>
          <p style={{color: 'var(--text-muted)'}}>Gestión y Visualización de Dispositivos</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Nuevo Dispositivo
        </button>
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
                <div style={{display: 'flex', alignItems: 'flex-end'}}>
                  <button className="btn btn-outline" onClick={() => {setFiltroInstitucion(''); setFiltroSedeSearch(''); setSearchTerm('');}}>
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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {dispositivos.map(d => (
                  <tr key={d._id}>
                    <td><span style={{fontWeight: 'bold', color: 'var(--accent)'}}>{d.placa}</span></td>
                    <td>{d.serial}</td>
                    <td>{d.dispositivo}</td>
                    <td>
                      <div style={{fontSize: '0.9rem'}}>{d.institucion}</div>
                      <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{d.sede}</div>
                    </td>
                    <td>{d.aula}</td>
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
            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
              <Filter size={18} color="var(--text-muted)" />
              <input 
                type="text" 
                className="search-input" 
                style={{marginBottom: 0, padding: '0.5rem 1rem'}}
                placeholder="Filtrar duplicados por Sede..." 
                value={filtroSede}
                onChange={(e) => setFiltroSede(e.target.value)}
              />
            </div>
          </div>

          {duplicados.map(group => (
            <div className="glass-card" key={group._id} style={{marginBottom: '1rem', borderLeft: '4px solid var(--danger)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                <h3 style={{color: 'var(--danger)'}}>Repetido: {group._id}</h3>
                <span className="badge" style={{background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '0.2rem 0.5rem', borderRadius: '4px'}}>
                   {group.count} veces
                </span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Placa</th>
                    <th>Serial</th>
                    <th>Institución</th>
                    <th>Sede</th>
                    <th>Aula</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {group.docs.map(doc => (
                    <tr key={doc._id}>
                      <td>{doc.placa}</td>
                      <td>{doc.serial}</td>
                      <td>{doc.institucion}</td>
                      <td>{doc.sede}</td>
                      <td>{doc.aula}</td>
                      <td>
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                          <button className="btn btn-outline" style={{padding: '0.4rem'}} onClick={() => openModal(doc)}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn btn-outline" style={{padding: '0.4rem', borderColor: 'var(--danger)', color: 'var(--danger)'}} onClick={() => handleDelete(doc._id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                className="btn btn-outline" 
                style={{marginTop: '1rem', width: '100%', justifyContent: 'center'}}
                onClick={() => exportToExcel(group.docs)}
              >
                <FileSpreadsheet size={14} /> Exportar estos para validación incitu
              </button>
            </div>
          ))}
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
                <input value={formData.dispositivo} onChange={e => setFormData({...formData, dispositivo: e.target.value})} />
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
    </div>
  );
};

export default App;
