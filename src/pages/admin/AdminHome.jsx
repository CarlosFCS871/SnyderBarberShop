import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FaUsers, FaUserTie, FaCalendarAlt, FaChartLine, FaSignOutAlt } from 'react-icons/fa';
import { logoutUser } from '../../services/authService';

const AdminHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    clientes: 0,
    barberos: 0,
    citas: 0
  });
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Consultar cantidad de clientes
        const qClientes = query(collection(db, 'usuarios'), where('rol', '==', 'Cliente'));
        const snapClientes = await getDocs(qClientes);

        // Consultar cantidad de barberos
        const qBarberos = query(collection(db, 'usuarios'), where('rol', '==', 'Barbero'));
        const snapBarberos = await getDocs(qBarberos);

        // Consultar total de citas
        const snapCitas = await getDocs(collection(db, 'citas'));

        setStats({
          clientes: snapClientes.size,
          barberos: snapBarberos.size,
          citas: snapCitas.size
        });
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const menuItems = [
    { title: 'Gestión Usuarios', icon: <FaUsers size={24} />, path: '/admin/usuarios', color: 'bg-blue-500/10 text-blue-500' },
    { title: 'Gestión Barberos', icon: <FaUserTie size={24} />, path: '/admin/barberos', color: 'bg-accent/10 text-accent' },
    { title: 'Todas las Citas', icon: <FaCalendarAlt size={24} />, path: '/admin/citas', color: 'bg-green-500/10 text-green-500' },
    { title: 'Reportes Financieros', icon: <FaChartLine size={24} />, path: '/admin/reportes', color: 'bg-purple-500/10 text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-primary text-white pb-20">
      {/* Header Admin */}
      <header className="bg-primary pt-10 pb-6 px-6 sticky top-0 z-10 border-b border-white/10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Panel <span className="text-accent">Admin</span></h1>
          <p className="text-gray-400 text-sm mt-1">Control del sistema</p>
        </div>
        <button 
          onClick={handleLogout} 
          className="bg-white/5 p-3 rounded-full border border-white/10 text-gray-400 hover:text-red-500 hover:border-red-500/50 transition-all"
        >
          <FaSignOutAlt size={18} />
        </button>
      </header>

      <main className="px-6 py-6">
        {/* Tarjetas de Estadísticas Rápidas */}
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Resumen Global</h2>
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white">{loading ? '-' : stats.clientes}</span>
            <span className="text-xs text-gray-400 mt-1">Clientes</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-accent">{loading ? '-' : stats.barberos}</span>
            <span className="text-xs text-gray-400 mt-1">Barberos</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white">{loading ? '-' : stats.citas}</span>
            <span className="text-xs text-gray-400 mt-1">Citas</span>
          </div>
        </div>

        {/* Menú de Gestión */}
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Módulos de Gestión</h2>
        <div className="grid grid-cols-1 gap-4">
          {menuItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.path}
              className="bg-white/5 p-5 rounded-2xl flex items-center gap-4 border border-white/5 hover:bg-white/10 transition-colors"
            >
              <div className={`p-4 rounded-xl ${item.color}`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-xs text-gray-400">Toca para administrar</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminHome;