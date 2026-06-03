import { useState, useEffect } from 'react';
import axios from 'axios';
import BookList from './components/BookList';
import BookDetail from './pages/BookDetail';
import './App.css';

function App() {
  const [book, setBook] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

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

  if (selectedBook) {
    return <BookDetail book={selectedBook} onBack={() => setSelectedBook(null)} theme={theme} toggleTheme={toggleTheme} />;
  }

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
        <button 
          onClick={toggleTheme} 
          style={{
            background: 'var(--card-bg)', 
            border: '1px solid var(--card-border)', 
            color: 'var(--text-primary)', 
            padding: '0.6rem 1rem', 
            borderRadius: '20px', 
            cursor: 'pointer',
            fontWeight: '600',
            marginLeft: '1rem',
            whiteSpace: 'nowrap'
          }}
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </nav>

      <header className="app-header">
        <h1>Discover Top Books</h1>
        <p>Explore the best books curated just for you</p>
      </header>

      {loading ? (
        <div className="loader">Loading amazing books...</div>
      ) : (
        <BookList books={filteredBooks} onBookSelect={setSelectedBook} />
      )}
    </div>
  );
}

export default App;
