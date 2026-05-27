import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Calendar, ShieldCheck, Building2 } from 'lucide-react';

const Home = () => {
  return (
    <div className="reserva-page">
      <header className="hero-header">
        <h1 className="heading-gold hero-title">Gestiones en línea CV</h1>
        <p className="hero-subtitle">La gestión definitiva para tu empresa</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', justifyContent: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <Building2 size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
          <h3>Dueños de Negocios</h3>
          <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>Crea tu cuenta gratis y comienza a gestionar tus turnos y clientes hoy mismo.</p>
          <Link to="/registro"><button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>Crear Cuenta</button></Link>
        </div>

        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <ShieldCheck size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
          <h3>Acceso al Sistema</h3>
          <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>Inicia sesión en tu panel de control para administrar tu empresa y ver reportes.</p>
          <Link to="/login"><button className="btn-primary">Iniciar Sesión</button></Link>
        </div>
      </div>

      <footer style={{ marginTop: '6rem', textAlign: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
        <p>&copy; 2026 Gestiones en línea CV - Sistema Multi-Empresa - Desarrollado por Carlos Vargas.</p>
      </footer>
    </div>
  );
};

export default Home;
