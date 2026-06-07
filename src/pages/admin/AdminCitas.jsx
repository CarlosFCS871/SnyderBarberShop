import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { FaArrowLeft, FaCalendarAlt, FaFilter, FaUser, FaUserTie, FaCut, FaClock } from 'react-icons/fa';

const AdminCitas = () => {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('Todas');

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'citas'));
        let listaCitas = [];

        for (const documento of querySnapshot.docs) {
          const dataCita = documento.data();
          
          let nombreCliente = 'Cliente Desconocido';
          if (dataCita.clienteId) {
            const clienteSnap = await getDoc(doc(db, 'usuarios', dataCita.clienteId));
            if (clienteSnap.exists()) {
              nombreCliente = `${clienteSnap.data().nombre} ${clienteSnap.data().apellido}`;
            }
          }

          listaCitas.push({
            id: documento.id,
            nombreCliente,
            ...dataCita
          });
        }

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
  }, []);

  const getBadgeStyle = (estado) => {
    switch(estado) {
      case 'Pendiente': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'Confirmada': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Finalizada': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Cancelada': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30';
    }
  };

  const getIndicadorColor = (estado) => {
    switch(estado) {
      case 'Pendiente': return 'bg-yellow-500';
      case 'Confirmada': return 'bg-green-500';
      case 'Finalizada': return 'bg-blue-500';
      case 'Cancelada': return 'bg-red-500';
      default: return 'bg-zinc-500';
    }
  };

  const citasFiltradas = filtro === 'Todas' 
    ? citas 
    : citas.filter(cita => cita.estado === filtro);

  const getFiltroColor = (estado) => {
    switch(estado) {
      case 'Todas': return filtro === estado ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : '';
      case 'Pendiente': return filtro === estado ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : '';
      case 'Confirmada': return filtro === estado ? 'bg-green-500/10 text-green-400 border-green-500/30' : '';
      case 'Finalizada': return filtro === estado ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : '';
      case 'Cancelada': return filtro === estado ? 'bg-red-500/10 text-red-400 border-red-500/30' : '';
      default: return '';
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
            <FaCalendarAlt className="text-amber-500" size={20} />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-amber-500 tracking-tight">
                Todas las Citas
              </h1>
              <p className="text-xs text-zinc-500">Monitoreo general del sistema</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-5xl mx-auto relative z-10">
        {/* Filtros Premium */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-2 text-zinc-500 mr-2 shrink-0">
            <FaFilter size={12} />
          </div>
          {['Todas', 'Pendiente', 'Confirmada', 'Finalizada', 'Cancelada'].map(estado => (
            <button
              key={estado}
              onClick={() => setFiltro(estado)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 border ${
                filtro === estado 
                ? getFiltroColor(estado)
                : 'bg-zinc-900/40 text-zinc-400 border-zinc-800/60 hover:bg-zinc-800/60 hover:border-zinc-700'
              }`}
            >
              {estado}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center mt-16 gap-4">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm">Cargando reservas...</p>
          </div>
        ) : citasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 gap-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 backdrop-blur-xl p-8">
            <div className="w-20 h-20 bg-zinc-900/60 rounded-full flex items-center justify-center border border-zinc-800">
              <FaCalendarAlt className="text-zinc-600" size={32} />
            </div>
            <div className="text-center">
              <p className="text-zinc-300 font-semibold">No hay citas para mostrar</p>
              <p className="text-zinc-500 text-sm mt-1">Prueba con otro filtro</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {citasFiltradas.map((cita) => (
              <div 
                key={cita.id} 
                className="group bg-zinc-900/40 hover:bg-zinc-800/60 rounded-2xl border border-zinc-800/60 hover:border-amber-500/30 flex flex-col gap-3 relative overflow-hidden transition-all duration-300 backdrop-blur-xl"
              >
                {/* Indicador visual de estado a la izquierda */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getIndicadorColor(cita.estado)} rounded-r-full`} />

                <div className="p-5 flex flex-col gap-4 pl-6">
                  {/* Header de la cita */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center shrink-0">
                        <FaCut className="text-amber-500" size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base sm:text-lg text-zinc-100 truncate group-hover:text-amber-500 transition-colors duration-300">
                          {cita.servicioNombre}
                        </h3>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border mt-1 ${getBadgeStyle(cita.estado)}`}>
                          {cita.estado}
                        </span>
                      </div>
                    </div>
                    <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black px-2.5 py-1 rounded-lg text-xs sm:text-sm whitespace-nowrap">
                      S/ {cita.precioFinal}
                    </span>
                  </div>

                  {/* Info del cliente y barbero */}
                  <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60 flex flex-col gap-1.5">
                    <p className="text-xs sm:text-sm text-zinc-300 flex items-center gap-2">
                      <FaUser size={10} className="text-amber-500 shrink-0" />
                      <span className="font-medium text-zinc-100">{cita.nombreCliente}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-400 flex items-center gap-2">
                      <FaUserTie size={10} className="text-amber-500 shrink-0" />
                      {cita.barberoNombre}
                    </p>
                  </div>
                  
                  {/* Fecha y Hora */}
                  <div className="flex gap-2 text-xs sm:text-sm font-semibold">
                    <span className="flex-1 bg-zinc-900/60 border border-zinc-800/60 text-zinc-100 px-3 py-2 rounded-lg flex items-center justify-center gap-2">
                      <FaCalendarAlt size={10} className="text-amber-500" />
                      {cita.fecha}
                    </span>
                    <span className="flex-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-2 rounded-lg flex items-center justify-center gap-2">
                      <FaClock size={10} />
                      {cita.hora}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCitas;