import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { FaArrowLeft, FaClock, FaTimes, FaCut, FaUserTie } from 'react-icons/fa';
import emailjs from '@emailjs/browser';

const BarberoServicios = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [barbero, setBarbero] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [reservaError, setReservaError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const barberoRef = doc(db, 'usuarios', id);
        const barberoSnap = await getDoc(barberoRef);
        if (barberoSnap.exists()) setBarbero(barberoSnap.data());

        const q = query(collection(db, 'servicios'), where('barberoId', '==', id));
        const serviciosSnap = await getDocs(q);
        
        setServicios(serviciosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const abrirModal = (servicio) => {
    setServicioSeleccionado(servicio);
    setFecha('');
    setHora('');
    setReservaError('');
    setModalVisible(true);
  };

  const handleReservar = async (e) => {
    e.preventDefault();
    setReservaError('');
    setIsSubmitting(true);

    try {
      const clienteRef = doc(db, 'usuarios', user.uid);
      const clienteSnap = await getDoc(clienteRef);
      const nombreCompleto = clienteSnap.exists() 
        ? `${clienteSnap.data().nombre} ${clienteSnap.data().apellido}` 
        : 'Cliente';

      const qValidacion = query(
        collection(db, 'citas'),
        where('barberoId', '==', id),
        where('fecha', '==', fecha),
        where('hora', '==', hora),
        where('estado', 'in', ['Pendiente', 'Confirmada'])
      );
      
      const validacionSnap = await getDocs(qValidacion);
      
      if (!validacionSnap.empty) {
        setReservaError("Esta hora ya se encuentra reservada.");
        setIsSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'citas'), {
        clienteId: user.uid,
        barberoId: id,
        barberoNombre: `${barbero.nombre} ${barbero.apellido}`,
        servicioId: servicioSeleccionado.id,
        servicioNombre: servicioSeleccionado.nombre,
        fecha: fecha,
        hora: hora,
        estado: 'Pendiente',
        precioFinal: servicioSeleccionado.precio,
        fechaCreacion: new Date().toISOString()
      });

      await emailjs.send(
        'service_tb2iewq', 
        'template_edgum39', 
        {
          nombre_barbero: barbero.nombre,
          nombre_cliente: nombreCompleto,
          servicio: servicioSeleccionado.nombre,
          fecha: fecha,
          hora: hora,
          to_email: barbero.correo 
        },
        'm098tvrgOfGEQlcaZ'
      );

      setModalVisible(false);
      navigate('/client/citas');

    } catch (error) {
      console.error("Error al reservar:", error);
      setReservaError("Ocurrió un error al procesar tu reserva.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-zinc-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Cargando servicios...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar del Barbero */}
            <div className="w-12 h-12 rounded-full bg-zinc-900/60 flex items-center justify-center overflow-hidden border-2 border-amber-500/30 shrink-0">
              {barbero?.fotoUrl ? (
                <img src={barbero.fotoUrl} alt={barbero.nombre} className="w-full h-full object-cover" />
              ) : (
                <FaUserTie className="text-amber-500" size={20} />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-black text-zinc-100 tracking-tight truncate">
                {barbero?.nombre} {barbero?.apellido}
              </h1>
              <p className="text-xs sm:text-sm text-amber-500 font-semibold flex items-center gap-1.5">
                <FaCut size={10} />
                Servicios disponibles
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-5xl mx-auto relative z-10">
        {servicios.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 gap-4">
            <div className="w-20 h-20 bg-zinc-900/60 rounded-full flex items-center justify-center border border-zinc-800">
              <FaCut className="text-zinc-600" size={32} />
            </div>
            <div className="text-center">
              <p className="text-zinc-300 font-semibold">Este barbero aún no tiene servicios</p>
              <p className="text-zinc-500 text-sm mt-1">Vuelve más tarde para ver su catálogo</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {servicios.map((servicio) => (
              <div 
                key={servicio.id} 
                className="group bg-zinc-900/40 hover:bg-zinc-800/60 p-5 sm:p-6 rounded-2xl border border-zinc-800/60 hover:border-amber-500/30 transition-all duration-300 backdrop-blur-xl"
              >
                <div className="flex justify-between items-start mb-3 gap-3">
                  <h3 className="font-bold text-lg sm:text-xl text-zinc-100 group-hover:text-amber-500 transition-colors duration-300">
                    {servicio.nombre}
                  </h3>
                  <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black px-3 py-1.5 rounded-lg text-sm sm:text-base whitespace-nowrap">
                    S/ {servicio.precio}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
                  {servicio.descripcion}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-zinc-800/60">
                  <div className="flex items-center gap-2 text-zinc-300 text-sm font-medium">
                    <div className="w-8 h-8 bg-zinc-800/60 rounded-lg flex items-center justify-center">
                      <FaClock className="text-amber-500" size={14} />
                    </div>
                    <span>{servicio.duracion} min</span>
                  </div>
                  <button 
                    onClick={() => abrirModal(servicio)}
                    className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-amber-500/20"
                  >
                    Reservar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Reserva */}
      {modalVisible && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-6 animate-fade-in"
          onClick={() => !isSubmitting && setModalVisible(false)}
        >
          <div 
            className="bg-neutral-950 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 border-t sm:border border-zinc-800/60 shadow-2xl shadow-black/50 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-zinc-100 tracking-tight">Reservar Cita</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Completa los datos para confirmar</p>
              </div>
              <button 
                onClick={() => !isSubmitting && setModalVisible(false)} 
                className="bg-zinc-900/60 p-2 rounded-full border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/50 transition-all duration-300 active:scale-95"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {reservaError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4 text-center font-medium flex items-center justify-center gap-2">
                <span>⚠️</span> {reservaError}
              </div>
            )}

            <form onSubmit={handleReservar} className="flex flex-col gap-4">
              {/* Servicio seleccionado */}
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/60 flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center shrink-0">
                  <FaCut className="text-amber-500" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Servicio</p>
                  <p className="font-bold text-zinc-100 truncate">{servicioSeleccionado?.nombre}</p>
                </div>
                <span className="text-amber-500 font-black text-sm">
                  S/ {servicioSeleccionado?.precio}
                </span>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-xs text-zinc-400 font-semibold mb-1.5 uppercase tracking-wide">
                  Fecha
                </label>
                <input 
                  type="date" 
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300 [color-scheme:dark]"
                />
              </div>

              {/* Hora */}
              <div>
                <label className="block text-xs text-zinc-400 font-semibold mb-1.5 uppercase tracking-wide">
                  Hora
                </label>
                <input 
                  type="time" 
                  required
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300 [color-scheme:dark]"
                />
              </div>

              {/* Botón de confirmar */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full font-black py-4 rounded-xl mt-2 transition-all duration-300 uppercase tracking-wider text-sm ${
                  isSubmitting 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                    : 'bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-neutral-950 shadow-lg shadow-amber-500/20'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : (
                  'Confirmar Reserva'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarberoServicios;