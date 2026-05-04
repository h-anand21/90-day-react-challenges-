import './UserCard.css';

function UserCard({ user }) {
  return (
    <div className="user-card">
      <div className="user-card__image-wrap">
        <img
          src={user.picture.medium}
          alt={user.name.first}
          className="user-card__image"
        />
      </div>

      <div className="user-card__content">
        <h3 className="user-card__name">
          {user.name.title} {user.name.first} {user.name.last}
        </h3>

        <div className="user-card__details">
          <div className="user-card__detail-row">
            <span className="user-card__label">Gender</span>
            <span className="user-card__value">{user.gender}</span>
          </div>

          <div className="user-card__detail-row">
            <span className="user-card__label">Location</span>
            <span className="user-card__value">
              {user.location.city}, {user.location.state},{' '}
              {user.location.country}
            </span>
          </div>

          <div className="user-card__detail-row">
            <span className="user-card__label">Email</span>
            <span className="user-card__value user-card__email">
              {user.email}
            </span>
          </div>

          <div className="user-card__detail-row">
            <span className="user-card__label">Phone</span>
            <span className="user-card__value">{user.phone}</span>
          </div>

          <div className="user-card__detail-row">
            <span className="user-card__label">Age</span>
            <span className="user-card__value">{user.dob.age} years</span>
          </div>

          <div className="user-card__detail-row">
            <span className="user-card__label">DOB</span>
            <span className="user-card__value">
              {new Date(user.dob.date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCard;
