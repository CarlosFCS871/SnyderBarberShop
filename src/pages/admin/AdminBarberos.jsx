import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, firebaseConfig } from '../../config/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { FaArrowLeft, FaPlus, FaTimes, FaUserTie, FaEdit, FaTrash } from 'react-icons/fa';

const AdminBarberos = () => {
  const navigate = useNavigate();
  const [barberos, setBarberos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados Generales
  const [modalVisible, setModalVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [barberoSeleccionadoId, setBarberoSeleccionadoId] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  // Estado del Formulario
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

  // --- Funciones para abrir Modal ---
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
      correo: barbero.correo, // Se muestra, pero no se debe editar por seguridad de Firebase Auth
      password: '' // No se carga la contraseña
    });
    setMensaje({ tipo: '', texto: '' });
    setModalVisible(true);
  };

  // --- Función Principal del Formulario (Crear o Editar) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      if (modoEdicion) {
        // --- LÓGICA DE EDICIÓN ---
        const barberoRef = doc(db, 'usuarios', barberoSeleccionadoId);
        await updateDoc(barberoRef, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono
        });
        setMensaje({ tipo: 'exito', texto: 'Datos actualizados correctamente.' });

      } else {
        // --- LÓGICA DE CREACIÓN ---
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

      fetchBarberos(); // Recargar la lista
      
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

  // --- Función para Eliminar Barbero ---
  const handleEliminar = async (id, nombre) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar al barbero ${nombre}?`);
    if (!confirmar) return;

    try {
      // Eliminamos el documento de Firestore
      await deleteDoc(doc(db, 'usuarios', id));
      // Actualizamos el estado local para quitarlo de la vista sin recargar
      setBarberos(barberos.filter(b => b.id !== id));
      alert('Barbero eliminado correctamente.');
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert('Hubo un error al eliminar el barbero.');
    }
  };

  return (
    <div className="min-h-screen bg-primary text-white pb-20 relative">
      <header className="bg-primary pt-10 pb-6 px-6 sticky top-0 z-10 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-accent transition-colors">
            <FaArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Gestión de Barberos</h1>
          </div>
        </div>
        <button 
          onClick={abrirModalCrear}
          className="bg-accent text-primary p-3 rounded-full hover:bg-yellow-500 transition-colors shadow-lg"
          title="Agregar nuevo barbero"
        >
          <FaPlus size={16} />
        </button>
      </header>

      <main className="px-6 py-6">
        {loading ? (
          <div className="text-center text-gray-400 mt-10">Cargando barberos...</div>
        ) : barberos.length === 0 ? (
          <div className="text-center flex flex-col items-center gap-4 mt-10 p-6 bg-white/5 rounded-2xl border border-white/10">
            <FaUserTie size={40} className="text-gray-500" />
            <p className="text-gray-400">Aún no hay barberos registrados en el sistema.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {barberos.map((barbero) => (
              <div key={barbero.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-accent shrink-0 overflow-hidden">
                  {barbero.fotoUrl ? (
                    <img src={barbero.fotoUrl} alt={barbero.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <FaUserTie size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{barbero.nombre} {barbero.apellido}</h3>
                  <p className="text-xs text-gray-400">{barbero.correo}</p>
                  <p className="text-xs text-accent mt-1">{barbero.telefono}</p>
                </div>
                {/* Botones de Acción */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => abrirModalEditar(barbero)}
                    className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button 
                    onClick={() => handleEliminar(barbero.id, barbero.nombre)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL CREAR / EDITAR BARBERO */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
          <div className="bg-[#1a1a1a] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 border-t sm:border border-white/10 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {modoEdicion ? 'Editar Barbero' : 'Nuevo Barbero'}
              </h2>
              <button onClick={() => setModalVisible(false)} className="text-gray-400 hover:text-white">
                <FaTimes size={20} />
              </button>
            </div>

            {mensaje.texto && (
              <div className={`p-3 rounded-lg text-sm mb-4 ${mensaje.tipo === 'exito' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                {mensaje.texto}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Nombre</label>
                  <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Apellido</label>
                  <input type="text" name="apellido" required value={formData.apellido} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">Teléfono</label>
                <input type="tel" name="telefono" required value={formData.telefono} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent" />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  name="correo" 
                  required 
                  value={formData.correo} 
                  onChange={handleChange} 
                  disabled={modoEdicion} // No se puede editar el correo si ya existe
                  className={`w-full border rounded-lg px-4 py-3 text-white focus:outline-none ${modoEdicion ? 'bg-black/20 border-white/5 text-gray-500 cursor-not-allowed' : 'bg-white/5 border-white/10 focus:border-accent'}`} 
                />
              </div>

              {!modoEdicion && (
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Contraseña temporal</label>
                  <input type="password" name="password" required minLength="6" value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent" />
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full font-bold py-4 rounded-lg mt-2 transition-colors ${
                  isSubmitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-accent text-primary hover:bg-yellow-500'
                }`}
              >
                {isSubmitting ? 'Procesando...' : (modoEdicion ? 'Guardar Cambios' : 'Crear Barbero')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBarberos;