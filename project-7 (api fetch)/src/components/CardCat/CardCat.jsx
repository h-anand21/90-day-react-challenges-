import './CardCat.css';

function CardCat({ cat, loading, onFetchCat }) {
  return (
    <section className="cat-card">
      <div className="cat-card__imageWrap">
        {cat ? (
          <img
            className="cat-card__image"
            src={cat.image}
            alt={cat.name || 'Random cat'}
          />
        ) : (
          <div className="cat-card__placeholder">
            <span>Ready for a cat</span>
            <p>Press the button to load a random profile.</p>
          </div>
        )}
      </div>

      <div className="cat-card__content">
        <div className="cat-card__header">
          <div>
            <p className="cat-card__label">Random Cat Profile</p>
            <h2>{cat ? cat.name : 'No cat loaded yet'}</h2>
          </div>
          <span className="cat-card__status">
            {loading ? 'Loading' : 'Ready'}
          </span>
        </div>

        {cat ? (
          <div className="cat-card__details">
            <div>
              <span>Origin</span>
              <strong>{cat.origin}</strong>
            </div>
            <div>
              <span>About</span>
              <p>{cat.description}</p>
            </div>
          </div>
        ) : (
          <p className="cat-card__emptyText">
            A random cat profile will appear here after the first fetch.
          </p>
        )}

        <button
          className="cat-card__button"
          onClick={onFetchCat}
          disabled={loading}
        >
          {loading ? 'Fetching...' : 'Get Random Cat'}
        </button>
      </div>
    </section>
  );
}

export default CardCat;
