import { useEffect, useState } from 'react';
import axios from 'axios';

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
     fetchCat();
   }, []);

  return (
    <div>
      <h1>Random Cat</h1>

      {loading && <p>Loading...</p>}

      {cat && (
        <div>
          <img src={cat.image} width="300" />
        </div>
      )}

      {cat && (
        <div>
          <p>Name: {cat.name}</p>
          <p>origin: {cat.origin}</p>
          <p>About: {cat.description}</p>
        </div>
      )}

      <button onClick={fetchCat}>Get Random Cat</button>
    </div>
  );
}

export default App;
