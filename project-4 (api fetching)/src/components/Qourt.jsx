import QuoteCard from './QuoteCard';

function Qourt({ quotes, error, loading, onLoadMore }) {
  const currentQuote = quotes[0];

  return (
    <section className="quotes-panel">
      <header className="quotes-header">
        <p className="eyebrow">Daily Inspiration</p>
        <h1>Code Quotes</h1>
      </header>

      {error ? <p className="status error">{error}</p> : null}

      <div className="quotes-list">
        {currentQuote ? (
          <QuoteCard quote={currentQuote} />
        ) : loading ? (
          <div className="mac-window loading-window">
            <div className="mac-header">
              <div className="mac-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
            </div>
            <div className="mac-body">Compiling next quote...</div>
          </div>
        ) : null}
      </div>

      <div className="actions">
        <button
          type="button"
          className="load-more-button"
          onClick={onLoadMore}
          disabled={loading}
        >
          {loading ? 'Running...' : 'Run Next Quote'}
        </button>
      </div>
    </section>
  );
}

export default Qourt;
