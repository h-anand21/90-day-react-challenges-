import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useMemo } from 'react';

import { authService } from '../services/authService';

import styled from 'styled-components';

export const Route = createFileRoute('/profile')({
  component: Profile,
});

const PROFILE_CAPTIONS = [
  "To infinity... and beyond! Having a great time exploring the outer sectors.",
  "Just another day building awesome web applications and squashing bugs! 🐛",
  "Living on coffee, code, and dreams. Always ready for the next adventure.",
  "Design is not just what it looks like, it's how it works. Making things beautiful today!",
  "In the zone. Headphones on, world off. Let's create something amazing.",
  "Exploring the digital frontier one line of code at a time. 🚀",
  "React enthusiast, CSS wizard, and overall tech explorer. Welcome to my profile!",
  "Debugging is like being the detective in a crime movie where you are also the murderer.",
  "Turning caffeine into working software since day one. ☕"
];

function Profile() {
  const [user, setUser] = useState(null);
  
  // Randomly select a caption when the component mounts
  const randomCaption = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * PROFILE_CAPTIONS.length);
    return PROFILE_CAPTIONS[randomIndex];
  }, []);

  const navigate = useNavigate();

useEffect(() => {
  const getCurrentUser = async () => {
    try {
      const userData = await authService.currentUser();

      console.log(userData);

      if (!userData) {
        navigate({ to: '/' });
        return;
      }

      setUser(userData);
    } catch (error) {
      console.log(error);

      navigate({ to: '/' });
    }
  };

  getCurrentUser();
}, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      alert('Logout successful');
      navigate({ to: '/' });
    } catch (error) {
      alert('Logout failed');
    }
  };

  if (!user) {
    return <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading profile...</p>;
  }

  return (
    <StyledWrapper>
      <div className="card-container">
        <div className="pixar-card" role="article" aria-labelledby="card-username">
          <div className="card-header">
            <div className="card-avatar" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold'}}>
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <p className="card-username" id="card-username">@{user.username}</p>
          </div>
          <div className="card-image-area">
            <div className="card-image-placeholder" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold'}}>
              {user.email}
            </div>
            <p className="card-caption">
              {randomCaption}
            </p>
          </div>
          <div className="card-actions">
            <button className="action-button like-button" aria-label="Logout" onClick={handleLogout} style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
              <svg className="action-button-icon" viewBox="0 0 24 24" style={{stroke: '#fff'}}>
                <path d="M16 17l5-5-5-5M21 12H9M9 3H4v18h5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 60px;
  
  .card-container {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    font-family: "Arial Rounded MT Bold", "Helvetica Rounded", Arial, sans-serif;
  }

  .pixar-card {
    --ui-blue: #1f2937;
    --ui-blue-shadow: #111827;
    --ui-green: #61c470;
    --ui-green-shadow: #45a253;
    --ui-red: #ef4444;
    --ui-red-shadow: #dc2626;
    --ui-cream: #f5f1e8;
    --ui-cream-shadow: #c7c1b5;
    --ui-dark: #323232;
    --button-press-depth: 0.15em;

    position: relative;
    width: 22em;
    max-width: 350px;
    background-color: var(--ui-cream);
    border-radius: 1.5em;
    padding: 1.2em;
    border: 0.2em solid var(--ui-dark);
    box-shadow: 0.6em 0.6em 0 var(--ui-dark);
    display: flex;
    flex-direction: column;
    transition:
      transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .pixar-card:hover {
    transform: translateY(-0.5em) rotate(-1deg);
    box-shadow: 0.8em 0.8em 0 var(--ui-dark);
  }

  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 1em;
  }

  .card-avatar {
    width: 3.5em;
    height: 3.5em;
    border-radius: 50%;
    background: linear-gradient(45deg, #f9a86d, #f48a58);
    border: 0.2em solid var(--ui-dark);
    box-shadow: 0.2em 0.2em 0 var(--ui-dark);
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }

  .pixar-card:hover .card-avatar {
    transform: scale(1.05) rotate(5deg);
  }

  .card-username {
    margin: 0 0 0 0.8em;
    font-size: 1.2em;
    font-weight: 700;
    color: var(--ui-dark);
  }

  .card-image-area {
    background-color: #d8d2c6;
    border-radius: 1em;
    padding: 0.8em;
    border: 0.2em solid var(--ui-dark);
    box-shadow: inset 0.2em 0.2em 0 #b3ac9f;
  }

  .card-image-placeholder {
    width: 100%;
    height: 5em;
    border-radius: 0.6em;
    background: linear-gradient(135deg, var(--ui-blue), var(--ui-blue-shadow));
    border: 0.2em solid var(--ui-dark);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .pixar-card:hover .card-image-placeholder {
    transform: scale(1.03);
  }

  .card-caption {
    margin: 1em 0 0 0;
    font-size: 0.9em;
    line-height: 1.4;
    color: var(--ui-dark);
    font-weight: 600;
  }

  .card-actions {
    display: flex;
    justify-content: space-around;
    margin-top: 1.5em;
  }

  .action-button {
    background: var(--ui-green);
    border: 0.2em solid var(--ui-dark);
    border-radius: 1em;
    padding: 0.5em;
    cursor: pointer;
    box-shadow:
      0 var(--button-press-depth) 0 var(--ui-green-shadow),
      0 0.4em 0 var(--ui-dark);
    transition:
      transform 0.1s ease,
      box-shadow 0.1s ease;
  }

  .action-button:active {
    transform: translateY(var(--button-press-depth));
    box-shadow:
      0 0 0 var(--ui-green-shadow),
      0 var(--button-press-depth) 0 var(--ui-dark);
  }

  .like-button {
    background: var(--ui-red);
    box-shadow:
      0 var(--button-press-depth) 0 var(--ui-red-shadow),
      0 0.4em 0 var(--ui-dark);
  }

  .like-button:active {
    box-shadow:
      0 0 0 var(--ui-red-shadow),
      0 var(--button-press-depth) 0 var(--ui-dark);
  }

  .action-button-icon {
    width: 1.8em;
    height: 1.8em;
    stroke: var(--ui-dark);
    stroke-width: 2.5;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    display: block;
  }
`;

export default Profile;
