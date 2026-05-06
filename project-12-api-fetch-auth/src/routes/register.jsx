import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { authService } from '../services/authService';

export const Route = createFileRoute('/register')({
  component: Register,
});

function Register() {
  const { register, handleSubmit } = useForm();

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Register</h2>

      <input {...register('email')} placeholder="Email" />

      <input {...register('username')} placeholder="Username" />

      <input {...register('password')} type="password" placeholder="Password" />

      <button type="submit">Register</button>
    </form>
  );
}
