
import VideoItem from './VideoItem';

export default function VideoList({ items }) {
  return (
    <section className="videos-grid">
      {items.map((item) => (
        <VideoItem key={item.id} item={item} />
      ))}
    </section>
  );
}
