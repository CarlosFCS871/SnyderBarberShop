import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// 1. Creamos el contexto
const AuthContext = createContext();

// 2. Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);

// 3. Proveedor del contexto que envolverá nuestra app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchamos los cambios de estado de Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Si hay usuario, buscamos su rol en la colección 'usuarios' de Firestore
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().rol);
          } else {
            setRole('Cliente'); // Rol por defecto si no se encuentra
          }
        } catch (error) {
          console.error("Error obteniendo el rol del usuario:", error);
          setRole('Cliente');
        }
      } else {
        // Si no hay usuario, limpiamos los estados
        setUser(null);
        setRole(null);
      }
      setLoading(false); // Terminamos de cargar
    });

    // Limpiamos el observador cuando el componente se desmonta
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};