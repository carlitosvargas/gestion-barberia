import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import alerts from '../utils/alerts';

const ResetPassword = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmarPassword) {
      return setError('Las contraseñas no coinciden');
    }

    if (password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres');
    }

    setCargando(true);

    try {
      await axios.post(`https://gestion-backend-cv.vercel.app/api/auth/reset-password/${id}/${token}`, { password });
      alerts.success('¡Éxito!', 'Tu contraseña ha sido restablecida. Ya puedes iniciar sesión con tu nueva contraseña.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al conectar con el servidor. Es posible que el enlace haya expirado.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '1rem' }}>
      <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <h2 className="heading-gold" style={{ textAlign: 'center', marginBottom: '2rem' }}>NUEVA CONTRASEÑA</h2>
        
        {error && (
          <div style={{ background: 'rgba(255, 0, 0, 0.1)', color: '#ff4d4d', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid rgba(255, 0, 0, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'var(--text-muted)' }}>Nueva Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'white', width: '100%', boxSizing: 'border-box' }}
                placeholder="Mínimo 6 caracteres"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'var(--text-muted)' }}>Confirmar Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={mostrarConfirmarPassword ? "text" : "password"}
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'white', width: '100%', boxSizing: 'border-box' }}
                placeholder="Repite tu contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {mostrarConfirmarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: '1rem' }}
            disabled={cargando}
          >
            {cargando ? 'Guardando...' : 'Guardar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
