import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Contabilidad = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        console.error("No hay token disponible, redirigiendo...");
        setTimeout(() => navigate("/home"), 500); // Evita redirigir instantáneamente
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/api/contabilidad/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("No autorizado");
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div>
      <h1>Contabilidad</h1>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Cargando...</p>}
    </div>
  );
};

export default Contabilidad;
