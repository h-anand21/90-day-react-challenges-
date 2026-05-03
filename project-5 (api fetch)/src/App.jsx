import { useEffect, useState } from 'react';
import Header from './components/Header';
import ChannelInfo from './components/ChannelInfo';
import VideoList from './components/VideoList';
import './styles.css';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [channelRes, playlistsRes] = await Promise.all([
          fetch('https://api.freeapi.app/api/v1/public/youtube/playlists/PLRAV69dS1uWSx4erHGq8hW_GE-Eaj60r-'),
          fetch('https://api.freeapi.app/api/v1/public/youtube/playlists')
        ]);
        
        const channelResult = await channelRes.json();
        const playlistsResult = await playlistsRes.json();
        
        setData({
          channel: channelResult.data.channel,
          playlists: playlistsResult.data.data
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  if (!data) return <div className="loader">Loading...</div>;

  return (
    <div className="app fade-in">
      <Header title={data.channel?.info?.title || 'Channel'} />
      <main className="container">
        <ChannelInfo channel={data.channel} />
        
        <div className="section-header slide-up">
          <h2 style={{ marginTop: '30px', marginBottom: '10px', fontSize: '1.6rem', color: 'var(--text)' }}>
            All Playlists
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
            Explore all the curated playlists from the channel
          </p>
        </div>

        <VideoList items={data.playlists || []} />
      </main>
    </div>
  );
}

export default App;
