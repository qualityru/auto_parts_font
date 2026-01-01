import { useState } from 'react'

function ProductCard({ 
  product, 
  index, 
  isExpanded, 
  onToggleWarehouses, 
  onAddToCart, 
  onOpenImageModal, 
  isItemInCart 
}) {
  const images = product.images || []
  const warehouses = product.warehouses || []
  const metadata = product.metadata || {}
  const isCross = metadata.is_cross || false
  const minPrice = metadata.min_price || 0
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAllWarehouses, setShowAllWarehouses] = useState(isExpanded || false)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  // Функция для преобразования URL картинок
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    
    // Если URL абсолютный (http:// или https://)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Если URL начинается с /static/, это картинки с бекенда
    // Nginx должен проксировать их на 77.238.232.189:8015
    if (imageUrl.startsWith('/static/')) {
      return imageUrl; // Оставляем как есть, nginx проксирует
    }
    
    // Если относительный URL без префикса
    if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
      return `/${imageUrl}`;
    }
    
    return imageUrl;
  }

  // Placeholder для отсутствующих картинок
  const getPlaceholderImage = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyMCIgdmlld0JveD0iMCAwIDQwMCAyMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMjAiIGZpbGw9IiNGNUY3RkEiLz48cGF0aCBkPSJNMjAwIDcwQzIzMS4zNiA3MCAyNTYgNTkuMzYgMjU2IDQ1QzI1NiAzMC42NCAyMzEuMzYgMjAgMjAwIDIwQzE2OC42NCAyMCAxNDQgMzAuNjQgMTQ0IDQ1QzE0NCA1OS4zNiAxNjguNjQgNzAgMjAwIDcwWiIgZmlsbD0iI0RDRUZGQyIvPjxwYXRoIGQ9Ik01MCAxNjBDMjguMzYgMTYwIDggMTQ3LjY0IDggMTMwQzggMTEyLjM2IDI4LjMzIDEwMCA1MCAxMDBMNzAgMTAwTDEwMCA0MEwyMDAgNDBMMjcwIDEwMEwzMTAgMTAwTDM1MCAxMDBDMzcxLjY0IDEwMCAzOTIgMTEyLjM2IDM5MiAxMzBDMzkyIDE0Ny42NCAzNzEuNjQgMTYwIDM1MCAxNjBINDBaIiBmaWxsPSIjRUNFRkZGIi8+PC9zdmc+';
  }

  // Обработчик ошибок загрузки картинок
  const handleImageError = (e) => {
    console.warn('Ошибка загрузки картинки:', e.target.src);
    e.target.onerror = null; // Предотвращаем бесконечный цикл
    e.target.src = getPlaceholderImage();
  }

  // Если isExpanded меняется извне, обновляем локальное состояние
  useState(() => {
    setShowAllWarehouses(isExpanded)
  }, [isExpanded])

  const visibleWarehouses = showAllWarehouses ? warehouses : warehouses.slice(0, 2)
  const validImages = images.filter(img => img && img.trim() !== '')

  const handleImageClick = () => {
    if (validImages.length > 0) {
      onOpenImageModal()
    }
  }

  const handleToggleWarehouses = () => {
    const newState = !showAllWarehouses
    setShowAllWarehouses(newState)
    // Вызываем родительскую функцию, если она предоставлена
    if (onToggleWarehouses) {
      onToggleWarehouses()
    }
  }

  const handleAddToCartClick = (warehouse) => {
    if (onAddToCart) {
      onAddToCart(product, warehouse)
    }
  }

  return (
    <div className="product-card" style={{ animationDelay: `${0.1 + index * 0.1}s` }}>
      <div className="image-gallery" onClick={handleImageClick}>
        {validImages.length > 0 ? (
          <div className="gallery-container">
            <div className="gallery-slides" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
              {validImages.map((src, idx) => {
                const imageUrl = getImageUrl(src);
                return (
                  <div key={idx} className="gallery-slide">
                    <img 
                      src={imageUrl} 
                      alt={`Изображение ${idx + 1}`}
                      onError={handleImageError}
                      loading="lazy"
                    />
                  </div>
                )
              })}
            </div>
            {validImages.length > 1 && (
              <>
                <div className="image-indicators">
                  {validImages.map((_, idx) => (
                    <div
                      key={idx}
                      className={`indicator ${idx === currentImageIndex ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentImageIndex(idx)
                      }}
                    ></div>
                  ))}
                </div>
                <div className="image-count">
                  <i className="fas fa-images"></i> {validImages.length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="no-image">
            <i className="fas fa-camera-slash"></i>
            <span>Изображение отсутствует</span>
          </div>
        )}
      </div>
      
      <div className="product-content">
        <div className="product-header">
          <div className="product-brand">{product.brand || 'Без бренда'}</div>
          <div className="product-title">{product.name || 'Название не указано'}</div>
          <div className="product-article">
            <span>Артикул: {product.article || '—'}</span>
            {isCross && <span className="cross-badge">Аналог</span>}
          </div>
          <div className="tags-container">
            {product.supplier && (
              <span className="tag tag-supplier">
                <i className="fas fa-truck"></i> {product.supplier}
              </span>
            )}
            {warehouses.length > 0 ? (
              <span className="tag tag-stock">
                <i className="fas fa-check"></i> В наличии
              </span>
            ) : (
              <span className="tag tag-no-stock">
                <i className="fas fa-times"></i> Нет в наличии
              </span>
            )}
            {isCross && (
              <span className="tag tag-cross">
                <i className="fas fa-exchange-alt"></i> Аналог
              </span>
            )}
          </div>
        </div>
        
        <div className="price-actions">
          <div className="price-info">
            <div className="best-price-container">
              <div className="min-price">{formatPrice(minPrice)} ₽</div>
              <div className="price-label">Лучшая цена</div>
            </div>
          </div>
        </div>
        
        {warehouses.length > 0 && (
          <div className="warehouses-section">
            <div className="warehouses-title">
              <i className="fas fa-warehouse"></i>
              <span>Наличие на складах ({warehouses.length})</span>
            </div>
            <div className="warehouses-list">
              {visibleWarehouses.map((warehouse, idx) => {
                const inCart = isItemInCart ? isItemInCart(product.id, warehouse.id) : false
                
                return (
                  <div key={idx} className="warehouse-card">
                    <div className="warehouse-info">
                      <h4>
                        {warehouse.name || 'Основной склад'}
                      </h4>
                      <div className="warehouse-details">
                        <div className="detail-item">
                          <i className="fas fa-box"></i>
                          <span>{warehouse.quantity || 0} шт.</span>
                        </div>
                        {warehouse.delivery_days && (
                          <div className="detail-item">
                            <i className="fas fa-clock"></i>
                            <span>{warehouse.delivery_days} дн.</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="warehouse-price">
                      <div className="warehouse-price-row">
                        <div className="price">{formatPrice(warehouse.price || 0)}</div>
                        <div className="currency">{warehouse.currency || 'RUB'}</div>
                        <button
                          className={`small-cart-btn ${inCart ? 'added' : ''}`}
                          onClick={() => handleAddToCartClick(warehouse)}
                          title="Добавить в корзину"
                          disabled={inCart}
                        >
                          <i className={inCart ? 'fas fa-check' : 'fas fa-cart-plus'}></i>
                        </button>
                      </div>
                      <div className="quantity">{warehouse.quantity || 0} шт.</div>
                    </div>
                  </div>
                )
              })}
              
              {warehouses.length > 2 && (
                <div className="more-warehouses-btn">
                  <button 
                    className="more-btn" 
                    onClick={handleToggleWarehouses}
                  >
                    <i className={`fas fa-${showAllWarehouses ? 'chevron-up' : 'ellipsis-h'}`}></i>
                    <span>
                      {showAllWarehouses ? 'Скрыть' : `Показать ещё ${warehouses.length - 2} складов`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard