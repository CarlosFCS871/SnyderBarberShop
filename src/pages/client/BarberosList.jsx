import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FaUserCircle, FaArrowLeft } from 'react-icons/fa';

const BarberosList = () => {
  const [barberos, setBarberos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBarberos = async () => {
      try {
        // Consultamos a Firebase todos los usuarios que tengan el rol "Barbero"
        const q = query(collection(db, 'usuarios'), where('rol', '==', 'Barbero'));
        const querySnapshot = await getDocs(q);
        
        const listaBarberos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setBarberos(listaBarberos);
      } catch (error) {
        console.error("Error al cargar los barberos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBarberos();
  }, []);

  return (
    <div className="min-h-screen bg-primary text-white pb-20">
      {/* Header con botón de retroceso */}
      <header className="bg-primary pt-10 pb-6 px-6 sticky top-0 z-10 border-b border-white/10 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-accent transition-colors">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-accent">Nuestros Barberos</h1>
      </header>

      <main className="px-6 py-6">
        {loading ? (
          <div className="text-center text-gray-400 mt-10">Cargando profesionales...</div>
        ) : barberos.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">Aún no hay barberos registrados.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {barberos.map((barbero) => (
              <div key={barbero.id} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                {/* Foto del Barbero o Icono por defecto */}
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0 text-accent">
                  {barbero.fotoUrl ? (
                    <img src={barbero.fotoUrl} alt={barbero.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <FaUserCircle size={40} />
                  )}
                </div>

                {/* Info del Barbero */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{barbero.nombre} {barbero.apellido}</h3>
                  <p className="text-sm text-gray-400">Barbero Profesional</p>
                </div>

                {/* Botón Ver Servicios */}
                <Link 
                  to={`/client/barbero/${barbero.id}/servicios`}
                  className="bg-accent text-primary font-semibold px-4 py-2 rounded-lg text-sm hover:bg-yellow-500 transition-colors"
                >
                  Servicios
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BarberosList;