import axios from "axios";

// Obtener el token del almacenamiento local
const getAuthToken = () => localStorage.getItem("access_token");

// Configuración base de Axios para el backend
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Asegúrate de usar la URL correcta
  headers: {
    "Content-Type": "application/json",
  },
});

const API_URL = "http://127.0.0.1:8000/api";

// Interceptor para agregar el token a cada solicitud
api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

export default api;

export const login = async (username: string, password: string) => {
    try {
      const response = await api.post("/token/", {
        username,
        password,
      });
  
      const { access, refresh } = response.data;
  
      // Guardar los tokens en localStorage
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
  
      return true;
    } catch (error) {
      console.error("Error en el login", error);
      return false;
    }
  };
  

export const getResumenContable = async () => {
    const token = localStorage.getItem("token"); // Asegúrate de obtenerlo correctamente
    return await axios.get(`${API_URL}/contabilidad/`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};