import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FaArrowLeft, FaCalendarCheck, FaClock, FaUserTie, FaCut } from 'react-icons/fa';

const ClientCitas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCitas = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'citas'), where('clienteId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const listaCitas = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        listaCitas.sort((a, b) => {
          const dateA = new Date(`${a.fecha}T${a.hora}`);
          const dateB = new Date(`${b.fecha}T${b.hora}`);
          return dateB - dateA;
        });

        setCitas(listaCitas);
      } catch (error) {
        console.error("Error al cargar las citas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();
  }, [user]);

  const getBadgeStyle = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'Confirmada': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Finalizada': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Cancelada': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 pb-20 relative overflow-hidden">
      {/* Efecto de fondo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-neutral-950 to-neutral-950 pointer-events-none" />

      {/* Header con glassmorphism */}
      <header className="bg-neutral-950/80 backdrop-blur-xl pt-10 pb-6 px-4 sm:px-6 sticky top-0 z-10 border-b border-zinc-800/60 relative">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-zinc-900/60 p-2.5 rounded-full border border-zinc-800 text-zinc-400 hover:text-amber-500 hover:border-amber-500/50 transition-all duration-300 active:scale-95"
          >
            <FaArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <FaCalendarCheck className="text-amber-500" size={20} />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-amber-500 tracking-tight">
                Mis Citas
              </h1>
              <p className="text-xs text-zinc-500">Historial de reservas</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-5xl mx-auto relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-16 gap-4">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm">Cargando tu historial...</p>
          </div>
        ) : citas.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 gap-4">
            <div className="w-20 h-20 bg-zinc-900/60 rounded-full flex items-center justify-center border border-zinc-800 mb-2">
              <FaCalendarCheck className="text-zinc-600" size={32} />
            </div>
            <div className="text-center">
              <p className="text-zinc-300 font-semibold">Aún no tienes citas registradas</p>
              <p className="text-zinc-500 text-sm mt-1">Reserva tu primera cita con nuestros barberos</p>
            </div>
            <button
              onClick={() => navigate('/client/barberos')}
              className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-bold px-6 py-3 rounded-xl mt-4 transition-all duration-300 shadow-lg shadow-amber-500/20 uppercase tracking-wider text-sm"
            >
              Reservar ahora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {citas.map((cita) => (
              <div
                key={cita.id}
                className="group bg-zinc-900/40 hover:bg-zinc-800/60 p-5 sm:p-6 rounded-2xl border border-zinc-800/60 hover:border-amber-500/30 flex flex-col gap-3 transition-all duration-300 backdrop-blur-xl"
              >
                {/* Header de la cita */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Icono de servicio */}
                    <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center shrink-0">
                      <FaCut className="text-amber-500" size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base sm:text-lg text-zinc-100 truncate group-hover:text-amber-500 transition-colors duration-300">
                        {cita.servicioNombre}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <FaUserTie size={10} className="text-amber-500" />
                        Con {cita.barberoNombre}
                      </p>
                    </div>
                  </div>
                  {/* Badge de estado */}
                  <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-lg border whitespace-nowrap ${getBadgeStyle(cita.estado)}`}>
                    {cita.estado}
                  </span>
                </div>

                {/* Footer de la cita */}
                <div className="flex justify-between items-center mt-2 pt-3 border-t border-zinc-800/60">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1.5 text-zinc-100 font-semibold">
                      <FaCalendarCheck size={12} className="text-amber-500" />
                      <span>{cita.fecha}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <FaClock size={12} />
                      <span>{cita.hora}</span>
                    </div>
                  </div>
                  <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black px-2.5 py-1 rounded-lg text-xs sm:text-sm">
                    S/ {cita.precioFinal}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientCitas;