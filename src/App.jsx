import { useState, useRef, useCallback } from 'react'
import './styles/App.css'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import ProductCard from './components/ProductCard'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorMessage from './components/ErrorMessage'
import EmptyState from './components/EmptyState'
import CartModal from './components/CartModal'
import AccountModal from './components/AccountModal'
import ImageModal from './components/ImageModal'
import { searchProductsStream } from './utils/api'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Храним товары в массиве, но группируем по ключу (Бренд + Артикул)
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState(new Set())
  
  const [showCartModal, setShowCartModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [imageModalData, setImageModalData] = useState(null)
  const [cartItems, setCartItems] = useState([])
  
  const activeStream = useRef(null)

  // Поиск в корзине по внутреннему ID товара и ID склада
  const isItemInCart = useCallback((productId, warehouseId) => {
    return cartItems.some(item => 
      item.productId === productId && item.warehouseId === warehouseId
    )
  }, [cartItems])

  const handleSearch = async (query = null) => {
    const searchTerm = query || searchQuery.trim()
    if (!searchTerm) {
      setError('Введите артикул')
      return
    }

    if (activeStream.current) activeStream.current.abort()
    
    setIsLoading(true)
    setError(null)
    setProducts([])
    setSuppliers(new Set())
    setSearchQuery(searchTerm)
    
    const stream = searchProductsStream(searchTerm, {
      onItem: (newItem) => {
        setProducts(prev => {
          // Создаем уникальный ключ для группировки (регистронезависимый)
          const groupKey = `${newItem.brand}-${newItem.article}`.toLowerCase().replace(/\s+/g, '')
          
          const existingProductIndex = prev.findIndex(p => p.groupKey === groupKey)

          if (existingProductIndex > -1) {
            // Если такой товар уже есть, добавляем новые склады в его список
            const updatedProducts = [...prev]
            const existingProduct = updatedProducts[existingProductIndex]
            
            // Добавляем склады, помечая, от какого они поставщика
            const newWarehouses = newItem.warehouses.map(w => ({
              ...w,
              supplier: newItem.supplier // прокидываем имя поставщика в склад
            }))

            updatedProducts[existingProductIndex] = {
              ...existingProduct,
              warehouses: [...existingProduct.warehouses, ...newWarehouses],
              // Обновляем описание или имя, если они были пустыми
              name: existingProduct.name || newItem.name,
              description: existingProduct.description || newItem.description
            }
            return updatedProducts
          } else {
            // Если товара нет, создаем новую карточку
            const firstWarehouses = newItem.warehouses.map(w => ({
              ...w,
              supplier: newItem.supplier
            }))

            return [...prev, { 
              ...newItem, 
              groupKey, 
              internalId: groupKey, 
              warehouses: firstWarehouses 
            }]
          }
        })
        setSuppliers(prev => new Set(prev).add(newItem.supplier))
      },
      onImages: ({ article, images }) => {
        setProducts(prev => prev.map(p => 
          p.article.toLowerCase() === article.toLowerCase()
            ? { ...p, images: Array.from(new Set([...(p.images || []), ...images])) } 
            : p
        ))
      },
      onDone: () => setIsLoading(false),
      onError: (err) => {
        setError(`Ошибка поиска: ${err.error}`)
        setIsLoading(false)
      },
      onEnd: () => setIsLoading(false)
    })

    activeStream.current = stream
    await stream.start()
  }

  const handleAddToCart = (product, warehouse) => {
    setCartItems(prev => {
      // ID склада берем из данных склада (он должен быть уникальным от API)
      const warehouseId = warehouse.id || `${warehouse.supplier}-${warehouse.name}-${warehouse.price}`
      const existingIndex = prev.findIndex(item => 
        item.productId === product.internalId && item.warehouseId === warehouseId
      )
      
      if (existingIndex > -1) {
        const newItems = [...prev]
        newItems[existingIndex].quantity += 1
        return newItems
      } else {
        return [...prev, {
          productId: product.internalId,
          warehouseId: warehouseId,
          brand: product.brand,
          name: product.name,
          article: product.article,
          image: product.images?.[0] || '',
          price: warehouse.price,
          currency: warehouse.currency || 'RUB',
          quantity: 1,
          warehouseName: warehouse.name,
          supplier: warehouse.supplier // Сохраняем, чей это склад
        }]
      }
    })
  }

  // Остальные методы (remove, clear, total) остаются без изменений...
  const handleRemoveFromCart = (productId, warehouseId) => {
    setCartItems(prev => prev.filter(item => !(item.productId === productId && item.warehouseId === warehouseId)))
  }

  return (
    <div className="app">
      <div className="header-controls">
        <button className="header-btn account-btn" onClick={() => setShowAccountModal(true)}><i className="fas fa-user"></i></button>
        <button className="header-btn cart-btn" onClick={() => setShowCartModal(true)}>
          <i className="fas fa-shopping-cart"></i>
          {cartItems.length > 0 && <span className="cart-count">{cartItems.length}</span>}
        </button>
      </div>

      <Header onExampleSearch={(q) => { setSearchQuery(q); handleSearch(q); }} />
      
      <div className="container">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={handleSearch} />
        
        <div className="main-content">
          {isLoading && products.length === 0 && <LoadingSpinner />}
          {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
          
          {products.length > 0 && (
            <div className="results-section">
              <div className="results-header">
                <h2>Найдено товаров: {products.length} {isLoading && <small>(загрузка...)</small>}</h2>
                <div className="suppliers-container">
                  {[...suppliers].map((s, i) => <div key={i} className="supplier-badge">{s}</div>)}
                </div>
              </div>
              
              <div className="products-grid">
                {products
                  .sort((a, b) => (a.is_cross === b.is_cross) ? 0 : a.is_cross ? 1 : -1) // Сначала оригиналы, потом кроссы
                  .map((product, index) => (
                    <ProductCard
                      key={product.internalId}
                      product={product}
                      index={index}
                      onAddToCart={handleAddToCart}
                      onOpenImageModal={() => setImageModalData({ images: product.images, productInfo: product })}
                      isItemInCart={isItemInCart}
                    />
                ))}
              </div>
            </div>
          )}
          {!isLoading && products.length === 0 && !error && <EmptyState onExampleSearch={(q) => { setSearchQuery(q); handleSearch(q); }} />}
        </div>
      </div>

      {showCartModal && (
        <CartModal
          cartItems={cartItems}
          onClose={() => setShowCartModal(false)}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={() => setCartItems([])}
          getCartTotal={() => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)}
        />
      )}
      {showAccountModal && <AccountModal onClose={() => setShowAccountModal(false)} />}
      {imageModalData && <ImageModal images={imageModalData.images} productInfo={imageModalData.productInfo} onClose={() => setImageModalData(null)} />}
    </div>
  )
}

export default App