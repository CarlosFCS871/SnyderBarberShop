import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { FaUserTie, FaCalendarAlt, FaUser, FaWallet, FaSignOutAlt } from 'react-icons/fa';
import { logoutUser } from '../../services/authService';

const ClientHome = () => {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState(null); // Nuevo estado para guardar los datos del usuario
  const [ultimaCita, setUltimaCita] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        // 1. Obtenemos los datos del perfil del usuario (para nombre y foto)
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPerfil(docSnap.data());
        }

        // 2. Obtenemos la última cita confirmada
        const q = query(
          collection(db, 'citas'),
          where('clienteId', '==', user.uid),
          where('estado', '==', 'Confirmada'),
          orderBy('fecha', 'asc'),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setUltimaCita(querySnapshot.docs[0].data());
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const menuItems = [
    { title: 'Barberos', icon: <FaUserTie size={24} />, path: '/client/barberos', color: 'bg-white/10' },
    { title: 'Mis Citas', icon: <FaCalendarAlt size={24} />, path: '/client/citas', color: 'bg-white/10' },
    { title: 'Perfil', icon: <FaUser size={24} />, path: '/client/perfil', color: 'bg-white/10' },
    { title: 'Gastos', icon: <FaWallet size={24} />, path: '/client/gastos', color: 'bg-white/10' },
  ];

  return (
    <div className="min-h-screen bg-primary text-white pb-20">
      {/* Header Personalizado con Foto y Nombre */}
      <header className="bg-primary pt-10 pb-6 px-6 sticky top-0 z-10 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Avatar del Usuario */}
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20 shrink-0">
            {perfil?.fotoUrl ? (
              <img src={perfil.fotoUrl} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <FaUser className="text-gray-400" size={24} />
            )}
          </div>
          
          {/* Texto de Bienvenida */}
          <div>
            <h1 className="text-xl font-bold text-accent tracking-wide">Snyder Barber</h1>
            <p className="text-gray-300 text-sm mt-1">
              Hola, <span className="font-semibold text-white">{perfil?.nombre || 'Cliente'}</span> 👋
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

      <main className="px-6 py-6">
        {/* Accesos Rápidos */}
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Acceso Rápido</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {menuItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.path}
              className={`${item.color} p-6 rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/5 active:bg-white/20 transition-colors`}
            >
              <div className="text-accent">{item.icon}</div>
              <span className="font-medium text-sm">{item.title}</span>
            </Link>
          ))}
        </div>

        {/* Última Cita Confirmada */}
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Próxima Cita</h2>
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-accent/10 rounded-bl-full"></div>
          
          {loading ? (
            <p className="text-gray-400 text-sm">Cargando...</p>
          ) : ultimaCita ? (
            <div>
              <p className="font-bold text-lg mb-1">{ultimaCita.servicioNombre}</p>
              <p className="text-gray-400 text-sm mb-3">Con {ultimaCita.barberoNombre}</p>
              <div className="flex gap-4 text-sm font-medium text-accent">
                <span className="bg-accent/10 px-3 py-1 rounded-full">{ultimaCita.fecha}</span>
                <span className="bg-accent/10 px-3 py-1 rounded-full">{ultimaCita.hora}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No tienes citas confirmadas.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientHome;