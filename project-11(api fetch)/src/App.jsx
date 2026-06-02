import { useState, useEffect } from 'react';
import axios from 'axios';
import BookList from './components/BookList';
import './App.css';

function App() {
  const [book, setBook] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredBooks = book.filter((item) => {
    const title = item.volumeInfo?.title || '';
    const authors = item.volumeInfo?.authors?.join(' ') || '';
    return title.toLowerCase().includes(searchQuery.toLowerCase()) || authors.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-logo">BookDiscover</div>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search by title or author..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </nav>

      <header className="app-header">
        <h1>Discover Top Books</h1>
        <p>Explore the best books curated just for you</p>
      </header>

      {loading ? (
        <div className="loader">Loading amazing books...</div>
      ) : (
        <BookList books={filteredBooks} />
      )}
    </div>
  );
}

export default App;
