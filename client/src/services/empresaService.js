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
  }
};

export default empresaService;
