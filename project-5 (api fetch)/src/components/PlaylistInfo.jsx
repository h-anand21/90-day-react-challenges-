

export default function PlaylistInfo({ playlist }) {
  const snip = playlist?.snippet || {};

  return (
    <section className="playlist-card">
      <h2>{snip.title}</h2>
      <p className="desc">{snip.description}</p>
      <p className="localized">Playlist: {snip.localized?.title}</p>
    </section>
  );
}
