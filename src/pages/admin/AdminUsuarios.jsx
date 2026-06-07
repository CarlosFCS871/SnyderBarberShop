import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { FaArrowLeft, FaTimes, FaUser, FaEdit, FaTrash, FaPhone, FaEnvelope, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const AdminUsuarios = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', telefono: '', correo: ''
  });

  const fetchUsuarios = async () => {
    try {
      const q = query(collection(db, 'usuarios'), where('rol', '==', 'Cliente'));
      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(lista);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioSeleccionadoId(usuario.id);
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono,
      correo: usuario.correo
    });
    setMensaje({ tipo: '', texto: '' });
    setModalVisible(true);
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const userRef = doc(db, 'usuarios', usuarioSeleccionadoId);
      await updateDoc(userRef, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono
      });

      setMensaje({ tipo: 'exito', texto: 'Datos actualizados correctamente.' });
      fetchUsuarios();
      
      setTimeout(() => {
        setModalVisible(false);
      }, 1500);

    } catch (error) {
      console.error("Error al actualizar:", error);
      setMensaje({ tipo: 'error', texto: 'Error al actualizar los datos.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar al cliente ${nombre}? Se perderá su historial.`);
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, 'usuarios', id));
      setUsuarios(usuarios.filter(u => u.id !== id));
      alert('Cliente eliminado correctamente.');
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert('Hubo un error al eliminar el cliente.');
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
            <FaUser className="text-amber-500" size={20} />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-amber-500 tracking-tight">
                Gestión de Clientes
              </h1>
              <p className="text-xs text-zinc-500">Administra los usuarios</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-5xl mx-auto relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-16 gap-4">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm">Cargando clientes...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 gap-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 backdrop-blur-xl p-8">
            <div className="w-20 h-20 bg-zinc-900/60 rounded-full flex items-center justify-center border border-zinc-800">
              <FaUser className="text-zinc-600" size={32} />
            </div>
            <div className="text-center">
              <p className="text-zinc-300 font-semibold">Aún no hay clientes registrados</p>
              <p className="text-zinc-500 text-sm mt-1">Los clientes aparecerán aquí cuando se registren</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {usuarios.map((usuario) => (
              <div 
                key={usuario.id} 
                className="group bg-zinc-900/40 hover:bg-zinc-800/60 p-5 rounded-2xl border border-zinc-800/60 hover:border-amber-500/30 flex items-center gap-4 transition-all duration-300 backdrop-blur-xl"
              >
                {/* Avatar del Cliente */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-900/60 flex items-center justify-center text-amber-500 shrink-0 overflow-hidden border-2 border-amber-500/30 shadow-lg shadow-amber-500/10">
                  {usuario.fotoUrl ? (
                    <img src={usuario.fotoUrl} alt={usuario.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <FaUser size={24} />
                  )}
                </div>
                
                {/* Info del Cliente */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-zinc-100 truncate group-hover:text-amber-500 transition-colors duration-300">
                    {usuario.nombre} {usuario.apellido}
                  </h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1 truncate">
                    <FaEnvelope size={9} className="text-amber-500 shrink-0" />
                    {usuario.correo}
                  </p>
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                    <FaPhone size={9} className="text-amber-500" />
                    {usuario.telefono}
                  </p>
                </div>
                
                {/* Botones de Acción */}
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => abrirModalEditar(usuario)}
                    className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300 active:scale-95"
                    title="Editar"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button 
                    onClick={() => handleEliminar(usuario.id, usuario.nombre)}
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

      {/* MODAL EDITAR USUARIO */}
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
                <h2 className="text-xl font-black text-zinc-100 tracking-tight">
                  Editar Cliente
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Modifica los datos del cliente</p>
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

            <form onSubmit={handleEditar} className="flex flex-col gap-4">
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

              {/* Correo (solo lectura) */}
              <div>
                <label className="text-zinc-500 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide flex items-center gap-1.5">
                  <FaEnvelope size={10} />
                  Correo Electrónico
                  <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-normal normal-case tracking-normal">
                    No editable
                  </span>
                </label>
                <input 
                  type="email" 
                  value={formData.correo} 
                  disabled 
                  className="w-full bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-4 py-3.5 text-zinc-500 cursor-not-allowed" 
                />
              </div>

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
                    Guardando...
                  </span>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;