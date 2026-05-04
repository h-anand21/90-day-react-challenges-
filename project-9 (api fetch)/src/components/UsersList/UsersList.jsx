import UserCard from '../UserCard/UserCard';
import './UsersList.css';

function UsersList({ users, loading }) {
  if (loading) {
    return <div className="users-list__loading">Loading users...</div>;
  }

  if (!users || users.length === 0) {
    return <div className="users-list__empty">No users found</div>;
  }

  return (
    <div className="users-list">
      <div className="users-list__header">
        <h2>Users List</h2>
        <p className="users-list__count">{users.length} users</p>
      </div>

      <div className="users-list__container">
        {users.map((user, index) => (
          <UserCard key={index} user={user} />
        ))}
      </div>
    </div>
  );
}

export default UsersList;
