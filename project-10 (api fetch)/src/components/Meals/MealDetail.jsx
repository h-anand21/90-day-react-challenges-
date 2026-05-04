import './MealDetail.css';

export default function MealDetail({ meal, getIngredients, onBack }) {
  if (!meal) return null;

  return (
    <div className="meal-detail">
      {onBack && (
        <button className="meal-detail__back-btn" onClick={onBack}>
          ← Back to Meals
        </button>
      )}
      
      <div className="meal-detail__header">
        <img
          className="meal-detail__img"
          src={meal.strMealThumb}
          alt={meal.strMeal}
        />
        <div className="meal-detail__info">
          <h2 className="meal-detail__title">{meal.strMeal}</h2>
          <div className="meal-detail__meta">
            {meal.strCategory && <span>{meal.strCategory}</span>}
            {meal.strArea && <span>{meal.strArea}</span>}
          </div>
          {meal.strTags && (
            <div className="meal-detail__tags">
              {meal.strTags.split(',').map(tag => (
                <span key={tag} className="tag">#{tag.trim()}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="meal-detail__content">
        <div>
          <h3 className="meal-detail__section-title">Instructions</h3>
          <p className="meal-detail__instructions">{meal.strInstructions}</p>
        </div>
        <div>
          <h3 className="meal-detail__section-title">Ingredients</h3>
          <ul className="meal-detail__ingredients">
            {getIngredients(meal).map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
