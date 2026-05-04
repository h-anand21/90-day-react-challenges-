// import './JokeCard.css';

// function JokeCard({ joke, loading, onFetchJoke }) {
//   return (
//     <section className="joke-card">
//       <h2 className="joke-card__title">Random Joke</h2>

//       <div className="joke-card__panel">
//         <div className="joke-card__panel-content">
//           {loading && <div className="joke-card__loading">Loading...</div>}

//           {!loading && joke && (
//             <p className="joke-card__text">{joke.content}</p>
//           )}

//           {!loading && !joke && (
//             <div className="joke-card__empty">
//               No joke yet — click the button.
//             </div>
//           )}
//         </div>

//         <div className="joke-card__panel-actions">
//           <button
//             className="joke-card__button"
//             onClick={onFetchJoke}
//             disabled={loading}
//           >
//             {loading ? 'Loading...' : 'Get New Joke'}
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// }

// export default JokeCard;
