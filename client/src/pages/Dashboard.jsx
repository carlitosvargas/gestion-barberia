import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, PlusCircle, Building2, LogOut, User as UserIcon } from 'lucide-react';

const Dashboard = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevaEmpresa, setNuevaEmpresa] = useState({ nombre: '', direccion: '', telefono: '' });

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
    } else if (usuario.rol === 'SUPER_ADMIN') {
      cargarEmpresas();
    }
  }, [usuario]);

  const cargarEmpresas = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/empresas');
      setEmpresas(res.data);
    } catch (err) {
      console.error('Error al cargar empresas', err);
    }
  };

  const handleCrearEmpresa = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/api/empresas', nuevaEmpresa, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMostrarModal(false);
      setNuevaEmpresa({ nombre: '', direccion: '', telefono: '' });
      cargarEmpresas();
    } catch (err) {
      alert('Error al crear empresa: ' + (err.response?.data?.mensaje || err.message));
    }
  };

  if (!usuario) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: 'var(--glass)', borderRight: '1px solid var(--glass-border)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        <h2 className="heading-gold" style={{ marginBottom: '3rem', fontSize: '1.5rem' }}>PANEL GESTIÓN</h2>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', borderRadius: '12px', background: 'rgba(201, 160, 99, 0.1)', color: 'var(--primary)' }}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          {usuario.rol === 'SUPER_ADMIN' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', color: 'var(--text-muted)' }}>
              <Building2 size={20} />
              <span>Barberías</span>
            </div>
          )}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '50%', color: 'black' }}>
              <UserIcon size={20} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{usuario.email}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{usuario.rol}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', background: 'rgba(255, 77, 77, 0.1)', border: 'none', borderRadius: '12px', color: '#ff4d4d', cursor: 'pointer' }}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Bienvenido, {usuario.rol === 'SUPER_ADMIN' ? 'Administrador' : 'Dueño'}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Aquí puedes gestionar {usuario.rol === 'SUPER_ADMIN' ? 'todas las barberías' : 'tu barbería'}.</p>
          </div>
          {usuario.rol === 'SUPER_ADMIN' && (
            <button onClick={() => setMostrarModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={20} />
              Nueva Barbería
            </button>
          )}
        </header>

        {usuario.rol === 'SUPER_ADMIN' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {empresas.map(empresa => (
              <div key={empresa.id} className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{empresa.nombre}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>📍 {empresa.direccion || 'Sin dirección'}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>📞 {empresa.telefono || 'Sin teléfono'}</p>
                <button style={{ marginTop: '1.5rem', width: '100%', padding: '0.6rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
                  Gestionar
                </button>
              </div>
            ))}
            {empresas.length === 0 && (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>No hay barberías registradas aún.</p>
            )}
          </div>
        )}
      </main>

      {/* Modal Nueva Empresa */}
      {mostrarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ padding: '2.5rem', width: '100%', maxWidth: '500px', background: '#1a1d21' }}>
            <h2 className="heading-gold" style={{ marginBottom: '2rem' }}>AGREGAR BARBERÍA</h2>
            <form onSubmit={handleCrearEmpresa} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <input 
                placeholder="Nombre de la barbería" 
                value={nuevaEmpresa.nombre} 
                onChange={e => setNuevaEmpresa({...nuevaEmpresa, nombre: e.target.value})}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'white' }}
                required
              />
              <input 
                placeholder="Dirección" 
                value={nuevaEmpresa.direccion} 
                onChange={e => setNuevaEmpresa({...nuevaEmpresa, direccion: e.target.value})}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'white' }}
              />
              <input 
                placeholder="Teléfono" 
                value={nuevaEmpresa.telefono} 
                onChange={e => setNuevaEmpresa({...nuevaEmpresa, telefono: e.target.value})}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'white' }}
              />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setMostrarModal(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
