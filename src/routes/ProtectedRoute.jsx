import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  // Mientras Firebase verifica la sesión, mostramos una pantalla de carga
  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Cargando...</div>;

  // Si no hay usuario, lo enviamos al Login
  if (!user) return <Navigate to="/login" replace />;

  // Si la ruta requiere roles específicos y el usuario no los tiene, lo redirigimos al inicio
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // Si pasa todas las validaciones, renderizamos la vista correspondiente
  return children;
};