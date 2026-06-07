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
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-black text-white text-center mb-8">Crear Cuenta</h2>

        <form onSubmit={handleRegister} className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
          {error && <p className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm mb-4 text-center">{error}</p>}

          <div className="grid grid-cols-2 gap-3 mb-3">
            <input type="text" name="nombre" placeholder="Nombre" required onChange={handleChange} className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-white outline-none focus:border-accent" />
            <input type="text" name="apellido" placeholder="Apellido" required onChange={handleChange} className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-white outline-none focus:border-accent" />
          </div>

          <div className="relative mb-3">
            <FaPhone className="absolute left-4 top-4.5 text-gray-600" />
            <input type="tel" name="telefono" value={formData.telefono} required onChange={handleChange} className="w-full bg-black/20 border border-white/5 rounded-xl pl-12 p-4 text-white outline-none focus:border-accent" />
          </div>

          <div className="relative mb-3">
            <FaEnvelope className="absolute left-4 top-4.5 text-gray-600" />
            <input type="email" name="correo" placeholder="Correo electrónico" required onChange={handleChange} className="w-full bg-black/20 border border-white/5 rounded-xl pl-12 p-4 text-white outline-none focus:border-accent" />
          </div>

          <div className="relative mb-3">
            <FaLock className="absolute left-4 top-4.5 text-gray-600" />
            <input type="password" name="password" placeholder="Contraseña" required minLength="6" onChange={handleChange} className="w-full bg-black/20 border border-white/5 rounded-xl pl-12 p-4 text-white outline-none focus:border-accent" />
          </div>

          <div className="relative mb-6">
            <FaLock className="absolute left-4 top-4.5 text-gray-600" />
            <input type="password" name="confirmPassword" placeholder="Confirmar contraseña" required minLength="6" onChange={handleChange} className="w-full bg-black/20 border border-white/5 rounded-xl pl-12 p-4 text-white outline-none focus:border-accent" />
          </div>

          <button type="submit" className="w-full bg-accent text-primary font-bold py-4 rounded-xl hover:bg-yellow-500 transition-all shadow-lg shadow-accent/20">
            REGISTRARSE
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          ¿Ya tienes cuenta? <Link to="/login" className="text-accent font-bold">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;