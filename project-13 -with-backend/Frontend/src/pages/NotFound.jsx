import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      textAlign: 'center',
      padding: '2rem',
      background: 'var(--surface)',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
      >
        <Plane size={48} style={{ color: 'var(--brand-500)' }} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '5rem', fontWeight: 800, color: 'var(--brand-400)', lineHeight: 1 }}>
          404
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Looks like this page got lost on the journey.
        </p>
        <Link to="/" className="btn btn-primary">
          Take me home
        </Link>
      </motion.div>
    </div>
  );
}
