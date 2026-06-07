import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { FaArrowLeft, FaCalendarAlt, FaCheck, FaTimes, FaFlagCheckered, FaFilter } from 'react-icons/fa';

// 1. IMPORTA EMAILJS
import emailjs from '@emailjs/browser';

const BarberCitas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('Pendiente'); // Por defecto mostramos las pendientes
  const [procesandoId, setProcesandoId] = useState(null); // Para saber qué cita se está actualizando

  const fetchCitas = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'citas'), where('barberoId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      let listaCitas = [];
      
      for (const documento of querySnapshot.docs) {
        const dataCita = documento.data();
        let nombreCliente = 'Cliente Desconocido';
        let telefonoCliente = '';
        let emailCliente = ''; // Capturamos el email del cliente

        // Buscamos los datos del cliente
        if (dataCita.clienteId) {
          const clienteSnap = await getDoc(doc(db, 'usuarios', dataCita.clienteId));
          if (clienteSnap.exists()) {
            const dataCliente = clienteSnap.data();
            nombreCliente = `${dataCliente.nombre} ${dataCliente.apellido}`;
            telefonoCliente = dataCliente.telefono;
            emailCliente = dataCliente.correo; // Obtenemos el correo
          }
        }

        listaCitas.push({ id: documento.id, nombreCliente, telefonoCliente, emailCliente, ...dataCita });
      }

      // Ordenar por fecha y hora
      listaCitas.sort((a, b) => {
        const dateA = new Date(`${a.fecha}T${a.hora}`);
        const dateB = new Date(`${b.fecha}T${b.hora}`);
        return dateA - dateB;
      });

      setCitas(listaCitas);
    } catch (error) {
      console.error("Error al cargar citas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, [user]);

  // Función vital: Cambiar el estado de la cita y enviar correo
  const cambiarEstado = async (citaId, nuevoEstado) => {
    if (nuevoEstado === 'Cancelada') {
      const confirmar = window.confirm('¿Estás seguro de que deseas cancelar esta cita?');
      if (!confirmar) return;
    }

    setProcesandoId(citaId);
    try {
      const citaRef = doc(db, 'citas', citaId);
      await updateDoc(citaRef, { estado: nuevoEstado });
      
      // Obtenemos los datos de la cita actualizada para el correo
      const citaActual = citas.find(c => c.id === citaId);

      // Enviar correo mediante EmailJS
      await emailjs.send(
        'service_tb2iewq', // Tu Service ID
        'template_pga5veo',  // REEMPLAZA CON TU TEMPLATE ID
        {
          nombre_cliente: citaActual.nombreCliente,
          servicio: citaActual.servicioNombre,
          fecha: citaActual.fecha,
          hora: citaActual.hora,
          nuevo_estado: nuevoEstado,
          to_email: citaActual.emailCliente // Email del cliente
        },
        'm098tvrgOfGEQlcaZ'    // REEMPLAZA CON TU PUBLIC KEY
      );
      
      // Actualizamos el estado local
      setCitas(citas.map(cita => cita.id === citaId ? { ...cita, estado: nuevoEstado } : cita));
      
    } catch (error) {
      console.error(`Error al cambiar estado o enviar correo:`, error);
      alert('Hubo un error al procesar la cita.');
    } finally {
      setProcesandoId(null);
    }
  };

  const citasFiltradas = citas.filter(cita => cita.estado === filtro);

  return (
    <div className="min-h-screen bg-primary text-white pb-20">
      <header className="bg-primary pt-10 pb-6 px-6 sticky top-0 z-10 border-b border-white/10 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-accent transition-colors">
          <FaArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Gestión de Citas</h1>
          <p className="text-sm text-gray-400">Controla tu agenda</p>
        </div>
      </header>

      <main className="px-6 py-6">
        {/* Filtros */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-2 text-gray-400 mr-2 shrink-0">
            <FaFilter size={14} />
          </div>
          {['Pendiente', 'Confirmada', 'Finalizada', 'Cancelada'].map(estado => (
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
          <div className="text-center text-gray-400 mt-10">Cargando agenda...</div>
        ) : citasFiltradas.length === 0 ? (
          <div className="text-center flex flex-col items-center gap-4 mt-10 p-6 bg-white/5 rounded-2xl border border-white/10">
            <FaCalendarAlt size={40} className="text-gray-500" />
            <p className="text-gray-400">No tienes citas en estado "{filtro}".</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {citasFiltradas.map((cita) => (
              <div key={cita.id} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
                
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-white">{cita.servicioNombre}</h3>
                    <span className="font-bold text-accent">S/ {cita.precioFinal}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-1">
                    Cliente: <span className="font-medium text-white">{cita.nombreCliente}</span>
                  </p>
                  <p className="text-sm text-gray-400">Telf: {cita.telefonoCliente}</p>
                </div>
                
                <div className="flex gap-3 text-sm font-medium bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-white bg-white/10 px-3 py-1 rounded-lg">{cita.fecha}</span>
                  <span className="text-accent bg-accent/10 px-3 py-1 rounded-lg">{cita.hora}</span>
                </div>

                {filtro === 'Pendiente' && (
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => cambiarEstado(cita.id, 'Confirmada')}
                      disabled={procesandoId === cita.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 text-green-500 border border-green-500/30 py-3 rounded-xl font-bold hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
                    >
                      <FaCheck /> Confirmar
                    </button>
                    <button 
                      onClick={() => cambiarEstado(cita.id, 'Cancelada')}
                      disabled={procesandoId === cita.id}
                      className="flex items-center justify-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}

                {filtro === 'Confirmada' && (
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => cambiarEstado(cita.id, 'Finalizada')}
                      disabled={procesandoId === cita.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                      <FaFlagCheckered /> Finalizar Corte
                    </button>
                    <button 
                      onClick={() => cambiarEstado(cita.id, 'Cancelada')}
                      disabled={procesandoId === cita.id}
                      className="flex items-center justify-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BarberCitas;