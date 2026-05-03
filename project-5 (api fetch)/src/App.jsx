import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        'https://api.freeapi.app/api/v1/public/youtube/playlists/PLRAV69dS1uWSx4erHGq8hW_GE-Eaj60r-',
      );
      const result = await res.json();

       console.log(result);
      setData(result.data);
    };

    fetchData();
  }, []);

  if (!data) return <h2>Loading...</h2>;

  return (
    <>
      {/* ✅ 1. Channel Info */}
      <h1>Channel: {data.channel?.info?.title}</h1>

      {/* ✅ Localized */}
      <p>Localized Title: {data.channel?.info?.localized?.title}</p>

      {/* ✅ Statistics */}
      <p>Subscribers: {data.channel?.statistics?.subscriberCount}</p>
      <p>Videos: {data.channel?.statistics?.videoCount}</p>
      <p>Views: {data.channel?.statistics?.viewCount}</p>

      <hr />

      {/* ✅ 2. Playlist Info */}
      <h2>{data.playlist?.snippet?.title}</h2>
      <p>{data.playlist?.snippet?.description}</p>

      <p>Playlist Localized: {data.playlist?.snippet?.localized?.title}</p>

      <hr />

      {/* ✅ Videos (map) */}
      {data.playlistItems?.map((item) => (
        <div key={item.id} style={{ marginBottom: '20px' }}>
          <h3>{item.snippet?.title}</h3>
          <p>{item.snippet?.description}</p>

          <a
            href={`https://www.youtube.com/watch?v=${item.snippet?.resourceId?.videoId}`}
            target="_blank"
          >
            ▶ Watch Video
          </a>
        </div>
      ))}
    </>
  );
}

export default App;
