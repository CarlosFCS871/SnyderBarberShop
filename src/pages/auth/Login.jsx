import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import { FaUser, FaLock } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await loginUser(email, password);
      navigate('/'); 
    } catch (err) {
      setError('Correo o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Efecto de fondo sutil para dar profundidad premium */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-neutral-950 to-neutral-950 pointer-events-none" />
      
      <div className="w-full max-w-sm relative z-10">
        {/* Header de la marca */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-black text-amber-500 tracking-tighter mb-1 drop-shadow-sm">
            SNYDER
          </h1>
          <p className="text-zinc-500 tracking-[0.25em] uppercase text-xs font-semibold">
            Barber Shop
          </p>
        </div>
        
        {/* Formulario */}
        <form onSubmit={handleLogin} className="bg-zinc-900/40 p-6 sm:p-8 rounded-2xl border border-zinc-800/60 backdrop-blur-xl shadow-2xl shadow-black/50">
          
          {/* Mensaje de error mejorado */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 text-center font-medium flex items-center justify-center gap-2 animate-pulse">
              <span>⚠️</span> {error}
            </div>
          )}
          
          {/* Input Email */}
          <div className="mb-5">
            <label className="text-zinc-400 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide">
              Correo Electrónico
            </label>
            <div className="relative group">
              <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors duration-300" />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300"
                placeholder="tu@correo.com"
                required 
              />
            </div>
          </div>

          {/* Input Contraseña */}
          <div className="mb-8">
            <label className="text-zinc-400 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide">
              Contraseña
            </label>
            <div className="relative group">
              <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors duration-300" />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300"
                placeholder="••••••••"
                required 
              />
            </div>
          </div>

          {/* Botón de acción */}
          <button 
            type="submit" 
            className="w-full bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-neutral-950 font-black py-4 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 uppercase tracking-wider text-sm"
          >
            Ingresar
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-zinc-500 mt-8 text-sm">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors duration-300">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;