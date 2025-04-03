"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, User, LogOut } from "lucide-react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"

// Product type definition
interface Product {
  id: number
  nombre: string
  precio: number
  imagen: string
  descripcion: string
  stock: number
  categoria?: string
}

export default function HomePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("token"))
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true; // Para evitar actualizaciones en un componente desmontado
  
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://127.0.0.1:8000/productos-publicos/");
        console.log("Products loaded:", response.data);
  
        if (isMounted) {
          setProducts(response.data);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        if (isMounted) {
          setError("No se pudieron cargar los productos. Por favor, intenta de nuevo más tarde.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
  
    fetchProducts();
  
    return () => {
      isMounted = false; // Limpieza al desmontar el componente
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token") // Eliminar token de sesión
    setIsAuthenticated(false)
    navigate("/home") // Redirigir al home
  }

  // Función para obtener la URL completa de la imagen
  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return "/placeholder.svg?height=200&width=200"

    // Si la URL ya es absoluta (comienza con http:// o https://), usarla directamente
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath
    }

    // Si es una ruta relativa, construir la URL completa
    return `http://127.0.0.1:8000${imagePath}`
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current: container } = scrollContainerRef
      const scrollAmount = 340 // Approximate width of a card + margin

      if (direction === "left") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" })
      }

      // Check scroll position after animation
      setTimeout(() => {
        if (container.scrollLeft <= 10) {
          setShowLeftArrow(false)
        } else {
          setShowLeftArrow(true)
        }

        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          setShowRightArrow(false)
        } else {
          setShowRightArrow(true)
        }
      }, 300)
    }
  }

  return (
    <div className="min-h-screen w-full bg-black text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-4 md:p-6 w-full">
        <div className="flex items-center">
          <Link to={isAuthenticated ? "/inventario" : "/home"}>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent cursor-pointer">
              VAPOR<span className="font-light">ZONE</span>
            </h1>
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

      {/* Hero Section */}
      <section className="w-full px-4 md:px-6 py-12 md:py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Premium Vaping Experience</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          Discover our collection of high-quality vapes designed for the perfect balance of flavor and vapor
        </p>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          Shop Now
        </Button>
      </section>

      {/* Products Horizontal Scroll */}
      <section className="relative w-full px-4 md:px-6 py-8">
        <h3 className="text-2xl font-semibold mb-6">Featured Products</h3>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="relative w-full">
            {/* Left scroll button */}
            {showLeftArrow && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-900/80 rounded-full p-2 text-white hover:bg-gray-800"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Products container */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 pt-2 px-2 -mx-2 w-full"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {products.length > 0 ? (
                products.map((product) => (
                  <Card
                    key={product.id}
                    className="flex-shrink-0 w-[300px] bg-gray-900 border-gray-800 hover:border-gray-700 transition-all"
                  >
                    <CardContent className="p-0">
                      <div className="aspect-square bg-gray-800 relative overflow-hidden">
                        <img
                          src={getImageUrl(product.imagen) || "/placeholder.svg"}
                          alt={product.nombre}
                          className="object-cover w-full h-full transition-transform hover:scale-105"
                          onError={(e) => {
                            console.error("Error al cargar imagen:", product.imagen)
                            e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                            e.currentTarget.onerror = null
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <p className="text-xl font-bold">${product.precio}</p>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-lg font-medium mb-2">{product.nombre}</h4>
                        <p className="text-gray-400 text-sm mb-4">{product.descripcion}</p>
                        {product.stock > 0 ? (
                          <Button variant="outline" size="sm" className="w-full border-gray-700 hover:bg-gray-800">
                            Añadir al Carrito
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-gray-700 bg-gray-800 opacity-50"
                            disabled
                          >
                            Agotado
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex justify-center items-center w-full py-8">
                  <p className="text-gray-400">No hay productos disponibles</p>
                </div>
              )}
            </div>

            {/* Right scroll button */}
            {showRightArrow && products.length > 0 && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-900/80 rounded-full p-2 text-white hover:bg-gray-800"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="w-full px-4 md:px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 p-6 rounded-xl border border-purple-800/30">
          <h3 className="text-xl font-semibold mb-2">Disposable Vapes</h3>
          <p className="text-gray-400 mb-4">Ready to use right out of the box</p>
          <Button variant="link" className="text-purple-400 p-0 hover:text-purple-300">
            View Collection →
          </Button>
        </div>
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-6 rounded-xl border border-blue-800/30">
          <h3 className="text-xl font-semibold mb-2">Pod Systems</h3>
          <p className="text-gray-400 mb-4">Compact and refillable options</p>
          <Button variant="link" className="text-blue-400 p-0 hover:text-blue-300">
            View Collection →
          </Button>
        </div>
        <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/20 p-6 rounded-xl border border-indigo-800/30">
          <h3 className="text-xl font-semibold mb-2">E-Liquids</h3>
          <p className="text-gray-400 mb-4">Premium flavors for any device</p>
          <Button variant="link" className="text-indigo-400 p-0 hover:text-indigo-300">
            View Collection →
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-gray-800 mt-12 py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 mb-4 md:mb-0">© 2024 VaporZone. All rights reserved.</p>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              About
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              Contact
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              Terms
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              Privacy
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}

