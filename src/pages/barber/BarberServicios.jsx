import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { FaArrowLeft, FaPlus, FaTimes, FaEdit, FaTrash, FaCut, FaClock, FaTag } from 'react-icons/fa';

const BarberServicios = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [servicioId, setServicioId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        duracion: ''
    });

    const fetchServicios = async () => {
        if (!user) return;
        try {
            const q = query(collection(db, 'servicios'), where('barberoId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setServicios(lista);
        } catch (error) {
            console.error("Error al cargar servicios:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServicios();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setFormData({ nombre: '', descripcion: '', precio: '', duracion: '' });
        setModalVisible(true);
    };

    const abrirModalEditar = (servicio) => {
        setModoEdicion(true);
        setServicioId(servicio.id);
        setFormData({
            nombre: servicio.nombre,
            descripcion: servicio.descripcion,
            precio: servicio.precio,
            duracion: servicio.duracion
        });
        setModalVisible(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const datosGuardar = {
                barberoId: user.uid,
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                precio: Number(formData.precio),
                duracion: Number(formData.duracion)
            };

            if (modoEdicion) {
                await updateDoc(doc(db, 'servicios', servicioId), datosGuardar);
            } else {
                await addDoc(collection(db, 'servicios'), datosGuardar);
            }

            fetchServicios();
            setModalVisible(false);
        } catch (error) {
            console.error("Error al guardar el servicio:", error);
            alert("Hubo un error al guardar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEliminar = async (id, nombre) => {
        const confirmar = window.confirm(`¿Seguro que deseas eliminar el servicio: ${nombre}?`);
        if (!confirmar) return;

        try {
            await deleteDoc(doc(db, 'servicios', id));
            setServicios(servicios.filter(s => s.id !== id));
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("Hubo un error al eliminar.");
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
                            <FaCut className="text-amber-500" size={20} />
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-amber-500 tracking-tight">
                                    Mis Servicios
                                </h1>
                                <p className="text-xs text-zinc-500">Gestiona tu catálogo</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Botón Agregar */}
                    <button
                        onClick={abrirModalCrear}
                        className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 p-3 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20"
                        title="Agregar servicio"
                    >
                        <FaPlus size={16} />
                    </button>
                </div>
            </header>

            <main className="px-4 sm:px-6 py-6 max-w-5xl mx-auto relative z-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center mt-16 gap-4">
                        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-zinc-400 text-sm">Cargando catálogo...</p>
                    </div>
                ) : servicios.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-16 gap-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 backdrop-blur-xl p-8">
                        <div className="w-20 h-20 bg-zinc-900/60 rounded-full flex items-center justify-center border border-zinc-800">
                            <FaCut className="text-zinc-600" size={32} />
                        </div>
                        <div className="text-center">
                            <p className="text-zinc-300 font-semibold">No tienes servicios configurados</p>
                            <p className="text-zinc-500 text-sm mt-1">Agrega tu primer servicio para que los clientes puedan reservar</p>
                        </div>
                        <button
                            onClick={abrirModalCrear}
                            className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-bold px-6 py-3 rounded-xl mt-4 transition-all duration-300 shadow-lg shadow-amber-500/20 uppercase tracking-wider text-sm flex items-center gap-2"
                        >
                            <FaPlus size={12} />
                            Agregar Servicio
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {servicios.map((servicio) => (
                            <div 
                                key={servicio.id} 
                                className="group bg-zinc-900/40 hover:bg-zinc-800/60 p-5 sm:p-6 rounded-2xl border border-zinc-800/60 hover:border-amber-500/30 flex flex-col gap-4 transition-all duration-300 backdrop-blur-xl"
                            >
                                {/* Header del servicio */}
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center shrink-0">
                                            <FaCut className="text-amber-500" size={16} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-base sm:text-lg text-zinc-100 truncate group-hover:text-amber-500 transition-colors duration-300">
                                                {servicio.nombre}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-zinc-400 mt-1 line-clamp-2">
                                                {servicio.descripcion}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black px-2.5 py-1 rounded-lg text-xs sm:text-sm whitespace-nowrap">
                                        S/ {servicio.precio}
                                    </span>
                                </div>

                                {/* Footer del servicio */}
                                <div className="flex justify-between items-center mt-2 pt-4 border-t border-zinc-800/60">
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300 font-medium">
                                        <div className="w-8 h-8 bg-zinc-800/60 rounded-lg flex items-center justify-center">
                                            <FaClock className="text-amber-500" size={12} />
                                        </div>
                                        <span>{servicio.duracion} min</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => abrirModalEditar(servicio)}
                                            className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300 active:scale-95"
                                            title="Editar"
                                        >
                                            <FaEdit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleEliminar(servicio.id, servicio.nombre)}
                                            className="p-2.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 active:scale-95"
                                            title="Eliminar"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* MODAL CREAR / EDITAR SERVICIO */}
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
                                    {modoEdicion ? 'Editar Servicio' : 'Nuevo Servicio'}
                                </h2>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    {modoEdicion ? 'Modifica los datos del servicio' : 'Completa los datos del servicio'}
                                </p>
                            </div>
                            <button 
                                onClick={() => !isSubmitting && setModalVisible(false)} 
                                className="bg-zinc-900/60 p-2 rounded-full border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/50 transition-all duration-300 active:scale-95"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {/* Nombre */}
                            <div>
                                <label className="text-zinc-400 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide">
                                    Nombre del Servicio
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    required
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej: Corte Clásico"
                                    className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300"
                                />
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="text-zinc-400 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide">
                                    Descripción
                                </label>
                                <textarea
                                    name="descripcion"
                                    required
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    rows="2"
                                    placeholder="Ej: Incluye lavado y peinado"
                                    className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300 resize-none"
                                ></textarea>
                            </div>

                            {/* Precio y Duración */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-zinc-400 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide flex items-center gap-1.5">
                                        <FaTag size={10} />
                                        Precio (S/)
                                    </label>
                                    <input
                                        type="number"
                                        name="precio"
                                        required
                                        min="0"
                                        step="0.1"
                                        value={formData.precio}
                                        onChange={handleChange}
                                        placeholder="30.00"
                                        className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="text-zinc-400 text-xs font-semibold ml-1 mb-1.5 block uppercase tracking-wide flex items-center gap-1.5">
                                        <FaClock size={10} />
                                        Duración (min)
                                    </label>
                                    <input
                                        type="number"
                                        name="duracion"
                                        required
                                        min="5"
                                        step="5"
                                        value={formData.duracion}
                                        onChange={handleChange}
                                        placeholder="45"
                                        className="w-full bg-neutral-950/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300"
                                    />
                                </div>
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
                                    modoEdicion ? 'Actualizar Servicio' : 'Guardar Servicio'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BarberServicios;