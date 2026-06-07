import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { FaArrowLeft, FaTimes, FaUser, FaEdit, FaTrash } from 'react-icons/fa';

const AdminUsuarios = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal de Edición
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', telefono: '', correo: ''
  });

  const fetchUsuarios = async () => {
    try {
      // Consultamos solo a los que tienen rol de "Cliente"
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
      correo: usuario.correo // Solo lectura
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
      fetchUsuarios(); // Recargar la lista
      
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
    <div className="min-h-screen bg-primary text-white pb-20 relative">
      <header className="bg-primary pt-10 pb-6 px-6 sticky top-0 z-10 border-b border-white/10 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-accent transition-colors">
          <FaArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Gestión de Clientes</h1>
        </div>
      </header>

      <main className="px-6 py-6">
        {loading ? (
          <div className="text-center text-gray-400 mt-10">Cargando clientes...</div>
        ) : usuarios.length === 0 ? (
          <div className="text-center flex flex-col items-center gap-4 mt-10 p-6 bg-white/5 rounded-2xl border border-white/10">
            <FaUser size={40} className="text-gray-500" />
            <p className="text-gray-400">Aún no hay clientes registrados en el sistema.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {usuarios.map((usuario) => (
              <div key={usuario.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-blue-400 shrink-0 overflow-hidden">
                  {usuario.fotoUrl ? (
                    <img src={usuario.fotoUrl} alt={usuario.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <FaUser size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{usuario.nombre} {usuario.apellido}</h3>
                  <p className="text-xs text-gray-400">{usuario.correo}</p>
                  <p className="text-xs text-blue-400 mt-1">{usuario.telefono}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => abrirModalEditar(usuario)}
                    className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button 
                    onClick={() => handleEliminar(usuario.id, usuario.nombre)}
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

      {/* MODAL EDITAR USUARIO */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
          <div className="bg-[#1a1a1a] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 border-t sm:border border-white/10 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Editar Cliente</h2>
              <button onClick={() => setModalVisible(false)} className="text-gray-400 hover:text-white">
                <FaTimes size={20} />
              </button>
            </div>

            {mensaje.texto && (
              <div className={`p-3 rounded-lg text-sm mb-4 ${mensaje.tipo === 'exito' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                {mensaje.texto}
              </div>
            )}

            <form onSubmit={handleEditar} className="flex flex-col gap-4">
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
                <label className="block text-sm text-gray-300 mb-1">Correo Electrónico (No editable)</label>
                <input 
                  type="email" 
                  value={formData.correo} 
                  disabled 
                  className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full font-bold py-4 rounded-lg mt-2 transition-colors ${
                  isSubmitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-accent text-primary hover:bg-yellow-500'
                }`}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;