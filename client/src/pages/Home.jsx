import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Calendar, ShieldCheck } from 'lucide-react';

const Home = () => {
  return (
    <div className="home-page" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="heading-gold" style={{ fontSize: '4rem', marginBottom: '1rem' }}>Gestiones en línea CV</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>La gestión definitiva para tu empresa</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', justifyContent: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <Calendar size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
          <h3>Para Clientes</h3>
          <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>Reserva tu turno de forma rápida y sencilla.</p>
          <Link to="/reserva/todas"><button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>Reservar Turno</button></Link>
        </div>

        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <ShieldCheck size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
          <h3>Acceso al Sistema</h3>
          <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>Inicia sesión para gestionar tu empresa o administrar la plataforma.</p>
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
