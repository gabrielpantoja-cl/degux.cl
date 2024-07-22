import { db } from "app/lib/db"; // Asegúrate de que el módulo 'db' exista y esté correctamente importado
import bcrypt from "bcrypt"; // Asegúrate de que bcrypt esté instalado y correctamente importado
import { nanoid } from "nanoid"; // Asegúrate de que nanoid esté instalado y correctamente importado
import { sendEmailVerification } from "app/lib/mail"; // Asegúrate de que esta función exista y esté correctamente importada
import GoogleProvider from "next-auth/providers/google"; // Importa el proveedor de Google

// Asegúrate de que las variables de entorno estén definidas
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error("Missing Google client ID or secret in environment variables");
}

const providers = [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ];
  
  export default providers;