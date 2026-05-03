function QuoteCard({ quote }) {
  return (
    <article className="mac-window">
      <div className="mac-header">
        <div className="mac-dots">
          <span className="dot red"></span>
          <span className="dot yellow"></span>
          <span className="dot green"></span>
        </div>
        <div className="mac-title">quote.txt</div>
      </div>
      <div className="mac-body plain-text">
        <p className="quote-content">"{quote.content}"</p>
        <p className="quote-author">— {quote.author}</p>
      </div>
    </article>
  );
}

export default QuoteCard;
