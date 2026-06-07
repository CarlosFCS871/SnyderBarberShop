import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { FaCalendarCheck, FaClock, FaCheckDouble, FaMoneyBillWave, FaCut, FaSignOutAlt, FaUser, FaChartLine, FaArrowRight } from 'react-icons/fa';
import { logoutUser } from '../../services/authService';

const BarberHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    pendientes: 0,
    confirmadas: 0,
    finalizadas: 0,
    gananciasHoy: 0,
    gananciasMes: 0,
    gananciasTotales: 0
  });

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setPerfil(docSnap.data());

        const q = query(collection(db, 'citas'), where('barberoId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        let pendientes = 0, confirmadas = 0, finalizadas = 0;
        let ganHoy = 0, ganMes = 0, ganTotales = 0;

        const hoy = new Date().toISOString().split("T")[0];
        const mesActual = hoy.substring(0, 7);

        querySnapshot.forEach((doc) => {
          const cita = doc.data();
          const precio = Number(cita.precioFinal) || 0;

          if (cita.estado === 'Pendiente') pendientes++;
          if (cita.estado === 'Confirmada') confirmadas++;
          if (cita.estado === 'Finalizada') {
            finalizadas++;
            ganTotales += precio;
            
            if (cita.fecha === hoy) ganHoy += precio;
            if (cita.fecha.substring(0, 7) === mesActual) ganMes += precio;
          }
        });

        setStats({
          pendientes, confirmadas, finalizadas,
          gananciasHoy: ganHoy, gananciasMes: ganMes, gananciasTotales: ganTotales
        });

      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const menuItems = [
    { title: 'Gestión de Citas', subtitle: 'Administra tus reservas', icon: <FaCalendarCheck size={22} />, path: '/barber/citas', color: 'bg-green-500/10 text-green-400 border-green-500/30' },
    { title: 'Mis Servicios', subtitle: 'Catálogo y precios', icon: <FaCut size={22} />, path: '/barber/servicios', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
    { title: 'Historial Ingresos', subtitle: 'Reportes financieros', icon: <FaMoneyBillWave size={22} />, path: '/barber/ingresos', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    { title: 'Mi Perfil', subtitle: 'Datos personales', icon: <FaUser size={22} />, path: '/barber/perfil', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 pb-20 relative overflow-hidden">
      {/* Efecto de fondo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-neutral-950 to-neutral-950 pointer-events-none" />

      {/* Header con glassmorphism */}
      <header className="bg-neutral-950/80 backdrop-blur-xl pt-10 pb-6 px-4 sm:px-6 sticky top-0 z-10 border-b border-zinc-800/60 relative">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Avatar del Barbero */}
            <div className="w-14 h-14 rounded-full bg-zinc-900/60 flex items-center justify-center overflow-hidden border-2 border-amber-500/30 shrink-0 shadow-lg shadow-amber-500/10">
              {perfil?.fotoUrl ? (
                <img src={perfil.fotoUrl} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <FaUser className="text-zinc-500" size={24} />
              )}
            </div>
            
            {/* Texto de Bienvenida */}
            <div>
              <h1 className="text-lg sm:text-xl font-black text-amber-500 tracking-tight">
                Panel Barbero
              </h1>
              <p className="text-zinc-400 text-sm mt-0.5">
                Hola, <span className="font-semibold text-zinc-100">{perfil?.nombre || 'Barbero'}</span> ✂️
              </p>
            </div>
          </div>

          {/* Botón Salir */}
          <button 
            onClick={handleLogout} 
            className="bg-zinc-900/60 p-3 rounded-full border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300 ml-2 active:scale-95"
            title="Cerrar sesión"
          >
            <FaSignOutAlt size={18} />
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-5xl mx-auto relative z-10 flex flex-col gap-6">
        
        {/* Resumen de Ganancias Premium */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 ml-1 flex items-center gap-2">
            <FaChartLine className="text-amber-500" size={12} />
            Rendimiento Financiero
          </h2>
          <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 shadow-2xl shadow-amber-500/30">
            {/* Decoraciones de fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-black/20 rounded-full blur-2xl" />
            <FaMoneyBillWave size={120} className="absolute -bottom-6 -right-6 text-black/10 rotate-12" />
            
            <div className="relative z-10">
              <p className="text-amber-950/80 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">
                Ganancias de Hoy
              </p>
              <h3 className="text-4xl sm:text-5xl font-black text-neutral-950 tracking-tight mb-4">
                S/ {loading ? '...' : stats.gananciasHoy.toFixed(2)}
              </h3>
              
              <div className="flex flex-wrap gap-4 sm:gap-6 border-t border-amber-950/20 pt-4">
                <div>
                  <p className="text-amber-950/60 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Este Mes</p>
                  <p className="font-black text-neutral-950 text-sm sm:text-base">S/ {loading ? '...' : stats.gananciasMes.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-amber-950/60 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Histórico</p>
                  <p className="font-black text-neutral-950 text-sm sm:text-base">S/ {loading ? '...' : stats.gananciasTotales.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de Citas */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 ml-1">
            Estado de Citas
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-zinc-900/40 border border-zinc-800/60 hover:border-yellow-500/30 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center transition-all duration-300 backdrop-blur-xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-3">
                <FaClock className="text-yellow-400" size={16} />
              </div>
              <span className="text-2xl sm:text-3xl font-black text-zinc-100">{loading ? '-' : stats.pendientes}</span>
              <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider mt-1 font-semibold">Pendientes</span>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800/60 hover:border-green-500/30 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center transition-all duration-300 backdrop-blur-xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-3">
                <FaCalendarCheck className="text-green-400" size={16} />
              </div>
              <span className="text-2xl sm:text-3xl font-black text-zinc-100">{loading ? '-' : stats.confirmadas}</span>
              <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider mt-1 font-semibold">Confirmadas</span>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800/60 hover:border-blue-500/30 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center transition-all duration-300 backdrop-blur-xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-3">
                <FaCheckDouble className="text-blue-400" size={16} />
              </div>
              <span className="text-2xl sm:text-3xl font-black text-zinc-100">{loading ? '-' : stats.finalizadas}</span>
              <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider mt-1 font-semibold">Finalizadas</span>
            </div>
          </div>
        </div>

        {/* Herramientas (Accesos Rápidos) */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 ml-1">
            Herramientas
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

export default BarberHome;