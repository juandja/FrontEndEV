import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav>
      <h1>Mi Aplicación</h1>
      <ul>
        <li>
          <a href="/">Inicio</a>
          
        </li>
        <li>
          <a href="/contabilidad">Contabilidad</a>
          <Link to="/inventario">Inventario</Link>
        </li>
        <li>
          {token ? (
            <button onClick={handleLogout}>Cerrar Sesión</button>
          ) : (
            <button onClick={() => navigate("/login")}>Iniciar Sesión</button>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
