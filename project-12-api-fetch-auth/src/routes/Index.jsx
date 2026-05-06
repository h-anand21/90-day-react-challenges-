import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { authService } from '../services/authService';

export const Route = createFileRoute('/')({
  component: Login,
});

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await authService.login(data);

      alert('Login success');

      navigate({ to: '/profile' });
    } catch {
      alert('Login failed');
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Login</h2>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            {...register('username', { required: 'Username is required' })}
            placeholder="Enter your username"
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
            placeholder="Enter your password"
          />
          {errors.password && <span className="error-message">{errors.password.message}</span>}
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
