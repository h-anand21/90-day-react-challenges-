

export default function ChannelInfo({ channel }) {
  const info = channel?.info || {};
  const stats = channel?.statistics || {};

  return (
    <section className="channel-card">
      <div className="channel-left">
        {info.thumbnails?.high?.url && (
          <img
            src={info.thumbnails.high.url}
            alt={info.title}
            className="avatar"
          />
        )}
      </div>

      <div className="channel-right">
        <h2>{info.title}</h2>
        <p className="localized">{info.localized?.title}</p>
        <div className="stats">
          <span>Subscribers: {stats.subscriberCount || '—'}</span>
          <span>Videos: {stats.videoCount || '—'}</span>
          <span>Views: {stats.viewCount || '—'}</span>
        </div>
      </div>
    </section>
  );
}
