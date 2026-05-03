import QuoteCard from './QuoteCard';

function Qourt({ quotes, error, loading, onLoadMore }) {
  return (
    <section className="quotes-panel">
      <header className="quotes-header">
        <p className="eyebrow">Daily inspiration</p>
        <h1>Quotes</h1>
        <p className="intro">
          Short lines, clear authors, and a button to load more when you want
          another one.
        </p>
      </header>

      {error ? <p className="status error">{error}</p> : null}

      <div className="quotes-list">
        {quotes.map((quote) => (
          <QuoteCard
            key={quote._id ?? `${quote.author}-${quote.content}`}
            quote={quote}
          />
        ))}
      </div>

      <div className="actions">
        <button
          type="button"
          className="load-more-button"
          onClick={onLoadMore}
          disabled={loading}
        >
          {loading ? 'Loading quotes...' : 'Show more quotes'}
        </button>
      </div>
    </section>
  );
}

export default Qourt;
