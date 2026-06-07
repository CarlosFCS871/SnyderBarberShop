import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
// Importamos FaUser para el ícono de perfil y el avatar por defecto
import { FaCalendarCheck, FaClock, FaCheckDouble, FaMoneyBillWave, FaCut, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { logoutUser } from '../../services/authService';

const BarberHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados de estadísticas
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
        // 1. Obtener datos del barbero (nombre y foto)
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setPerfil(docSnap.data());

        // 2. Obtener todas las citas asignadas a este barbero
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

  // Agregamos "Mi Perfil" a los accesos rápidos
  const menuItems = [
    { title: 'Gestión de Citas', icon: <FaCalendarCheck size={24} />, path: '/barber/citas', color: 'bg-green-500/10 text-green-500' },
    { title: 'Mis Servicios', icon: <FaCut size={24} />, path: '/barber/servicios', color: 'bg-accent/10 text-accent' },
    { title: 'Historial Ingresos', icon: <FaMoneyBillWave size={24} />, path: '/barber/ingresos', color: 'bg-blue-500/10 text-blue-500' },
    { title: 'Mi Perfil', icon: <FaUser size={24} />, path: '/barber/perfil', color: 'bg-white/10 text-gray-300' },
  ];

  return (
    <div className="min-h-screen bg-primary text-white pb-20">
      {/* Header Personalizado con Foto y Nombre */}
      <header className="bg-primary pt-10 pb-6 px-6 sticky top-0 z-10 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Avatar del Barbero */}
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-accent shrink-0">
            {perfil?.fotoUrl ? (
              <img src={perfil.fotoUrl} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <FaUser className="text-gray-400" size={24} />
            )}
          </div>
          
          {/* Texto de Bienvenida */}
          <div>
            <h1 className="text-xl font-bold text-accent tracking-wide">Panel Barbero</h1>
            <p className="text-gray-300 text-sm mt-1">
              Hola, <span className="font-semibold text-white">{perfil?.nombre || 'Barbero'}</span> ✂️
            </p>
          </div>
        </div>

        {/* Botón Salir */}
        <button 
          onClick={handleLogout} 
          className="bg-white/5 p-3 rounded-full border border-white/10 text-gray-400 hover:text-red-500 hover:border-red-500/50 transition-all ml-2"
          title="Cerrar sesión"
        >
          <FaSignOutAlt size={18} />
        </button>
      </header>

      <main className="px-6 py-6 flex flex-col gap-6">
        
        {/* Resumen de Ganancias */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-200">Rendimiento Financiero</h2>
          <div className="bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-white/5">
              <FaMoneyBillWave size={100} />
            </div>
            
            <p className="text-sm text-gray-400 mb-1">Ganancias de Hoy</p>
            <h3 className="text-3xl font-black text-accent mb-4">S/ {loading ? '...' : stats.gananciasHoy.toFixed(2)}</h3>
            
            <div className="flex gap-6 border-t border-white/10 pt-4">
              <div>
                <p className="text-xs text-gray-400">Este Mes</p>
                <p className="font-bold text-white">S/ {loading ? '...' : stats.gananciasMes.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Histórico</p>
                <p className="font-bold text-white">S/ {loading ? '...' : stats.gananciasTotales.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de Citas */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-200">Estado de Citas</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center">
              <FaClock className="text-yellow-500 mb-2" size={20} />
              <span className="text-xl font-black text-white">{loading ? '-' : stats.pendientes}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Pendientes</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center">
              <FaCalendarCheck className="text-green-500 mb-2" size={20} />
              <span className="text-xl font-black text-white">{loading ? '-' : stats.confirmadas}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Confirmadas</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center">
              <FaCheckDouble className="text-blue-500 mb-2" size={20} />
              <span className="text-xl font-black text-white">{loading ? '-' : stats.finalizadas}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Finalizadas</span>
            </div>
          </div>
        </div>

        {/* Herramientas (Accesos Rápidos) */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-200">Herramientas</h2>
          <div className="grid grid-cols-1 gap-3">
            {menuItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.path}
                className="bg-white/5 p-4 rounded-xl flex items-center gap-4 border border-white/5 hover:bg-white/10 transition-colors"
              >
                <div className={`p-3 rounded-lg ${item.color}`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BarberHome;