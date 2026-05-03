import '../styles/ProductCard.css';

function ProductCard({ product }) {
  const {
    title,
    description,
    price,
    discountPercentage,
    rating,
    stock,
    thumbnail,
    images,
  } = product;

  const productImage = thumbnail || (images && images[0]) || '/placeholder.jpg';
  const discountedPrice = price
    ? (price * (1 - (discountPercentage || 0) / 100)).toFixed(2)
    : 0;
  const hasDiscount = discountPercentage && discountPercentage > 0;

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={productImage}
          alt={title}
          className="product-image"
          onError={(e) => {
            e.target.src = '/placeholder.jpg';
          }}
        />
        {hasDiscount && (
          <div className="discount-badge">-{discountPercentage}%</div>
        )}
        {stock === 0 && (
          <div className="out-of-stock-overlay">Out of Stock</div>
        )}
      </div>

      <div className="product-content">
        <h3 className="product-title">{title}</h3>

        {description && <p className="product-description">{description}</p>}

        <div className="product-rating">
          <span className="stars">
            {'★'.repeat(Math.floor(rating || 0))}
            {'☆'.repeat(5 - Math.floor(rating || 0))}
          </span>
          <span className="rating-text">({rating || 'N/A'}/5)</span>
        </div>

        <div className="product-price">
          {hasDiscount ? (
            <>
              <span className="original-price">${price.toFixed(2)}</span>
              <span className="discounted-price">${discountedPrice}</span>
            </>
          ) : (
            <span className="current-price">
              ${price ? price.toFixed(2) : 'N/A'}
            </span>
          )}
        </div>

        <div className="product-stock">
          <span
            className={`stock-status ${stock > 0 ? 'in-stock' : 'out-of-stock'}`}
          >
            {stock > 0 ? `${stock} in stock` : 'Out of Stock'}
          </span>
        </div>

        <button
          className={`add-to-cart-btn ${stock === 0 ? 'disabled' : ''}`}
          disabled={stock === 0}
        >
          {stock > 0 ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
