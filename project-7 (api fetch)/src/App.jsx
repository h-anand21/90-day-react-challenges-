import { useEffect, useState } from 'react';
import axios from 'axios';
import CardCat from './components/CardCat/CardCat';
import './App.css';

function App() {
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCat = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        'https://api.freeapi.app/api/v1/public/cats/cat/random',
      );

      // console.log(res.data);
      setCat(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => {
      fetchCat();
    }, 0);

    return () => clearTimeout(id);
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-copy">
        <p className="eyebrow">Free API Demo</p>
        <h1>Random Cat</h1>
        <p className="subtitle">
          Fetch a new cat profile, image, and description with one click.
        </p>
      </section>

      <CardCat cat={cat} loading={loading} onFetchCat={fetchCat} />
    </main>
  );
}

export default App;
