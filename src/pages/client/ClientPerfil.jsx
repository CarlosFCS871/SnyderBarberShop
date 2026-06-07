import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase'; // Ya no importamos storage
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FaArrowLeft, FaUserCircle, FaCamera } from 'react-icons/fa';

const ClientPerfil = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [perfil, setPerfil] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    fotoUrl: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    const fetchPerfil = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPerfil(docSnap.data());
        }
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [user]);

  const handleChange = (e) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  // TRUCO: Convertimos la imagen a código de texto (Base64) para guardarla sin usar Storage
  const handleImagenChange = (e) => {
    if (e.target.files[0]) {
      const archivo = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        // Cuando termina de leer, guardamos el texto Base64 en el estado
        setPerfil({ ...perfil, fotoUrl: reader.result });
      };
      
      reader.readAsDataURL(archivo);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      // Actualizamos los datos en Firestore directamente (la foto ya está en formato texto)
      const userRef = doc(db, 'usuarios', user.uid);
      await updateDoc(userRef, {
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        telefono: perfil.telefono,
        fotoUrl: perfil.fotoUrl
      });

      setMensaje({ tipo: 'exito', texto: 'Perfil actualizado correctamente.' });
      
    } catch (error) {
      console.error("Error al actualizar:", error);
      setMensaje({ tipo: 'error', texto: 'Hubo un error al guardar los cambios.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-primary flex items-center justify-center text-white">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-primary text-white pb-20">
      {/* Header */}
      <header className="bg-primary pt-10 pb-6 px-6 sticky top-0 z-10 border-b border-white/10 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-accent transition-colors">
          <FaArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Mi Perfil</h1>
        </div>
      </header>

      <main className="px-6 py-6">
        <form onSubmit={handleGuardar} className="flex flex-col gap-6">
          
          {/* Foto de Perfil */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-28 h-28 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-white/20">
              {perfil.fotoUrl ? (
                <img 
                  src={perfil.fotoUrl} 
                  alt="Perfil" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUserCircle size={80} className="text-gray-400" />
              )}
              
              <label className="absolute bottom-0 w-full bg-black/60 py-1 flex justify-center cursor-pointer hover:bg-black/80 transition-colors">
                <FaCamera size={16} className="text-white" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImagenChange} 
                />
              </label>
            </div>
            <p className="text-sm text-gray-400">Toca el ícono para cambiar tu foto</p>
          </div>

          {mensaje.texto && (
            <div className={`p-3 rounded-lg text-sm text-center ${mensaje.tipo === 'exito' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {mensaje.texto}
            </div>
          )}

          {/* Formulario de Datos */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Nombre</label>
              <input 
                type="text" 
                name="nombre"
                required
                value={perfil.nombre}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-300 mb-1">Apellido</label>
              <input 
                type="text" 
                name="apellido"
                required
                value={perfil.apellido}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Teléfono</label>
              <input 
                type="tel" 
                name="telefono"
                required
                value={perfil.telefono}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-300 mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                value={perfil.correo || ''}
                readOnly
                className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className={`w-full font-bold py-4 rounded-lg mt-2 transition-colors ${
              saving ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-accent text-primary hover:bg-yellow-500'
            }`}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ClientPerfil;