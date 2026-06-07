import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { FaArrowLeft, FaMoneyBillWave, FaReceipt } from 'react-icons/fa';

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
        // Buscamos solo las citas de este barbero que estén FINALIZADAS
        const q = query(
          collection(db, 'citas'), 
          where('barberoId', '==', user.uid),
          where('estado', '==', 'Finalizada')
        );
        
        const querySnapshot = await getDocs(q);
        
        let total = 0;
        let listaIngresos = [];

        // Usamos for...of para buscar el nombre del cliente de cada ingreso
        for (const documento of querySnapshot.docs) {
          const data = documento.data();
          total += Number(data.precioFinal) || 0; // Sumamos al total
          
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

        // Ordenamos del ingreso más reciente al más antiguo
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
    <div className="min-h-screen bg-primary text-white pb-20">
      {/* Header */}
      <header className="bg-primary pt-10 pb-6 px-6 sticky top-0 z-10 border-b border-white/10 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-accent transition-colors">
          <FaArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Historial de Ingresos</h1>
          <p className="text-sm text-gray-400">Detalle de tus cobros</p>
        </div>
      </header>

      <main className="px-6 py-6 flex flex-col gap-6">
        
        {/* Tarjeta de Total Acumulado */}
        <div className="bg-gradient-to-br from-blue-900/50 to-black border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-blue-500/10">
          <FaMoneyBillWave size={100} className="absolute -bottom-4 -right-4 text-blue-500/10" />
          <p className="font-medium text-sm mb-1 text-blue-300">Total Generado (Histórico)</p>
          <h2 className="text-4xl font-black text-white">S/ {totalHistorico.toFixed(2)}</h2>
        </div>

        {/* Historial Detallado */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Últimos cobros</h3>
          
          {loading ? (
            <div className="text-center text-gray-400 py-10">Calculando ingresos...</div>
          ) : ingresos.length === 0 ? (
            <div className="text-center flex flex-col items-center gap-3 py-10 border border-white/5 rounded-2xl bg-white/5">
              <FaReceipt size={30} className="text-gray-500" />
              <p className="text-gray-400 text-sm">Aún no tienes citas finalizadas.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {ingresos.map((ingreso) => (
                <div key={ingreso.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                      <FaReceipt size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{ingreso.servicioNombre}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{ingreso.fecha} • {ingreso.nombreCliente}</p>
                    </div>
                  </div>
                  <span className="font-bold text-accent text-lg">S/ {ingreso.precioFinal}</span>
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