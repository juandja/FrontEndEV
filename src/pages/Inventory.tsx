"use client"

import type React from "react"
import { User, LogOut, Upload, ImageIcon } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { Button } from "../components/ui/button"
import { ArrowRight } from "lucide-react"

interface Producto {
  id: number
  nombre: string
  precio: number | string
  stock: number | string
  imagen?: string | null // Simplificado para evitar problemas de tipo
}

function Inventario() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: "", precio: "", stock: "" })
  const [imagenFile, setImagenFile] = useState<File | null>(null) // Estado separado para el archivo
  const [editImagenFile, setEditImagenFile] = useState<File | null>(null) // Estado separado para edición
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<Producto>({
    id: 0,
    nombre: "",
    precio: 0,
    stock: 0,
    imagen: null,
  })
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("token"))
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null)
  const [uploadingImage, setUploadingImage] = useState<number | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

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

  // Configuración para subir archivos
  const getFileUploadConfig = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "multipart/form-data",
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
      console.log("Productos cargados:", response.data)
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

  // Manejar selección de imagen
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImagenFile(file) // Guardar el archivo en un estado separado

      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Manejar selección de imagen para edición
  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setEditImagenFile(file) // Guardar el archivo en un estado separado

      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
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

      // Primero creamos el producto
      const productoData = {
        nombre: nuevoProducto.nombre,
        precio: Number.parseFloat(nuevoProducto.precio),
        stock: Number.parseInt(nuevoProducto.stock),
      }

      const response = await axios.post("http://127.0.0.1:8000/api/productos/", productoData, getAxiosConfig())
      const nuevoProductoCreado = response.data

      // Si hay imagen, la subimos
      if (imagenFile) {
        const formData = new FormData()
        formData.append("imagen", imagenFile)

        try {
          const imagenResponse = await axios.post(
            `http://127.0.0.1:8000/api/productos/${nuevoProductoCreado.id}/imagen/`,
            formData,
            getFileUploadConfig(),
          )

          // Actualizamos el producto con la URL de la imagen
          if (imagenResponse.data && imagenResponse.data.imagen_url) {
            console.log("Imagen subida con URL:", imagenResponse.data.imagen_url)
            nuevoProductoCreado.imagen = imagenResponse.data.imagen_url
          }
        } catch (imgErr) {
          console.error("Error al subir la imagen:", imgErr)
          // Continuamos aunque falle la subida de imagen
        }
      }

      setProductos([...productos, nuevoProductoCreado])
      setNuevoProducto({ nombre: "", precio: "", stock: "" }) // Limpiar formulario
      setImagenFile(null) // Limpiar archivo
      setPreviewImage(null)
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

  // Subir imagen para un producto existente
  const subirImagen = async (id: number) => {
    if (!editImagenFile) return

    try {
      setUploadingImage(id)
      const formData = new FormData()
      formData.append("imagen", editImagenFile)

      const token = getToken()
      if (!token) {
        navigate("/login")
        return
      }

      const response = await axios.post(
        `http://127.0.0.1:8000/api/productos/${id}/imagen/`,
        formData,
        getFileUploadConfig(),
      )

      // Verificar que la respuesta contiene la URL de la imagen
      if (response.data && response.data.imagen_url) {
        console.log("Imagen actualizada con URL:", response.data.imagen_url)

        // Actualizar el producto con la nueva URL de imagen
        setProductos(productos.map((prod) => (prod.id === id ? { ...prod, imagen: response.data.imagen_url } : prod)))
      } else {
        console.warn("La respuesta no contiene la URL de la imagen:", response.data)
      }

      setEditImagenFile(null)
      setPreviewImage(null)
      setError("")
    } catch (err) {
      console.error("Error al subir imagen:", err)
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate("/login")
      } else {
        setError("Error al subir la imagen. Intenta nuevamente.")
      }
    } finally {
      setUploadingImage(null)
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
      imagen: producto.imagen,
    })
    setEditImagenFile(null) // Resetear el archivo de imagen
    setPreviewImage(typeof producto.imagen === "string" ? producto.imagen : null)
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

      // Si hay una nueva imagen, la subimos después de actualizar los datos
      if (editImagenFile) {
        await subirImagen(editingId)
      } else {
        // Si no hay nueva imagen, mantener la imagen actual
        setProductos(
          productos.map((prod) => (prod.id === editingId ? { ...response.data, imagen: prod.imagen } : prod)),
        )
      }

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

  const handleLogout = () => {
    localStorage.removeItem("token") // Eliminar token de sesión
    setIsAuthenticated(false)
    navigate("/home") // Redirigir al home
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

  // Función para obtener la URL completa de la imagen
  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return "/placeholder.svg"

    // Si la URL ya es absoluta (comienza con http:// o https://), usarla directamente
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath
    }

    // Si es una ruta relativa, construir la URL completa
    return `http://127.0.0.1:8000${imagePath}`
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 p-6">
      {/* Header */}
      <header className="flex justify-between items-center p-4 md:p-6 w-full">
        <div className="flex items-center">
          <Link to={"/home"}>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              VAPOR<span className="font-light">ZONE</span>
            </h1>
          </Link>
        </div>

        <div className="w-full flex justify-center">
          <Link
            to="/transacciones"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium transition-all duration-300 hover:brightness-110 hover:scale-105 shadow-md rounded-md"
          >
            Ver Transacciones
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {isAuthenticated ? (
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        ) : (
          <Link to="/login">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <User className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </Button>
          </Link>
        )}
      </header>

      <div className="max-w-6xl mx-auto bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
        <div className="border-b border-gray-700 p-4 md:p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            Inventario de Vapers
          </h1>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1 block text-gray-300">Nombre</label>
              <input
                type="text"
                value={nuevoProducto.nombre}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Nombre del vaper"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-gray-300">Precio</label>
              <input
                type="number"
                value={nuevoProducto.precio}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Cantidad en stock"
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-gray-300">Imagen</label>
              <div className="flex items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {imagenFile ? "Cambiar imagen" : "Subir imagen"}
                </button>
              </div>
              {previewImage && !editingId && (
                <div className="mt-2 relative w-16 h-16 rounded-md overflow-hidden">
                  <img
                    src={previewImage || "/placeholder.svg"}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                      e.currentTarget.onerror = null
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex items-end">
              <button
                onClick={agregarProducto}
                disabled={loading}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium rounded-md flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          )}

          {/* Tabla de productos */}
          <div className="rounded-md border border-gray-700 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-gray-200 px-4 py-3 w-[80px] text-center">ID</th>
                  <th className="text-gray-200 px-4 py-3">Imagen</th>
                  <th className="text-gray-200 px-4 py-3">Nombre</th>
                  <th className="text-gray-200 px-4 py-3">Precio</th>
                  <th className="text-gray-200 px-4 py-3">Stock</th>
                  <th className="text-gray-200 px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-6 px-4">
                      No hay vapers en el inventario
                    </td>
                  </tr>
                ) : (
                  productos.map((producto) => (
                    <tr key={producto.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-center font-medium">{producto.id}</td>
                      <td className="px-4 py-3">
                        {editingId === producto.id ? (
                          <div>
                            <input
                              type="file"
                              ref={editFileInputRef}
                              onChange={handleEditImageSelect}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => editFileInputRef.current?.click()}
                              className="px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center text-xs"
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              {editImagenFile ? "Cambiar" : "Subir"}
                            </button>
                            {previewImage && (
                              <div className="mt-2 relative w-12 h-12 rounded-md overflow-hidden">
                                <img
                                  src={previewImage || "/placeholder.svg"}
                                  alt="Vista previa"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg"
                                    e.currentTarget.onerror = null
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center">
                            {producto.imagen ? (
                              <img
                                src={getImageUrl(producto.imagen) || "/placeholder.svg"}
                                alt={producto.nombre}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error("Error al cargar imagen:", producto.imagen)
                                  e.currentTarget.src = "/placeholder.svg"
                                  e.currentTarget.onerror = null
                                }}
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-gray-500" />
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === producto.id ? (
                          <input
                            name="nombre"
                            value={editValues.nombre}
                            onChange={handleEditChange}
                            className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                            className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                            className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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

      {/* Footer */}
      <footer className="mt-8 p-4 text-center text-gray-400 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm">© {new Date().getFullYear()} VAPORZONE - Todos los derechos reservados</p>
          <p className="text-xs mt-1 text-gray-500">Diseñado con ♥ para amantes del vapeo</p>
        </div>
      </footer>
    </div>
  )
}

export default Inventario

