import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { FaArrowLeft, FaCalendarAlt, FaFilter } from 'react-icons/fa';

const AdminCitas = () => {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('Todas'); // Estado para el filtro actual

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'citas'));
        let listaCitas = [];

        // Usamos un bucle for...of para poder hacer consultas asíncronas dentro (buscar nombre del cliente)
        for (const documento of querySnapshot.docs) {
          const dataCita = documento.data();
          
          // Buscamos el nombre del cliente en la colección usuarios
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

        // Ordenamos: las más recientes/próximas primero
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
      case 'Pendiente': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Confirmada': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Finalizada': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Cancelada': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  // Lógica para filtrar las citas según el botón seleccionado
  const citasFiltradas = filtro === 'Todas' 
    ? citas 
    : citas.filter(cita => cita.estado === filtro);

  return (
    <div className="min-h-screen bg-primary text-white pb-20">
      <header className="bg-primary pt-10 pb-6 px-6 sticky top-0 z-10 border-b border-white/10 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-accent transition-colors">
          <FaArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Todas las Citas</h1>
          <p className="text-sm text-gray-400">Monitoreo general</p>
        </div>
      </header>

      <main className="px-6 py-6">
        {/* Filtros */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-2 text-gray-400 mr-2 shrink-0">
            <FaFilter size={14} />
          </div>
          {['Todas', 'Pendiente', 'Confirmada', 'Finalizada', 'Cancelada'].map(estado => (
            <button
              key={estado}
              onClick={() => setFiltro(estado)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                filtro === estado 
                ? 'bg-accent text-primary border-accent' 
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {estado}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 mt-10">Cargando reservas...</div>
        ) : citasFiltradas.length === 0 ? (
          <div className="text-center flex flex-col items-center gap-4 mt-10 p-6 bg-white/5 rounded-2xl border border-white/10">
            <FaCalendarAlt size={40} className="text-gray-500" />
            <p className="text-gray-400">No hay citas para mostrar en esta categoría.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {citasFiltradas.map((cita) => (
              <div key={cita.id} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col gap-3 relative overflow-hidden">
                {/* Indicador visual de estado a la izquierda */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  cita.estado === 'Pendiente' ? 'bg-yellow-500' :
                  cita.estado === 'Confirmada' ? 'bg-green-500' :
                  cita.estado === 'Finalizada' ? 'bg-blue-500' : 'bg-red-500'
                }`}></div>

                <div className="flex justify-between items-start pl-2">
                  <div>
                    <h3 className="font-bold text-lg">{cita.servicioNombre}</h3>
                    <p className="text-sm text-gray-300">
                      Cliente: <span className="font-medium text-white">{cita.nombreCliente}</span>
                    </p>
                    <p className="text-sm text-gray-400">
                      Barbero: {cita.barberoNombre}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getBadgeStyle(cita.estado)}`}>
                    {cita.estado}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mt-2 pt-3 border-t border-white/5 pl-2">
                  <div className="flex gap-3 text-sm font-medium">
                    <span className="text-white bg-white/10 px-2 py-1 rounded">{cita.fecha}</span>
                    <span className="text-gray-400 bg-white/5 px-2 py-1 rounded">{cita.hora}</span>
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

export default AdminCitas;