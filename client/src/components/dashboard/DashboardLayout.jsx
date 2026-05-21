import React, { useState } from 'react'; // <-- MODIFICACIÓN: se agregó useState
import { LogOut, User as UserIcon, Menu, X } from 'lucide-react';
// <-- MODIFICACIÓN: se agregaron Menu y X

export const DashboardLayout = ({
  usuario,
  logout,
  navigate,
  children,
  sidebarItems,
  titulo,
  subtitulo,
  accionesExtra,
  empresa
}) => {

  // <-- MODIFICACIÓN: estado para abrir/cerrar menú hamburguesa
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0c' }}>

      {/* ========================= */}
      {/* MODIFICACIÓN: BOTÓN HAMBURGUESA */}
      {/* ========================= */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 2000,
          background: 'var(--glass)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          padding: '0.7rem',
          color: 'white',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)'
        }}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* ========================= */}
      {/* MODIFICACIÓN: OVERLAY OSCURO */}
      {/* ========================= */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: '280px',
          background: '#111315',
          borderRight: '1px solid var(--glass-border)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',

          // <-- MODIFICACIÓN: sidebar flotante
          position: 'fixed',
          top: 0,

          // <-- MODIFICACIÓN: animación abrir/cerrar
          left: menuOpen ? '0' : '-300px',

          height: '100vh',
          transition: 'left 0.3s ease',
          zIndex: 1500
        }}
      >

        {/* Logo */}
        {empresa?.logo ? (
          <div
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 2rem auto',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid var(--primary)',
              boxShadow: '0 0 15px rgba(201, 160, 99, 0.3)'
            }}
          >
            <img
              src={empresa.logo}
              alt="Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        ) : (
          <h2
            className="heading-gold"
            style={{
              marginBottom: '3rem',
              fontSize: '1.5rem',
              textAlign: 'center'
            }}
          >
            PANEL GESTIÓN
          </h2>
        )}

        {/* Navegación */}
        <nav
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
          }}
        >

          {/* ========================= */}
          {/* MODIFICACIÓN: cerrar menú al seleccionar opción */}
          {/* ========================= */}
          {React.Children.map(sidebarItems, (item) =>
            React.cloneElement(item, {
              onClick: () => {
                item.props.onClick?.();
                setMenuOpen(false);
              }
            })
          )}
        </nav>

        {/* Usuario */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '2rem',
            borderTop: '1px solid var(--glass-border)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            <div
              style={{
                background: 'var(--primary)',
                padding: '0.5rem',
                borderRadius: '50%',
                color: 'black'
              }}
            >
              <UserIcon size={20} />
            </div>

            <div style={{ overflow: 'hidden' }}>
              <p
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}
              >
                {usuario.nombre} {usuario.apellido}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={logoutBtnStyle}
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main
        style={{
          flex: 1,
          padding: '3rem',
          overflowY: 'auto',
          width: '100%',

          // <-- MODIFICACIÓN: separación superior para botón hamburguesa
          marginTop: '2rem'
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem'
          }}
        >
          <div>
            <h1 style={{ fontSize: '2rem', color: 'white' }}>
              {titulo}
            </h1>

            <p style={{ color: 'var(--text-muted)' }}>
              {subtitulo}
            </p>
          </div>

          {accionesExtra}
        </header>

        {children}
      </main>
    </div>
  );
};

// NavItem
export const NavItem = ({ active, onClick, icon, label }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.8rem',
      borderRadius: '12px',
      background: active
        ? 'rgba(201, 160, 99, 0.1)'
        : 'transparent',
      color: active
        ? 'var(--primary)'
        : 'var(--text-muted)',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }}
  >
    {icon}
    <span>{label}</span>
  </div>
);

const logoutBtnStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '0.8rem',
  background: 'rgba(255, 77, 77, 0.1)',
  border: 'none',
  borderRadius: '12px',
  color: '#ff4d4d',
  cursor: 'pointer'
};

export const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },

  content: {
    padding: '2.5rem',
    width: '100%',
    maxWidth: '500px',
    background: '#111315'
  },

  input: {
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid var(--glass-border)',
    background: 'var(--glass)',
    color: 'white',
    outline: 'none'
  },

  btnSec: {
    flex: 1,
    padding: '0.8rem',
    borderRadius: '12px',
    background: 'transparent',
    border: '1px solid var(--glass-border)',
    color: 'white',
    cursor: 'pointer'
  }
};