import './MealCard.css';

export default function MealCard({ meal, onShow }) {
  return (
    <article className="meal-card" onClick={() => onShow(meal)}>
      <div className="meal-card__img-wrapper">
        <img
          className="meal-card__img"
          src={meal.strMealThumb}
          alt={meal.strMeal}
          loading="lazy"
        />
        {meal.strCategory && (
          <div className="meal-card__overlay">
            <span className="meal-card__category">{meal.strCategory}</span>
          </div>
        )}
      </div>
      <div className="meal-card__body">
        <h4 className="meal-card__title" title={meal.strMeal}>{meal.strMeal}</h4>
        <div className="meal-card__footer">
          {meal.strArea && <span className="meal-card__area">📍 {meal.strArea}</span>}
          <button className="meal-card__button" onClick={(e) => { e.stopPropagation(); onShow(meal); }}>
            View Recipe
          </button>
        </div>
      </div>
    </article>
  );
}
