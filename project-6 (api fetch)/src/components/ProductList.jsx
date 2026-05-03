import ProductCard from './ProductCard';
import '../styles/ProductList.css';

function ProductList({ products, loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="products-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-container">
        <div className="error">
          <h2>Error Loading Products</h2>
          <p>{error}</p>
          <button onClick={onRetry} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="products-container">
        <div className="no-products">
          <p>No products available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Our Products</h1>
        <p className="subtitle">Discover our amazing collection</p>
      </div>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product._id || product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default ProductList;
