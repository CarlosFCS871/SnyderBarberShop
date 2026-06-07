import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FaUserCircle, FaArrowLeft, FaCut } from 'react-icons/fa';

const BarberosList = () => {
  const [barberos, setBarberos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBarberos = async () => {
      try {
        const q = query(collection(db, 'usuarios'), where('rol', '==', 'Barbero'));
        const querySnapshot = await getDocs(q);
        
        const listaBarberos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setBarberos(listaBarberos);
      } catch (error) {
        console.error("Error al cargar los barberos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBarberos();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 pb-20 relative overflow-hidden">
      {/* Efecto de fondo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-neutral-950 to-neutral-950 pointer-events-none" />

      {/* Header con botón de retroceso */}
      <header className="bg-neutral-950/80 backdrop-blur-xl pt-10 pb-6 px-4 sm:px-6 sticky top-0 z-10 border-b border-zinc-800/60 relative">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="bg-zinc-900/60 p-2.5 rounded-full border border-zinc-800 text-zinc-400 hover:text-amber-500 hover:border-amber-500/50 transition-all duration-300 active:scale-95"
          >
            <FaArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <FaCut className="text-amber-500" size={20} />
            <h1 className="text-xl sm:text-2xl font-black text-amber-500 tracking-tight">
              Nuestros Barberos
            </h1>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-5xl mx-auto relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-16 gap-4">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm">Cargando profesionales...</p>
          </div>
        ) : barberos.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 gap-4">
            <div className="w-20 h-20 bg-zinc-900/60 rounded-full flex items-center justify-center border border-zinc-800">
              <FaUserCircle className="text-zinc-600" size={40} />
            </div>
            <div className="text-center">
              <p className="text-zinc-300 font-semibold">Aún no hay barberos registrados</p>
              <p className="text-zinc-500 text-sm mt-1">Vuelve más tarde para ver nuestro equipo</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {barberos.map((barbero) => (
              <div 
                key={barbero.id} 
                className="group bg-zinc-900/40 hover:bg-zinc-800/60 p-5 rounded-2xl border border-zinc-800/60 hover:border-amber-500/30 flex items-center gap-4 transition-all duration-300 backdrop-blur-xl"
              >
                {/* Foto del Barbero o Icono por defecto */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-900/60 flex items-center justify-center overflow-hidden shrink-0 border-2 border-amber-500/30 shadow-lg shadow-amber-500/10 group-hover:border-amber-500/60 transition-colors duration-300">
                  {barbero.fotoUrl ? (
                    <img src={barbero.fotoUrl} alt={barbero.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <FaUserCircle className="text-zinc-500" size={48} />
                  )}
                </div>

                {/* Info del Barbero */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-zinc-100 truncate">
                    {barbero.nombre} {barbero.apellido}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    Barbero Profesional
                  </p>
                </div>

                {/* Botón Ver Servicios */}
                <Link 
                  to={`/client/barbero/${barbero.id}/servicios`}
                  className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-300 shadow-lg shadow-amber-500/20 whitespace-nowrap"
                >
                  Servicios
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BarberosList;