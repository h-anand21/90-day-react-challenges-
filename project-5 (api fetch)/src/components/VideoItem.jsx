export default function VideoItem({ item }) {
  const snip = item.snippet || {};
  const thumb = snip.thumbnails?.medium?.url || snip.thumbnails?.default?.url || snip.thumbnails?.high?.url;

  const isPlaylist = item.kind === 'youtube#playlist';
  const url = isPlaylist 
    ? `https://www.youtube.com/playlist?list=${item.id}` 
    : `https://www.youtube.com/watch?v=${snip.resourceId?.videoId}`;
  const btnText = isPlaylist ? '▶ View Playlist' : '▶ Watch';

  return (
    <article className="video-card">
      {thumb && <img src={thumb} alt={snip.title} className="thumb" />}
      <div className="video-body">
        <h3>{snip.title}</h3>
        <p className="video-desc">{snip.description || 'No description available.'}</p>
        <a
          className="watch-btn"
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          {btnText}
        </a>
      </div>
    </article>
  );
}
