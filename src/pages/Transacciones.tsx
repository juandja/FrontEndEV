"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react";
import { ChevronLeft, ChevronRight, User, LogOut } from 'lucide-react'
import axios from "axios"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "../components/ui/alert";

const API_URL = "http://localhost:8000/api/transacciones/"
const PRODUCTOS_URL = "http://localhost:8000/api/productos/"

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

interface Transaccion {
  id: number
  tipo: string
  monto: number
  descripcion: string
  producto: number
  cantidad: number
  fecha: string
}

interface Producto {
  id: number
  nombre: string
  precio: number
  stock: number
  descripcion: string
}


export default function Transacciones() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [form, setForm] = useState({
    tipo: "",
    monto: "",
    descripcion: "",
    producto: "",
    cantidad: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [stockError, setStockError] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("token"))
  const [buscandoProducto, setBuscandoProducto] = useState(false)

  const token = localStorage.getItem("token")
    const navigate = useNavigate()

  useEffect(() => {
    fetchTransacciones()
  }, [])

  const fetchTransacciones = async () => {
    if (!token) {
      toast.error("No hay token disponible")
      return
    }

    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTransacciones(response.data)
    } catch (error) {
      toast.error("Error al obtener transacciones")
    }
  }

  const buscarProducto = async (id: string) => {
    if (!id || !token) return

    setBuscandoProducto(true)
    setProductoSeleccionado(null)
    setStockError(false)

    try {
      const response = await axios.get(`${PRODUCTOS_URL}${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProductoSeleccionado(response.data)
    } catch (error) {
      toast.error("Producto no encontrado")
      setProductoSeleccionado(null)
    } finally {
      setBuscandoProducto(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token") // Eliminar token de sesión
    setIsAuthenticated(false)
    navigate("/home") // Redirigir al home
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })

    if (name === "producto" && value) {
      buscarProducto(value)
    }

    if (name === "cantidad" && productoSeleccionado) {
      const cantidad = Number.parseInt(value)
      setStockError(cantidad > productoSeleccionado.stock)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (stockError) {
      toast.error("No hay suficiente stock disponible")
      return
    }

    setIsLoading(true)

    if (!token) {
      toast.error("No hay token disponible")
      setIsLoading(false)
      return
    }

    try {
      await axios.post(API_URL, form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Transacción creada")
      fetchTransacciones()
      // Limpiar el formulario
      setForm({
        tipo: "",
        monto: "",
        descripcion: "",
        producto: "",
        cantidad: "",
      })
      setProductoSeleccionado(null)
    } catch (error) {
      toast.error("Error al enviar transacción")
    } finally {
      setIsLoading(false)
    }
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
        <div className="items-center justify-center border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">

       </div >

       <div className="w-full flex justify-center">
        <Link
          to="/inventario"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium transition-all duration-300 hover:brightness-110 hover:scale-105 shadow-md"
        >
          Ver Inventario
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
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
              <User className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </Button>
          </Link>
        )}
      </header>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-purple-400">Gestión de Transacciones</h2>

        <Card className="bg-zinc-900 border-zinc-800 mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Tipo</label>
                  <Input
                    name="tipo"
                    placeholder="ingreso/inversión"
                    value={form.tipo}
                    onChange={handleChange}
                    required
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Monto</label>
                  <Input
                    name="monto"
                    placeholder="Monto"
                    type="number"
                    value={form.monto}
                    onChange={handleChange}
                    required
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Descripción</label>
                <Input
                  name="descripcion"
                  placeholder="Descripción"
                  value={form.descripcion}
                  onChange={handleChange}
                  required
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">ID del producto</label>
                  <Input
                    name="producto"
                    placeholder="ID del producto"
                    type="number"
                    value={form.producto}
                    onChange={handleChange}
                    required
                    className="bg-zinc-800 border-zinc-700"
                  />
                  {buscandoProducto && (
                    <div className="flex items-center mt-2 text-sm text-gray-400">
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Buscando producto...
                    </div>
                  )}
                  {productoSeleccionado && (
                    <div className="mt-2 text-sm">
                      <p className="text-purple-400">{productoSeleccionado.nombre}</p>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="bg-zinc-800 text-gray-300">
                          Stock: {productoSeleccionado.stock}
                        </Badge>
                        <Badge variant="outline" className="ml-2 bg-zinc-800 text-gray-300">
                          ${productoSeleccionado.precio}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Cantidad</label>
                  <Input
                    name="cantidad"
                    placeholder="Cantidad"
                    type="number"
                    value={form.cantidad}
                    onChange={handleChange}
                    required
                    className={`bg-zinc-800 border-zinc-700 ${stockError ? "border-red-500" : ""}`}
                  />
                  {stockError && (
                    <Alert variant="destructive" className="mt-2 py-2 bg-red-900/50 border-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs ml-2">
                        Stock insuficiente. Disponible: {productoSeleccionado?.stock}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || stockError}
                className="mt-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Registrar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <h3 className="text-xl font-bold mb-4 text-purple-400">Historial de Transacciones</h3>

        <div className="grid gap-4">
          {transacciones.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay transacciones registradas</p>
          ) : (
            transacciones.map((trx) => (
              <Card key={trx.id} className="bg-zinc-900 border-zinc-800 hover:border-purple-800 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className={`mb-2 ${trx.tipo === "ingreso" ? "bg-green-600" : "bg-blue-600"}`}>
                        {trx.tipo}
                      </Badge>
                      <p className="text-lg font-medium">${trx.monto}</p>
                      <p className="text-gray-400 text-sm mt-1">{trx.descripcion}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        <span className="text-gray-500">ID Producto:</span> {trx.producto}
                      </p>
                      <p className="text-sm text-gray-400">
                        <span className="text-gray-500">Cantidad:</span> {trx.cantidad}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">{new Date(trx.fecha).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

