import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [joke, setJoke] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchJoke = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        'https://api.freeapi.app/api/v1/public/randomjokes'
      );

      // 👇 IMPORTANT CHANGE HERE
      const jokesArray = res.data.data.data;

      // pick one random joke
      const randomJoke =
        jokesArray[Math.floor(Math.random() * jokesArray.length)];

      setJoke(randomJoke);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJoke();
  }, []);

  return (
    <div>
      <h1>Random Joke</h1>

      {loading && <p>Loading...</p>}

      {!loading && joke && (
        <div className="card">
          <p>{joke.content}</p>
        </div>
      )}

      <button onClick={fetchJoke} disabled={loading}>
        {loading ? 'Loading...' : 'Get New Joke'}
      </button>
    </div>
  );
}

export default App;