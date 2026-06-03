import React from 'react';

const BookDetail = ({ book, onBack }) => {
  if (!book) {
    return (
      <div className="app-container not-found-container">
        <h2>Book not found!</h2>
        <button className="load-next-button" onClick={onBack}>Back to Home</button>
      </div>
    );
  }

  const { volumeInfo } = book;

  return (
    <div className="app-container">
      <nav className="navbar book-detail-nav" onClick={onBack}>
        <div className="nav-logo">← Back to Discover</div>
      </nav>

      <div className="book-detail-card">
        <div className="detail-image-wrapper">
          <img 
            src={volumeInfo?.imageLinks?.thumbnail?.replace('zoom=1', 'zoom=0') || volumeInfo?.imageLinks?.thumbnail || 'https://via.placeholder.com/300?text=No+Cover'} 
            alt={volumeInfo?.title} 
            className="detail-image"
          />
        </div>
        <div className="detail-content-wrapper">
          <h1 className="detail-title">{volumeInfo?.title}</h1>
          
          {volumeInfo?.authors && (
            <h3 className="detail-authors">By {volumeInfo.authors.join(', ')}</h3>
          )}

          <div className="detail-meta-grid">
            {volumeInfo?.publisher && (
              <div className="meta-item">
                <p className="meta-label">Publisher</p>
                <p className="meta-value">{volumeInfo.publisher}</p>
              </div>
            )}
            {volumeInfo?.publishedDate && (
              <div className="meta-item">
                <p className="meta-label">Published</p>
                <p className="meta-value">{volumeInfo.publishedDate}</p>
              </div>
            )}
            {volumeInfo?.pageCount && (
              <div className="meta-item">
                <p className="meta-label">Pages</p>
                <p className="meta-value">{volumeInfo.pageCount}</p>
              </div>
            )}
            <div className="meta-item rating-item">
              <span className="book-rating large-rating">
                ⭐ {volumeInfo?.averageRating || 'N/A'}
              </span>
            </div>
          </div>

          <div className="detail-description-section">
            <h3 className="description-heading">Description</h3>
            <p className="detail-description-text">
              {volumeInfo?.description || 'No description available for this book.'}
            </p>
          </div>
          
          {volumeInfo?.infoLink && (
            <div className="detail-action-section">
              <a 
                href={volumeInfo.infoLink} 
                target="_blank" 
                rel="noreferrer" 
                className="load-next-button external-link" 
              >
                View on Google Books
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
