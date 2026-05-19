import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';

export const DashboardLayout = ({ usuario, logout, navigate, children, sidebarItems, titulo, subtitulo, accionesExtra, empresa }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0c' }}>
      {/* Sidebar Compartido */}
      <aside style={{ width: '280px', background: 'var(--glass)', borderRight: '1px solid var(--glass-border)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>

        {/* Logo de la Barbería  */}
        {empresa?.logo ? (
          <div style={{ width: '80px', height: '80px', margin: '0 auto 2rem auto', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)', boxShadow: '0 0 15px rgba(201, 160, 99, 0.3)' }}>
            <img src={empresa.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <h2 className="heading-gold" style={{ marginBottom: '3rem', fontSize: '1.5rem', textAlign: 'center' }}>PANEL GESTIÓN</h2>
        )}

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {sidebarItems}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '50%', color: 'black' }}>
              <UserIcon size={20} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white' }}>{usuario.nombre} {usuario.apellido}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} style={logoutBtnStyle}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Compartido */}
      <main style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'white' }}>{titulo}</h1>
            <p style={{ color: 'var(--text-muted)' }}>{subtitulo}</p>
          </div>
          {accionesExtra}
        </header>
        {children}
      </main>
    </div>
  );
};

// Componente NavItem compartido
export const NavItem = ({ active, onClick, icon, label }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', borderRadius: '12px',
      background: active ? 'rgba(201, 160, 99, 0.1)' : 'transparent',
      color: active ? 'var(--primary)' : 'var(--text-muted)',
      cursor: 'pointer', transition: 'all 0.2s'
    }}
  >
    {icon}
    <span>{label}</span>
  </div>
);

const logoutBtnStyle = { width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', background: 'rgba(255, 77, 77, 0.1)', border: 'none', borderRadius: '12px', color: '#ff4d4d', cursor: 'pointer' };

export const modalStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  content: { padding: '2.5rem', width: '100%', maxWidth: '500px', background: '#111315' },
  input: { padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'white', outline: 'none' },
  btnSec: { flex: 1, padding: '0.8rem', borderRadius: '12px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer' }
};
