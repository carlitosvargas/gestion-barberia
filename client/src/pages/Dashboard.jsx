import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminPanel from './dashboard/AdminPanel';
import EmpresaPanel from './dashboard/EmpresaPanel';

const Dashboard = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  if (!usuario) {
    // Si no hay usuario, el useEffect de cada componente lo redirigirá, 

    return null;
  }

  // Despachador según el rol
  if (usuario.rol === 'SUPER_ADMIN') {
    return <AdminPanel usuario={usuario} logout={logout} navigate={navigate} />;
  }

  if (usuario.rol === 'DUENO_EMPRESA') {
    return <EmpresaPanel usuario={usuario} logout={logout} navigate={navigate} />;
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
      <h1>Error de Acceso</h1>
      <p>No tienes un rol asignado válido.</p>
      <button onClick={() => logout()} className="btn-primary" style={{ marginTop: '1rem' }}>Cerrar Sesión</button>
    </div>
  );
};

export default Dashboard;
