import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContabilidadData {
  total_ingresos: number;
  total_inversiones: number;
  total_ganancias: number;
}

export default function Contabilidad() {
  const [data, setData] = useState<ContabilidadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); // Obtener el token del almacenamiento local
  
        const response = await axios.get("http://127.0.0.1:8000/api/contabilidad/", {
          headers: {
            Authorization: `Bearer ${token}`, // Agregar el token en la cabecera
          },
        });
  
        console.log("Contabilidad cargada:", response.data);
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching contabilidad:", err);
        setError("No se pudieron cargar los datos de contabilidad.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Resumen Financiero</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-green-500">${data?.total_ingresos}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inversiones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-red-500">-${data?.total_inversiones}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ganancias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-blue-500">${data?.total_ganancias}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
