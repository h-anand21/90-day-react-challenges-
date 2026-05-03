import { useState, useEffect } from 'react';
import ProductList from './components/ProductList';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://api.freeapi.app/api/v1/public/randomproducts',
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        // Handle the API response structure
        let productList = [];
        if (data.success && data.data) {
          // Response format: { success: true, data: { products: [...] } }
          if (Array.isArray(data.data)) {
            productList = data.data;
          } else if (data.data.products && Array.isArray(data.data.products)) {
            productList = data.data.products;
          } else if (data.data.docs && Array.isArray(data.data.docs)) {
            productList = data.data.docs;
          } else if (typeof data.data === 'object') {
            // If data.data is an object with product arrays, find the first array
            const arrays = Object.values(data.data).filter((v) =>
              Array.isArray(v),
            );
            productList = arrays.length > 0 ? arrays[0] : [];
          }
        } else if (Array.isArray(data)) {
          productList = data;
        } else if (data.data && Array.isArray(data.data)) {
          productList = data.data;
        } else if (data.products && Array.isArray(data.products)) {
          productList = data.products;
        }

        if (productList.length === 0) {
          throw new Error('No products found in API response');
        }

        setProducts(productList);

        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleRetry = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://api.freeapi.app/api/v1/public/randomproducts',
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      let productList = [];
      if (data.success && data.data) {
        if (Array.isArray(data.data)) {
          productList = data.data;
        } else if (data.data.products && Array.isArray(data.data.products)) {
          productList = data.data.products;
        } else if (data.data.docs && Array.isArray(data.data.docs)) {
          productList = data.data.docs;
        } else if (typeof data.data === 'object') {
          const arrays = Object.values(data.data).filter((v) =>
            Array.isArray(v),
          );
          productList = arrays.length > 0 ? arrays[0] : [];
        }
      } else if (Array.isArray(data)) {
        productList = data;
      } else if (data.data && Array.isArray(data.data)) {
        productList = data.data;
      } else if (data.products && Array.isArray(data.products)) {
        productList = data.products;
      }

      if (productList.length === 0) {
        throw new Error('No products found in API response');
      }

      setProducts(productList);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app">
      <ProductList
        products={products}
        loading={loading}
        error={error}
        onRetry={handleRetry}
      />
    </main>
  );
}

export default App;
