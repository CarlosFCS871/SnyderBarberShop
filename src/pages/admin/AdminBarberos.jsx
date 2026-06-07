import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, firebaseConfig } from '../../config/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { FaArrowLeft, FaPlus, FaTimes, FaUserTie, FaEdit, FaTrash, FaPhone, FaEnvelope, FaLock, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const AdminBarberos = () => {
  const navigate = useNavigate();
  const [barberos, setBarberos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [barberoSeleccionadoId, setBarberoSeleccionadoId] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', telefono: '+51', correo: '', password: ''
  });

  const fetchBarberos = async () => {
    try {
      const q = query(collection(db, 'usuarios'), where('rol', '==', 'Barbero'));
      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBarberos(lista);
    } catch (error) {
      console.error("Error al cargar barberos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarberos();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setFormData({ nombre: '', apellido: '', telefono: '+51', correo: '', password: '' });
    setMensaje({ tipo: '', texto: '' });
    setModalVisible(true);
  };

  const abrirModalEditar = (barbero) => {
    setModoEdicion(true);
    setBarberoSeleccionadoId(barbero.id);
    setFormData({
      nombre: barbero.nombre,
      apellido: barbero.apellido,
      telefono: barbero.telefono,
      correo: barbero.correo,
      password: ''
    });
    setMensaje({ tipo: '', texto: '' });
    setModalVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      if (modoEdicion) {
        const barberoRef = doc(db, 'usuarios', barberoSeleccionadoId);
        await updateDoc(barberoRef, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono
        });
        setMensaje({ tipo: 'exito', texto: 'Datos actualizados correctamente.' });

      } else {
        const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
        const secondaryAuth = getAuth(secondaryApp);

        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.correo, formData.password);
        const nuevoUser = userCredential.user;

        await setDoc(doc(db, 'usuarios', nuevoUser.uid), {
          uid: nuevoUser.uid,
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono,
          correo: formData.correo,
          rol: 'Barbero',
          fotoUrl: '',
          fechaRegistro: new Date().toISOString()
        });

        await signOut(secondaryAuth);
        setMensaje({ tipo: 'exito', texto: 'Barbero creado exitosamente.' });
      }

      fetchBarberos();
      
      setTimeout(() => {
        setModalVisible(false);
      }, 1500);

    } catch (error) {
      console.error("Error en la operación:", error);
      setMensaje({ tipo: 'error', texto: modoEdicion ? 'Error al actualizar los datos.' : 'Error al crear. Verifica el correo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar al barbero ${nombre}?`);
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, 'usuarios', id));
      setBarberos(barberos.filter(b => b.id !== id));
      alert('Barbero eliminado correctamente.');
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert('Hubo un error al eliminar el barbero.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 pb-20 relative overflow-hidden">
      {/* Efecto de fondo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-neutral-950 to-neutral-950 pointer-events-none" />

      {/* Header con glassmorphism */}
      <header className="bg-neutral-950/80 backdrop-blur-xl pt-10 pb-6 px-4 sm:px-6 sticky top-0 z-10 border-b border-zinc-800/60 relative">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="bg-zinc-900/60 p-2.5 rounded-full border border-zinc-800 text-zinc-400 hover:text-amber-500 hover:border-amber-500/50 transition-all duration-300 active:scale-95"
            >
              <FaArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-3">
              <FaUserTie className="text-amber-500" size={20} />
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-amber-500 tracking-tight">
                  Gestión de Barberos
                </h1>
                <p className="text-xs text-zinc-500">Administra el equipo</p>
              </div>
            </div>
          </div>
          
          {/* Botón Agregar */}
          <button 
            onClick={abrirModalCrear}
            className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 p-3 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20"
            title="Agregar nuevo barbero"
          >
            <FaPlus size={16} />
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-5xl mx-auto relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-16 gap-4">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm">Cargando barberos...</p>
          </div>
        ) : barberos.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 gap-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 backdrop-blur-xl p-8">
            <div className="w-20 h-20 bg-zinc-900/60 rounded-full flex items-center justify-center border border-zinc-800">
              <FaUserTie className="text-zinc-600" size={32} />
            </div>
            <div className="text-center">
              <p className="text-zinc-300 font-semibold">Aún no hay barberos registrados</p>
              <p className="text-zinc-500 text-sm mt-1">Agrega tu primer barbero al sistema</p>
            </div>
            <button
              onClick={abrirModalCrear}
              className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-bold px-6 py-3 rounded-xl mt-4 transition-all duration-300 shadow-lg shadow-amber-500/20 uppercase tracking-wider text-sm flex items-center gap-2"
            >
              <FaPlus size={12} />
              Agregar Barbero
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {barberos.map((barbero) => (
              <div 
                key={barbero.id} 
                className="group bg-zinc-900/40 hover:bg-zinc-800/60 p-5 rounded-2xl border border-zinc-800/60 hover:border-amber-500/30 flex items-center gap-4 transition-all duration-300 backdrop-blur-xl"
              >
                {/* Avatar del Barbero */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-900/60 flex items-center justify-center text-amber-500 shrink-0 overflow-hidden border-2 border-amber-500/30 shadow-lg shadow-amber-500/10">
                  {barbero.fotoUrl ? (
                    <img src={barbero.fotoUrl} alt={barbero.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <FaUserTie size={24} />
                  )}
                </div>
                
                {/* Info del Barbero */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-zinc-100 truncate group-hover:text-amber-500 transition-colors duration-300">
                    {barbero.nombre} {barbero.apellido}
                  </h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1 truncate">
                    <FaEnvelope size={9} className="text-amber-500 shrink-0" />
                    {barbero.correo}
                  </p>
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                    <FaPhone size={9} className="text-amber-500" />
                    {barbero.telefono}
                  </p>
                </div>
                
                {/* Botones de Acción */}
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => abrirModalEditar(barbero)}
                    className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300 active:scale-95"
                    title="Editar"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button 
                    onClick={() => handleEliminar(barbero.id, barbero.nombre)}
                    className="p-2.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 active:scale-95"
                    title="Eliminar"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL CREAR / EDITAR BARBERO */}
      {modalVisible && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-6 animate-fade-in"
          onClick={() => !isSubmitting && setModalVisible(false)}
        >
          <div 
            className="bg-neutral-950 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 border-t sm:border border-zinc-800/60 shadow-2xl shadow-black/50 animate-slide-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-zinc-100 tracking-tight">
                  {modoEdicion ? 'Editar Barbero' : 'Nuevo Barbero'}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {modoEdicion ? 'Modifica los datos del barbero' : 'Completa los datos para crear'}
                </p>
              </div>
              <button 
                onClick={() => !isSubmitting && setModalVisible(false)} 
                className="bg-zinc-900/60 p-2 rounded-full border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/50 transition-all duration-300 active:scale-95"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* Mensajes de feedback */}
            {mensaje.texto && (
              <div className={`p-4 rounded-xl text-sm text-center font-medium flex items-center justify-center gap-2 border mb-4 ${
                mensaje.tipo === 'exito' 
                  ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {mensaje.tipo === 'exito' ? <FaCheck size={14} /> : <FaExclamationTriangle size={14} />}
                {mensaje.texto}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Nombre y Apellido en Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide">
                    Nombre
                  </label>
                  <input 
                    type="text" 
                    name="nombre" 
                    required 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    placeholder="Ej. Juan"
                    className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300" 
                  />
                </div>
                <div>
                  <label className="text-zinc-400 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide">
                    Apellido
                  </label>
                  <input 
                    type="text" 
                    name="apellido" 
                    required 
                    value={formData.apellido} 
                    onChange={handleChange} 
                    placeholder="Ej. Pérez"
                    className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300" 
                  />
                </div>
              </div>
              
              {/* Teléfono */}
              <div>
                <label className="text-zinc-400 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide flex items-center gap-1.5">
                  <FaPhone size={10} />
                  Teléfono
                </label>
                <input 
                  type="tel" 
                  name="telefono" 
                  required 
                  value={formData.telefono} 
                  onChange={handleChange} 
                  placeholder="+51 999 999 999"
                  className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300" 
                />
              </div>

              {/* Correo */}
              <div>
                <label className="text-zinc-400 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide flex items-center gap-1.5">
                  <FaEnvelope size={10} />
                  Correo Electrónico
                  {modoEdicion && (
                    <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-normal normal-case tracking-normal">
                      No editable
                    </span>
                  )}
                </label>
                <input 
                  type="email" 
                  name="correo" 
                  required 
                  value={formData.correo} 
                  onChange={handleChange} 
                  disabled={modoEdicion}
                  placeholder="correo@ejemplo.com"
                  className={`w-full border rounded-xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 outline-none transition-all duration-300 ${
                    modoEdicion 
                      ? 'bg-zinc-900/60 border-zinc-800/60 text-zinc-500 cursor-not-allowed' 
                      : 'bg-neutral-950/50 border-zinc-800 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20'
                  }`} 
                />
              </div>

              {/* Contraseña (solo al crear) */}
              {!modoEdicion && (
                <div>
                  <label className="text-zinc-400 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide flex items-center gap-1.5">
                    <FaLock size={10} />
                    Contraseña temporal
                  </label>
                  <input 
                    type="password" 
                    name="password" 
                    required 
                    minLength="6" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300" 
                  />
                </div>
              )}

              {/* Botón Guardar */}
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
                  modoEdicion ? 'Guardar Cambios' : 'Crear Barbero'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBarberos;