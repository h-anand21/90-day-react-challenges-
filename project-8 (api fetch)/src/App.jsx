import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import JokeCard from './components/JokeCard/JokeCard';

function App() {
  const [joke, setJoke] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchJoke = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        'https://api.freeapi.app/api/v1/public/randomjokes',
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
      <JokeCard joke={joke} loading={loading} onFetchJoke={fetchJoke} />
    </div>
  );
}

export default App;
