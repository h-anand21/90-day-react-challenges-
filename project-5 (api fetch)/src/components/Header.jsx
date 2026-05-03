
export default function Header({ title }) {
  const avatar = 'https://github.com/hiteshchoudhary.png';

  return (
    <header className="site-header">
      <div className="brand">
        <div className="logo" aria-hidden>
          <img
            src={avatar}
            alt="Hitesh Choudhary"
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              objectFit: 'cover',
            }}
          />
        </div>
        <div>
          <h1>{title}</h1>
          <p className="subtitle">Curated playlist</p>
        </div>
      </div>
    </header>
  );
}
