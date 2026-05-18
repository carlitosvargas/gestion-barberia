import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { DashboardLayout, NavItem, modalStyles } from '../../components/dashboard/DashboardLayout';
import { LayoutDashboard, Users, Building2 } from 'lucide-react';
import alerts from '../../utils/alerts';

const AdminPanel = ({ usuario, logout, navigate }) => {
  const [empresas, setEmpresas] = useState([]);
  const [usuariosSinEmpresa, setUsuariosSinEmpresa] = useState([]);
  const [mostrarModalEmpresa, setMostrarModalEmpresa] = useState(false);
  const [mostrarModalAsignar, setMostrarModalAsignar] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [nuevaEmpresa, setNuevaEmpresa] = useState({ nombre: '', direccion: '', telefono: '', dias: '', horarios: '' });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const dataEmpresas = await adminService.obtenerEmpresas();
      setEmpresas(dataEmpresas);
      const dataUsuarios = await adminService.obtenerUsuariosSinEmpresa();
      setUsuariosSinEmpresa(dataUsuarios);
    } catch (err) { console.error(err); }
  };

  const handleCrearEmpresa = async (e) => {
    e.preventDefault();

    // Validar el formato de horarios en el frontend
    if (nuevaEmpresa.horarios && nuevaEmpresa.horarios.trim() !== '') {
      const matches = nuevaEmpresa.horarios.match(/\b\d{2}:\d{2}\b/g);
      if (!matches || matches.length < 2 || matches.length % 2 !== 0) {
        return alerts.error(
          'Formato de Horarios Inválido',
          "Debes ingresar parejas de inicio y fin válidas en formato HH:MM. Ej: '09:00 a 13:00' o '09:00 a 13:00, 16:00 a 20:00'"
        );
      }
    }

    try {
      await adminService.crearEmpresa(nuevaEmpresa);
      alerts.success('¡Creada!', 'La sucursal se ha registrado con éxito.');
      setMostrarModalEmpresa(false);
      setNuevaEmpresa({ nombre: '', direccion: '', telefono: '', dias: '', horarios: '' });
      cargarDatos();
    } catch (err) {
      alerts.error('Error', err.response?.data?.mensaje || 'No se pudo crear la sucursal');
    }
  };

  const handleAsignarUsuario = async (e) => {
    e.preventDefault();
    try {
      await adminService.asignarEmpresaAUsuario(usuarioSeleccionado, empresaSeleccionada.id);
      alerts.success('¡Asignado!', 'El dueño ahora tiene acceso a su sucursal.');
      setMostrarModalAsignar(false);
      setUsuarioSeleccionado('');
      cargarDatos();
    } catch (err) {
      alerts.error('Error', err.response?.data?.mensaje || 'No se pudo asignar el usuario');
    }
  };

  const sidebarItems = (
    <>
      <NavItem active={true} icon={<LayoutDashboard size={20} />} label="Empresas" />
      <div style={{ padding: '0.8rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem' }}>SISTEMA GLOBAL</div>
    </>
  );

  return (
    <DashboardLayout
      usuario={usuario} logout={logout} navigate={navigate}
      sidebarItems={sidebarItems}
      titulo="Control General"
      subtitulo="Administración de Sucursales"
      accionesExtra={<button onClick={() => setMostrarModalEmpresa(true)} className="btn-primary">Nueva Sucursal</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {empresas.map(empresa => (
          <div key={empresa.id} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ color: 'var(--primary)' }}>{empresa.nombre}</h3>
              <span style={{ fontSize: '0.7rem', background: 'var(--glass)', padding: '2px 8px', borderRadius: '4px' }}>Nº Empresa: {empresa.id}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>📍 {empresa.direccion || 'Sin dirección'}</p>
            {empresa.dias && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>📅 {empresa.dias}</p>}
            {empresa.horarios && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>🕒 {empresa.horarios}</p>}
            <button
              onClick={() => { setEmpresaSeleccionada(empresa); setMostrarModalAsignar(true); }}
              style={{ marginTop: '1.5rem', width: '100%', padding: '0.6rem', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: 'black', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Users size={16} /> Asignar Dueño
            </button>
          </div>
        ))}
      </div>

      {/* Modales */}
      {mostrarModalEmpresa && (
        <div style={modalStyles.overlay}>
          <div className="glass-card" style={modalStyles.content}>
            <h2 className="heading-gold">NUEVA BARBERÍA</h2>
            <form onSubmit={handleCrearEmpresa} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
              <input placeholder="Nombre" value={nuevaEmpresa.nombre} onChange={e => setNuevaEmpresa({ ...nuevaEmpresa, nombre: e.target.value })} style={modalStyles.input} required />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input placeholder="Días (Ej: Lun a Vie)" value={nuevaEmpresa.dias} onChange={e => setNuevaEmpresa({ ...nuevaEmpresa, dias: e.target.value })} style={modalStyles.input} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <input placeholder="Horarios (Ej: 09:00 a 20:00)" value={nuevaEmpresa.horarios} onChange={e => setNuevaEmpresa({ ...nuevaEmpresa, horarios: e.target.value })} style={modalStyles.input} required />
                  <span style={{ fontSize: '0.65rem', color: 'var(--primary)' }}>Formato HH:MM. Ej: 09:00 a 13:00, 16:00 a 20:00</span>
                </div>
              </div>

              <input placeholder="Dirección" value={nuevaEmpresa.direccion} onChange={e => setNuevaEmpresa({ ...nuevaEmpresa, direccion: e.target.value })} style={modalStyles.input} />
              <input placeholder="Teléfono" value={nuevaEmpresa.telefono} onChange={e => setNuevaEmpresa({ ...nuevaEmpresa, telefono: e.target.value })} style={modalStyles.input} />
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setMostrarModalEmpresa(false)} style={modalStyles.btnSec}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarModalAsignar && (
        <div style={modalStyles.overlay}>
          <div className="glass-card" style={modalStyles.content}>
            <h2 className="heading-gold">ASIGNAR DUEÑO</h2>
            <form onSubmit={handleAsignarUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
              <select value={usuarioSeleccionado} onChange={e => setUsuarioSeleccionado(e.target.value)} style={modalStyles.input} required>
                <option value="">Seleccionar usuario...</option>
                {usuariosSinEmpresa.map(u => (
                  <option key={u.id} value={u.id} style={{ background: '#1a1d21' }}>{u.nombre} {u.apellido}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setMostrarModalAsignar(false)} style={modalStyles.btnSec}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Asignar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminPanel;
