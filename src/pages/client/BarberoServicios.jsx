import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { FaArrowLeft, FaClock, FaTimes } from 'react-icons/fa';
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
      // 1. Obtener nombre y datos del cliente para el correo
      const clienteRef = doc(db, 'usuarios', user.uid);
      const clienteSnap = await getDoc(clienteRef);
      const nombreCompleto = clienteSnap.exists() 
        ? `${clienteSnap.data().nombre} ${clienteSnap.data().apellido}` 
        : 'Cliente';

      // 2. VALIDACIÓN: Comprobar si ya existe una cita
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

      // 3. Guardar en Firestore
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

      // 4. Enviar correo al BARBERO
      await emailjs.send(
        'service_tb2iewq', 
        'template_edgum39', 
        {
          nombre_barbero: barbero.nombre,
          nombre_cliente: nombreCompleto, // Nombre corregido
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

  if (loading) return <div className="min-h-screen bg-primary flex items-center justify-center text-white">Cargando servicios...</div>;

  return (
    <div className="min-h-screen bg-primary text-white pb-20 relative">
      <header className="bg-primary pt-10 pb-6 px-6 sticky top-0 z-10 border-b border-white/10 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-accent transition-colors">
          <FaArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">{barbero?.nombre} {barbero?.apellido}</h1>
          <p className="text-sm text-accent">Servicios disponibles</p>
        </div>
      </header>

      <main className="px-6 py-6">
        {servicios.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">Este barbero aún no tiene servicios.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {servicios.map((servicio) => (
              <div key={servicio.id} className="bg-white/5 p-5 rounded-2xl border border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{servicio.nombre}</h3>
                  <span className="text-accent font-bold">S/ {servicio.precio}</span>
                </div>
                <p className="text-gray-400 text-sm mb-4">{servicio.descripcion}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <FaClock className="text-accent" />
                    <span>{servicio.duracion} min</span>
                  </div>
                  <button 
                    onClick={() => abrirModal(servicio)}
                    className="bg-accent text-primary font-bold px-5 py-2 rounded-lg text-sm hover:bg-yellow-500 transition-colors"
                  >
                    Reservar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalVisible && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
          <div className="bg-[#1a1a1a] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 border-t sm:border border-white/10 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Reservar Cita</h2>
              <button onClick={() => setModalVisible(false)} className="text-gray-400 hover:text-white">
                <FaTimes size={20} />
              </button>
            </div>

            {reservaError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-4">
                {reservaError}
              </div>
            )}

            <form onSubmit={handleReservar} className="flex flex-col gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-2">
                <p className="text-sm text-gray-400">Servicio seleccionado</p>
                <p className="font-bold">{servicioSeleccionado?.nombre}</p>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Fecha</label>
                <input 
                  type="date" 
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-primary border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Hora</label>
                <input 
                  type="time" 
                  required
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full bg-primary border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full font-bold py-4 rounded-lg mt-4 transition-colors ${
                  isSubmitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-accent text-primary hover:bg-yellow-500'
                }`}
              >
                {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarberoServicios;