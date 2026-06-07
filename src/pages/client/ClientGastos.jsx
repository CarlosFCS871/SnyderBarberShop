import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FaArrowLeft, FaWallet, FaReceipt } from 'react-icons/fa';

const ClientGastos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [pagos, setPagos] = useState([]);
  const [totalGastado, setTotalGastado] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGastos = async () => {
      if (!user) return;
      try {
        // Buscamos solo las citas de este cliente que ya estén FINALIZADAS
        const q = query(
          collection(db, 'citas'), 
          where('clienteId', '==', user.uid),
          where('estado', '==', 'Finalizada')
        );
        
        const querySnapshot = await getDocs(q);
        
        let total = 0;
        const listaPagos = querySnapshot.docs.map(doc => {
          const data = doc.data();
          total += Number(data.precioFinal) || 0; // Sumamos al total
          return {
            id: doc.id,
            ...data
          };
        });

        // Ordenamos del pago más reciente al más antiguo
        listaPagos.sort((a, b) => {
          const dateA = new Date(`${a.fecha}T${a.hora}`);
          const dateB = new Date(`${b.fecha}T${b.hora}`);
          return dateB - dateA;
        });
        
        setPagos(listaPagos);
        setTotalGastado(total);
      } catch (error) {
        console.error("Error al cargar los gastos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGastos();
  }, [user]);

  return (
    <div className="min-h-screen bg-primary text-white pb-20">
      {/* Header */}
      <header className="bg-primary pt-10 pb-6 px-6 sticky top-0 z-10 border-b border-white/10 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-accent transition-colors">
          <FaArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Mis Gastos</h1>
          <p className="text-sm text-gray-400">Control de tus pagos</p>
        </div>
      </header>

      <main className="px-6 py-6 flex flex-col gap-6">
        
        {/* Tarjeta de Total Acumulado */}
        <div className="bg-accent rounded-2xl p-6 text-primary relative overflow-hidden shadow-lg shadow-accent/20">
          <FaWallet size={100} className="absolute -bottom-4 -right-4 text-black/10" />
          <p className="font-medium text-sm mb-1 opacity-80">Total Invertido</p>
          <h2 className="text-4xl font-black">S/ {totalGastado.toFixed(2)}</h2>
        </div>

        {/* Historial de Pagos */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Historial de Pagos</h3>
          
          {loading ? (
            <div className="text-center text-gray-400 py-10">Calculando gastos...</div>
          ) : pagos.length === 0 ? (
            <div className="text-center flex flex-col items-center gap-3 py-10 border border-white/5 rounded-2xl bg-white/5">
              <FaReceipt size={30} className="text-gray-500" />
              <p className="text-gray-400 text-sm">Aún no tienes citas finalizadas.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pagos.map((pago) => (
                <div key={pago.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      <FaReceipt size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{pago.servicioNombre}</h4>
                      <p className="text-xs text-gray-400">{pago.fecha} • {pago.barberoNombre}</p>
                    </div>
                  </div>
                  <span className="font-bold text-accent">S/ {pago.precioFinal}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientGastos;