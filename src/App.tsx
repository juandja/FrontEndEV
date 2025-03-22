import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Home from "./pages/Home";
import Contabilidad from "./pages/Contabilidad";
import Login from "./pages/Login";
import MainLayout from "./layouts/MainLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthNavigator from "./components/AuthNavigator"; // ⬅ Agregado
import Inventario from "./pages/Inventory"; // Asegúrate de que el nombre sea correcto

const App = () => {
  const { token } = useContext(AuthContext);

  return (

    <>
          <div style={{ backgroundColor: 'green', padding: '50px', color: 'white' }}>
          Si ves este fondo rojo, Tailwind NO está funcionando.
        </div>
      <div className="bg-blue-500 text-white p-4 text-center">
      ¡Tailwind está funcionando! 🚀
    </div>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Maneja la redirección en logout */}
        <Route path="*" element={<AuthNavigator />} />

        {/* Rutas protegidas dentro de MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/contabilidad" element={token ? <Contabilidad /> : <Navigate to="/login" />} />
        </Route>
      </Routes>
    </>
  );
};


export default App;
