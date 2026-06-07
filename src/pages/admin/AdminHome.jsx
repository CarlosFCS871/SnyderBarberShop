import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FaUsers, FaUserTie, FaCalendarAlt, FaChartLine, FaSignOutAlt, FaArrowRight, FaCrown } from 'react-icons/fa';
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
        const qClientes = query(collection(db, 'usuarios'), where('rol', '==', 'Cliente'));
        const snapClientes = await getDocs(qClientes);

        const qBarberos = query(collection(db, 'usuarios'), where('rol', '==', 'Barbero'));
        const snapBarberos = await getDocs(qBarberos);

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
    { title: 'Gestión Usuarios', subtitle: 'Administra todos los clientes', icon: <FaUsers size={22} />, path: '/admin/usuarios', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    { title: 'Gestión Barberos', subtitle: 'Equipo de profesionales', icon: <FaUserTie size={22} />, path: '/admin/barberos', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
    { title: 'Todas las Citas', subtitle: 'Historial completo de reservas', icon: <FaCalendarAlt size={22} />, path: '/admin/citas', color: 'bg-green-500/10 text-green-400 border-green-500/30' },
    { title: 'Reportes Financieros', subtitle: 'Análisis de ingresos', icon: <FaChartLine size={22} />, path: '/admin/reportes', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  ];

  const statItems = [
    { label: 'Clientes', value: stats.clientes, icon: <FaUsers />, color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    { label: 'Barberos', value: stats.barberos, icon: <FaUserTie />, color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
    { label: 'Citas', value: stats.citas, icon: <FaCalendarAlt />, color: 'bg-green-500/10 text-green-400 border-green-500/30' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 pb-20 relative overflow-hidden">
      {/* Efecto de fondo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-neutral-950 to-neutral-950 pointer-events-none" />

      {/* Header Admin con glassmorphism */}
      <header className="bg-neutral-950/80 backdrop-blur-xl pt-10 pb-6 px-4 sm:px-6 sticky top-0 z-10 border-b border-zinc-800/60 relative">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaCrown className="text-amber-500" size={16} />
              <h1 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
                Panel <span className="text-amber-500">Admin</span>
              </h1>
            </div>
            <p className="text-xs text-zinc-500">Control total del sistema</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="bg-zinc-900/60 p-3 rounded-full border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300 active:scale-95"
            title="Cerrar sesión"
          >
            <FaSignOutAlt size={18} />
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-5xl mx-auto relative z-10 flex flex-col gap-6">
        
        {/* Tarjetas de Estadísticas Rápidas */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 ml-1">
            Resumen Global
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {statItems.map((stat, index) => (
              <div 
                key={index}
                className="bg-zinc-900/40 border border-zinc-800/60 hover:border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center transition-all duration-300 backdrop-blur-xl group"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center mb-3 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <span className="text-2xl sm:text-3xl font-black text-zinc-100">
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    stat.value
                  )}
                </span>
                <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider mt-1 font-semibold">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Menú de Gestión */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 ml-1">
            Módulos de Gestión
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {menuItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.path}
                className="group bg-zinc-900/40 hover:bg-zinc-800/60 p-4 sm:p-5 rounded-2xl flex items-center gap-4 border border-zinc-800/60 hover:border-amber-500/30 transition-all duration-300 backdrop-blur-xl"
              >
                <div className={`p-3 rounded-xl border ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-zinc-100 group-hover:text-amber-500 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-500 truncate">{item.subtitle}</p>
                </div>
                <FaArrowRight className="text-zinc-600 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-300" size={14} />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminHome;