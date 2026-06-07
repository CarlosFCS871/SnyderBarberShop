import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { FaArrowLeft, FaCalendarAlt, FaCheck, FaTimes, FaFlagCheckered, FaFilter, FaUser, FaPhone, FaCut } from 'react-icons/fa';
import emailjs from '@emailjs/browser';

const BarberCitas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('Pendiente');
  const [procesandoId, setProcesandoId] = useState(null);

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
        let emailCliente = '';

        if (dataCita.clienteId) {
          const clienteSnap = await getDoc(doc(db, 'usuarios', dataCita.clienteId));
          if (clienteSnap.exists()) {
            const dataCliente = clienteSnap.data();
            nombreCliente = `${dataCliente.nombre} ${dataCliente.apellido}`;
            telefonoCliente = dataCliente.telefono;
            emailCliente = dataCliente.correo;
          }
        }

        listaCitas.push({ id: documento.id, nombreCliente, telefonoCliente, emailCliente, ...dataCita });
      }

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

  const cambiarEstado = async (citaId, nuevoEstado) => {
    if (nuevoEstado === 'Cancelada') {
      const confirmar = window.confirm('¿Estás seguro de que deseas cancelar esta cita?');
      if (!confirmar) return;
    }

    setProcesandoId(citaId);
    try {
      const citaRef = doc(db, 'citas', citaId);
      await updateDoc(citaRef, { estado: nuevoEstado });

      const citaActual = citas.find(c => c.id === citaId);

      await emailjs.send(
        'service_tb2iewq',
        'template_pga5veo',
        {
          nombre_cliente: citaActual.nombreCliente,
          servicio: citaActual.servicioNombre,
          fecha: citaActual.fecha,
          hora: citaActual.hora,
          nuevo_estado: nuevoEstado,
          to_email: citaActual.emailCliente
        },
        'm098tvrgOfGEQlcaZ'
      );

      setCitas(citas.map(cita => cita.id === citaId ? { ...cita, estado: nuevoEstado } : cita));

    } catch (error) {
      console.error(`Error al cambiar estado o enviar correo:`, error);
      alert('Hubo un error al procesar la cita.');
    } finally {
      setProcesandoId(null);
    }
  };

  const citasFiltradas = citas.filter(cita => cita.estado === filtro);

  const getFiltroColor = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'Confirmada': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'Finalizada': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Cancelada': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';
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
                Gestión de Citas
              </h1>
              <p className="text-xs text-zinc-500">Controla tu agenda</p>
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
          {['Pendiente', 'Confirmada', 'Finalizada', 'Cancelada'].map(estado => (
            <button
              key={estado}
              onClick={() => setFiltro(estado)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 border ${filtro === estado
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
            <p className="text-zinc-400 text-sm">Cargando agenda...</p>
          </div>
        ) : citasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 gap-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 backdrop-blur-xl p-8">
            <div className="w-20 h-20 bg-zinc-900/60 rounded-full flex items-center justify-center border border-zinc-800">
              <FaCalendarAlt className="text-zinc-600" size={32} />
            </div>
            <div className="text-center">
              <p className="text-zinc-300 font-semibold">No tienes citas en estado "{filtro}"</p>
              <p className="text-zinc-500 text-sm mt-1">Prueba con otro filtro</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {citasFiltradas.map((cita) => (
              <div
                key={cita.id}
                className="group bg-zinc-900/40 hover:bg-zinc-800/60 p-5 sm:p-6 rounded-2xl border border-zinc-800/60 hover:border-amber-500/30 flex flex-col gap-4 transition-all duration-300 backdrop-blur-xl"
              >
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
                      <p className="text-xs sm:text-sm text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <FaUser size={10} className="text-amber-500" />
                        {cita.nombreCliente}
                      </p>
                    </div>
                  </div>
                  <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black px-2.5 py-1 rounded-lg text-xs sm:text-sm whitespace-nowrap">
                    S/ {cita.precioFinal}
                  </span>
                </div>

                {/* Info del cliente */}
                <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60 flex items-center gap-2">
                  <FaPhone className="text-zinc-500" size={12} />
                  <span className="text-xs sm:text-sm text-zinc-300 font-medium">{cita.telefonoCliente}</span>
                </div>

                {/* Fecha y Hora */}
                <div className="flex gap-2 text-xs sm:text-sm font-semibold">
                  <span className="flex-1 bg-zinc-900/60 border border-zinc-800/60 text-zinc-100 px-3 py-2 rounded-lg flex items-center justify-center gap-2">
                    <FaCalendarAlt size={10} className="text-amber-500" />
                    {cita.fecha}
                  </span>
                  <span className="flex-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-2 rounded-lg flex items-center justify-center">
                    {cita.hora}
                  </span>
                </div>

                {/* Botones de Acción para Pendientes */}
                {filtro === 'Pendiente' && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => cambiarEstado(cita.id, 'Confirmada')}
                      disabled={procesandoId === cita.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 text-green-400 border border-green-500/30 py-3 rounded-xl font-bold hover:bg-green-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      {procesandoId === cita.id ? (
                        <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaCheck />
                      )}
                      Confirmar
                    </button>
                    <button
                      onClick={() => cambiarEstado(cita.id, 'Cancelada')}
                      disabled={procesandoId === cita.id}
                      className="flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      {procesandoId === cita.id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaTimes />
                      )}
                    </button>
                  </div>
                )}

                {/* Botones de Acción para Confirmadas */}
                {filtro === 'Confirmada' && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => cambiarEstado(cita.id, 'Finalizada')}
                      disabled={procesandoId === cita.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 py-3 rounded-xl font-bold hover:bg-blue-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      {procesandoId === cita.id ? (
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaFlagCheckered />
                      )}
                      Finalizar Corte
                    </button>
                    <button
                      onClick={() => cambiarEstado(cita.id, 'Cancelada')}
                      disabled={procesandoId === cita.id}
                      className="flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      {procesandoId === cita.id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaTimes />
                      )}
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