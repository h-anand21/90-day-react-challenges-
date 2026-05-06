import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { authService } from '../services/authService';
import { useState } from 'react';
import styled from 'styled-components';

export const Route = createFileRoute('/register')({
  component: Register,
});

function Register() {
  const [isDark, setIsDark] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await authService.register({
        ...data,
        role: 'ADMIN',
      });
      alert('Registered');
      navigate({ to: '/' });
    } catch {
      alert('Error');
    }
  };

  return (
    <StyledWrapper $isDark={isDark}>
      <form className={`form ${isDark ? 'dark' : ''}`} onSubmit={handleSubmit(onSubmit)}>
        <button 
          type="button" 
          className="theme-toggle" 
          onClick={() => setIsDark(!isDark)}
          aria-label="Toggle dark mode"
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        <div className="title">Welcome,<br /><span>sign up to continue</span></div>
        
        <input 
          type="email" 
          placeholder="Email" 
          className="input" 
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: 'Invalid email format',
            },
          })}
        />
        {errors.email && <span className="error-message" style={{ color: 'red', fontSize: '13px', marginTop: '-15px', marginBottom: '5px' }}>{errors.email.message}</span>}

        <input 
          type="text" 
          placeholder="Username" 
          className="input" 
          {...register('username', { required: 'Username is required' })}
        />
        {errors.username && <span className="error-message" style={{ color: 'red', fontSize: '13px', marginTop: '-15px', marginBottom: '5px' }}>{errors.username.message}</span>}
        
        <input 
          type="password" 
          placeholder="Password" 
          className="input" 
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'At least 6 characters' },
          })}
        />
        {errors.password && <span className="error-message" style={{ color: 'red', fontSize: '13px', marginTop: '-15px', marginBottom: '5px' }}>{errors.password.message}</span>}
        
        <button type="submit" className="button-confirm">Sign Up →</button>
        <div className="bottom-link">
          Already have an account? <Link to="/">Login</Link>
        </div>
      </form>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 60px;

  .form {
    --input-focus: #1f2937;
    --font-color: #323232;
    --font-color-sub: #666;
    --bg-color: #fff;
    --main-color: #323232;
    padding: 20px;
    background: var(--bg-color);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 20px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    box-shadow: 4px 4px var(--main-color);
    position: relative;
    transition: all 0.3s ease;
  }

  .form.dark {
    --input-focus: #9ca3af;
    --font-color: #f1f1f1;
    --font-color-sub: #ccc;
    --bg-color: #1a1a1a;
    --main-color: #f1f1f1;
  }

  .theme-toggle {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .theme-toggle:hover {
    transform: scale(1.1);
  }

  .title {
    color: var(--font-color);
    font-weight: 900;
    font-size: 20px;
    margin-bottom: 25px;
    transition: color 0.3s ease;
  }

  .title span {
    color: var(--font-color-sub);
    font-weight: 600;
    font-size: 17px;
    transition: color 0.3s ease;
  }

  .input {
    width: 250px;
    height: 40px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px var(--main-color);
    font-size: 15px;
    font-weight: 600;
    color: var(--font-color);
    padding: 5px 10px;
    outline: none;
    box-sizing: border-box;
    transition: all 0.3s ease;
  }

  .input::placeholder {
    color: var(--font-color-sub);
    opacity: 0.8;
  }

  .input:focus {
    border: 2px solid var(--input-focus);
  }

  .button-confirm {
    margin: 30px auto 0 auto;
    width: 120px;
    height: 40px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px var(--main-color);
    font-size: 17px;
    font-weight: 600;
    color: var(--font-color);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .button-confirm:active {
    box-shadow: 0px 0px var(--main-color);
    transform: translate(3px, 3px);
  }

  .bottom-link {
    margin-top: 15px;
    font-size: 15px;
    text-align: center;
    width: 100%;
    color: var(--font-color-sub);
    font-weight: 600;
    transition: color 0.3s ease;
  }

  .bottom-link a {
    color: var(--font-color);
    font-weight: 800;
    text-decoration: underline;
    margin-left: 5px;
    transition: color 0.3s ease;
  }
`;
