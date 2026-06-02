import React, { useState } from 'react';

const BookCard = ({ book }) => {
  const { volumeInfo } = book;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="book-card">
      <div className="image-container">
        <img 
          src={volumeInfo?.imageLinks?.thumbnail || 'https://via.placeholder.com/150?text=No+Cover'} 
          alt={volumeInfo?.title || 'Book cover'} 
          className="book-image"
        />
        <div className="image-overlay"></div>
      </div>
      <div className="card-content">
        <h3 className="book-title">{volumeInfo?.title || 'Unknown Title'}</h3>
        {volumeInfo?.authors && (
          <p className="book-authors">Author: {volumeInfo.authors.join(', ')}</p>
        )}
        {volumeInfo?.publisher && (
          <p className="book-meta">Publisher: {volumeInfo.publisher}</p>
        )}
        {volumeInfo?.publishedDate && (
          <p className="book-meta">Published: {volumeInfo.publishedDate}</p>
        )}
        <p className="book-description">
          {volumeInfo?.description 
            ? isExpanded 
              ? volumeInfo.description 
              : volumeInfo.description.length > 120 
                ? volumeInfo.description.substring(0, 120) + '...'
                : volumeInfo.description
            : 'No description available for this book.'}
        </p>
        <div className="card-footer">
          <span className="book-rating">
            ⭐ {volumeInfo?.averageRating || 'N/A'}
          </span>
          <button 
            className="read-more-btn" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
