import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { authService } from '../services/authService';

export const Route = createFileRoute('/register')({
  component: Register,
});

function Register() {
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
    <div className="form-container">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Register</h2>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Entered value does not match email format',
              },
            })}
            placeholder="Enter your email"
          />
          {errors.email && <span className="error-message">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            {...register('username', { required: 'Username is required' })}
            placeholder="Choose a username"
          />
          {errors.username && <span className="error-message">{errors.username.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            })}
            type="password"
            placeholder="Create a password"
          />
          {errors.password && <span className="error-message">{errors.password.message}</span>}
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
