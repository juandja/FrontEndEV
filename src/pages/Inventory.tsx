"use client"

import type React from "react"

import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"

interface Producto {
  id: number
  nombre: string
  precio: number | string // Modificado para aceptar string o number
  stock: number | string // Modificado para aceptar string o number
}

function Inventario() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: "", precio: "", stock: "" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<Producto>({ id: 0, nombre: "", precio: 0, stock: 0 })
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null)

  const navigate = useNavigate()

  // Obtener token del localStorage
  const getToken = () => {
    const token = localStorage.getItem("token")
    return token
  }

  // Configuración de axios con el token
  const getAxiosConfig = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  })

  // Cargar productos al iniciar
  useEffect(() => {
    const token = getToken()

    if (!token) {
      navigate("/login") // Si no hay token, redirigir a Login
      return
    }

    fetchProductos()
  }, [navigate])

  // Función para obtener todos los productos
  const fetchProductos = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://127.0.0.1:8000/api/productos/", getAxiosConfig())
      setProductos(response.data)
      setError("")
    } catch (err) {
      console.error("Error al obtener los productos:", err)
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate("/login") // Si el token es inválido, redirigir
      } else {
        setError("Error al cargar los productos. Verifica la conexión con el servidor.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Agregar producto
  const agregarProducto = async () => {
    // Validar que los campos no estén vacíos
    if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.stock) {
      setError("Todos los campos son obligatorios")
      return
    }

    try {
      setLoading(true)
      const productoData = {
        nombre: nuevoProducto.nombre,
        precio: Number.parseFloat(nuevoProducto.precio),
        stock: Number.parseInt(nuevoProducto.stock),
      }

      const response = await axios.post("http://127.0.0.1:8000/api/productos/", productoData, getAxiosConfig())

      setProductos([...productos, response.data])
      setNuevoProducto({ nombre: "", precio: "", stock: "" }) // Limpiar formulario
      setError("")
    } catch (err) {
      console.error("Error al agregar producto:", err)
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate("/login")
      } else {
        setError("Error al agregar el producto. Verifica los datos e intenta nuevamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Eliminar producto
  const eliminarProducto = async (id: number) => {
    try {
      setLoading(true)
      await axios.delete(`http://127.0.0.1:8000/api/productos/${id}/`, getAxiosConfig())
      setProductos(productos.filter((prod) => prod.id !== id))
      setShowConfirmDelete(null)
    } catch (err) {
      console.error("Error al eliminar producto:", err)
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate("/login")
      } else {
        setError("Error al eliminar el producto. Intenta nuevamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Iniciar edición de un producto
  const startEditing = (producto: Producto) => {
    setEditingId(producto.id)
    setEditValues({
      id: producto.id,
      nombre: producto.nombre,
      precio: typeof producto.precio === "string" ? Number.parseFloat(producto.precio) : producto.precio,
      stock: typeof producto.stock === "string" ? Number.parseInt(producto.stock) : producto.stock,
    })
  }

  // Manejar cambios en el formulario de edición
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditValues({
      ...editValues,
      [name]: name === "nombre" ? value : Number(value),
    })
  }

  // Guardar cambios de edición
  const saveEdit = async () => {
    if (editingId === null) return

    try {
      setLoading(true)
      const response = await axios.put(
        `http://127.0.0.1:8000/api/productos/${editingId}/`,
        {
          nombre: editValues.nombre,
          precio: typeof editValues.precio === "string" ? Number.parseFloat(editValues.precio) : editValues.precio,
          stock: typeof editValues.stock === "string" ? Number.parseInt(editValues.stock) : editValues.stock,
        },
        getAxiosConfig(),
      )

      setProductos(productos.map((prod) => (prod.id === editingId ? response.data : prod)))
      setEditingId(null)
      setError("")
    } catch (err) {
      console.error("Error al actualizar producto:", err)
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate("/login")
      } else {
        setError("Error al actualizar el producto. Verifica los datos e intenta nuevamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Función auxiliar para formatear el precio
  const formatPrecio = (precio: number | string): string => {
    if (typeof precio === "number") {
      return precio.toFixed(2)
    } else if (typeof precio === "string") {
      const num = Number.parseFloat(precio)
      return isNaN(num) ? "0.00" : num.toFixed(2)
    }
    return "0.00"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
        <div className="border-b border-gray-700 p-4 md:p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-400">Inventario de Vapers</h1>
          <button
            onClick={fetchProductos}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            Recargar
          </button>
        </div>

        <div className="p-4 md:p-6">
          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-2 rounded-md mb-4">{error}</div>
          )}

          {/* Formulario para agregar nuevo producto */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1 block text-gray-300">Nombre</label>
              <input
                type="text"
                value={nuevoProducto.nombre}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del vaper"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-gray-300">Precio</label>
              <input
                type="number"
                value={nuevoProducto.precio}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Precio"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-gray-300">Stock</label>
              <input
                type="number"
                value={nuevoProducto.stock}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cantidad en stock"
                min="0"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={agregarProducto}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Agregar
              </button>
            </div>
          </div>

          {/* Indicador de carga */}
          {loading && (
            <div className="flex justify-center my-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Tabla de productos */}
          <div className="rounded-md border border-gray-700 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-gray-200 px-4 py-3 w-[80px] text-center">ID</th>
                  <th className="text-gray-200 px-4 py-3">Nombre</th>
                  <th className="text-gray-200 px-4 py-3">Precio</th>
                  <th className="text-gray-200 px-4 py-3">Stock</th>
                  <th className="text-gray-200 px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-6 px-4">
                      No hay vapers en el inventario
                    </td>
                  </tr>
                ) : (
                  productos.map((producto) => (
                    <tr key={producto.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-center font-medium">{producto.id}</td>
                      <td className="px-4 py-3">
                        {editingId === producto.id ? (
                          <input
                            name="nombre"
                            value={editValues.nombre}
                            onChange={handleEditChange}
                            className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          producto.nombre
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === producto.id ? (
                          <input
                            name="precio"
                            type="number"
                            value={editValues.precio || ""}
                            onChange={handleEditChange}
                            className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                          />
                        ) : (
                          <span className="font-mono">{formatPrecio(producto.precio)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === producto.id ? (
                          <input
                            name="stock"
                            type="number"
                            value={editValues.stock || ""}
                            onChange={handleEditChange}
                            className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        ) : (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              Number(producto.stock) > 0
                                ? "bg-green-900/30 text-green-400 border border-green-800"
                                : "bg-red-900/30 text-red-400 border border-red-800"
                            }`}
                          >
                            {producto.stock}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {editingId === producto.id ? (
                          <button
                            onClick={saveEdit}
                            disabled={loading}
                            className="px-2 py-1 border border-green-600 text-green-500 hover:bg-green-900/20 rounded-md inline-flex items-center justify-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                              <polyline points="17 21 17 13 7 13 7 21"></polyline>
                              <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => startEditing(producto)}
                            disabled={loading}
                            className="px-2 py-1 border border-blue-600 text-blue-500 hover:bg-blue-900/20 rounded-md inline-flex items-center justify-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                        )}

                        {showConfirmDelete === producto.id ? (
                          <div className="inline-flex items-center space-x-2 ml-2">
                            <span className="text-xs text-red-400">¿Confirmar?</span>
                            <button
                              onClick={() => eliminarProducto(producto.id)}
                              disabled={loading}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs"
                            >
                              Sí
                            </button>
                            <button
                              onClick={() => setShowConfirmDelete(null)}
                              className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-xs"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowConfirmDelete(producto.id)}
                            disabled={loading}
                            className="px-2 py-1 border border-red-600 text-red-500 hover:bg-red-900/20 rounded-md inline-flex items-center justify-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Inventario

