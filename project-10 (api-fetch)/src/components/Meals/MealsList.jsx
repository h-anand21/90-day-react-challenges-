import MealCard from './MealCard';
import './MealsList.css';

export default function MealsList({ meals, onShow, loadMore, loadAll }) {
  return (
    <div className="meals-list">
      <div className="meals-list__grid">
        {meals.map((meal) => (
          <div key={meal.id} className="meals-list__item">
            <MealCard meal={meal} onShow={onShow} />
          </div>
        ))}
      </div>

      <div className="meals-list__actions">
        <button onClick={loadMore} className="meals-list__btn">
          Load More
        </button>
        <button onClick={loadAll} className="meals-list__btn">
          Load All (30 pages)
        </button>
      </div>
    </div>
  );
}
