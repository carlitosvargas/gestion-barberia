import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Scissors, Phone, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import pagoService from '../services/pagoService';

const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const nombresDiasSemanaCompleto = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

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

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Cargando información del turno...</p>
      </div>
    );
  }

  const fechaTurno = turno?.fecha ? new Date(turno.fecha) : null;
  const horaStr = fechaTurno ? `${String(fechaTurno.getHours()).padStart(2, '0')}:${String(fechaTurno.getMinutes()).padStart(2, '0')}` : '';
  const rutaServicios = turno?.empresa?.id ? `/reserva/${turno.empresa.id}` : turno?.empresaId ? `/reserva/${turno.empresaId}` : '/reserva/todas';
  const rutaTodosServicios = '/reserva/todas';
  return (
    <div className="reserva-page" style={{ padding: '5rem 1.5rem', maxWidth: '620px', margin: '0 auto', textAlign: 'center' }}>
      <div className="glass-card" style={{
        padding: '3.5rem 2.5rem',
        borderTop: `4px solid ${esExito ? 'var(--primary)' : esPendiente ? '#f1c40f' : '#e74c3c'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.8rem'
      }}>

        {/* Icono de Estado */}
        {esExito && (
          <CheckCircle size={75} color="var(--primary)" style={{ filter: 'drop-shadow(0 0 12px rgba(201,160,99,0.5))' }} />
        )}
        {esPendiente && (
          <Clock size={75} color="#f1c40f" style={{ filter: 'drop-shadow(0 0 12px rgba(241, 196, 15, 0.4))' }} />
        )}
        {esFallo && (
          <XCircle size={75} color="#e74c3c" style={{ filter: 'drop-shadow(0 0 12px rgba(231, 76, 60, 0.4))' }} />
        )}

        <div>
          <h1 className="heading-gold" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
            {esExito ? '¡TURNO Y PAGO CONFIRMADO!' : esPendiente ? '¡TURNO REGISTRADO!' : 'PAGO NO COMPLETADO'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {esExito
              ? 'Tu reserva y tu pago con Mercado Pago se han registrado con éxito.'
              : esPendiente
                ? 'Tu reserva está agendada. El pago se encuentra en proceso de acreditación.'
                : 'El turno está reservado pero el pago no se completó. Puedes abonarlo en el local.'}
          </p>
        </div>

        {/* Badge de Estado del Pago */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '4px 14px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          background: esExito ? 'rgba(46, 204, 113, 0.15)' : esPendiente ? 'rgba(241, 196, 15, 0.15)' : 'rgba(231, 76, 60, 0.15)',
          color: esExito ? '#2ecc71' : esPendiente ? '#f1c40f' : '#e74c3c',
          border: `1px solid ${esExito ? '#2ecc7155' : esPendiente ? '#f1c40f55' : '#e74c3c55'}`
        }}>
          {esExito ? <CheckCircle2 size={14} /> : <Clock size={14} />}
          {esExito ? 'PAGO APROBADO CON MERCADO PAGO' : esPendiente ? 'PAGO PENDIENTE' : 'PAGO PENDIENTE EN LOCAL'}
        </div>

        {/* DETALLES DE LA CITA */}
        {turno && (
          <div style={{
            width: '100%',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '1.8rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h4 style={{ color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', letterSpacing: '1px' }}>
              DETALLES DE LA CITA
            </h4>
            <p style={{ fontSize: '0.95rem' }}>💈 <strong>Barbería:</strong> {turno.empresa?.nombre}</p>
            <p style={{ fontSize: '0.95rem' }}>✂️ <strong>Servicio:</strong> {turno.servicio?.nombre} (${turno.servicio?.precio})</p>
            {fechaTurno && (
              <p style={{ fontSize: '0.95rem' }}>
                📅 <strong>Fecha:</strong> {nombresDiasSemanaCompleto[fechaTurno.getDay()]} {fechaTurno.getDate()} de {nombresMeses[fechaTurno.getMonth()]} de {fechaTurno.getFullYear()}
              </p>
            )}
            {horaStr && <p style={{ fontSize: '0.95rem' }}>🕒 <strong>Horario:</strong> {horaStr} hs</p>}
            {turno.cliente && (
              <p style={{ fontSize: '0.95rem' }}>👤 <strong>Cliente:</strong> {turno.cliente.nombre} {turno.cliente.apellido}</p>
            )}
            {turno.empresa?.direccion && <p style={{ fontSize: '0.95rem' }}>📍 <strong>Dirección:</strong> {turno.empresa.direccion}</p>}
            {paymentId && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--glass-border)', paddingTop: '0.5rem' }}>
                🔖 <strong>ID Operación MP:</strong> {paymentId}
              </p>
            )}
          </div>
        )}

        {/* Botón WhatsApp de Confirmación */}
        {turno?.empresa?.telefono && fechaTurno && (
          <a
            href={`https://wa.me/${turno.empresa.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
              `¡Hola! Confirmo mi turno en *${turno.empresa.nombre}*:\n\n` +
              `✂️ *Servicio:* ${turno.servicio?.nombre}\n` +
              `📅 *Fecha:* ${nombresDiasSemanaCompleto[fechaTurno.getDay()]} ${fechaTurno.getDate()} de ${nombresMeses[fechaTurno.getMonth()]} de ${fechaTurno.getFullYear()}\n` +
              `🕒 *Horario:* ${horaStr} hs\n` +
              `💵 *Estado del Pago:* ${esExito ? 'ABONADO CON MERCADO PAGO' : 'PENDIENTE'}\n` +
              (turno.empresa.direccion ? `📍 *Dirección:* ${turno.empresa.direccion}\n` : '') +
              `\n¡Muchas gracias! Mi nombre es ${turno.cliente?.nombre || ''} ${turno.cliente?.apellido || ''}.`
            )}`}
            target="_blank"
            rel="noreferrer"
            style={{
              width: '100%',
              padding: '0.85rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#25d366',
              color: 'black',
              textDecoration: 'none',
              gap: '0.5rem',
              fontSize: '0.95rem',
              borderRadius: '8px',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          >
            📱 Enviar confirmación a WhatsApp de la Empresa
          </a>
        )}

        {/* Botón Volver a los Servicios */}
        <Link
          to={rutaServicios}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '0.85rem',
            fontWeight: 'bold',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem'
          }}
        >
          <Scissors size={18} /> Reservar otro servicio en esta sucursal
        </Link>

        {/*  
         Link Volver al Inicio */}
        <Link
          to={rutaTodosServicios}
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            textDecoration: 'none',
            marginTop: '-0.5rem',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.target.style.color = 'var(--primary)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        >
          Volver al Inicio
        </Link>

      </div>
    </div>
  );
}
