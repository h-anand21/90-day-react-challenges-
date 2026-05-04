import './Sidebar.css';

export default function Sidebar({
  search,
  setSearch,
  filteredMeals,
  setSelectedMeal,
  loadMore,
  loadAll
}) {
  return (
    <aside className="meals-sidebar">
      <h3 className="meals-sidebar__title">Search</h3>

      <input
        className="meals-sidebar__input"
        type="text"
        placeholder="Search any item..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="meals-sidebar__list">
        {filteredMeals.map((meal) => (
          <button
            key={meal.id}
            className="meals-sidebar__item"
            onClick={() => setSelectedMeal(meal)}
            type="button"
          >
            {meal.strMeal}
          </button>
        ))}
      </div>

      <div className="meals-sidebar__actions">
        <button className="meals-sidebar__btn" onClick={loadMore}>
          Load More
        </button>
        <button className="meals-sidebar__btn meals-sidebar__btn--all" onClick={loadAll}>
          Load All
        </button>
      </div>
    </aside>
  );
}
