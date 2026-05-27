import React, { useState, useEffect } from 'react';
import empresaService from '../../services/empresaService';
import { DashboardLayout, NavItem, modalStyles } from '../../components/dashboard/DashboardLayout';
import {
  Calendar, Scissors, Settings, Trash2, LayoutDashboard, Pencil, Save,
  Image as ImageIcon, Building2, Clock, Upload, ChevronLeft, ChevronRight,
  Plus, Check, X, User, Phone, CheckCircle, BarChart3
} from 'lucide-react';
import alerts from '../../utils/alerts';
import { optimizarImagen } from '../../utils/imageOptimizer';

const EmpresaPanel = ({ usuario, logout, navigate }) => {
  const [seccion, setSeccion] = useState('inicio');
  const [servicios, setServicios] = useState([]);
  const [miEmpresa, setMiEmpresa] = useState(null);

  // Formulario Mi Empresa
  const [formEmpresa, setFormEmpresa] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    logo: '',
    dias: '',
    horarios: ''
  });

  // Modales
  const [mostrarModalServicio, setMostrarModalServicio] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [servicioEnEdicion, setServicioEnEdicion] = useState(null);
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: '', precio: '', duracion: 30 });

  // Gestión de Turnos (Calendario y Agenda)
  const [turnos, setTurnos] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [mesActual, setMesActual] = useState(new Date());
  const [mostrarModalTurnoManual, setMostrarModalTurnoManual] = useState(false);
  const [nuevoTurnoManual, setNuevoTurnoManual] = useState({
    clienteNombre: '',
    clienteApellido: '',
    clienteTelefono: '',
    clienteEmail: '',
    servicioId: '',
    hora: '09:00'
  });

  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  useEffect(() => {
    cargarDatos();
  }, [seccion]);

  // Al cargar miEmpresa, actualizar el formulario de configuración
  useEffect(() => {
    if (miEmpresa) {
      setFormEmpresa({
        nombre: miEmpresa.nombre || '',
        direccion: miEmpresa.direccion || '',
        telefono: miEmpresa.telefono || '',
        logo: miEmpresa.logo || '',
        dias: miEmpresa.dias || '',
        horarios: miEmpresa.horarios || ''
      });
    }
  }, [miEmpresa]);

  const cargarDatos = async () => {
    try {
      if (seccion === 'servicios') {
        const data = await empresaService.obtenerServicios();
        setServicios(data);
      }
      if (seccion === 'turnos' || seccion === 'reportes') {
        const dataServicios = await empresaService.obtenerServicios();
        setServicios(dataServicios);
        if (usuario.empresaId) {
          const dataTurnos = await empresaService.obtenerTurnos(usuario.empresaId);
          setTurnos(dataTurnos);
        }
      }
      if (usuario.empresaId) {
        const data = await empresaService.obtenerMiEmpresa(usuario.empresaId);
        setMiEmpresa(data);
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdateEmpresa = async (e) => {
    e.preventDefault();

    // Validar el formato de horarios en el frontend
    if (formEmpresa.horarios && formEmpresa.horarios.trim() !== '') {
      const matches = formEmpresa.horarios.match(/\b\d{2}:\d{2}\b/g);
      if (!matches || matches.length < 2 || matches.length % 2 !== 0) {
        return alerts.error(
          'Formato de Horarios Inválido',
          "Debes ingresar parejas de inicio y fin válidas en formato HH:MM. Ej: '09:00 a 13:00' o '09:00 a 13:00, 16:00 a 20:00'"
        );
      }
    }

    try {
      await empresaService.actualizarMiEmpresa(miEmpresa.id, formEmpresa);
      alerts.success('¡Actualizado!', 'Los datos de tu empresa han sido guardados.');
      cargarDatos();
    } catch (err) {
      alerts.error('Error', err.response?.data?.mensaje || 'No se pudieron guardar los cambios.');
    }
  };

  const handleSubirLogoLocal = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      alerts.toast('Optimizando y subiendo imagen...', 'info');
      const blobOptimizado = await optimizarImagen(file, 250, 250);
      const res = await empresaService.subirImagen(blobOptimizado);
      setFormEmpresa(prev => ({ ...prev, logo: res.url }));
      alerts.success('¡Logo cargado!', 'El logo local ha sido cargado correctamente.');
    } catch (err) {
      console.error(err);
      alerts.error('Error', err.response?.data?.mensaje || 'No se pudo subir la imagen.');
    }
  };

  const handleCrearServicio = async (e) => {
    e.preventDefault();
    try {
      await empresaService.crearServicio(nuevoServicio);
      alerts.success('¡Añadido!', 'El servicio ha sido creado correctamente.');
      setMostrarModalServicio(false);
      setNuevoServicio({ nombre: '', precio: '', duracion: 30 });
      cargarDatos();
    } catch (err) {
      alerts.error('Error', err.response?.data?.mensaje || 'No se pudo crear el servicio');
    }
  };

  const handleActualizarServicio = async (e) => {
    e.preventDefault();
    try {
      await empresaService.actualizarServicio(servicioEnEdicion.id, servicioEnEdicion);
      alerts.success('¡Actualizado!', 'El servicio se ha modificado correctamente.');
      setMostrarModalEditar(false);
      setServicioEnEdicion(null);
      cargarDatos();
    } catch (err) {
      alerts.error('Error', 'No se pudo actualizar el servicio');
    }
  };

  const handleDeleteServicio = async (id) => {
    const confirmacion = await alerts.confirm('¿Estás seguro?', 'Esta acción eliminará el servicio permanentemente.');
    if (confirmacion.isConfirmed) {
      try {
        await empresaService.eliminarServicio(id);
        alerts.toast('Servicio eliminado con éxito');
        cargarDatos();
      } catch (err) {
        alerts.error('Error', 'No se pudo eliminar el servicio');
      }
    }
  };

  const abrirEdicion = (servicio) => {
    setServicioEnEdicion({ ...servicio });
    setMostrarModalEditar(true);
  };

  // --- LÓGICA DE TURNOS ---

  const handleCambiarEstadoTurno = async (turnoId, nuevoEstado) => {
    try {
      const turnoAfectado = turnos.find(t => t.id === turnoId);

      await empresaService.actualizarEstadoTurno(turnoId, nuevoEstado);
      alerts.toast(`Turno ${nuevoEstado.toLowerCase()} con éxito`, 'success');
      cargarDatos();

      // Si el dueño cancela el turno, ofrecer enviarle un WhatsApp al cliente
      if (nuevoEstado === 'CANCELADO' && turnoAfectado?.cliente?.telefono) {
        const confirmacion = await alerts.confirm(
          '¿Notificar al cliente?',
          `¿Deseas enviarle un mensaje automático al WhatsApp de ${turnoAfectado.cliente.nombre} informando la cancelación del turno?`
        );

        if (confirmacion.isConfirmed) {
          const fechaObj = new Date(turnoAfectado.fecha);
          const horaStr = `${String(fechaObj.getHours()).padStart(2, '0')}:${String(fechaObj.getMinutes()).padStart(2, '0')}`;
          const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          });

          const mensaje = `Hola *${turnoAfectado.cliente.nombre}*! Te escribimos de *${miEmpresa?.nombre || 'nuestro establecimiento'}* para informarte que lamentablemente hemos cancelado tu turno de *${turnoAfectado.servicio?.nombre || 'Servicio'}* agendado para el *${fechaFormateada}* a las *${horaStr} hs*. Pedimos disculpas por cualquier inconveniente provocado.`;

          const linkWhatsApp = `https://wa.me/${turnoAfectado.cliente.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(mensaje)}`;
          window.open(linkWhatsApp, '_blank');
        }
      }
    } catch (err) {
      console.error(err);
      alerts.error('Error', 'No se pudo cambiar el estado del turno.');
    }
  };

  const handleCrearTurnoManual = async (e) => {
    e.preventDefault();
    try {
      const anio = fechaSeleccionada.getFullYear();
      const mes = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
      const dia = String(fechaSeleccionada.getDate()).padStart(2, '0');
      const fechaTurno = new Date(`${anio}-${mes}-${dia}T${nuevoTurnoManual.hora}:00`);

      const datos = {
        empresaId: usuario.empresaId,
        servicioId: parseInt(nuevoTurnoManual.servicioId),
        fecha: fechaTurno.toISOString(),
        clienteNombre: nuevoTurnoManual.clienteNombre,
        clienteApellido: nuevoTurnoManual.clienteApellido,
        clienteTelefono: nuevoTurnoManual.clienteTelefono,
        clienteEmail: nuevoTurnoManual.clienteEmail || ''
      };

      await empresaService.crearTurno(datos);
      alerts.success('¡Agendado!', 'El turno manual se registró con éxito.');
      setMostrarModalTurnoManual(false);
      setNuevoTurnoManual({
        clienteNombre: '',
        clienteApellido: '',
        clienteTelefono: '',
        clienteEmail: '',
        servicioId: '',
        hora: '09:00'
      });
      cargarDatos();
    } catch (err) {
      console.error(err);
      alerts.error('Error', err.response?.data?.mensaje || 'No se pudo agendar el turno.');
    }
  };

  const cambiarMes = (offset) => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + offset, 1));
  };

  const obtenerDiasCalendario = () => {
    const anio = mesActual.getFullYear();
    const mes = mesActual.getMonth();

    const primerDia = new Date(anio, mes, 1).getDay();
    const totalDias = new Date(anio, mes + 1, 0).getDate();

    const dias = [];

    // Rellenar espacios vacíos antes del primer día (Ajustando a semana que empieza el Lunes)
    const offset = primerDia === 0 ? 6 : primerDia - 1;
    for (let i = 0; i < offset; i++) {
      dias.push(null);
    }

    for (let d = 1; d <= totalDias; d++) {
      dias.push(new Date(anio, mes, d));
    }

    return dias;
  };

  const diaTieneTurnos = (date) => {
    if (!date) return false;
    return turnos.some(t => {
      const fechaTurno = new Date(t.fecha);
      return (
        fechaTurno.getFullYear() === date.getFullYear() &&
        fechaTurno.getMonth() === date.getMonth() &&
        fechaTurno.getDate() === date.getDate() &&
        t.estado !== 'CANCELADO'
      );
    });
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
    const rangoPorDefecto = [];
    for (let h = 9; h < 20; h++) {
      const horaStr = h < 10 ? `0${h}` : `${h}`;
      rangoPorDefecto.push(`${horaStr}:00`);
      rangoPorDefecto.push(`${horaStr}:30`);
    }

    if (!miEmpresa?.horarios) {
      return rangoPorDefecto;
    }

    try {
      // Extraer todas las horas con formato HH:MM (ej: 09:00, 12:30)
      const regex = /\b\d{2}:\d{2}\b/g;
      const matches = miEmpresa.horarios.match(regex);

      if (!matches || matches.length < 2) {
        return rangoPorDefecto;
      }

      const slots = [];

      // Procesar los rangos en parejas de inicio y fin
      for (let i = 0; i < matches.length; i += 2) {
        if (!matches[i + 1]) break; // Si no hay pareja de fin, salir

        const [startHoras, startMinutos] = matches[i].split(':').map(Number);
        const [endHoras, endMinutos] = matches[i + 1].split(':').map(Number);

        // Convertir todo a minutos absolutos para evitar problemas aritméticos
        const inicioEnMinutos = startHoras * 60 + startMinutos;
        const finEnMinutos = endHoras * 60 + endMinutos;

        // Generar intervalos de 30 minutos (el último turno debe iniciar antes de la hora de cierre)
        for (let m = inicioEnMinutos; m < finEnMinutos; m += 30) {
          const h = Math.floor(m / 60);
          const min = m % 60;
          const hStr = h < 10 ? `0${h}` : `${h}`;
          const minStr = min === 0 ? '00' : `${min}`;
          slots.push(`${hStr}:${minStr}`);
        }
      }

      return slots.length > 0 ? slots : rangoPorDefecto;
    } catch (error) {
      console.error('Error al generar slots de horario:', error);
      return rangoPorDefecto;
    }
  };

  const obtenerEstadisticasClientes = () => {
    const mapaClientes = {};

    turnos.forEach(t => {
      if (!t.cliente) return;
      const key = t.cliente.id;
      if (!mapaClientes[key]) {
        mapaClientes[key] = {
          cliente: t.cliente,
          total: 0,
          PENDIENTE: 0,
          CONFIRMADO: 0,
          COMPLETADO: 0,
          CANCELADO: 0
        };
      }
      mapaClientes[key].total += 1;
      if (mapaClientes[key].hasOwnProperty(t.estado)) {
        mapaClientes[key][t.estado] += 1;
      }
    });

    return Object.values(mapaClientes).sort((a, b) => b.total - a.total);
  };

  // --- FIN LÓGICA DE TURNOS ---

  const sidebarItems = (
    <>
      <NavItem active={seccion === 'inicio'} onClick={() => setSeccion('inicio')} icon={<LayoutDashboard size={20} />} label="Inicio" />
      <NavItem active={seccion === 'turnos'} onClick={() => setSeccion('turnos')} icon={<Calendar size={20} />} label="Turnos" />
      <NavItem active={seccion === 'reportes'} onClick={() => setSeccion('reportes')} icon={<BarChart3 size={20} />} label="Reportes" />
      <NavItem active={seccion === 'servicios'} onClick={() => setSeccion('servicios')} icon={<Scissors size={20} />} label="Servicios" />
      <NavItem active={seccion === 'configuracion'} onClick={() => setSeccion('configuracion')} icon={<Settings size={20} />} label="Mi Empresa" />
    </>
  );

  if (!usuario.empresaId) {
    return (
      <DashboardLayout usuario={usuario} logout={logout} navigate={navigate} titulo="Sin Empresa" subtitulo="Aún no tienes una sucursal asignada">
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Building2 size={60} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3>¡Hola {usuario.nombre}!</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
            Parece que un administrador aún no te ha asignado una sucursal.
            <br />Por favor, contacta con el soporte para que vinculen tu cuenta a tu local.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // Formateador de fechas
  const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const nombresDiasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  const hoyCero = new Date();
  hoyCero.setHours(0, 0, 0, 0);
  const esDiaPasado = fechaSeleccionada < hoyCero;

  return (
    <DashboardLayout
      usuario={usuario} logout={logout} navigate={navigate}
      sidebarItems={sidebarItems}
      titulo={miEmpresa?.nombre || 'Mi Empresa'}
      subtitulo={`Gestión de ${seccion}`}
      accionesExtra={
        seccion === 'servicios' ? (
          <button onClick={() => setMostrarModalServicio(true)} className="btn-primary">Nuevo Servicio</button>
        ) : seccion === 'turnos' ? (
          !esDiaPasado && (
            <button onClick={() => setMostrarModalTurnoManual(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} /> Agendar Turno
            </button>
          )
        ) : null
      }
      empresa={miEmpresa}
    >
      {/* Contenido según pestaña */}
      {seccion === 'inicio' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3>Bienvenido, {usuario.nombre}</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Hoy tienes {turnos.filter(t => esMismoDia(new Date(t.fecha), new Date()) && t.estado !== 'CANCELADO').length} turnos programados.</p>
        </div>
      )}

      {seccion === 'servicios' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {servicios.map(s => (
            <div key={s.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{s.nombre}</h4>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${s.precio}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⏱ {s.duracion} min</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button onClick={() => abrirEdicion(s)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDeleteServicio(s.id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {seccion === 'turnos' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem', flexWrap: 'wrap' }}>
          {/* COLUMNA CALENDARIO */}
          <div className="glass-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
                {nombresMeses[mesActual.getMonth()]} {mesActual.getFullYear()}
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => cambiarMes(-1)} style={{ background: 'var(--glass)', border: 'none', padding: '0.5rem', borderRadius: '6px', color: 'white', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
                <button onClick={() => cambiarMes(1)} style={{ background: 'var(--glass)', border: 'none', padding: '0.5rem', borderRadius: '6px', color: 'white', cursor: 'pointer' }}><ChevronRight size={16} /></button>
              </div>
            </div>

            {/* Días de la semana */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div>LU</div><div>MA</div><div>MI</div><div>JU</div><div>VI</div><div>SA</div><div>DO</div>
            </div>

            {/* Celdas del Calendario */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.6rem', textAlign: 'center' }}>
              {obtenerDiasCalendario().map((dia, idx) => {
                if (!dia) return <div key={`empty-${idx}`} />;
                const seleccionado = esMismoDia(dia, fechaSeleccionada);
                const hoy = esMismoDia(dia, new Date());
                const tieneCitas = diaTieneTurnos(dia);

                return (
                  <button
                    key={`dia-${idx}`}
                    onClick={() => setFechaSeleccionada(dia)}
                    style={{
                      position: 'relative',
                      background: seleccionado ? 'var(--primary)' : 'var(--glass)',
                      border: seleccionado ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      padding: '0.75rem 0',
                      color: seleccionado ? 'black' : hoy ? 'var(--primary)' : 'white',
                      fontWeight: seleccionado || hoy ? 'bold' : 'normal',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '42px'
                    }}
                  >
                    {dia.getDate()}
                    {tieneCitas && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: seleccionado ? 'black' : 'var(--primary)',
                          boxShadow: seleccionado ? 'none' : '0 0 5px var(--primary)'
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* COLUMNA AGENDA DIARIA */}
          <div className="glass-card" style={{ padding: '1.8rem', minHeight: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ color: 'var(--primary)', fontSize: '1.3rem' }}>
                  {nombresDiasSemana[fechaSeleccionada.getDay()]}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {fechaSeleccionada.getDate()} de {nombresMeses[fechaSeleccionada.getMonth()]} de {fechaSeleccionada.getFullYear()}
                </span>
              </div>
            </div>

            {/* Listado de bloques de horarios (Agenda) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '550px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {generarSlotsDelDia().map((slot, idx) => {
                // Buscar si hay un turno en este slot específico
                const turnoEnSlot = turnos.find(t => {
                  const f = new Date(t.fecha);
                  const horaStr = `${String(f.getHours()).padStart(2, '0')}:${String(f.getMinutes()).padStart(2, '0')}`;
                  return esMismoDia(f, fechaSeleccionada) && horaStr === slot && t.estado !== 'CANCELADO';
                });

                return (
                  <div
                    key={`slot-${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.2rem',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    {/* Hora */}
                    <div style={{ fontSize: '0.95rem', fontWeight: 'bold', minWidth: '50px', color: 'var(--text-muted)' }}>
                      {slot}
                    </div>

                    {/* Contenido (Turno o Libre) */}
                    <div style={{ flex: 1 }}>
                      {turnoEnSlot ? (
                        <div
                          style={{
                            background: 'rgba(201, 160, 99, 0.05)',
                            border: '1px solid var(--glass-border)',
                            borderLeft: '4px solid var(--primary)',
                            borderRadius: '6px',
                            padding: '0.8rem 1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <User size={14} color="var(--primary)" />
                              <strong style={{ fontSize: '0.95rem' }}>{turnoEnSlot.cliente.nombre} {turnoEnSlot.cliente.apellido}</strong>

                              {/* Badge de Estado */}
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontWeight: 'bold',
                                  background: turnoEnSlot.estado === 'PENDIENTE' ? '#f1c40f22' : turnoEnSlot.estado === 'CONFIRMADO' ? '#2ecc7122' : '#3498db22',
                                  color: turnoEnSlot.estado === 'PENDIENTE' ? '#f1c40f' : turnoEnSlot.estado === 'CONFIRMADO' ? '#2ecc71' : '#3498db',
                                  border: `1px solid ${turnoEnSlot.estado === 'PENDIENTE' ? '#f1c40f44' : turnoEnSlot.estado === 'CONFIRMADO' ? '#2ecc7144' : '#3498db44'}`
                                }}
                              >
                                {turnoEnSlot.estado}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Scissors size={12} /> {turnoEnSlot.servicio.nombre} (${turnoEnSlot.servicio.precio})</span>
                              {turnoEnSlot.cliente.telefono && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Phone size={12} /> {turnoEnSlot.cliente.telefono}</span>}
                            </div>
                          </div>

                          {/* Botones de acción del dueño */}
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {turnoEnSlot.estado === 'PENDIENTE' && (
                              <>
                                <button
                                  onClick={() => handleCambiarEstadoTurno(turnoEnSlot.id, 'CONFIRMADO')}
                                  style={{ background: 'rgba(46, 204, 113, 0.15)', border: '1px solid #2ecc71', color: '#2ecc71', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                >
                                  <Check size={12} /> Confirmar
                                </button>
                                <button
                                  onClick={() => handleCambiarEstadoTurno(turnoEnSlot.id, 'CANCELADO')}
                                  style={{ background: 'rgba(231, 76, 60, 0.15)', border: '1px solid #e74c3c', color: '#e74c3c', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                >
                                  <X size={12} /> Cancelar
                                </button>
                              </>
                            )}
                            {turnoEnSlot.estado === 'CONFIRMADO' && (
                              <>
                                <button
                                  onClick={() => handleCambiarEstadoTurno(turnoEnSlot.id, 'COMPLETADO')}
                                  style={{ background: 'rgba(52, 152, 219, 0.15)', border: '1px solid #3498db', color: '#3498db', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                >
                                  <CheckCircle size={12} /> Finalizar
                                </button>
                                <button
                                  onClick={() => handleCambiarEstadoTurno(turnoEnSlot.id, 'CANCELADO')}
                                  style={{ background: 'rgba(231, 76, 60, 0.15)', border: '1px solid #e74c3c', color: '#e74c3c', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                >
                                  <X size={12} /> Cancelar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.8rem' }}>
                          <span style={{ fontSize: '0.85rem', color: esDiaPasado ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
                            {esDiaPasado ? 'No disponible' : 'Disponible'}
                          </span>
                          {!esDiaPasado && (
                            <button
                              onClick={() => {
                                setNuevoTurnoManual(prev => ({ ...prev, hora: slot }));
                                setMostrarModalTurnoManual(true);
                              }}
                              style={{
                                background: 'transparent',
                                border: '1px dashed rgba(201,160,99,0.3)',
                                color: 'var(--primary)',
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <Plus size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {seccion === 'configuracion' && (
        <div className="glass-card" style={{ padding: window.innerWidth < 768 ? '1.2rem' : '2.5rem', maxWidth: '700px' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Perfil de la Empresa</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Esta información será visible para tus clientes al momento de reservar.</p>

          <form onSubmit={handleUpdateEmpresa} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Nombre Comercial</label>
                <input
                  style={modalStyles.input}
                  value={formEmpresa.nombre}
                  onChange={e => setFormEmpresa({ ...formEmpresa, nombre: e.target.value })}
                  placeholder="Ej: Barberia Don"
                  required
                />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Teléfono de Contacto</label>
                <input
                  style={modalStyles.input}
                  value={formEmpresa.telefono}
                  onChange={e => setFormEmpresa({ ...formEmpresa, telefono: e.target.value })}
                  placeholder="Ej: +54 9 11..."
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Días de Atención</label>
                <input
                  style={modalStyles.input}
                  value={formEmpresa.dias}
                  onChange={e => setFormEmpresa({ ...formEmpresa, dias: e.target.value })}
                  placeholder="Ej: Lunes a Sábados"
                />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Horarios de Atención</label>
                <input
                  style={modalStyles.input}
                  value={formEmpresa.horarios}
                  onChange={e => setFormEmpresa({ ...formEmpresa, horarios: e.target.value })}
                  placeholder="Ej: 09:00 a 13:00, 16:30 a 20:30"
                  required
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '0.1rem' }}>
                  * Formato HH:MM requerido. Ej: "09:00 a 18:00" o "09:00 a 13:00, 16:00 a 20:00"
                </span>
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Dirección Física</label>
              <input
                style={modalStyles.input}
                value={formEmpresa.direccion}
                onChange={e => setFormEmpresa({ ...formEmpresa, direccion: e.target.value })}
                placeholder="Ej: Av. Siempre Viva 742"
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Logo de la Empresa</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Selector local premium */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <label
                    htmlFor="logo-local-file"
                    className="btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      margin: 0,
                      padding: '0.6rem 1.2rem',
                      background: 'rgba(201, 160, 99, 0.1)',
                      border: '1px dashed var(--primary)',
                      color: 'var(--primary)',
                      fontSize: '0.9rem',
                      borderRadius: '8px'
                    }}
                  >
                    <Upload size={18} />
                    Subir Logo Local
                  </label>
                  <input
                    type="file"
                    id="logo-local-file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleSubirLogoLocal}
                  />

                  {formEmpresa.logo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '55px', height: '55px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)', boxShadow: '0 0 12px rgba(201,160,99,0.3)', background: 'var(--glass)' }}>
                        <img src={formEmpresa.logo} alt="Preview Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Logotipo actual</span>
                    </div>
                  )}
                </div>

                {/* Separador estético elegante */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.2rem 0' }}>
                  <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--glass-border)', opacity: 0.5 }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>O TAMBIÉN PUEDES USAR UNA URL DE INTERNET</span>
                  <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--glass-border)', opacity: 0.5 }} />
                </div>

                {/* Entrada de URL clásica */}
                <input
                  style={modalStyles.input}
                  value={formEmpresa.logo}
                  onChange={e => setFormEmpresa({ ...formEmpresa, logo: e.target.value })}
                  placeholder="https://ejemplo.com/tu-logo.jpg"
                />
              </div>

            </div>

            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginTop: '1rem' }}>
              <Save size={20} />
              Guardar Cambios
            </button>
          </form>
        </div>
      )}

      {seccion === 'reportes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* TARJETAS DE ESTADÍSTICAS PREMIUM */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>

            {/* PENDIENTES */}
            <div
              className="glass-card"
              style={{
                padding: '1.8rem',
                borderLeft: '4px solid #f1c40f',
                background: 'rgba(241, 196, 15, 0.03)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '0.5px' }}>PENDIENTES</span>
                <Clock size={20} color="#f1c40f" />
              </div>
              <h2 style={{ fontSize: '2.5rem', color: '#f1c40f', marginTop: '1rem', fontWeight: '800' }}>
                {turnos.filter(t => t.estado === 'PENDIENTE').length}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Turnos por confirmar</p>
            </div>

            {/* CONFIRMADOS */}
            <div
              className="glass-card"
              style={{
                padding: '1.8rem',
                borderLeft: '4px solid #3498db',
                background: 'rgba(52, 152, 219, 0.03)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '0.5px' }}>CONFIRMADOS</span>
                <Check size={20} color="#3498db" />
              </div>
              <h2 style={{ fontSize: '2.5rem', color: '#3498db', marginTop: '1rem', fontWeight: '800' }}>
                {turnos.filter(t => t.estado === 'CONFIRMADO').length}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Turnos confirmados activos</p>
            </div>

            {/* FINALIZADOS */}
            <div
              className="glass-card"
              style={{
                padding: '1.8rem',
                borderLeft: '4px solid #2ecc71',
                background: 'rgba(46, 204, 113, 0.03)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '0.5px' }}>FINALIZADOS</span>
                <CheckCircle size={20} color="#2ecc71" />
              </div>
              <h2 style={{ fontSize: '2.5rem', color: '#2ecc71', marginTop: '1rem', fontWeight: '800' }}>
                {turnos.filter(t => t.estado === 'COMPLETADO').length}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Servicios completados</p>
            </div>

            {/* CANCELADOS */}
            <div
              className="glass-card"
              style={{
                padding: '1.8rem',
                borderLeft: '4px solid #e74c3c',
                background: 'rgba(231, 76, 60, 0.03)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '0.5px' }}>CANCELADOS</span>
                <X size={20} color="#e74c3c" />
              </div>
              <h2 style={{ fontSize: '2.5rem', color: '#e74c3c', marginTop: '1rem', fontWeight: '800' }}>
                {turnos.filter(t => t.estado === 'CANCELADO').length}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Turnos anulados</p>
            </div>

          </div>

          {/* DOS COLUMNAS: RANKING DE CLIENTES E HISTORIAL DE TURNOS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', alignItems: 'flex-start' }}>

            {/* COLUMNA CLIENTES: ESTADÍSTICAS POR CLIENTE */}
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Frecuencia de Clientes</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Cantidad de turnos y desglose de estados por cliente</p>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  maxHeight: '600px',
                  overflowY: 'auto',
                  paddingRight: '0.5rem'
                }}
              >
                {obtenerEstadisticasClientes().length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No hay datos de clientes registrados aún.
                  </div>
                ) : (
                  obtenerEstadisticasClientes().map(item => {
                    const iniciales = `${item.cliente.nombre?.[0] || 'C'}${item.cliente.apellido?.[0] || ''}`.toUpperCase();
                    return (
                      <div
                        key={item.cliente.id}
                        style={{
                          padding: '1.2rem',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--glass-border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.8rem'
                        }}
                      >
                        {/* Datos Cliente */}
                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: 'rgba(201, 160, 99, 0.1)',
                            border: '1px solid rgba(201, 160, 99, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            color: 'var(--primary)',
                            fontSize: '0.85rem'
                          }}>
                            {iniciales}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'white' }}>
                              {item.cliente.nombre} {item.cliente.apellido}
                            </h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              📱 {item.cliente.telefono} {item.cliente.email ? `| ✉️ ${item.cliente.email}` : ''}
                            </span>
                          </div>
                        </div>

                        {/* Desglose de Estados */}
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.6rem' }}>
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }}>
                            Total: {item.total}
                          </span>
                          {item.COMPLETADO > 0 && (
                            <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', border: '1px solid rgba(46, 204, 113, 0.2)', fontWeight: 'bold' }}>
                              Finalizados: {item.COMPLETADO}
                            </span>
                          )}
                          {item.CONFIRMADO > 0 && (
                            <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', border: '1px solid rgba(52, 152, 219, 0.2)', fontWeight: 'bold' }}>
                              Confirmados: {item.CONFIRMADO}
                            </span>
                          )}
                          {item.PENDIENTE > 0 && (
                            <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(241, 196, 15, 0.1)', color: '#f1c40f', border: '1px solid rgba(241, 196, 15, 0.2)', fontWeight: 'bold' }}>
                              Pendientes: {item.PENDIENTE}
                            </span>
                          )}
                          {item.CANCELADO > 0 && (
                            <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', border: '1px solid rgba(231, 76, 60, 0.2)', fontWeight: 'bold' }}>
                              Cancelados: {item.CANCELADO}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA: HISTORIAL DE TURNOS FILTRADO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>

              {/* BARRA DE FILTROS RÁPIDOS */}
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Historial de Turnos</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Total: {turnos.length} turnos</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { key: 'TODOS', label: 'Todos', color: '#ffffff', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
                    { key: 'PENDIENTE', label: 'Pendientes', color: '#f1c40f', bg: 'rgba(241,196,15,0.08)', border: 'rgba(241,196,15,0.2)' },
                    { key: 'CONFIRMADO', label: 'Confirmados', color: '#3498db', bg: 'rgba(52,152,219,0.08)', border: 'rgba(52,152,219,0.2)' },
                    { key: 'COMPLETADO', label: 'Finalizados', color: '#2ecc71', bg: 'rgba(46,204,113,0.08)', border: 'rgba(46,204,113,0.2)' },
                    { key: 'CANCELADO', label: 'Cancelados', color: '#e74c3c', bg: 'rgba(231,76,60,0.08)', border: 'rgba(231,76,60,0.2)' }
                  ].map(filtro => {
                    const activo = filtroEstado === filtro.key;
                    return (
                      <button
                        key={filtro.key}
                        onClick={() => setFiltroEstado(filtro.key)}
                        style={{
                          background: activo ? filtro.color : 'transparent',
                          color: activo ? '#000000' : filtro.color,
                          border: `1px solid ${activo ? filtro.color : filtro.border}`,
                          padding: '0.5rem 1rem',
                          borderRadius: '30px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          transition: 'all 0.2s ease',
                          boxShadow: activo ? `0 0 10px ${filtro.color}44` : 'none'
                        }}
                      >
                        {filtro.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LISTADO DESPLAZABLE DE TURNOS CON SCROLL */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  maxHeight: '600px',
                  overflowY: 'auto',
                  paddingRight: '0.5rem'
                }}
              >
                {turnos
                  .filter(t => filtroEstado === 'TODOS' || t.estado === filtroEstado)
                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                  .length === 0 ? (
                  <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Calendar size={40} color="var(--primary)" style={{ opacity: 0.4, marginBottom: '1rem' }} />
                    <h4>No se encontraron turnos</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>No hay registros correspondientes al filtro seleccionado.</p>
                  </div>
                ) : (
                  turnos
                    .filter(t => filtroEstado === 'TODOS' || t.estado === filtroEstado)
                    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                    .map(turno => {
                      const fechaObj = new Date(turno.fecha);
                      const horaStr = `${String(fechaObj.getHours()).padStart(2, '0')}:${String(fechaObj.getMinutes()).padStart(2, '0')}`;
                      const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      });

                      // Colores de estado
                      let colorEstado = '#f1c40f'; // Pendiente
                      let bgEstado = 'rgba(241, 196, 15, 0.1)';
                      if (turno.estado === 'CONFIRMADO') {
                        colorEstado = '#3498db';
                        bgEstado = 'rgba(52, 152, 219, 0.1)';
                      } else if (turno.estado === 'COMPLETADO') {
                        colorEstado = '#2ecc71';
                        bgEstado = 'rgba(46, 204, 113, 0.1)';
                      } else if (turno.estado === 'CANCELADO') {
                        colorEstado = '#e74c3c';
                        bgEstado = 'rgba(231, 76, 60, 0.1)';
                      }

                      // Iniciales del cliente para el avatar circular
                      const iniciales = `${turno.cliente?.nombre?.[0] || 'C'}${turno.cliente?.apellido?.[0] || ''}`.toUpperCase();

                      return (
                        <div
                          key={turno.id}
                          className="glass-card"
                          style={{
                            padding: '1.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '1.5rem',
                            flexWrap: 'wrap',
                            borderLeft: `3px solid ${colorEstado}`,
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {/* DATOS DEL TURNO Y SERVICIO */}
                          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', minWidth: '280px', flex: '1' }}>

                            {/* Avatar del Cliente */}
                            <div style={{
                              width: '45px',
                              height: '45px',
                              borderRadius: '50%',
                              background: bgEstado,
                              border: `1px solid ${colorEstado}33`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              color: colorEstado,
                              fontSize: '0.95rem'
                            }}>
                              {iniciales}
                            </div>

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>
                                  {turno.cliente?.nombre || 'Cliente'} {turno.cliente?.apellido || ''}
                                </span>
                                <span style={{
                                  fontSize: '0.75rem',
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '12px',
                                  color: colorEstado,
                                  background: bgEstado,
                                  fontWeight: 'bold',
                                  letterSpacing: '0.5px'
                                }}>
                                  {turno.estado}
                                </span>
                              </div>

                              <p style={{ fontSize: '0.9rem', color: 'var(--primary)', marginTop: '0.3rem', fontWeight: '500' }}>
                                ✂️ {turno.servicio?.nombre || 'Servicio'} — <strong style={{ color: 'white' }}>${turno.servicio?.precio || 0}</strong>
                              </p>

                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                📅 <span style={{ textTransform: 'capitalize' }}>{fechaFormateada}</span> a las <strong>{horaStr} hs</strong>
                              </p>
                            </div>
                          </div>

                          {/* DATOS DE CONTACTO DEL CLIENTE */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: '220px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              📱 {turno.cliente?.telefono || 'Sin teléfono'}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', wordBreak: 'break-all' }}>
                              ✉️ {turno.cliente?.email || 'Sin email registrado'}
                            </span>

                            {/* BOTONES DIRECTOS DE WHATSAPP / LLAMADA */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                              {turno.cliente?.telefono && (
                                <>
                                  <a
                                    href={`https://wa.me/${turno.cliente.telefono.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-primary"
                                    style={{
                                      padding: '0.35rem 0.75rem',
                                      fontSize: '0.75rem',
                                      borderRadius: '6px',
                                      textDecoration: 'none',
                                      background: '#25d366',
                                      borderColor: '#25d366',
                                      color: 'black',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.3rem',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    WhatsApp
                                  </a>

                                </>
                              )}
                            </div>
                          </div>

                          {/* ACCIONES DE ESTADO RÁPIDAS */}
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {turno.estado === 'PENDIENTE' && (
                              <>
                                <button
                                  onClick={() => handleCambiarEstadoTurno(turno.id, 'CONFIRMADO')}
                                  className="btn-primary"
                                  style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem', fontWeight: 'bold' }}
                                >
                                  Confirmar
                                </button>
                                <button
                                  onClick={() => handleCambiarEstadoTurno(turno.id, 'COMPLETADO')}
                                  style={{ background: '#2ecc71', border: '1px solid #2ecc71', color: 'black', padding: '0.5rem 0.8rem', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                  Finalizar
                                </button>
                                <button
                                  onClick={() => handleCambiarEstadoTurno(turno.id, 'CANCELADO')}
                                  style={{ background: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c', padding: '0.5rem 0.8rem', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                  Cancelar
                                </button>
                              </>
                            )}

                            {turno.estado === 'CONFIRMADO' && (
                              <>
                                <button
                                  onClick={() => handleCambiarEstadoTurno(turno.id, 'COMPLETADO')}
                                  style={{ background: '#2ecc71', border: '1px solid #2ecc71', color: 'black', padding: '0.5rem 0.8rem', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                  Finalizar
                                </button>
                                <button
                                  onClick={() => handleCambiarEstadoTurno(turno.id, 'CANCELADO')}
                                  style={{ background: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c', padding: '0.5rem 0.8rem', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                  Cancelar
                                </button>
                              </>
                            )}
                          </div>

                        </div>
                      );
                    })
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO SERVICIO */}
      {mostrarModalServicio && (
        <div style={modalStyles.overlay}>
          <div className="glass-card" style={modalStyles.content}>
            <h2 className="heading-gold">NUEVO SERVICIO</h2>
            <form onSubmit={handleCrearServicio} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
              <input placeholder="Nombre" value={nuevoServicio.nombre} onChange={e => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })} style={modalStyles.input} required />
              <input type="number" placeholder="Precio" value={nuevoServicio.precio} onChange={e => setNuevoServicio({ ...nuevoServicio, precio: e.target.value })} style={modalStyles.input} required />
              <input type="number" placeholder="Duración (min)" value={nuevoServicio.duracion} onChange={e => setNuevoServicio({ ...nuevoServicio, duracion: e.target.value })} style={modalStyles.input} required />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setMostrarModalServicio(false)} style={modalStyles.btnSec}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Agregar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR SERVICIO */}
      {mostrarModalEditar && (
        <div style={modalStyles.overlay}>
          <div className="glass-card" style={modalStyles.content}>
            <h2 className="heading-gold">EDITAR SERVICIO</h2>
            <form onSubmit={handleActualizarServicio} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
              <input placeholder="Nombre" value={servicioEnEdicion.nombre} onChange={e => setServicioEnEdicion({ ...servicioEnEdicion, nombre: e.target.value })} style={modalStyles.input} required />
              <input type="number" placeholder="Precio" value={servicioEnEdicion.precio} onChange={e => setServicioEnEdicion({ ...servicioEnEdicion, precio: e.target.value })} style={modalStyles.input} required />
              <input type="number" placeholder="Duración (min)" value={servicioEnEdicion.duracion} onChange={e => setServicioEnEdicion({ ...servicioEnEdicion, duracion: e.target.value })} style={modalStyles.input} required />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => { setMostrarModalEditar(false); setServicioEnEdicion(null); }} style={modalStyles.btnSec}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AGENDAR TURNO MANUAL */}
      {mostrarModalTurnoManual && (
        <div style={modalStyles.overlay}>
          <div className="glass-card" style={modalStyles.content}>
            <h2 className="heading-gold">AGENDAR TURNO MANUAL</h2>
            <form onSubmit={handleCrearTurnoManual} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input placeholder="Nombre Cliente" value={nuevoTurnoManual.clienteNombre} onChange={e => setNuevoTurnoManual({ ...nuevoTurnoManual, clienteNombre: e.target.value })} style={modalStyles.input} required />
                <input placeholder="Apellido Cliente" value={nuevoTurnoManual.clienteApellido} onChange={e => setNuevoTurnoManual({ ...nuevoTurnoManual, clienteApellido: e.target.value })} style={modalStyles.input} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input placeholder="Teléfono (Ej: +54...)" value={nuevoTurnoManual.clienteTelefono} onChange={e => setNuevoTurnoManual({ ...nuevoTurnoManual, clienteTelefono: e.target.value })} style={modalStyles.input} required />
                <input placeholder="Email (Opcional)" value={nuevoTurnoManual.clienteEmail} onChange={e => setNuevoTurnoManual({ ...nuevoTurnoManual, clienteEmail: e.target.value })} style={modalStyles.input} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                <select
                  value={nuevoTurnoManual.servicioId}
                  onChange={e => setNuevoTurnoManual({ ...nuevoTurnoManual, servicioId: e.target.value })}
                  style={modalStyles.input}
                  required
                >
                  <option value="">Seleccionar Servicio...</option>
                  {servicios.map(s => (
                    <option key={s.id} value={s.id} style={{ background: '#1a1d21' }}>{s.nombre} (${s.precio})</option>
                  ))}
                </select>

                <select
                  value={nuevoTurnoManual.hora}
                  onChange={e => setNuevoTurnoManual({ ...nuevoTurnoManual, hora: e.target.value })}
                  style={modalStyles.input}
                  required
                >
                  {generarSlotsDelDia().map(slot => (
                    <option key={slot} value={slot} style={{ background: '#1a1d21' }}>{slot} hs</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setMostrarModalTurnoManual(false)} style={modalStyles.btnSec}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Agendar Turno</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const labelStyle = { fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' };

export default EmpresaPanel;
