import api from './api';

const adminService = {
  // Gestión de Empresas
  obtenerEmpresas: async () => {
    const res = await api.get('/empresas');
    return res.data;
  },
  crearEmpresa: async (datos) => {
    const res = await api.post('/empresas', datos);
    return res.data;
  },
  
  // Gestión de Usuarios
  obtenerUsuariosSinEmpresa: async () => {
    const res = await api.get('/usuarios/sin-empresa');
    return res.data;
  },
  asignarEmpresaAUsuario: async (usuarioId, empresaId) => {
    const res = await api.post('/usuarios/asignar', { usuarioId, empresaId });
    return res.data;
  }
};

export default adminService;
