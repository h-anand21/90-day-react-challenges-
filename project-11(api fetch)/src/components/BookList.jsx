import React, { useState } from 'react';
import BookCard from './BookCard';

const BookList = ({ books }) => {
  const [visibleCount, setVisibleCount] = useState(6);

  const loadNextCard = () => {
    if (visibleCount < books.length) {
      setVisibleCount(prev => prev + 6);
    }
  };

  if (!books || books.length === 0) {
    return <div className="loading-state">Looking for books...</div>;
  }

  return (
    <div className="book-list-wrapper">
      <div className="books-grid">
        {books.slice(0, visibleCount).map((item) => (
          <BookCard key={item.id} book={item} />
        ))}
      </div>
      
      {visibleCount < books.length && (
        <div className="button-container">
          <button className="load-next-button" onClick={loadNextCard}>
            Load Next Book
          </button>
        </div>
      )}
      
      {visibleCount >= books.length && books.length > 0 && (
        <div className="end-message">You've reached the end of the collection!</div>
      )}
    </div>
  );
};

export default BookList;
