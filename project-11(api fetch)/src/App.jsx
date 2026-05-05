import { useState, useEffect } from 'react';
import axios from 'axios';
import BookList from './components/BookList';
import './App.css';

function App() {
  const [book, setBook] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        'https://api.freeapi.app/api/v1/public/books',
      );

      setBook(res.data.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => {
      fetchBook();
    }, 0);

    return () => clearTimeout(id);
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Discover Top Books</h1>
        <p>Explore the best books curated just for you</p>
      </header>

      {loading ? (
        <div className="loader">Loading amazing books...</div>
      ) : (
        <BookList books={book} />
      )}
    </div>
  );
}

export default App;
