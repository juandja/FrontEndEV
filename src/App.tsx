import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Home from "./pages/Home";
import Contabilidad from "./pages/Contabilidad";
import Login from "./pages/Login";
import MainLayout from "./layouts/MainLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Transacciones from "./pages/Transacciones";
import AuthNavigator from "./components/AuthNavigator"; // ⬅ Agregado
import Inventario from "./pages/Inventory"; // Asegúrate de que el nombre sea correcto

const App = () => {
  const { token } = useContext(AuthContext);

  return (
    <>
      <ToastContainer />
      <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Maneja la redirección en logout */}
        <Route path="*" element={<AuthNavigator />} />

        {/* Rutas protegidas dentro de MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/contabilidad" element={token ? <Contabilidad /> : <Navigate to="/login" />} />
          <Route path="/transacciones" element={<Transacciones />} />
        </Route>
      </Routes>
    </>
  );
};


export default App;
