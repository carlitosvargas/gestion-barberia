import api from './api';

const publicService = {
  // Obtener todas las barberías registradas
  obtenerEmpresas: async () => {
    const res = await api.get('/empresas');
    return res.data;
  },

  // Obtener una barbería por ID (incluyendo sus servicios de forma automática)
  obtenerEmpresaPorId: async (id) => {
    const res = await api.get(`/empresas/${id}`);
    return res.data;
  },

  // Obtener ocupación de turnos pública de una empresa
  obtenerTurnosOcupados: async (empresaId) => {
    const res = await api.get(`/turnos/empresa/${empresaId}/publico`);
    return res.data;
  },

  // Crear un turno públicamente desde la reserva del cliente
  crearTurno: async (datos) => {
    const res = await api.post('/turnos', datos);
    return res.data;
  },

  // Verificar si un cliente existe por su teléfono en esta empresa
  verificarCliente: async (telefono, empresaId) => {
    const res = await api.get('/turnos/verificar-cliente', {
      params: { telefono, empresaId }
    });
    return res.data;
  }
};

export default publicService;
