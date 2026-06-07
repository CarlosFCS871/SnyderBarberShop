import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { FaArrowLeft, FaPlus, FaTimes, FaEdit, FaTrash, FaCut, FaClock } from 'react-icons/fa';

const BarberServicios = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados para el Modal
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
            // Nos aseguramos de guardar los números como tipo 'number'
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
        <div className="min-h-screen bg-primary text-white pb-20 relative">
            <header className="bg-primary pt-10 pb-6 px-6 sticky top-0 z-10 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-accent transition-colors">
                        <FaArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white">Mis Servicios</h1>
                    </div>
                </div>
                <button
                    onClick={abrirModalCrear}
                    className="bg-accent text-primary p-3 rounded-full hover:bg-yellow-500 transition-colors shadow-lg"
                >
                    <FaPlus size={16} />
                </button>
            </header>

            <main className="px-6 py-6">
                {loading ? (
                    <div className="text-center text-gray-400 mt-10">Cargando catálogo...</div>
                ) : servicios.length === 0 ? (
                    <div className="text-center flex flex-col items-center gap-4 mt-10 p-6 bg-white/5 rounded-2xl border border-white/10">
                        <FaCut size={40} className="text-gray-500" />
                        <p className="text-gray-400">No tienes servicios configurados. Agrega uno para que los clientes puedan reservar.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {servicios.map((servicio) => (
                            <div key={servicio.id} className="bg-white/5 p-5 rounded-xl border border-white/10 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg">{servicio.nombre}</h3>
                                        <p className="text-xs text-gray-400 mt-1">{servicio.descripcion}</p>
                                    </div>
                                    <span className="font-bold text-accent whitespace-nowrap ml-4">S/ {servicio.precio}</span>
                                </div>

                                <div className="flex justify-between items-center mt-2 pt-3 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <FaClock className="text-gray-500" />
                                        <span>{servicio.duracion} min</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => abrirModalEditar(servicio)}
                                            className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                                        >
                                            <FaEdit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleEliminar(servicio.id, servicio.nombre)}
                                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                        >
                                            <FaTrash size={16} />
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
                <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
                    <div className="bg-[#1a1a1a] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 border-t sm:border border-white/10 animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {modoEdicion ? 'Editar Servicio' : 'Nuevo Servicio'}
                            </h2>
                            <button onClick={() => setModalVisible(false)} className="text-gray-400 hover:text-white">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Nombre del Servicio</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    required
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej: Corte Clásico"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Descripción</label>
                                <textarea
                                    name="descripcion"
                                    required
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    rows="2"
                                    placeholder="Ej: Incluye lavado y peinado"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent resize-none"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">Precio (S/)</label>
                                    <input
                                        type="number"
                                        name="precio"
                                        required
                                        min="0"
                                        step="0.1"
                                        value={formData.precio}
                                        onChange={handleChange}
                                        placeholder="30.00"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">Duración (min)</label>
                                    <input
                                        type="number"
                                        name="duracion"
                                        required
                                        min="5"
                                        step="5"
                                        value={formData.duracion}
                                        onChange={handleChange}
                                        placeholder="45"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full font-bold py-4 rounded-lg mt-2 transition-colors ${isSubmitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-accent text-primary hover:bg-yellow-500'
                                    }`}
                            >
                                {isSubmitting ? 'Guardando...' : 'Guardar Servicio'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BarberServicios;