import { useEffect, useState } from 'react';
import './App.css';
import Qourt from './components/Qourt.jsx';

function App() {
  const [quotes, setQuotes] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `https://api.freeapi.app/api/v1/public/quotes?page=${page}&limit=1`,
          {
            method: 'GET',
            headers: { accept: 'application/json' },
            signal: controller.signal,
          },
        );

        const data = await response.json();
        const nextQuotes = data?.data?.data ?? [];

        if (isActive) {
          setQuotes(nextQuotes);
        }
      } catch (error) {
        if (error.name !== 'AbortError' && isActive) {
          setError('Unable to load quotes right now. Please try again.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [page]);

  const handleLoadMore = () => {
    setPage((currentPage) => currentPage + 1);
  };

  return (
    <main className="quotes-app">
      <Qourt
        quotes={quotes}
        error={error}
        loading={loading}  
        onLoadMore={handleLoadMore}
      />
    </main>
  );
}

export default App;
