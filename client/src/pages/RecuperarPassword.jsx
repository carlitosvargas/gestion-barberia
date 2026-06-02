import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import alerts from '../utils/alerts';

const RecuperarPassword = () => {
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await axios.post('https://gestion-backend-cv.vercel.app/api/auth/recuperar-password', { email });
      setEnviado(true);
      alerts.success('¡Correo Enviado!', 'Revisa tu bandeja de entrada o spam para restablecer tu contraseña.');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '1rem' }}>
      <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1.2rem' }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
            ← Volver al Login
          </Link>
        </div>
        
        <h2 className="heading-gold" style={{ textAlign: 'center', marginBottom: '1rem' }}>RECUPERAR CUENTA</h2>
        
        {enviado ? (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: '#2ecc71', fontSize: '1.1rem', marginBottom: '1rem' }}>✅ Solicitud enviada correctamente.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Te hemos enviado un enlace de recuperación a tu correo electrónico. Sigue las instrucciones para cambiar tu contraseña.</p>
          </div>
        ) : (
          <>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>

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
              <button
                type="submit"
                className="btn-primary"
                style={{ marginTop: '1rem' }}
                disabled={cargando}
              >
                {cargando ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default RecuperarPassword;
