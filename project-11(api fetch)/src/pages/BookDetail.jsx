import React from 'react';

const BookDetail = ({ book, onBack }) => {
  if (!book) {
    return (
      <div className="app-container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Book not found!</h2>
        <button className="load-next-button" onClick={onBack}>Back to Home</button>
      </div>
    );
  }

  const { volumeInfo } = book;

  return (
    <div className="app-container">
      <nav className="navbar" style={{ justifyContent: 'flex-start', cursor: 'pointer' }} onClick={onBack}>
        <div className="nav-logo">← Back to Discover</div>
      </nav>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.8)', padding: '2rem', borderRadius: '24px' }}>
        <div style={{ flex: '1', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
          <img 
            src={volumeInfo?.imageLinks?.thumbnail?.replace('zoom=1', 'zoom=0') || volumeInfo?.imageLinks?.thumbnail || 'https://via.placeholder.com/300?text=No+Cover'} 
            alt={volumeInfo?.title} 
            style={{ width: '100%', maxWidth: '350px', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
          />
        </div>
        <div style={{ flex: '2', minWidth: '300px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#212121', marginBottom: '1rem' }}>{volumeInfo?.title}</h1>
          
          {volumeInfo?.authors && (
            <h3 style={{ color: '#bf360c', marginBottom: '1rem' }}>By {volumeInfo.authors.join(', ')}</h3>
          )}

          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}>
            {volumeInfo?.publisher && (
              <div>
                <p style={{ color: '#777', fontSize: '0.9rem' }}>Publisher</p>
                <p style={{ fontWeight: '600' }}>{volumeInfo.publisher}</p>
              </div>
            )}
            {volumeInfo?.publishedDate && (
              <div>
                <p style={{ color: '#777', fontSize: '0.9rem' }}>Published</p>
                <p style={{ fontWeight: '600' }}>{volumeInfo.publishedDate}</p>
              </div>
            )}
            {volumeInfo?.pageCount && (
              <div>
                <p style={{ color: '#777', fontSize: '0.9rem' }}>Pages</p>
                <p style={{ fontWeight: '600' }}>{volumeInfo.pageCount}</p>
              </div>
            )}
            <div style={{ marginLeft: 'auto' }}>
              <span className="book-rating" style={{ fontSize: '1.2rem' }}>
                ⭐ {volumeInfo?.averageRating || 'N/A'}
              </span>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem' }}>Description</h3>
            <p style={{ lineHeight: '1.8', color: '#555', fontSize: '1.1rem' }}>
              {volumeInfo?.description || 'No description available for this book.'}
            </p>
          </div>
          
          {volumeInfo?.infoLink && (
            <div style={{ marginTop: '2rem' }}>
              <a 
                href={volumeInfo.infoLink} 
                target="_blank" 
                rel="noreferrer" 
                className="load-next-button" 
                style={{ display: 'inline-block', textDecoration: 'none' }}
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
