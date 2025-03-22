import { useEffect, useState } from "react";

const Contabilidad = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/api/contabilidad/", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,  // Asegúrate de incluir el token
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
  }, []);

  return (
    <div>
      <h1>Contabilidad</h1>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Cargando...</p>}
    </div>
  );
};

export default Contabilidad;
  