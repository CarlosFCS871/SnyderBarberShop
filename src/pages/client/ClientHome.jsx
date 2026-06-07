import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { FaUserTie, FaCalendarAlt, FaUser, FaWallet, FaSignOutAlt } from 'react-icons/fa';
import { logoutUser } from '../../services/authService';

const ClientHome = () => {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState(null);
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
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPerfil(docSnap.data());
        }

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
    { title: 'Barberos', icon: <FaUserTie size={28} />, path: '/client/barberos' },
    { title: 'Mis Citas', icon: <FaCalendarAlt size={28} />, path: '/client/citas' },
    { title: 'Perfil', icon: <FaUser size={28} />, path: '/client/perfil' },
    { title: 'Gastos', icon: <FaWallet size={28} />, path: '/client/gastos' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 pb-20 relative overflow-hidden">
      {/* Efecto de fondo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-neutral-950 to-neutral-950 pointer-events-none" />

      {/* Header Personalizado */}
      <header className="bg-neutral-950/80 backdrop-blur-xl pt-10 pb-6 px-4 sm:px-6 sticky top-0 z-10 border-b border-zinc-800/60 relative">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Avatar del Usuario */}
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
                Snyder Barber
              </h1>
              <p className="text-zinc-400 text-sm mt-0.5">
                Hola, <span className="font-semibold text-zinc-100">{perfil?.nombre || 'Cliente'}</span> 👋
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

      <main className="px-4 sm:px-6 py-6 max-w-5xl mx-auto relative z-10">
        {/* Accesos Rápidos */}
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 ml-1">
          Acceso Rápido
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="group bg-zinc-900/40 hover:bg-zinc-800/60 p-5 sm:p-6 rounded-2xl flex flex-col items-center justify-center gap-3 border border-zinc-800/60 hover:border-amber-500/30 active:scale-95 transition-all duration-300"
            >
              <div className="text-amber-500 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <span className="font-semibold text-xs sm:text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">
                {item.title}
              </span>
            </Link>
          ))}
        </div>

        {/* Próxima Cita Confirmada */}
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 ml-1">
          Próxima Cita
        </h2>
        <div className="bg-zinc-900/40 rounded-2xl p-6 border border-zinc-800/60 relative overflow-hidden backdrop-blur-xl">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/5 rounded-full pointer-events-none blur-2xl" />

          <div className="relative z-10">
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-400 text-sm">Cargando tu próxima cita...</p>
              </div>
            ) : ultimaCita ? (
              <div>
                <div className="flex items-start gap-4">
                  {/* Icono de cita */}
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center shrink-0">
                    <FaCalendarAlt className="text-amber-500" size={20} />
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-lg sm:text-xl text-zinc-100 mb-1">
                      {ultimaCita.servicioNombre}
                    </p>
                    <p className="text-zinc-400 text-sm mb-4 flex items-center gap-2">
                      <FaUserTie size={12} className="text-amber-500" />
                      Con {ultimaCita.barberoNombre}
                    </p>

                    {/* Fecha y Hora */}
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2">
                        <FaCalendarAlt size={10} />
                        {ultimaCita.fecha}
                      </span>
                      <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold">
                        {ultimaCita.hora}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-zinc-800/60 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaCalendarAlt className="text-zinc-600" size={24} />
                </div>
                <p className="text-zinc-400 text-sm font-medium">No tienes citas confirmadas</p>
                <p className="text-zinc-600 text-xs mt-1">Reserva tu próxima cita con nuestros barberos</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientHome;