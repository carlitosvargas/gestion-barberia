import api from './api';

const empresaService = {
  // Datos de la Empresa
  obtenerMiEmpresa: async (id) => {
    const res = await api.get(`/empresas/${id}`);
    return res.data;
  },
  actualizarMiEmpresa: async (id, datos) => {
    const res = await api.put(`/empresas/${id}`, datos);
    return res.data;
  },
  subirImagen: async (blobImagen) => {
    const formData = new FormData();
    formData.append('imagen', blobImagen, 'logo-barberia.jpg');
    const res = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data; // Retorna { url: '...' }
  },
  
  // Gestión de Servicios
  obtenerServicios: async () => {
    const res = await api.get('/servicios');
    return res.data;
  },
  crearServicio: async (datos) => {
    const res = await api.post('/servicios', datos);
    return res.data;
  },
  actualizarServicio: async (id, datos) => {
    const res = await api.put(`/servicios/${id}`, datos);
    return res.data;
  },
  eliminarServicio: async (id) => {
    const res = await api.delete(`/servicios/${id}`);
    return res.data;
  },

  // Gestión de Turnos (Agenda)
  obtenerTurnos: async (empresaId) => {
    const res = await api.get(`/turnos/empresa/${empresaId}`);
    return res.data;
  },
  actualizarEstadoTurno: async (id, estado) => {
    const res = await api.put(`/turnos/${id}/estado`, { estado });
    return res.data;
  },
  crearTurno: async (datos) => {
    const res = await api.post('/turnos', datos);
    return res.data;
  }
};

export default empresaService;
