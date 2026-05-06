import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { authService } from '../services/authService';

export const Route = createFileRoute('/')({
  component: Login,
});

function Login() {
  const { register, handleSubmit } = useForm();

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Login</h2>

      <input {...register('username')} placeholder="Username" />

      <input {...register('password')} type="password" placeholder="Password" />

      <button type="submit">Login</button>
    </form>
  );
}
