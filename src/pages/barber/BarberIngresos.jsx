import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { FaArrowLeft, FaMoneyBillWave, FaReceipt, FaCut, FaUser, FaChartLine } from 'react-icons/fa';

const BarberIngresos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [ingresos, setIngresos] = useState([]);
  const [totalHistorico, setTotalHistorico] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIngresos = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'citas'), 
          where('barberoId', '==', user.uid),
          where('estado', '==', 'Finalizada')
        );
        
        const querySnapshot = await getDocs(q);
        
        let total = 0;
        let listaIngresos = [];

        for (const documento of querySnapshot.docs) {
          const data = documento.data();
          total += Number(data.precioFinal) || 0;
          
          let nombreCliente = 'Cliente Desconocido';
          if (data.clienteId) {
            const clienteSnap = await getDoc(doc(db, 'usuarios', data.clienteId));
            if (clienteSnap.exists()) {
              nombreCliente = `${clienteSnap.data().nombre} ${clienteSnap.data().apellido}`;
            }
          }

          listaIngresos.push({
            id: documento.id,
            nombreCliente,
            ...data
          });
        }

        listaIngresos.sort((a, b) => {
          const dateA = new Date(`${a.fecha}T${a.hora}`);
          const dateB = new Date(`${b.fecha}T${b.hora}`);
          return dateB - dateA;
        });
        
        setIngresos(listaIngresos);
        setTotalHistorico(total);
      } catch (error) {
        console.error("Error al cargar los ingresos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngresos();
  }, [user]);

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
            <FaMoneyBillWave className="text-amber-500" size={20} />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-amber-500 tracking-tight">
                Historial de Ingresos
              </h1>
              <p className="text-xs text-zinc-500">Detalle de tus cobros</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-5xl mx-auto relative z-10 flex flex-col gap-6">
        
        {/* Tarjeta de Total Acumulado Premium */}
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 shadow-2xl shadow-amber-500/30">
          {/* Decoraciones de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-black/20 rounded-full blur-2xl" />
          <FaMoneyBillWave size={120} className="absolute -bottom-6 -right-6 text-black/10 rotate-12" />
          
          <div className="relative z-10">
            <p className="text-amber-950/80 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <FaChartLine size={12} />
              Total Generado (Histórico)
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-neutral-950 tracking-tight">
              S/ {totalHistorico.toFixed(2)}
            </h2>
            <p className="text-amber-950/60 text-xs sm:text-sm mt-2 font-medium">
              En {ingresos.length} {ingresos.length === 1 ? 'servicio' : 'servicios'}
            </p>
          </div>
        </div>

        {/* Historial Detallado */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 ml-1">
            Últimos cobros
          </h3>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-400 text-sm">Calculando ingresos...</p>
            </div>
          ) : ingresos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 backdrop-blur-xl">
              <div className="w-20 h-20 bg-zinc-900/60 rounded-full flex items-center justify-center border border-zinc-800">
                <FaReceipt className="text-zinc-600" size={32} />
              </div>
              <div className="text-center">
                <p className="text-zinc-300 font-semibold">Aún no tienes citas finalizadas</p>
                <p className="text-zinc-500 text-sm mt-1">Tus ingresos aparecerán aquí</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {ingresos.map((ingreso) => (
                <div 
                  key={ingreso.id} 
                  className="group bg-zinc-900/40 hover:bg-zinc-800/60 p-4 sm:p-5 rounded-2xl border border-zinc-800/60 hover:border-amber-500/30 flex justify-between items-center gap-3 transition-all duration-300 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    {/* Icono del servicio */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors duration-300">
                      <FaCut className="text-amber-500" size={16} />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm sm:text-base text-zinc-100 truncate group-hover:text-amber-500 transition-colors duration-300">
                        {ingreso.servicioNombre}
                      </h4>
                      <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5 truncate">
                        <FaUser size={9} className="text-amber-500 shrink-0" />
                        {ingreso.nombreCliente}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {ingreso.fecha}
                      </p>
                    </div>
                  </div>
                  
                  {/* Precio */}
                  <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black px-3 py-1.5 rounded-lg text-xs sm:text-sm whitespace-nowrap">
                    S/ {ingreso.precioFinal}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BarberIngresos;