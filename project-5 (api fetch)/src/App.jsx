import { useEffect, useState } from 'react';
import Header from './components/Header';
import ChannelInfo from './components/ChannelInfo';
import VideoList from './components/VideoList';
import './styles.css';

function App() {
  const [data, setData] = useState(null);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [visibleCount, setVisibleCount] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [channelRes, playlistsRes] = await Promise.all([
          fetch('https://api.freeapi.app/api/v1/public/youtube/playlists/PLRAV69dS1uWSx4erHGq8hW_GE-Eaj60r-'),
          fetch('https://api.freeapi.app/api/v1/public/youtube/playlists?page=1&limit=50')
        ]);
        
        const channelResult = await channelRes.json();
        const playlistsResult = await playlistsRes.json();
        
        setData({
          channel: channelResult.data.channel
        });
        setAllPlaylists(playlistsResult.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchInitialData();
  }, []);

  const loadMore = () => {
    setVisibleCount(prevCount => prevCount + 2);
  };

  // If searching, search across ALL playlists. Otherwise, only show the visible count.
  const isSearching = searchQuery.trim().length > 0;
  
  const displayedPlaylists = isSearching 
    ? allPlaylists.filter(pl => 
        pl.snippet?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allPlaylists.slice(0, visibleCount);

  const hasMoreToLoad = !isSearching && visibleCount < allPlaylists.length;

  if (!data) return <div className="loader">Loading...</div>;

  return (
    <div className="app fade-in">
      <Header title={data.channel?.info?.title || 'Channel'} />
      <main className="container main-layout">
        
        {/* LEFT SIDEBAR: Channel Info */}
        <aside className="sidebar">
          <ChannelInfo channel={data.channel} />
        </aside>

        {/* RIGHT CONTENT: Playlists & Search */}
        <section className="content">
          <div className="section-header slide-up">
            <div className="header-text">
              <h2 className="title">All Playlists</h2>
              <p className="subtitle">Explore all curated playlists from the channel</p>
            </div>
            
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search all playlists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <VideoList items={displayedPlaylists} />

          {hasMoreToLoad && (
            <div className="load-more-container">
              <button className="load-more-btn" onClick={loadMore}>
                Load More Playlists
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;
