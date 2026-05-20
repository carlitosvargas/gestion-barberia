import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import publicService from '../services/publicService';
import {
  Calendar, MapPin, Phone, Clock, ArrowLeft, Scissors, Building2,
  ChevronRight, ChevronLeft, Check, CheckCircle, User, AlertCircle
} from 'lucide-react';
import alerts from '../utils/alerts';

// Constantes de formateo de fecha globales
const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const nombresDiasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function Reserva() {
  const { empresaId } = useParams();
  const navigate = useNavigate();

  // Estados
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Flujo de Reserva
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [mesActual, setMesActual] = useState(new Date());
  const [turnosOcupados, setTurnosOcupados] = useState([]);
  const [slotSeleccionado, setSlotSeleccionado] = useState('');
  const [mostrarFormularioDatos, setMostrarFormularioDatos] = useState(false);
  const [cargandoConfirmar, setCargandoConfirmar] = useState(false);

  // Datos Cliente
  const [formCliente, setFormCliente] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: ''
  });

  const [clienteVerificado, setClienteVerificado] = useState(false);
  const [cargandoVerificacion, setCargandoVerificacion] = useState(false);
  const [camposBloqueados, setCamposBloqueados] = useState(false);

  const [reservaExitosa, setReservaExitosa] = useState(false);
  const [detalleReservaCreada, setDetalleReservaCreada] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, [empresaId]);

  useEffect(() => {
    if (servicioSeleccionado && empresaSeleccionada) {
      cargarTurnosOcupados();
    }
  }, [servicioSeleccionado]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      if (empresaId === 'todas') {
        const data = await publicService.obtenerEmpresas();
        setEmpresas(data);
        setEmpresaSeleccionada(null);
      } else {
        const data = await publicService.obtenerEmpresaPorId(empresaId);
        setEmpresaSeleccionada(data);
      }
    } catch (err) {
      console.error(err);
      alerts.error('Error', 'No se pudo cargar la información.');
    } finally {
      setCargando(false);
    }
  };

  const cargarTurnosOcupados = async () => {
    try {
      const data = await publicService.obtenerTurnosOcupados(empresaSeleccionada.id);
      setTurnosOcupados(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeleccionarServicio = (servicio) => {
    setServicioSeleccionado(servicio);
    setSlotSeleccionado('');
    setMostrarFormularioDatos(false);
    setClienteVerificado(false);
    setCamposBloqueados(false);
    setFormCliente({
      nombre: '',
      apellido: '',
      telefono: '',
      email: ''
    });

    // Asegurarse de que la fecha seleccionada por defecto no sea pasada
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaSeleccionada < hoy) {
      setFechaSeleccionada(new Date());
      setMesActual(new Date());
    }
  };

  const handleVerificarTelefono = async (e) => {
    e.preventDefault();
    if (!formCliente.telefono || formCliente.telefono.trim() === '') {
      return alerts.error('Teléfono requerido', 'Por favor, ingresa tu número de teléfono.');
    }

    setCargandoVerificacion(true);
    try {
      const res = await publicService.verificarCliente(formCliente.telefono, empresaSeleccionada.id);
      if (res.existe) {
        setFormCliente(prev => ({
          ...prev,
          nombre: res.nombre,
          apellido: res.apellido,
          email: res.email || ''
        }));
        setCamposBloqueados(true);
        alerts.toast('¡Tus datos fueron cargados con éxito!', 'success');
      } else {
        setFormCliente(prev => ({
          ...prev,
          nombre: '',
          apellido: '',
          email: ''
        }));
        setCamposBloqueados(false);
        alerts.toast('Cliente nuevo detectado', 'info');
      }
      setClienteVerificado(true);
    } catch (err) {
      console.error(err);
      alerts.error('Error de verificación', 'No se pudo comprobar el número de teléfono.');
    } finally {
      setCargandoVerificacion(false);
    }
  };

  const handleConfirmarReserva = async (e) => {
    e.preventDefault();
    if (!slotSeleccionado) {
      return alerts.error('Falta seleccionar horario', 'Por favor, elige una hora para tu cita.');
    }

    setCargandoConfirmar(true);
    try {
      const anio = fechaSeleccionada.getFullYear();
      const mes = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
      const dia = String(fechaSeleccionada.getDate()).padStart(2, '0');
      const fechaTurno = new Date(`${anio}-${mes}-${dia}T${slotSeleccionado}:00`);

      const datos = {
        empresaId: empresaSeleccionada.id,
        servicioId: servicioSeleccionado.id,
        fecha: fechaTurno.toISOString(),
        clienteNombre: formCliente.nombre,
        clienteApellido: formCliente.apellido,
        clienteTelefono: formCliente.telefono,
        clienteEmail: formCliente.email || ''
      };

      const res = await publicService.crearTurno(datos);

      setDetalleReservaCreada({
        fecha: fechaTurno,
        barberia: empresaSeleccionada.nombre,
        servicio: servicioSeleccionado.nombre,
        precio: servicioSeleccionado.precio,
        direccion: empresaSeleccionada.direccion
      });

      alerts.success('¡Reserva Exitosa!', 'Tu turno ha sido agendado correctamente.');
      setReservaExitosa(true);
    } catch (err) {
      console.error(err);
      alerts.error('Error al reservar', err.response?.data?.mensaje || 'No se pudo completar la reserva.');
    } finally {
      setCargandoConfirmar(false);
    }
  };

  const handleReservarOtroServicio = () => {
    setReservaExitosa(false);
    setServicioSeleccionado(null);
    setSlotSeleccionado('');
    setMostrarFormularioDatos(false);
    cargarTurnosOcupados();
  };

  // --- LÓGICA DE CALENDARIO Y SLOTS (Cliente) ---

  const cambiarMes = (offset) => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + offset, 1));
  };

  const obtenerDiasCalendario = () => {
    const anio = mesActual.getFullYear();
    const mes = mesActual.getMonth();

    const primerDia = new Date(anio, mes, 1).getDay();
    const totalDias = new Date(anio, mes + 1, 0).getDate();

    const dias = [];
    const offset = primerDia === 0 ? 6 : primerDia - 1;

    for (let i = 0; i < offset; i++) {
      dias.push(null);
    }

    for (let d = 1; d <= totalDias; d++) {
      dias.push(new Date(anio, mes, d));
    }

    return dias;
  };

  const esMismoDia = (date1, date2) => {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const generarSlotsDelDia = () => {
    let horaInicio = 9;
    let horaFin = 20;

    if (empresaSeleccionada?.horarios) {
      try {
        const regex = /\b\d{2}:\d{2}\b/g;
        const matches = empresaSeleccionada.horarios.match(regex);
        if (matches && matches.length >= 2) {
          const slots = [];
          for (let i = 0; i < matches.length; i += 2) {
            if (!matches[i + 1]) break;
            const [startHoras, startMinutos] = matches[i].split(':').map(Number);
            const [endHoras, endMinutos] = matches[i + 1].split(':').map(Number);

            const inicioEnMinutos = startHoras * 60 + startMinutos;
            const finEnMinutos = endHoras * 60 + endMinutos;

            for (let m = inicioEnMinutos; m < finEnMinutos; m += 30) {
              const h = Math.floor(m / 60);
              const min = m % 60;
              const hStr = h < 10 ? `0${h}` : `${h}`;
              const minStr = min === 0 ? '00' : `${min}`;
              slots.push(`${hStr}:${minStr}`);
            }
          }
          return slots;
        }
      } catch (error) {
        console.error(error);
      }
    }

    // Rango estándar por defecto si falla o no hay configurados
    const slots = [];
    for (let h = horaInicio; h < horaFin; h++) {
      const hStr = h < 10 ? `0${h}` : `${h}`;
      slots.push(`${hStr}:00`);
      slots.push(`${hStr}:30`);
    }
    return slots;
  };

  const slotEstaOcupado = (slot) => {
    return turnosOcupados.some(t => {
      const f = new Date(t.fecha);
      const horaStr = `${String(f.getHours()).padStart(2, '0')}:${String(f.getMinutes()).padStart(2, '0')}`;
      return esMismoDia(f, fechaSeleccionada) && horaStr === slot;
    });
  };

  // --- FIN LÓGICA DE CALENDARIO ---

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Cargando información...</p>
      </div>
    );
  }

  // PANTALLA EXCELENTE: Reserva Exitosa
  if (reservaExitosa && detalleReservaCreada) {
    const nombresDiasSemanaCompleto = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return (
      <div className="reserva-page" style={{ padding: '6rem 2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3.5rem 2.5rem', borderTop: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.8rem' }}>
          <CheckCircle size={70} color="var(--primary)" style={{ filter: 'drop-shadow(0 0 10px rgba(201,160,99,0.4))' }} />
          <div>
            <h1 className="heading-gold" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>¡TURNO AGENDADO!</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Tu reserva ha sido confirmada en el sistema con éxito.</p>
          </div>

          <div style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.8rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', letterSpacing: '1px' }}>DETALLES DE LA CITA</h4>
            <p style={{ fontSize: '0.95rem' }}>💈 <strong>Barbería:</strong> {detalleReservaCreada.barberia}</p>
            <p style={{ fontSize: '0.95rem' }}>✂️ <strong>Servicio:</strong> {detalleReservaCreada.servicio} (${detalleReservaCreada.precio})</p>
            <p style={{ fontSize: '0.95rem' }}>📅 <strong>Fecha:</strong> {nombresDiasSemanaCompleto[detalleReservaCreada.fecha.getDay()]} {detalleReservaCreada.fecha.getDate()} de {nombresMeses[detalleReservaCreada.fecha.getMonth()]} de {detalleReservaCreada.fecha.getFullYear()}</p>
            <p style={{ fontSize: '0.95rem' }}>🕒 <strong>Horario:</strong> {slotSeleccionado} hs</p>
            {detalleReservaCreada.direccion && <p style={{ fontSize: '0.95rem' }}>📍 <strong>Dirección:</strong> {detalleReservaCreada.direccion}</p>}
          </div>

          <a
            href={`https://wa.me/${empresaSeleccionada?.telefono?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(
              `¡Hola! Confirmo mi turno en *${detalleReservaCreada.barberia}*:\n\n` +
              `✂️ *Servicio:* ${detalleReservaCreada.servicio}\n` +
              `📅 *Fecha:* ${nombresDiasSemanaCompleto[detalleReservaCreada.fecha.getDay()]} ${detalleReservaCreada.fecha.getDate()} de ${nombresMeses[detalleReservaCreada.fecha.getMonth()]} de ${detalleReservaCreada.fecha.getFullYear()}\n` +
              `🕒 *Horario:* ${slotSeleccionado} hs\n` +
              `💵 *Precio:* $${detalleReservaCreada.precio}\n` +
              (detalleReservaCreada.direccion ? `📍 *Dirección:* ${detalleReservaCreada.direccion}\n` : '') +
              `\n¡Muchas gracias! Mi nombre es ${formCliente.nombre} ${formCliente.apellido}.`
            )}`}
            target="_blank"
            rel="noreferrer"
            style={{
              width: '100%',
              padding: '0.8rem',
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
              borderRadius: '6px',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          >
            📱 Enviar confirmación a WhatsApp de la Empresa
          </a>

          <button
            onClick={handleReservarOtroServicio}
            className="btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontWeight: 'bold', cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Reservar otro servicio en esta sucursal
          </button>

          <Link
            to="/"
            style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', marginTop: '0.5rem', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  // VISTA 1: Lista de todas las empresas disponibles
  if (empresaId === 'todas') {
    return (
      <div className="reserva-page">
        <header style={{ marginBottom: '3rem', position: 'relative' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Volver al Inicio
          </Link>
          <h1 className="heading-gold" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>ENCUENTRA TU SUCURSAL</h1>
          <p style={{ color: 'var(--text-muted)' }}>Selecciona una de nuestros locales disponibles para agendar tu cita con los mejores profesionales.</p>
        </header>

        {empresas.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <Building2 size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>No hay barberías disponibles</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Actualmente no hay sucursales registradas en la plataforma.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '2rem' }}>
            {empresas.map(emp => (
              <div key={emp.id} className="glass-card card-hover" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '320px', transition: 'all 0.3s ease' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '65px', height: '65px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--glass)' }}>
                      {emp.logo ? (
                        <img src={emp.logo} alt={emp.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Building2 size={24} color="var(--primary)" />
                      )}
                    </div>
                    <div>
                      <h3 style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>{emp.nombre}</h3>
                      {emp.direccion && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}><MapPin size={12} /> {emp.direccion}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', margin: '1.5rem 0', padding: '1rem 0', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
                    {emp.dias && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                        <Calendar size={14} color="var(--primary)" />
                        <span><strong>Días:</strong> {emp.dias}</span>
                      </div>
                    )}
                    {emp.horarios && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                        <Clock size={14} color="var(--primary)" />
                        <span><strong>Horarios:</strong> {emp.horarios}</span>
                      </div>
                    )}
                    {emp.telefono && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                        <Phone size={14} color="var(--primary)" />
                        <span><strong>Teléfono:</strong> {emp.telefono}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/reserva/${emp.id}`)}
                  className="btn-primary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}
                >
                  Ver Servicios y Reservar <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const hoyCero = new Date();
  hoyCero.setHours(0, 0, 0, 0);
  const esDiaPasado = fechaSeleccionada < hoyCero;

  // VISTA 3: Flujo de selección de Día y Hora o Completar Datos
  if (servicioSeleccionado) {
    return (
      <div className="reserva-page">
        <header style={{ marginBottom: '3rem' }}>
          <button
            onClick={() => {
              if (mostrarFormularioDatos) {
                setMostrarFormularioDatos(false);
              } else {
                setServicioSeleccionado(null);
                setSlotSeleccionado('');
              }
            }}
            style={{ background: 'transparent', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem', padding: 0 }}
          >
            <ArrowLeft size={16} /> Volver a {mostrarFormularioDatos ? 'elegir fecha y hora' : 'elegir servicios'}
          </button>

          {empresaSeleccionada && (
            <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
              <Building2 size={24} color="var(--primary)" />
              <div>
                <h3 style={{ color: 'var(--primary)', fontSize: '1.2rem', letterSpacing: '1px' }}>{empresaSeleccionada.nombre.toUpperCase()}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reservando: <strong>{servicioSeleccionado.nombre} (${servicioSeleccionado.precio})</strong></span>
              </div>
            </div>
          )}
        </header>

        {!mostrarFormularioDatos ? (
          /* PASO A: CALENDARIO Y HORA */
          <div className="responsive-grid-step-a">

            {/* LADO IZQUIERDO: CALENDARIO CLIENTE */}
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
                  {nombresMeses[mesActual.getMonth()]} {mesActual.getFullYear()}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => cambiarMes(-1)} style={{ background: 'var(--glass)', border: 'none', padding: '0.5rem', borderRadius: '6px', color: 'white', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
                  <button onClick={() => cambiarMes(1)} style={{ background: 'var(--glass)', border: 'none', padding: '0.5rem', borderRadius: '6px', color: 'white', cursor: 'pointer' }}><ChevronRight size={16} /></button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div>LU</div><div>MA</div><div>MI</div><div>JU</div><div>VI</div><div>SA</div><div>DO</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.6rem', textAlign: 'center' }}>
                {obtenerDiasCalendario().map((dia, idx) => {
                  if (!dia) return <div key={`empty-${idx}`} />;
                  const seleccionado = esMismoDia(dia, fechaSeleccionada);
                  const hoy = esMismoDia(dia, new Date());
                  const diaPasado = dia < hoyCero;

                  return (
                    <button
                      key={`dia-${idx}`}
                      onClick={() => !diaPasado && setFechaSeleccionada(dia)}
                      disabled={diaPasado}
                      style={{
                        position: 'relative',
                        background: seleccionado ? 'var(--primary)' : 'var(--glass)',
                        border: seleccionado ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        padding: '0.75rem 0',
                        color: diaPasado ? 'rgba(255,255,255,0.08)' : seleccionado ? 'black' : hoy ? 'var(--primary)' : 'white',
                        fontWeight: seleccionado || hoy ? 'bold' : 'normal',
                        cursor: diaPasado ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '42px',
                        opacity: diaPasado ? 0.3 : 1
                      }}
                    >
                      {dia.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LADO DERECHO: SLOTS DE HORA CLIENTE */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--primary)', fontSize: '1.3rem' }}>
                  {nombresDiasSemana[fechaSeleccionada.getDay()]}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {fechaSeleccionada.getDate()} de {nombresMeses[fechaSeleccionada.getMonth()]} de {fechaSeleccionada.getFullYear()}
                </span>
              </div>

              {esDiaPasado ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
                  <AlertCircle size={36} color="var(--primary)" style={{ opacity: 0.6 }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No se pueden reservar turnos para fechas en el pasado.<br />Por favor, selecciona una fecha válida en el calendario.</p>
                </div>
              ) : (
                <>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Elige uno de los horarios disponibles para tu turno:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {generarSlotsDelDia().map((slot, idx) => {
                      const ocupado = slotEstaOcupado(slot);
                      const elegido = slotSeleccionado === slot;

                      return (
                        <button
                          key={`slot-${idx}`}
                          onClick={() => !ocupado && setSlotSeleccionado(slot)}
                          disabled={ocupado}
                          style={{
                            background: elegido ? 'var(--primary)' : ocupado ? 'rgba(255,255,255,0.02)' : 'var(--glass)',
                            border: elegido ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                            color: elegido ? 'black' : ocupado ? 'rgba(255,255,255,0.1)' : 'white',
                            padding: '0.8rem 0',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            cursor: ocupado ? 'not-allowed' : 'pointer',
                            textDecoration: ocupado ? 'line-through' : 'none',
                            transition: 'all 0.2s ease',
                            opacity: ocupado ? 0.3 : 1
                          }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>

                  {slotSeleccionado && (
                    <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setMostrarFormularioDatos(true)}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem', fontWeight: 'bold' }}
                      >
                        Continuar con mis datos <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        ) : (
          /* PASO B: FORMULARIO DE RESERVA CLIENTE */
          <div className="responsive-grid-step-b">

            {/* LADO IZQUIERDO: FORMULARIO */}
            <div className="glass-card" style={{ padding: '2.5rem' }}>
              {!clienteVerificado ? (
                <>
                  <h2 className="heading-gold" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>VERIFICAR TELÉFONO</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>Por favor, ingresa tu número de teléfono celular para continuar con la reserva.</p>

                  <form onSubmit={handleVerificarTelefono} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Teléfono Celular</label>
                      <input
                        placeholder="Ej: +54 9 11..."
                        value={formCliente.telefono}
                        onChange={e => setFormCliente({ ...formCliente, telefono: e.target.value })}
                        style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={cargandoVerificacion}
                      style={{ width: '100%', padding: '0.9rem', marginTop: '1.5rem', fontWeight: 'bold', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      {cargandoVerificacion ? (
                        <>
                          <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid transparent', borderTopColor: 'black', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                          Verificando...
                        </>
                      ) : (
                        <>
                          Continuar <ChevronRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 className="heading-gold" style={{ fontSize: '1.8rem', margin: 0 }}>DATOS PERSONALES</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setClienteVerificado(false);
                        setCamposBloqueados(false);
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold', padding: 0 }}
                    >
                      <ArrowLeft size={14} /> Cambiar Teléfono
                    </button>
                  </div>

                  {camposBloqueados ? (
                    <p style={{ color: '#2ecc71', marginBottom: '2.5rem', fontSize: '0.85rem', background: 'rgba(46, 204, 113, 0.05)', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(46, 204, 113, 0.15)' }}>
                      ✓ Hemos encontrado tus datos asociados a este número de teléfono. Están completados y no se pueden modificar. Si hay algún error, puedes cambiar el teléfono arriba.
                    </p>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
                      Es tu primera vez reservando en esta sucursal. Por favor, completa tus datos para finalizar.
                    </p>
                  )}

                  <form onSubmit={handleConfirmarReserva} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="form-row-2col">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nombre</label>
                        <input
                          placeholder="Ej: Juan"
                          value={formCliente.nombre}
                          onChange={e => setFormCliente({ ...formCliente, nombre: e.target.value })}
                          style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none', opacity: camposBloqueados ? 0.6 : 1 }}
                          required
                          disabled={camposBloqueados}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Apellido</label>
                        <input
                          placeholder="Ej: Pérez"
                          value={formCliente.apellido}
                          onChange={e => setFormCliente({ ...formCliente, apellido: e.target.value })}
                          style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none', opacity: camposBloqueados ? 0.6 : 1 }}
                          required
                          disabled={camposBloqueados}
                        />
                      </div>
                    </div>

                    <div className="form-row-2col">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Teléfono Celular</label>
                        <input
                          value={formCliente.telefono}
                          style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none', opacity: 0.6 }}
                          disabled
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Correo Electrónico (Opcional)</label>
                        <input
                          placeholder="juanperez@ejemplo.com"
                          type="email"
                          value={formCliente.email}
                          onChange={e => setFormCliente({ ...formCliente, email: e.target.value })}
                          style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none', opacity: camposBloqueados ? 0.6 : 1 }}
                          disabled={camposBloqueados}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={cargandoConfirmar}
                      style={{ width: '100%', padding: '0.9rem', marginTop: '1.5rem', fontWeight: 'bold', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      {cargandoConfirmar ? (
                        <>
                          <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid transparent', borderTopColor: 'black', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                          Agendando cita...
                        </>
                      ) : (
                        <>
                          <Check size={18} /> Confirmar Mi Turno
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* LADO DERECHO: DETALLE DEL TURNO RESUMIDO */}
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.8rem', borderLeft: '4px solid var(--primary)', alignSelf: 'flex-start' }}>
              <h3 style={{ color: 'var(--primary)', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', fontSize: '1.1rem' }}>RESUMEN DE RESERVA</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Barbería</span>
                  <strong style={{ fontSize: '1.15rem', color: 'white' }}>{empresaSeleccionada.nombre}</strong>
                  {empresaSeleccionada.direccion && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>📍 {empresaSeleccionada.direccion}</span>}
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Servicio Seleccionado</span>
                  <strong style={{ fontSize: '1.1rem', color: 'white' }}>{servicioSeleccionado.nombre}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>⏱ Duración: {servicioSeleccionado.duracion} min</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Fecha</span>
                    <strong style={{ fontSize: '0.95rem' }}>{fechaSeleccionada.getDate()}/{fechaSeleccionada.getMonth() + 1}/{fechaSeleccionada.getFullYear()}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Horario</span>
                    <strong style={{ fontSize: '0.95rem' }}>{slotSeleccionado} hs</strong>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Total a pagar:</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--primary)' }}>${servicioSeleccionado.precio}</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    );
  }

  // VISTA 2: Detalle de empresa seleccionada y sus servicios asociados
  return (
    <div className="reserva-page">
      <header style={{ marginBottom: '3rem' }}>
        <button
          onClick={() => navigate('/reserva/todas')}
          style={{ background: 'transparent', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem', padding: 0 }}
        >
          <ArrowLeft size={16} /> Volver a todas las sucursales
        </button>

        {/* Ficha compacta de la empresa seleccionada */}
        {empresaSeleccionada && (
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary)', background: 'var(--glass)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {empresaSeleccionada.logo ? (
                  <img src={empresaSeleccionada.logo} alt={empresaSeleccionada.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Building2 size={32} color="var(--primary)" />
                )}
              </div>
              <div>
                <h1 className="heading-gold" style={{ fontSize: '2.5rem', marginBottom: '0.3rem' }}>{empresaSeleccionada.nombre.toUpperCase()}</h1>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  {empresaSeleccionada.direccion && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14} color="var(--primary)" /> {empresaSeleccionada.direccion}</span>}
                  {empresaSeleccionada.telefono && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={14} color="var(--primary)" /> {empresaSeleccionada.telefono}</span>}
                  {empresaSeleccionada.dias && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} color="var(--primary)" /> {empresaSeleccionada.dias}</span>}
                  {empresaSeleccionada.horarios && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} color="var(--primary)" /> {empresaSeleccionada.horarios}</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <section style={{ marginTop: '4rem' }}>
        <h2 className="heading-gold" style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Scissors size={24} /> SERVICIOS DISPONIBLES
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Elige el servicio que deseas realizarte para proceder con la reserva.</p>

        {!empresaSeleccionada?.servicios || empresaSeleccionada.servicios.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <Scissors size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>No hay servicios cargados</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Esta sucursal aún no tiene servicios cargados para reservar online.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {empresaSeleccionada.servicios.map(serv => (
              <div key={serv.id} className="glass-card card-hover" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px', borderTop: '2px solid transparent', transition: 'all 0.3s ease' }}>
                <div>
                  <h3 style={{ color: 'var(--primary)', fontSize: '1.3rem', marginBottom: '1rem' }}>{serv.nombre}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    <Clock size={16} /> <span>{serv.duracion} minutos</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.2rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>${serv.precio}</span>
                  <button
                    onClick={() => handleSeleccionarServicio(serv)}
                    className="btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    Seleccionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
