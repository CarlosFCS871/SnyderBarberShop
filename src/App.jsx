import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';


// Importamos los componentes reales de autenticación
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import ClientHome from './pages/client/ClientHome';
import BarberosList from './pages/client/BarberosList';
import BarberoServicios from './pages/client/BarberoServicios'; // Agrega esta línea
import ClientCitas from './pages/client/ClientCitas'; // Agrega esta línea
import ClientPerfil from './pages/client/ClientPerfil';
import ClientGastos from './pages/client/ClientGastos'; // Agrega esta línea



import AdminHome from './pages/admin/AdminHome';
import AdminBarberos from './pages/admin/AdminBarberos'; // Agrega esta línea
import AdminUsuarios from './pages/admin/AdminUsuarios'; // Agrega esta línea
import AdminCitas from './pages/admin/AdminCitas'; // Agrega esta línea
import AdminReportes from './pages/admin/AdminReportes'; // Agrega esta línea




import BarberHome from './pages/barber/BarberHome'; // Asegúrate de agregar esto
import BarberServicios from './pages/barber/BarberServicios'; // Agrega esta línea
import BarberCitas from './pages/barber/BarberCitas'; // Agrega esta línea
import BarberIngresos from './pages/barber/BarberIngresos'; // Agrega esta línea
import BarberPerfil from './pages/barber/BarberPerfil';

function App() {
  const { user, role, loading } = useAuth();

  // Pantalla de carga mientras Firebase verifica la sesión
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-primary text-white">Iniciando Snyder Barber...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-primary font-sans text-white">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

          {/* Enrutador Principal: Redirige según el rol del usuario conectado */}
          <Route path="/" element={
            !user ? <Navigate to="/login" /> :
              role === 'Admin' ? <Navigate to="/admin" /> :
                role === 'Barbero' ? <Navigate to="/barber" /> :
                  <Navigate to="/client" />
          } />

          {/* Rutas Privadas: Administrador */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Routes>
                <Route path="/" element={<AdminHome />} />
                <Route path="/barberos" element={<AdminBarberos />} /> {/* NUEVA RUTA */}
                <Route path="/usuarios" element={<AdminUsuarios />} /> {/* NUEVA RUTA */}
                <Route path="/citas" element={<AdminCitas />} /> {/* NUEVA RUTA */}
                <Route path="/reportes" element={<AdminReportes />} /> {/* NUEVA RUTA */}
              </Routes>
            </ProtectedRoute>
          } />

          {/* Rutas Privadas: Barbero */}
          <Route path="/barber/*" element={
            <ProtectedRoute allowedRoles={['Barbero']}>
              <Routes>
                <Route path="/" element={<BarberHome />} />
                <Route path="/servicios" element={<BarberServicios />} /> {/* NUEVA RUTA */}
                <Route path="/citas" element={<BarberCitas />} /> {/* NUEVA RUTA */}
                <Route path="/ingresos" element={<BarberIngresos />} /> {/* NUEVA RUTA */}
                <Route path="/perfil" element={<BarberPerfil />} /> {/* NUEVA RUTA */}
              </Routes>
            </ProtectedRoute>
          } />

          {/* Rutas Privadas: Cliente */}
          <Route path="/client/*" element={
            <ProtectedRoute allowedRoles={['Cliente']}>
              <Routes>
                <Route path="/" element={<ClientHome />} />
                <Route path="/barberos" element={<BarberosList />} />
                <Route path="/barbero/:id/servicios" element={<BarberoServicios />} /> {/* NUEVA RUTA */}
                <Route path="/citas" element={<ClientCitas />} /> {/* NUEVA RUTA */}
                <Route path="/perfil" element={<ClientPerfil />} /> {/* NUEVA RUTA */}
                <Route path="/gastos" element={<ClientGastos />} /> {/* NUEVA RUTA */}
              </Routes>
            </ProtectedRoute>
          } />

          {/* Ruta 404 - Redirige al inicio si la URL no existe */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;