import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { useEffect, useState } from 'react';

import { authService } from '../services/authService';

export const Route = createFileRoute('/profile')({
  component: Profile,
});

function Profile() {
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userData = authService.currentUser();

    if (!userData) {
      navigate({ to: '/' });
      return;
    }

    setUser(userData);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();

      alert('Logout successful');

      navigate({ to: '/' });
    } catch (error) {
      alert('Logout failed');
    }
  };

  return (
    <div>
      <h1>Profile Page</h1>

      {user ? (
        <>
          <p>Email: {user.email}</p>

          <p>Username: {user.username}</p>

          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Profile;
