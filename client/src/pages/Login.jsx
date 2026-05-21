import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const respuesta = await axios.post('https://gestion-backend-cv.vercel.app/api/auth/login', {
        email,
        password
      });

      const { usuario, token } = respuesta.data;
      login(usuario, token);

      // Redirigir según el rol o simplemente al dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1.2rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
            ← Volver al Inicio
          </Link>
        </div>
        <h2 className="heading-gold" style={{ textAlign: 'center', marginBottom: '2rem' }}>ACCESO PANEL</h2>

        {error && (
          <div style={{ background: 'rgba(255, 0, 0, 0.1)', color: '#ff4d4d', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid rgba(255, 0, 0, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'var(--text-muted)' }}>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'white' }}
              placeholder="nombre@email.com"
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'var(--text-muted)' }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'white' }}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: '1rem' }}
            disabled={cargando}
          >
            {cargando ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          ¿Aún no tienes cuenta? <br />
          <Link to="/registro" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Registrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
