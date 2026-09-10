import api from './api';

const pagoService = {
  // Obtener la información del turno y su estado de pago
  obtenerDetallePago: async (turnoId) => {
    const res = await api.get(`/pagos/turno/${turnoId}`);
    return res.data;
  },

  // Generar o refrescar la preferencia de Mercado Pago
  crearPreferencia: async (turnoId) => {
    const res = await api.post(`/pagos/crear-preferencia/${turnoId}`);
    return res.data;
  },

  // Marcar como pagado manualmente (para dueños/barberos)
  marcarPagoManual: async (turnoId, metodoPago = 'EFECTIVO', monto) => {
    const res = await api.post(`/pagos/marcar-manual/${turnoId}`, { metodoPago, monto });
    return res.data;
  }
};

export default pagoService;
