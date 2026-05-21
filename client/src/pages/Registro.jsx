import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import alerts from '../utils/alerts';

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    password: '',
    confirmarPassword: ''
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmarPassword) {
      return setError('Las contraseñas no coinciden');
    }

    setCargando(true);

    try {
      await axios.post('https://gestion-backend-cv.vercel.app/api/auth/registro', {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        email: formData.email,
        password: formData.password,
        rol: 'DUENO_EMPRESA'
      });

      await alerts.success('¡Registro exitoso!', 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (err) {
      const mensaje = err.response?.data?.mensaje || 'Error al registrar usuario';
      setError(mensaje);
      alerts.error('Ups...', mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem' }}>
      <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1.2rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
            ← Volver al Inicio
          </Link>
        </div>
        <h2 className="heading-gold" style={{ textAlign: 'center', marginBottom: '2rem' }}>CREAR CUENTA</h2>

        {error && (
          <div style={{ background: 'rgba(255, 0, 0, 0.1)', color: '#ff4d4d', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid rgba(255, 0, 0, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nombre</label>
              <input name="nombre" value={formData.nombre} onChange={handleChange} style={inputStyle} placeholder="Ej: Juan" required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Apellido</label>
              <input name="apellido" value={formData.apellido} onChange={handleChange} style={inputStyle} placeholder="Ej: Pérez" required />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Teléfono</label>
            <input name="telefono" value={formData.telefono} onChange={handleChange} style={inputStyle} placeholder="Ej: +54 9 11..." />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} placeholder="tu@email.com" required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Contraseña</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} style={inputStyle} placeholder="Mínimo 6 caracteres" required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Confirmar Contraseña</label>
            <input type="password" name="confirmarPassword" value={formData.confirmarPassword} onChange={handleChange} style={inputStyle} placeholder="Repite tu contraseña" required />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={cargando}>
            {cargando ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          ¿Ya tienes una cuenta? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: '0.8rem',
  borderRadius: '8px',
  border: '1px solid var(--glass-border)',
  background: 'var(--glass)',
  color: 'white',
  outline: 'none'
};

export default Registro;
