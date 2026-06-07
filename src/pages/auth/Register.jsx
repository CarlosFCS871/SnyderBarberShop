import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerClient } from '../../services/authService';
import { FaUser, FaLock, FaEnvelope, FaPhone } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', telefono: '+51', correo: '', password: '', confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }

    try {
      await registerClient(formData);
      navigate('/client');
    } catch (err) {
      setError('Error al registrar. Verifica tus datos o intenta con otro correo.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Efecto de fondo sutil para dar profundidad premium */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-neutral-950 to-neutral-950 pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-black text-amber-500 tracking-tighter mb-1 drop-shadow-sm">
            Crear Cuenta
          </h2>
          <p className="text-zinc-500 tracking-[0.25em] uppercase text-xs font-semibold">
            Únete a Snyder Barber Shop
          </p>
        </div>

        <form onSubmit={handleRegister} className="bg-zinc-900/40 p-6 sm:p-8 rounded-2xl border border-zinc-800/60 backdrop-blur-xl shadow-2xl shadow-black/50">
          
          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 text-center font-medium flex items-center justify-center gap-2 animate-pulse">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Nombre y Apellido en Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-zinc-400 text-[10px] sm:text-xs font-semibold ml-1 mb-1 block uppercase tracking-wide">Nombre</label>
              <input 
                type="text" 
                name="nombre" 
                placeholder="Ej. Juan" 
                required 
                onChange={handleChange} 
                className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300 text-sm sm:text-base" 
              />
            </div>
            <div>
              <label className="text-zinc-400 text-[10px] sm:text-xs font-semibold ml-1 mb-1 block uppercase tracking-wide">Apellido</label>
              <input 
                type="text" 
                name="apellido" 
                placeholder="Ej. Pérez" 
                required 
                onChange={handleChange} 
                className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300 text-sm sm:text-base" 
              />
            </div>
          </div>

          {/* Teléfono */}
          <div className="mb-4">
            <label className="text-zinc-400 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide">Teléfono</label>
            <div className="relative group">
              <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors duration-300" />
              <input 
                type="tel" 
                name="telefono" 
                value={formData.telefono} 
                required 
                onChange={handleChange} 
                className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300" 
              />
            </div>
          </div>

          {/* Correo */}
          <div className="mb-4">
            <label className="text-zinc-400 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide">Correo Electrónico</label>
            <div className="relative group">
              <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors duration-300" />
              <input 
                type="email" 
                name="correo" 
                placeholder="tu@correo.com" 
                required 
                onChange={handleChange} 
                className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300" 
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="mb-4">
            <label className="text-zinc-400 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide">Contraseña</label>
            <div className="relative group">
              <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors duration-300" />
              <input 
                type="password" 
                name="password" 
                placeholder="Mínimo 6 caracteres" 
                required 
                minLength="6" 
                onChange={handleChange} 
                className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300" 
              />
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div className="mb-8">
            <label className="text-zinc-400 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide">Confirmar Contraseña</label>
            <div className="relative group">
              <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors duration-300" />
              <input 
                type="password" 
                name="confirmPassword" 
                placeholder="Repite tu contraseña" 
                required 
                minLength="6" 
                onChange={handleChange} 
                className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300" 
              />
            </div>
          </div>

          {/* Botón de acción */}
          <button 
            type="submit" 
            className="w-full bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-neutral-950 font-black py-4 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 uppercase tracking-wider text-sm"
          >
            Registrarse
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-zinc-500 mt-8 text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors duration-300">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;