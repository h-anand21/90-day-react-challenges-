function QuoteCard({ quote }) {
  return (
    <article className="quote-card">
      <p className="quote-content">{quote.content}</p>
      <p className="quote-author">{quote.author}</p>
    </article>
  );
}

export default QuoteCard;
