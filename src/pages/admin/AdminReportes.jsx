import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FaArrowLeft, FaChartLine, FaMoneyBillWave, FaUserTie } from 'react-icons/fa';

const AdminReportes = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Estados para los datos financieros
  const [totalGanancias, setTotalGanancias] = useState(0);
  const [totalCitasRealizadas, setTotalCitasRealizadas] = useState(0);
  const [gananciasPorBarbero, setGananciasPorBarbero] = useState([]);

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        // Consultamos ÚNICAMENTE las citas que ya fueron pagadas (Finalizadas)
        const q = query(collection(db, 'citas'), where('estado', '==', 'Finalizada'));
        const querySnapshot = await getDocs(q);

        let sumaTotal = 0;
        const desgloseBarberos = {}; // Usamos un objeto para agrupar las ganancias por nombre

        querySnapshot.forEach((doc) => {
          const cita = doc.data();
          const precio = Number(cita.precioFinal) || 0;
          const barbero = cita.barberoNombre || 'Barbero Desconocido';

          // Sumamos al global
          sumaTotal += precio;

          // Agrupamos por barbero
          if (!desgloseBarberos[barbero]) {
            desgloseBarberos[barbero] = { ganancias: 0, citas: 0 };
          }
          desgloseBarberos[barbero].ganancias += precio;
          desgloseBarberos[barbero].citas += 1;
        });

        // Convertimos el objeto a un arreglo para poder recorrerlo con .map() en el HTML
        const listaBarberos = Object.keys(desgloseBarberos).map(nombre => ({
          nombre,
          ganancias: desgloseBarberos[nombre].ganancias,
          citas: desgloseBarberos[nombre].citas
        }));

        // Ordenamos la lista para que el barbero que más generó salga primero
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
    <div className="min-h-screen bg-primary text-white pb-20 relative">
      <header className="bg-primary pt-10 pb-6 px-6 sticky top-0 z-10 border-b border-white/10 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-accent transition-colors">
          <FaArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Reportes Financieros</h1>
          <p className="text-sm text-gray-400">Balance del negocio</p>
        </div>
      </header>

      <main className="px-6 py-6">
        {loading ? (
          <div className="text-center text-gray-400 mt-10">Calculando finanzas...</div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Tarjeta Principal de Ingresos */}
            <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden shadow-lg">
              <FaChartLine size={80} className="absolute -bottom-4 -right-4 text-purple-500/10" />
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <FaMoneyBillWave size={18} />
                <h2 className="font-semibold text-sm uppercase tracking-wider">Ingresos Totales</h2>
              </div>
              <p className="text-4xl font-black text-white mb-1">S/ {totalGanancias.toFixed(2)}</p>
              <p className="text-sm text-gray-400">Generado en {totalCitasRealizadas} citas finalizadas</p>
            </div>

            {/* Desglose por Barbero */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-200 border-b border-white/10 pb-2">Rendimiento por Barbero</h3>
              
              {gananciasPorBarbero.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6 bg-white/5 rounded-xl">
                  Aún no hay ingresos registrados.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {gananciasPorBarbero.map((barbero, index) => (
                    <div key={index} className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                        <FaUserTie size={16} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-white">{barbero.nombre}</h4>
                        <p className="text-xs text-gray-400">{barbero.citas} citas realizadas</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent">S/ {barbero.ganancias.toFixed(2)}</p>
                      </div>
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