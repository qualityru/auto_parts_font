import { useState } from 'react'

function ProductCard({
  product,
  index,
  onAddToCart,
  isItemInCart,
  onOpenImageModal,
}) {
  const [showAll, setShowAll] = useState(false)

  const warehouses = showAll
    ? product.warehouses
    : product.warehouses.slice(0, 3)

  // Используем правильное определение минимальной цены
  const minPrice = product.warehouses?.length > 0
    ? Math.min(...product.warehouses.map(w => w.price || 0))
    : 0

  // Правильное определение кросса
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

  // Получаем информацию о возврате из supplier_info
  const getReturnInfo = (warehouse) => {
    const info = warehouse.supplier_info?.original_data
    if (!info) return { text: 'без возврата', days: null }
    
    if (info.return_type?.id === '3') {
      return { text: 'без возврата', days: null }
    }
    
    const returnType = info.return_type?.name || ''
    const hasReturn = returnType.includes('Возврат возможен')
    
    return {
      text: hasReturn ? 'возврат' : 'без возврата',
      days: info.back_days || null
    }
  }

  return (
    <div
      className="product-card ultra-compact"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* IMAGE */}
      <div
        className="image-gallery ultra-compact"
        onClick={onOpenImageModal}
      >
        {product.images?.length ? (
          <img src={product.images[0]} alt={product.name} loading="lazy" />
        ) : (
          <div className="no-image">Нет фото</div>
        )}
      </div>

      <div className="product-content ultra-compact">
        {/* TOP LINE */}
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

        {/* BRAND */}
        {product.brand && (
          <div className="brand-badge">
            {product.brand}
          </div>
        )}

        {/* TITLE */}
        <h3 className="product-title ultra-compact" title={product.name}>
          {product.name || 'Без названия'}
        </h3>

        {/* PRICE */}
        <div className="price-row ultra-compact">
          <span className="price">{formatPrice(minPrice)}</span>
          <span className="currency">₽</span>
          <span className="price-note">от {warehouses.length} склада(ов)</span>
        </div>

        {/* WAREHOUSES */}
        <div className="warehouses ultra-compact">
          {warehouses.map(w => {
            const inCart = isItemInCart(product.internalId, w.id)
            const returnInfo = getReturnInfo(w)
            const quantity = w.quantity || 0
            const isAvailable = w.is_available !== false && quantity > 0
            
            return (
              <div key={w.id || `${product.id}-${w.name}`} className="warehouse-row">
                <div className="warehouse-left">
                  <span className={isAvailable ? 'ok' : 'warn'}>
                    {isAvailable ? `В наличии: ${quantity}` : 'Нет в наличии'}
                  </span>

                  {w.delivery_days && (
                    <span className="delivery">{w.delivery_days} дн</span>
                  )}

                  {/* Отображаем поставщика склада, если он отличается от основного */}
                  {w.supplier && w.supplier !== product.supplier && (
                    <span className="wh-supplier" title={`Поставщик склада: ${w.supplier}`}>
                      {w.supplier}
                    </span>
                  )}

                  <span className={returnInfo.days ? 'return' : 'no-return'}>
                    {returnInfo.days ? `${returnInfo.text} ${returnInfo.days} дн` : returnInfo.text}
                  </span>
                </div>

                <div className="warehouse-right">
                  <span className="wh-price" title="Цена за единицу">
                    {formatPrice(w.price || 0)}
                  </span>

                  <button
                    className={`cart-btn ${inCart ? 'added' : ''} ${!isAvailable ? 'disabled' : ''}`}
                    disabled={!isAvailable}
                    onClick={() => isAvailable && onAddToCart(product, w)}
                    title={isAvailable ? 'Добавить в корзину' : 'Нет в наличии'}
                  >
                    <i className={inCart ? 'fas fa-check' : 'fas fa-cart-plus'} />
                  </button>
                </div>
              </div>
            )
          })}

          {product.warehouses.length > 3 && (
            <button
              className="more-compact"
              onClick={() => setShowAll(v => !v)}
            >
              {showAll ? 'Скрыть' : `Ещё ${product.warehouses.length - 3} складов`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard