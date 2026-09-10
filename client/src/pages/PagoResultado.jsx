import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowRight, Home, Calendar } from 'lucide-react';
import pagoService from '../services/pagoService';

export default function PagoResultado() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const turnoId = searchParams.get('turnoId') || searchParams.get('external_reference');
  const status = searchParams.get('status') || searchParams.get('collection_status');
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');


  const [turno, setTurno] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (turnoId) {
      pagoService.obtenerDetallePago(turnoId)
        .then(data => setTurno(data.turno))
        .catch(err => console.error(err))
        .finally(() => setCargando(false));
    } else {
      setCargando(false);
    }
  }, [turnoId]);

  const esExito = status === 'success' || status === 'approved';
  const esPendiente = status === 'pending' || status === 'in_process';
  const esFallo = status === 'failure' || status === 'rejected' || (!esExito && !esPendiente);

  return (
    <div className="reserva-page" style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
      <div className="glass-card" style={{
        padding: '3.5rem 2.5rem',
        borderTop: `4px solid ${esExito ? '#2ecc71' : esPendiente ? '#f1c40f' : '#e74c3c'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        
        {/* Icono de Estado */}
        {esExito && (
          <CheckCircle size={75} color="#2ecc71" style={{ filter: 'drop-shadow(0 0 15px rgba(46, 204, 113, 0.4))' }} />
        )}
        {esPendiente && (
          <Clock size={75} color="#f1c40f" style={{ filter: 'drop-shadow(0 0 15px rgba(241, 196, 15, 0.4))' }} />
        )}
        {esFallo && (
          <XCircle size={75} color="#e74c3c" style={{ filter: 'drop-shadow(0 0 15px rgba(231, 76, 60, 0.4))' }} />
        )}

        <div>
          <h1 className="heading-gold" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {esExito ? '¡PAGO APROBADO!' : esPendiente ? 'PAGO EN PROCESO' : 'PAGO NO COMPLETADO'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {esExito
              ? 'Tu pago a través de Mercado Pago fue acreditado con éxito.'
              : esPendiente
              ? 'El pago se encuentra pendiente de acreditación. Te notificaremos en cuanto se confirme.'
              : 'Hubo un inconveniente al procesar tu pago en Mercado Pago.'}
          </p>
        </div>

        {/* Detalle del Turno */}
        {turno && (
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.5rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h4 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.4rem', fontSize: '0.9rem', letterSpacing: '1px' }}>
              RESUMEN DE LA RESERVA
            </h4>
            <p style={{ fontSize: '0.9rem' }}>💈 <strong>Barbería:</strong> {turno.empresa?.nombre}</p>
            <p style={{ fontSize: '0.9rem' }}>✂️ <strong>Servicio:</strong> {turno.servicio?.nombre} (${turno.servicio?.precio})</p>
            {paymentId && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>🔖 <strong>ID Operación MP:</strong> {paymentId}</p>}
          </div>
        )}

        {/* Botones de acción */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', marginTop: '1rem' }}>
          {turnoId && (
            <Link
              to={`/pago/turno/${turnoId}`}
              className="btn-primary"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.9rem'
              }}
            >
              <Calendar size={18} /> Ver Comprobante y Turno
            </Link>
          )}

          <Link
            to="/"
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              textDecoration: 'none',
              padding: '0.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.target.style.color = 'var(--primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >
            <Home size={16} /> Volver al Inicio
          </Link>
        </div>

      </div>
    </div>
  );
}
