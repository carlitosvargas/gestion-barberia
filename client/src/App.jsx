import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Reserva from './pages/Reserva';
import RecuperarPassword from './pages/RecuperarPassword';
import ResetPassword from './pages/ResetPassword';
import PagoResumen from './pages/PagoResumen';
import PagoResultado from './pages/PagoResultado';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/recuperar-password" element={<RecuperarPassword />} />
          <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reserva/:empresaId" element={<Reserva />} />
          <Route path="/pago/turno/:turnoId" element={<PagoResumen />} />
          <Route path="/pago/resultado" element={<PagoResultado />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
