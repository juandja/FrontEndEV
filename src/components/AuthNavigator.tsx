import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AuthNavigator = () => {
  const navigate = useNavigate();
  const { setLogoutCallback } = useContext(AuthContext);

  useEffect(() => {
    setLogoutCallback(() => () => navigate("/login"));
  }, [navigate, setLogoutCallback]);

  return null; // No renderiza nada, solo maneja la redirección
};

export default AuthNavigator;
