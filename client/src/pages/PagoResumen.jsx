import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import pagoService from '../services/pagoService';
import alerts from '../utils/alerts';
import {
  CreditCard, QrCode, CheckCircle2, Scissors, Building2,
  Calendar, Clock, User, Phone, ArrowLeft, ExternalLink,
  Copy, Check, DollarSign, ShieldCheck, Share2, Sparkles, RefreshCw
} from 'lucide-react';

const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const nombresDiasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function PagoResumen() {
  const { turnoId } = useParams();
  const navigate = useNavigate();

  const [turno, setTurno] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoPreferencia, setCargandoPreferencia] = useState(false);
  const [preferenciaMP, setPreferenciaMP] = useState(null);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState('online'); // 'online' | 'qr'
  const [copiado, setCopiado] = useState(false);
  const [esDueno, setEsDueno] = useState(false);

  useEffect(() => {
    // Comprobar si hay un usuario logueado en localStorage
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      try {
        const u = JSON.parse(usuarioGuardado);
        if (u.rol === 'DUENO_EMPRESA' || u.rol === 'SUPER_ADMIN') {
          setEsDueno(true);
        }
      } catch (e) {
        // Ignorar
      }
    }

    cargarDetalle();
  }, [turnoId]);

  const cargarDetalle = async () => {
    setCargando(true);
    try {
      const data = await pagoService.obtenerDetallePago(turnoId);
      setTurno(data.turno);

      // Si el turno aún no está pagado, generamos la preferencia de Mercado Pago
      if (data.turno.estadoPago !== 'PAGADO') {
        generarPreferencia();
      }
    } catch (err) {
      console.error(err);
      alerts.error('Error', 'No se pudo cargar el detalle del turno a pagar.');
    } finally {
      setCargando(false);
    }
  };

  const generarPreferencia = async () => {
    setCargandoPreferencia(true);
    try {
      const pref = await pagoService.crearPreferencia(turnoId);
      setPreferenciaMP(pref);
    } catch (err) {
      console.warn('No se pudo generar preferencia automática:', err.response?.data?.mensaje || err.message);
    } finally {
      setCargandoPreferencia(false);
    }
  };

  const handleCopiarLink = () => {
    const url = preferenciaMP?.init_point || window.location.href;
    navigator.clipboard.writeText(url);
    setCopiado(true);
    alerts.toast('Enlace copiado al portapapeles', 'success');
    setTimeout(() => setCopiado(false), 2500);
  };

  const handlePagarOnline = () => {
    if (preferenciaMP?.init_point) {
      window.location.href = preferenciaMP.init_point;
    } else {
      generarPreferencia().then(() => {
        if (preferenciaMP?.init_point) {
          window.location.href = preferenciaMP.init_point;
        }
      });
    }
  };

  const handleMarcarPagadoEfectivo = async () => {
    const confirm = await alerts.confirm(
      '¿Registrar pago en efectivo?',
      `Confirmar que el cliente abonó $${turno.servicio.precio} en el local.`
    );

    if (confirm.isConfirmed) {
      try {
        await pagoService.marcarPagoManual(turnoId, 'EFECTIVO');
        alerts.success('¡Pago Registrado!', 'El turno ha sido marcado como PAGADO.');
        cargarDetalle();
      } catch (err) {
        console.error(err);
        alerts.error('Error', 'No se pudo registrar el pago manual.');
      }
    }
  };

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" style={{ width: '45px', height: '45px', border: '4px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Cargando resumen de pago...</p>
      </div>
    );
  }

  if (!turno) {
    return (
      <div className="reserva-page" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div className="glass-card" style={{ padding: '3rem 2rem', maxWidth: '500px', margin: '0 auto' }}>
          <h2>Turno no encontrado</h2>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>El turno que intentas pagar no existe o ha sido eliminado.</p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>Volver al Inicio</Link>
        </div>
      </div>
    );
  }

  const fechaTurno = new Date(turno.fecha);
  const horaStr = `${String(fechaTurno.getHours()).padStart(2, '0')}:${String(fechaTurno.getMinutes()).padStart(2, '0')}`;
  const checkoutUrl = preferenciaMP?.init_point || window.location.href;
  const esPagado = turno.estadoPago === 'PAGADO';

  return (
    <div className="reserva-page" style={{ maxWidth: '850px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      
      {/* Botón Volver */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.target.style.color = 'var(--primary)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={18} /> Volver
        </button>
      </div>

      {/* Encabezado */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="heading-gold" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
          {esPagado ? 'COMPROBANTE DE PAGO' : 'RESUMEN Y PAGO DEL SERVICIO'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {esPagado
            ? 'Este turno se encuentra registrado y completamente abonado.'
            : 'Revisa los detalles del servicio y completa el pago a través de Mercado Pago o Código QR.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: esPagado ? '1fr' : '1.1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* COLUMNA IZQUIERDA: Tarjeta Resumen del Turno */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
          
          {/* Badge de Estado de Pago */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.2rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Turno #{turno.id}
            </span>
            <span
              style={{
                fontSize: '0.8rem',
                padding: '4px 12px',
                borderRadius: '20px',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: esPagado ? 'rgba(46, 204, 113, 0.15)' : 'rgba(241, 196, 15, 0.15)',
                color: esPagado ? '#2ecc71' : '#f1c40f',
                border: `1px solid ${esPagado ? '#2ecc7166' : '#f1c40f66'}`
              }}
            >
              {esPagado ? <CheckCircle2 size={14} /> : <Clock size={14} />}
              {esPagado ? 'PAGADO' : 'PENDIENTE DE PAGO'}
            </span>
          </div>

          {/* Información Barbería y Servicio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(201, 160, 99, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Building2 size={22} />
              </div>
              <div>
                <strong style={{ fontSize: '1.1rem', display: 'block' }}>{turno.empresa?.nombre}</strong>
                {turno.empresa?.direccion && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {turno.empresa?.direccion}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(201, 160, 99, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Scissors size={22} />
              </div>
              <div>
                <strong style={{ fontSize: '1.05rem', display: 'block' }}>{turno.servicio?.nombre}</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>⏱ Duración: {turno.servicio?.duracion} minutos</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(201, 160, 99, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Calendar size={22} />
              </div>
              <div>
                <strong style={{ fontSize: '1rem', display: 'block' }}>
                  {nombresDiasSemana[fechaTurno.getDay()]}, {fechaTurno.getDate()} de {nombresMeses[fechaTurno.getMonth()]} de {fechaTurno.getFullYear()}
                </strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold' }}>🕒 {horaStr} hs</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <User size={22} />
              </div>
              <div>
                <strong style={{ fontSize: '0.95rem', display: 'block' }}>{turno.cliente?.nombre} {turno.cliente?.apellido}</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📞 {turno.cliente?.telefono}</span>
              </div>
            </div>
          </div>

          {/* Desglose de Precio */}
          <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.2rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Servicio ({turno.servicio?.nombre})</span>
              <span>${Number(turno.servicio?.precio).toLocaleString('es-AR')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              <span>Total a pagar</span>
              <span>${Number(turno.servicio?.precio).toLocaleString('es-AR')} ARS</span>
            </div>
          </div>

          {/* Botones adicionales / WhatsApp */}
          {turno.empresa?.telefono && (
            <a
              href={`https://wa.me/${turno.empresa.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `¡Hola! Consulta sobre mi turno #${turno.id} en ${turno.empresa.nombre} (${turno.servicio?.nombre} - ${fechaTurno.getDate()}/${fechaTurno.getMonth()+1} a las ${horaStr}hs). Estado: ${esPagado ? 'PAGADO' : 'PENDIENTE'}.`
              )}`}
              target="_blank"
              rel="noreferrer"
              style={{
                textAlign: 'center',
                padding: '0.7rem',
                borderRadius: '8px',
                background: 'rgba(37, 211, 102, 0.12)',
                border: '1px solid rgba(37, 211, 102, 0.3)',
                color: '#25d366',
                textDecoration: 'none',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: '600'
              }}
            >
              <Share2 size={16} /> Contactar a la Barbería por WhatsApp
            </a>
          )}

          {/* Opción de cobro manual para el dueño */}
          {esDueno && !esPagado && (
            <button
              onClick={handleMarcarPagadoEfectivo}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px dashed var(--primary)',
                color: 'var(--primary)',
                padding: '0.8rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem'
              }}
            >
              <DollarSign size={16} /> Registrar Pago en Efectivo (Dueño)
            </button>
          )}

        </div>

        {/* COLUMNA DERECHA: Pasarela de Pago (Mercado Pago / QR) */}
        {!esPagado ? (
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '4px solid var(--primary)' }}>
            
            {/* Selector de Método: Online vs QR */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
              <button
                onClick={() => setMetodoSeleccionado('online')}
                style={{
                  background: metodoSeleccionado === 'online' ? 'var(--primary)' : 'transparent',
                  color: metodoSeleccionado === 'online' ? '#000' : 'var(--text-muted)',
                  border: 'none',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s'
                }}
              >
                <CreditCard size={16} /> Pago Online
              </button>

              <button
                onClick={() => setMetodoSeleccionado('qr')}
                style={{
                  background: metodoSeleccionado === 'qr' ? 'var(--primary)' : 'transparent',
                  color: metodoSeleccionado === 'qr' ? '#000' : 'var(--text-muted)',
                  border: 'none',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s'
                }}
              >
                <QrCode size={16} /> Código QR
              </button>
            </div>

            {/* VISTA 1: Pago Online con Mercado Pago */}
            {metodoSeleccionado === 'online' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'center' }}>
                
                <div style={{ padding: '1rem', background: 'rgba(201, 160, 99, 0.05)', borderRadius: '12px', border: '1px solid rgba(201, 160, 99, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                    <ShieldCheck size={20} />
                    <strong style={{ fontSize: '0.95rem' }}>Pago Seguro con Mercado Pago</strong>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                    Abona con tarjetas de débito/crédito, dinero en cuenta o en efectivo en puntos de cobro.
                  </p>
                </div>

                <button
                  onClick={handlePagarOnline}
                  disabled={cargandoPreferencia}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.05rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    boxShadow: '0 4px 20px rgba(0, 158, 227, 0.3)',
                    background: 'linear-gradient(135deg, #009ee3 0%, #007eb5 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    cursor: cargandoPreferencia ? 'not-allowed' : 'pointer'
                  }}
                >
                  {cargandoPreferencia ? (
                    <>
                      <RefreshCw size={18} className="spin" /> Conectando con Mercado Pago...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} /> Pagar con Mercado Pago
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', opacity: 0.7, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>🔒 Encriptación SSL</span>
                  <span>•</span>
                  <span>⚡ Acreditación Instantánea</span>
                </div>
              </div>
            )}

            {/* VISTA 2: Código QR para cobro presencial o escaneo */}
            {metodoSeleccionado === 'qr' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Escanea con la app de <strong>Mercado Pago</strong> o la cámara de tu celular para abonar:
                </p>

                {/* Contenedor del QR */}
                <div style={{
                  padding: '1.2rem',
                  background: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {preferenciaMP?.init_point ? (
                    <QRCodeSVG
                      value={preferenciaMP.init_point}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  ) : (
                    <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                      <RefreshCw size={24} className="spin" />
                    </div>
                  )}
                </div>

                <div style={{ width: '100%', display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleCopiarLink}
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      background: 'var(--glass)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    {copiado ? <Check size={14} color="#2ecc71" /> : <Copy size={14} />}
                    {copiado ? '¡Copiado!' : 'Copiar Link'}
                  </button>

                  <a
                    href={preferenciaMP?.init_point || '#'}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      background: 'rgba(201, 160, 99, 0.15)',
                      border: '1px solid var(--primary)',
                      borderRadius: '8px',
                      color: 'var(--primary)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      fontWeight: 'bold'
                    }}
                  >
                    <ExternalLink size={14} /> Abrir Link
                  </a>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* Pantalla si ya está pagado */
          <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem', borderTop: '4px solid #2ecc71' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(46, 204, 113, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2ecc71' }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ color: '#2ecc71', fontSize: '1.4rem' }}>¡Pago Completado con Éxito!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              El servicio ya se encuentra totalmente abonado y agendado. Presenta este comprobante al momento de asistir a tu cita.
            </p>
            <Link
              to="/"
              className="btn-primary"
              style={{ textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}
            >
              Volver al Inicio
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
