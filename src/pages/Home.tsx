import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="text-2xl font-bold text-gray-800">Bienvenido {user || "Usuario"} 👋</h1>
      <p className="text-gray-600">Esta es la página de inicio de tu aplicación.</p>

      {!token ? (
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700" onClick={() => navigate("/login")}>Iniciar Sesión</button>
      ) : (
        <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700" onClick={() => navigate("/contabilidad")}>Ir a Contabilidad</button>
      )}
    </div>
  );
};


export default Home;
