import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FaArrowLeft, FaUserCircle, FaCamera, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

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

  const handleImagenChange = (e) => {
    if (e.target.files[0]) {
      const archivo = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-zinc-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Cargando perfil...</p>
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
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-amber-500 tracking-tight">
              Mi Perfil
            </h1>
            <p className="text-xs text-zinc-500">Gestiona tu información personal</p>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-3xl mx-auto relative z-10">
        <form onSubmit={handleGuardar} className="flex flex-col gap-6">
          
          {/* Foto de Perfil Premium */}
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-zinc-900/60 flex items-center justify-center overflow-hidden border-4 border-amber-500/30 shadow-2xl shadow-amber-500/20 group">
              {perfil.fotoUrl ? (
                <img 
                  src={perfil.fotoUrl} 
                  alt="Perfil" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUserCircle size={80} className="text-zinc-600" />
              )}
              
              {/* Overlay de cámara */}
              <label className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center cursor-pointer">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <FaCamera size={16} className="text-neutral-950" />
                  </div>
                  <span className="text-white text-xs font-semibold">Cambiar</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImagenChange} 
                />
              </label>

              {/* Badge inferior permanente para móvil */}
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent py-2 flex justify-center sm:hidden">
                <FaCamera size={14} className="text-amber-500" />
              </div>
            </div>
            <p className="text-xs text-zinc-500 text-center">
              Toca la foto para cambiarla
            </p>
          </div>

          {/* Mensajes de feedback */}
          {mensaje.texto && (
            <div className={`p-4 rounded-xl text-sm text-center font-medium flex items-center justify-center gap-2 border ${
              mensaje.tipo === 'exito' 
                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {mensaje.tipo === 'exito' ? <FaCheck size={14} /> : <FaExclamationTriangle size={14} />}
              {mensaje.texto}
            </div>
          )}

          {/* Formulario de Datos */}
          <div className="bg-zinc-900/40 p-5 sm:p-6 rounded-2xl border border-zinc-800/60 backdrop-blur-xl flex flex-col gap-5">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1">
              Información Personal
            </h2>

            {/* Nombre y Apellido en Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-400 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide">
                  Nombre
                </label>
                <input 
                  type="text" 
                  name="nombre"
                  required
                  value={perfil.nombre}
                  onChange={handleChange}
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
                  value={perfil.apellido}
                  onChange={handleChange}
                  className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="text-zinc-400 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide">
                Teléfono
              </label>
              <input 
                type="tel" 
                name="telefono"
                required
                value={perfil.telefono}
                onChange={handleChange}
                className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300"
              />
            </div>

            {/* Correo (solo lectura) */}
            <div>
              <label className="text-zinc-500 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide flex items-center gap-1.5">
                Correo Electrónico
                <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-normal normal-case tracking-normal">
                  No editable
                </span>
              </label>
              <input 
                type="email" 
                value={perfil.correo || ''}
                readOnly
                className="w-full bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-4 py-3.5 text-zinc-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Botón Guardar */}
          <button 
            type="submit" 
            disabled={saving}
            className={`w-full font-black py-4 rounded-xl transition-all duration-300 uppercase tracking-wider text-sm ${
              saving 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                : 'bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-neutral-950 shadow-lg shadow-amber-500/20'
            }`}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                Guardando...
              </span>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ClientPerfil;