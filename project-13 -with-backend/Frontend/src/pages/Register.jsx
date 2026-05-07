import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useNavigate, Link } from '@tanstack/react-router';
import { Plane, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Account created! Welcome aboard 🎉');
      navigate({ to: '/dashboard' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="auth-logo">
          <Plane size={28} />
          <span>TripSync</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Start planning your first trip today</p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          {/* Name */}
          <div className="form-group">
            <label className="label" htmlFor="name">Full Name</label>
            <div className="input-wrap">
              <User size={16} className="input-icon" />
              <input
                id="name"
                type="text"
                className={`input input-with-icon ${errors.name ? 'error' : ''}`}
                placeholder="Jane Doe"
                {...register('name')}
              />
            </div>
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="label" htmlFor="email">Email</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                id="email"
                type="email"
                className={`input input-with-icon ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="label" htmlFor="password">Password</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className={`input input-with-icon input-with-icon-right ${errors.password ? 'error' : ''}`}
                placeholder="Min. 6 characters"
                {...register('password')}
              />
              <button type="button" className="input-icon-right" onClick={() => setShowPass((p) => !p)}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
