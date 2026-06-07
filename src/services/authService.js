import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Función para iniciar sesión
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Función para registrar un nuevo cliente
export const registerClient = async (userData) => {
  try {
    // 1. Crear el usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, userData.correo, userData.password);
    const user = userCredential.user;

    // 2. Guardar los datos adicionales en Firestore (Colección 'usuarios')
    await setDoc(doc(db, 'usuarios', user.uid), {
      uid: user.uid,
      nombre: userData.nombre,
      apellido: userData.apellido,
      telefono: userData.telefono,
      correo: userData.correo,
      rol: 'Cliente', // Rol por defecto
      fotoUrl: '', // Se actualizará después en el perfil
      fechaRegistro: new Date().toISOString()
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Función para cerrar sesión
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};