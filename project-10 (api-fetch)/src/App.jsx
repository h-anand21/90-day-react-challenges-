import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './components/Meals/Sidebar';
import MealsList from './components/Meals/MealsList';
import MealDetail from './components/Meals/MealDetail';
import './App.css';

function App() {
  const [meals, setMeals] = useState([]); // current display
  const [allMeals, setAllMeals] = useState([]); // all 30 pages
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);

  // ✅ fetch single page
  const fetchMeals = async (pageNum = 1) => {
    const res = await axios.get(
      `https://api.freeapi.app/api/v1/public/meals?page=${pageNum}`,
    );
    return res.data.data.data;
  };

  // ✅ initial load (10 items)
  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    setLoading(true);
    const data = await fetchMeals(1);
    setMeals(data);
    setLoading(false);
  };

  // ✅ Load More button
  const loadMore = async () => {
    const nextPage = page + 1;
    const data = await fetchMeals(nextPage);

    setMeals((prev) => [...prev, ...data]);
    setPage(nextPage);
  };

  // ✅ Load ALL 30 pages
  const loadAll = async () => {
    setLoading(true);

    let all = [];

    for (let i = 1; i <= 30; i++) {
      const data = await fetchMeals(i);
      all = [...all, ...data];
    }

    setMeals(all);
    setAllMeals(all);
    setLoading(false);
  };

  // ✅ Categories
  const categories = [
    'All',
    ...new Set((allMeals.length ? allMeals : meals).map((m) => m.strCategory).filter(Boolean)),
  ];

  // ✅ Search & Filter logic
  const filteredMeals = (allMeals.length ? allMeals : meals).filter((meal) => {
    const matchesSearch = meal.strMeal.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || meal.strCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="meals-app" style={{ display: 'flex' }}>
      <Sidebar
        search={search}
        setSearch={setSearch}
        filteredMeals={filteredMeals}
        setSelectedMeal={setSelectedMeal}
        loadMore={loadMore}
        loadAll={loadAll}
      />

      <main style={{ flex: 1, padding: '12px' }}>
        {loading && <h2>Loading...</h2>}

        {selectedMeal ? (
          <MealDetail meal={selectedMeal} getIngredients={getIngredients} onBack={() => setSelectedMeal(null)} />
        ) : (
          <>
            <div className="category-filter-container">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <MealsList
              meals={filteredMeals}
              onShow={(m) => setSelectedMeal(m)}
              loadMore={loadMore}
              loadAll={loadAll}
            />
          </>
        )}
      </main>
    </div>
  );
}

// ✅ Ingredients extractor
function getIngredients(meal) {
  const list = [];

  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];

    if (ing && ing.trim()) {
      list.push(`${ing} - ${meas}`);
    }
  }

  return list;
}

export default App;
