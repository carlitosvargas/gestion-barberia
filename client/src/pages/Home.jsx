import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Calendar, ShieldCheck } from 'lucide-react';

const Home = () => {
  return (
    <div className="home-page" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="heading-gold" style={{ fontSize: '4rem', marginBottom: '1rem' }}>PLATAFORMA BARBER</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>La gestión definitiva para tu barbería de lujo</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <Scissors size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
          <h3>Para Barberías</h3>
          <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>Gestiona tus servicios, turnos y clientes en un solo lugar con una interfaz premium.</p>
          <Link to="/login"><button className="btn-primary">Ingresar como Empresa</button></Link>
        </div>

        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <Calendar size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
          <h3>Para Clientes</h3>
          <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>Reserva tu turno de forma rápida y sencilla sin necesidad de registrarte.</p>
          <Link to="/reserva/todas"><button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>Reservar Turno</button></Link>
        </div>

        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <ShieldCheck size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
          <h3>Administración</h3>
          <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>Control total de todas las barberías registradas en la plataforma.</p>
          <Link to="/login"><button className="btn-primary">Panel Admin</button></Link>
        </div>
      </div>

      <footer style={{ marginTop: '6rem', textAlign: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
        <p>&copy; 2026 Barber Platform - Sistema Multi-Empresa</p>
      </footer>
    </div>
  );
};

export default Home;
