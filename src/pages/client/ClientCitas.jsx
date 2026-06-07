import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FaArrowLeft, FaCalendarCheck } from 'react-icons/fa';

const ClientCitas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCitas = async () => {
      if (!user) return;
      try {
        // Buscamos solo las citas de este cliente
        const q = query(collection(db, 'citas'), where('clienteId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const listaCitas = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Ordenamos las citas usando JavaScript (las más nuevas primero)
        // Hacemos esto aquí para no tener que configurar índices complejos en Firebase aún
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

  // Función para darle un color distinto a cada estado
  const getBadgeStyle = (estado) => {
    switch(estado) {
      case 'Pendiente': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Confirmada': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Finalizada': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Cancelada': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-primary text-white pb-20">
      {/* Header */}
      <header className="bg-primary pt-10 pb-6 px-6 sticky top-0 z-10 border-b border-white/10 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-accent transition-colors">
          <FaArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Mis Citas</h1>
          <p className="text-sm text-gray-400">Historial de reservas</p>
        </div>
      </header>

      <main className="px-6 py-6">
        {loading ? (
          <div className="text-center text-gray-400 mt-10">Cargando tu historial...</div>
        ) : citas.length === 0 ? (
          <div className="text-center flex flex-col items-center gap-4 mt-10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-500 mb-2">
              <FaCalendarCheck size={24} />
            </div>
            <p className="text-gray-400">Aún no tienes citas registradas.</p>
            <button 
              onClick={() => navigate('/client/barberos')}
              className="bg-accent text-primary font-bold px-6 py-2 rounded-lg mt-2"
            >
              Reservar ahora
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {citas.map((cita) => (
              <div key={cita.id} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{cita.servicioNombre}</h3>
                    <p className="text-sm text-gray-400">Con {cita.barberoNombre}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getBadgeStyle(cita.estado)}`}>
                    {cita.estado}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mt-2 pt-3 border-t border-white/5">
                  <div className="flex gap-3 text-sm font-medium">
                    <span className="text-white">{cita.fecha}</span>
                    <span className="text-gray-400">{cita.hora}</span>
                  </div>
                  <span className="text-accent font-bold">S/ {cita.precioFinal}</span>
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