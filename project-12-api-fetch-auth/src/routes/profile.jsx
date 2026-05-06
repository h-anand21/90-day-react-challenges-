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
    <div className="form-container">
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Profile Page</h2>

      {user ? (
        <div style={{ textAlign: 'center' }}>
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '16px' }}>
            <label>Email</label>
            <div style={{ padding: '12px', background: 'var(--code-bg)', borderRadius: '8px' }}>{user.email}</div>
          </div>

          <div className="form-group" style={{ textAlign: 'left', marginBottom: '24px' }}>
            <label>Username</label>
            <div style={{ padding: '12px', background: 'var(--code-bg)', borderRadius: '8px' }}>{user.username}</div>
          </div>

          <button onClick={handleLogout} type="submit" style={{ background: '#ef4444' }}>Logout</button>
        </div>
      ) : (
        <p style={{ textAlign: 'center' }}>Loading...</p>
      )}
    </div>
  );
}

export default Profile;
