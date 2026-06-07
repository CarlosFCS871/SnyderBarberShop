import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FaArrowLeft, FaChartLine, FaMoneyBillWave, FaUserTie, FaTrophy, FaCalendarCheck } from 'react-icons/fa';

const AdminReportes = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [totalGanancias, setTotalGanancias] = useState(0);
  const [totalCitasRealizadas, setTotalCitasRealizadas] = useState(0);
  const [gananciasPorBarbero, setGananciasPorBarbero] = useState([]);

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const q = query(collection(db, 'citas'), where('estado', '==', 'Finalizada'));
        const querySnapshot = await getDocs(q);

        let sumaTotal = 0;
        const desgloseBarberos = {};

        querySnapshot.forEach((doc) => {
          const cita = doc.data();
          const precio = Number(cita.precioFinal) || 0;
          const barbero = cita.barberoNombre || 'Barbero Desconocido';

          sumaTotal += precio;

          if (!desgloseBarberos[barbero]) {
            desgloseBarberos[barbero] = { ganancias: 0, citas: 0 };
          }
          desgloseBarberos[barbero].ganancias += precio;
          desgloseBarberos[barbero].citas += 1;
        });

        const listaBarberos = Object.keys(desgloseBarberos).map(nombre => ({
          nombre,
          ganancias: desgloseBarberos[nombre].ganancias,
          citas: desgloseBarberos[nombre].citas
        }));

        listaBarberos.sort((a, b) => b.ganancias - a.ganancias);

        setTotalGanancias(sumaTotal);
        setTotalCitasRealizadas(querySnapshot.size);
        setGananciasPorBarbero(listaBarberos);

      } catch (error) {
        console.error("Error al generar reportes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportes();
  }, []);

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
            <FaChartLine className="text-amber-500" size={20} />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-amber-500 tracking-tight">
                Reportes Financieros
              </h1>
              <p className="text-xs text-zinc-500">Balance del negocio</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-5xl mx-auto relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-16 gap-4">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm">Calculando finanzas...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Tarjeta Principal de Ingresos Premium */}
            <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 shadow-2xl shadow-amber-500/30">
              {/* Decoraciones de fondo */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-black/20 rounded-full blur-2xl" />
              <FaChartLine size={120} className="absolute -bottom-6 -right-6 text-black/10 rotate-12" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-amber-950/80 mb-2">
                  <FaMoneyBillWave size={16} />
                  <h2 className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                    Ingresos Totales
                  </h2>
                </div>
                <p className="text-4xl sm:text-5xl font-black text-neutral-950 tracking-tight mb-1">
                  S/ {totalGanancias.toFixed(2)}
                </p>
                <p className="text-amber-950/60 text-xs sm:text-sm font-medium flex items-center gap-2">
                  <FaCalendarCheck size={12} />
                  Generado en {totalCitasRealizadas} citas finalizadas
                </p>
              </div>
            </div>

            {/* Desglose por Barbero */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 ml-1 flex items-center gap-2">
                <FaTrophy className="text-amber-500" size={12} />
                Rendimiento por Barbero
              </h3>
              
              {gananciasPorBarbero.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 backdrop-blur-xl">
                  <div className="w-20 h-20 bg-zinc-900/60 rounded-full flex items-center justify-center border border-zinc-800">
                    <FaUserTie className="text-zinc-600" size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-zinc-300 font-semibold">Aún no hay ingresos registrados</p>
                    <p className="text-zinc-500 text-sm mt-1">Los reportes aparecerán aquí</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {gananciasPorBarbero.map((barbero, index) => (
                    <div 
                      key={index} 
                      className="group bg-zinc-900/40 hover:bg-zinc-800/60 p-4 sm:p-5 rounded-2xl border border-zinc-800/60 hover:border-amber-500/30 flex items-center gap-3 sm:gap-4 transition-all duration-300 backdrop-blur-xl"
                    >
                      {/* Avatar del barbero */}
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors duration-300">
                        <FaUserTie className="text-amber-500" size={18} />
                        {/* Badge de posición */}
                        {index === 0 && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                            <FaTrophy className="text-neutral-950" size={8} />
                          </div>
                        )}
                      </div>
                      
                      {/* Info del barbero */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm sm:text-base text-zinc-100 truncate group-hover:text-amber-500 transition-colors duration-300">
                          {barbero.nombre}
                        </h4>
                        <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                          <FaCalendarCheck size={9} className="text-amber-500" />
                          {barbero.citas} {barbero.citas === 1 ? 'cita' : 'citas'} realizadas
                        </p>
                      </div>
                      
                      {/* Ganancias */}
                      <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black px-3 py-1.5 rounded-lg text-xs sm:text-sm whitespace-nowrap">
                        S/ {barbero.ganancias.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReportes;