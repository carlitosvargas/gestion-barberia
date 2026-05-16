import React, { useState, useEffect } from 'react';
import empresaService from '../../services/empresaService';
import { DashboardLayout, NavItem, modalStyles } from '../../components/dashboard/DashboardLayout';
import { Calendar, Scissors, Settings, Trash2, LayoutDashboard, Pencil, Save, Image as ImageIcon, Building2, Clock } from 'lucide-react';
import alerts from '../../utils/alerts';

const EmpresaPanel = ({ usuario, logout, navigate }) => {
  const [seccion, setSeccion] = useState('inicio');
  const [servicios, setServicios] = useState([]);
  const [miEmpresa, setMiEmpresa] = useState(null);

  // Formulario Mi Empresa
  const [formEmpresa, setFormEmpresa] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    logo: '',
    dias: '',
    horarios: ''
  });

  // Modales
  const [mostrarModalServicio, setMostrarModalServicio] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [servicioEnEdicion, setServicioEnEdicion] = useState(null);
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: '', precio: '', duracion: 30 });

  useEffect(() => {
    cargarDatos();
  }, [seccion]);

  // Al cargar miEmpresa, actualizar el formulario de configuración
  useEffect(() => {
    if (miEmpresa) {
      setFormEmpresa({
        nombre: miEmpresa.nombre || '',
        direccion: miEmpresa.direccion || '',
        telefono: miEmpresa.telefono || '',
        logo: miEmpresa.logo || '',
        dias: miEmpresa.dias || '',
        horarios: miEmpresa.horarios || ''
      });
    }
  }, [miEmpresa]);

  const cargarDatos = async () => {
    try {
      if (seccion === 'servicios') {
        const data = await empresaService.obtenerServicios();
        setServicios(data);
      }
      if (usuario.empresaId) {
        const data = await empresaService.obtenerMiEmpresa(usuario.empresaId);
        setMiEmpresa(data);
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdateEmpresa = async (e) => {
    e.preventDefault();
    try {
      await empresaService.actualizarMiEmpresa(miEmpresa.id, formEmpresa);
      alerts.success('¡Actualizado!', 'Los datos de tu empresa han sido guardados.');
      cargarDatos();
    } catch (err) {
      alerts.error('Error', 'No se pudieron guardar los cambios.');
    }
  };

  const handleCrearServicio = async (e) => {
    e.preventDefault();
    try {
      await empresaService.crearServicio(nuevoServicio);
      alerts.success('¡Añadido!', 'El servicio ha sido creado correctamente.');
      setMostrarModalServicio(false);
      setNuevoServicio({ nombre: '', precio: '', duracion: 30 });
      cargarDatos();
    } catch (err) {
      alerts.error('Error', err.response?.data?.mensaje || 'No se pudo crear el servicio');
    }
  };

  const handleActualizarServicio = async (e) => {
    e.preventDefault();
    try {
      await empresaService.actualizarServicio(servicioEnEdicion.id, servicioEnEdicion);
      alerts.success('¡Actualizado!', 'El servicio se ha modificado correctamente.');
      setMostrarModalEditar(false);
      setServicioEnEdicion(null);
      cargarDatos();
    } catch (err) {
      alerts.error('Error', 'No se pudo actualizar el servicio');
    }
  };

  const handleDeleteServicio = async (id) => {
    const confirmacion = await alerts.confirm('¿Estás seguro?', 'Esta acción eliminará el servicio permanentemente.');
    if (confirmacion.isConfirmed) {
      try {
        await empresaService.eliminarServicio(id);
        alerts.toast('Servicio eliminado con éxito');
        cargarDatos();
      } catch (err) {
        alerts.error('Error', 'No se pudo eliminar el servicio');
      }
    }
  };

  const abrirEdicion = (servicio) => {
    setServicioEnEdicion({ ...servicio });
    setMostrarModalEditar(true);
  };

  const sidebarItems = (
    <>
      <NavItem active={seccion === 'inicio'} onClick={() => setSeccion('inicio')} icon={<LayoutDashboard size={20} />} label="Inicio" />
      <NavItem active={seccion === 'turnos'} onClick={() => setSeccion('turnos')} icon={<Calendar size={20} />} label="Turnos" />
      <NavItem active={seccion === 'servicios'} onClick={() => setSeccion('servicios')} icon={<Scissors size={20} />} label="Servicios" />
      <NavItem active={seccion === 'configuracion'} onClick={() => setSeccion('configuracion')} icon={<Settings size={20} />} label="Mi Empresa" />
    </>
  );

  if (!usuario.empresaId) {
    return (
      <DashboardLayout usuario={usuario} logout={logout} navigate={navigate} titulo="Sin Empresa" subtitulo="Aún no tienes una sucursal asignada">
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Building2 size={60} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3>¡Hola {usuario.nombre}!</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
            Parece que un administrador aún no te ha asignado una sucursal.
            <br />Por favor, contacta con el soporte para que vinculen tu cuenta a tu local.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      usuario={usuario} logout={logout} navigate={navigate}
      sidebarItems={sidebarItems}
      titulo={miEmpresa?.nombre || 'Mi Empresa'}
      subtitulo={`Gestión de ${seccion}`}
      accionesExtra={seccion === 'servicios' && <button onClick={() => setMostrarModalServicio(true)} className="btn-primary">Nuevo Servicio</button>}
      empresa={miEmpresa}
    >
      {/* Contenido según pestaña */}
      {seccion === 'inicio' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3>Bienvenido, {usuario.nombre}</h3>
          <p style={{ color: 'var(--text-muted)' }}>Hoy tienes 0 turnos pendientes.</p>
        </div>
      )}

      {seccion === 'servicios' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {servicios.map(s => (
            <div key={s.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{s.nombre}</h4>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${s.precio}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⏱ {s.duracion} min</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button onClick={() => abrirEdicion(s)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDeleteServicio(s.id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {seccion === 'configuracion' && (
        <div className="glass-card" style={{ padding: '2.5rem', maxWidth: '700px' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Perfil de la Empresa</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Esta información será visible para tus clientes al momento de reservar.</p>

          <form onSubmit={handleUpdateEmpresa} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Nombre Comercial</label>
                <input
                  style={modalStyles.input}
                  value={formEmpresa.nombre}
                  onChange={e => setFormEmpresa({ ...formEmpresa, nombre: e.target.value })}
                  placeholder="Ej: Barbería Vargas"
                  required
                />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Teléfono de Contacto</label>
                <input
                  style={modalStyles.input}
                  value={formEmpresa.telefono}
                  onChange={e => setFormEmpresa({ ...formEmpresa, telefono: e.target.value })}
                  placeholder="Ej: +54 9 11..."
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Días de Atención</label>
                <input
                  style={modalStyles.input}
                  value={formEmpresa.dias}
                  onChange={e => setFormEmpresa({ ...formEmpresa, dias: e.target.value })}
                  placeholder="Ej: Lunes a Sábados"
                />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Horarios de Atención</label>
                <input
                  style={modalStyles.input}
                  value={formEmpresa.horarios}
                  onChange={e => setFormEmpresa({ ...formEmpresa, horarios: e.target.value })}
                  placeholder="Ej: 09:00 a 20:00"
                />
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Dirección Física</label>
              <input
                style={modalStyles.input}
                value={formEmpresa.direccion}
                onChange={e => setFormEmpresa({ ...formEmpresa, direccion: e.target.value })}
                placeholder="Ej: Av. Siempre Viva 742"
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>URL del Logo (Imagen)</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input
                  style={{ ...modalStyles.input, flex: 1 }}
                  value={formEmpresa.logo}
                  onChange={e => setFormEmpresa({ ...formEmpresa, logo: e.target.value })}
                  placeholder="https://link-a-tu-imagen.jpg"
                />
                {formEmpresa.logo && (
                  <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                    <img src={formEmpresa.logo} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                <ImageIcon size={12} /> Se recomienda una imagen cuadrada de al menos 200x200px.
              </p>
            </div>

            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginTop: '1rem' }}>
              <Save size={20} />
              Guardar Cambios
            </button>
          </form>
        </div>
      )}

      {/* Modales */}
      {mostrarModalServicio && (
        <div style={modalStyles.overlay}>
          <div className="glass-card" style={modalStyles.content}>
            <h2 className="heading-gold">NUEVO SERVICIO</h2>
            <form onSubmit={handleCrearServicio} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
              <input placeholder="Nombre" value={nuevoServicio.nombre} onChange={e => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })} style={modalStyles.input} required />
              <input type="number" placeholder="Precio" value={nuevoServicio.precio} onChange={e => setNuevoServicio({ ...nuevoServicio, precio: e.target.value })} style={modalStyles.input} required />
              <input type="number" placeholder="Duración (min)" value={nuevoServicio.duracion} onChange={e => setNuevoServicio({ ...nuevoServicio, duracion: e.target.value })} style={modalStyles.input} required />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setMostrarModalServicio(false)} style={modalStyles.btnSec}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Agregar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarModalEditar && (
        <div style={modalStyles.overlay}>
          <div className="glass-card" style={modalStyles.content}>
            <h2 className="heading-gold">EDITAR SERVICIO</h2>
            <form onSubmit={handleActualizarServicio} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
              <input placeholder="Nombre" value={servicioEnEdicion.nombre} onChange={e => setServicioEnEdicion({ ...servicioEnEdicion, nombre: e.target.value })} style={modalStyles.input} required />
              <input type="number" placeholder="Precio" value={servicioEnEdicion.precio} onChange={e => setServicioEnEdicion({ ...servicioEnEdicion, precio: e.target.value })} style={modalStyles.input} required />
              <input type="number" placeholder="Duración (min)" value={servicioEnEdicion.duracion} onChange={e => setServicioEnEdicion({ ...servicioEnEdicion, duracion: e.target.value })} style={modalStyles.input} required />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => { setMostrarModalEditar(false); setServicioEnEdicion(null); }} style={modalStyles.btnSec}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const labelStyle = { fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' };

export default EmpresaPanel;
