import { useState } from 'react'

function ProductCard({
  product,
  index,
  onAddToCart,
  isItemInCart,
  onOpenImageModal,
}) {
  const [showAll, setShowAll] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = product.images || []
  const validImages = images.filter(img => img && img.trim() !== '')
  
  const warehouses = showAll
    ? product.warehouses
    : product.warehouses.slice(0, 3)

  const minPrice = product.warehouses?.length > 0
    ? Math.min(...product.warehouses.map(w => w.price || 0))
    : 0

  const isCross = product.is_cross === true || 
                 product.metadata?.is_cross === true ||
                 product.metadata?.original_data?.is_cross === 1

  const formatPrice = (price) => {
    if (typeof price !== 'number') return '0.00'
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  // --- Логика обработки URL картинок ---
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    if (imageUrl.startsWith('/static/')) {
      return imageUrl; // Nginx проксирует
    }
    if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
      return `/${imageUrl}`;
    }
    return imageUrl;
  }

  const getPlaceholderImage = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyMCIgdmlld0JveD0iMCAwIDQwMCAyMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMjAiIGZpbGw9IiNGNUY3RkEiLz48cGF0aCBkPSJNMjAwIDcwQzIzMS4zNiA3MCAyNTYgNTkuMzYgMjU2IDQ1QzI1NiAzMC42NCAyMzEuMzYgMjAgMjAwIDIwQzE2OC42NCAyMCAxNDQgMzAuNjQgMTQ0IDQ1QzE0NCA1OS4zNiAxNjguNjQgNzAgMjAwIDcwWiIgZmlsbD0iI0RDRUZGQyIvPjxwYXRoIGQ9Ik01MCAxNjBDMjguMzYgMTYwIDggMTQ3LjY0IDggMTMwQzggMTEyLjM2IDI4LjMzIDEwMCA1MCAxMDBMNzAgMTAwTDEwMCA0MEwyMDAgNDBMMjcwIDEwMEwzMTAgMTAwTDM1MCAxMDBDMzcxLjY0IDEwMCAzOTIgMTEyLjM2IDM5MiAxMzBDMzkyIDE0Ny42NCAzNzEuNjQgMTYwIDM1MCAxNjBINDBaIiBmaWxsPSIjRUNFRkZGIi8+PC9zdmc+';
  }

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = getPlaceholderImage();
  }

  const getReturnInfo = (warehouse) => {
    const info = warehouse.supplier_info?.original_data
    if (!info) return { text: 'без возврата', days: null }
    if (info.return_type?.id === '3') return { text: 'без возврата', days: null }
    const returnType = info.return_type?.name || ''
    const hasReturn = returnType.includes('Возврат возможен')
    return {
      text: hasReturn ? 'возврат' : 'без возврата',
      days: info.back_days || null
    }
  }

  return (
    <div className="product-card ultra-compact" style={{ animationDelay: `${index * 0.05}s` }}>
      {/* IMAGE GALLERY */}
      <div className="image-gallery ultra-compact" onClick={onOpenImageModal}>
        {validImages.length > 0 ? (
          <div className="gallery-container">
            <div 
              className="gallery-slides" 
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {validImages.map((src, idx) => (
                <div key={idx} className="gallery-slide">
                  <img 
                    src={getImageUrl(src)} 
                    alt={product.name} 
                    onError={handleImageError}
                    loading="lazy" 
                  />
                </div>
              ))}
            </div>
            {validImages.length > 1 && (
              <div className="image-indicators">
                {validImages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`indicator ${idx === currentImageIndex ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="no-image">Нет фото</div>
        )}
      </div>

      <div className="product-content ultra-compact">
        <div className="product-topline">
          {product.supplier && (
            <span className="meta supplier" title="Поставщик товара">
              {product.supplier}
            </span>
          )}
          <span className={`meta ${isCross ? 'cross' : 'orig'}`}>
            {isCross ? 'АНАЛОГ' : 'ОРИГИНАЛ'}
          </span>
          <span className="meta article" title="Артикул">
            {product.article}
          </span>
        </div>

        {product.brand && <div className="brand-badge">{product.brand}</div>}

        <h3 className="product-title ultra-compact" title={product.name}>
          {product.name || 'Без названия'}
        </h3>

        <div className="price-row ultra-compact">
          <span className="price">{formatPrice(minPrice)}</span>
          <span className="currency">₽</span>
          <span className="price-note">от {product.warehouses.length} склада(ов)</span>
        </div>

        <div className="warehouses ultra-compact">
          {warehouses.map(w => {
            const inCart = isItemInCart(product.internalId || product.id, w.id)
            const returnInfo = getReturnInfo(w)
            const quantity = w.quantity || 0
            const isAvailable = w.is_available !== false && quantity > 0
            
            return (
              <div key={w.id || `${product.id}-${w.name}`} className="warehouse-row">
                <div className="warehouse-left">
                  <span className={isAvailable ? 'ok' : 'warn'}>
                    {isAvailable ? `В наличии: ${quantity}` : 'Нет в наличии'}
                  </span>
                  {w.delivery_days && <span className="delivery">{w.delivery_days} дн</span>}
                  <span className={returnInfo.days ? 'return' : 'no-return'}>
                    {returnInfo.days ? `${returnInfo.text} ${returnInfo.days} дн` : returnInfo.text}
                  </span>
                </div>

                <div className="warehouse-right">
                  <span className="wh-price">{formatPrice(w.price || 0)}</span>
                  <button
                    className={`cart-btn ${inCart ? 'added' : ''} ${!isAvailable ? 'disabled' : ''}`}
                    disabled={!isAvailable}
                    onClick={() => isAvailable && onAddToCart(product, w)}
                  >
                    <i className={inCart ? 'fas fa-check' : 'fas fa-cart-plus'} />
                  </button>
                </div>
              </div>
            )
          })}

          {product.warehouses.length > 3 && (
            <button className="more-compact" onClick={() => setShowAll(v => !v)}>
              {showAll ? 'Скрыть' : `Ещё ${product.warehouses.length - 3} складов`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard