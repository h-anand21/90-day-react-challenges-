import { motion } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';
import { MapPin, Users, CheckSquare, DollarSign, Calendar, ArrowRight, Plane } from 'lucide-react';
import './Landing.css';

const features = [
  { icon: Calendar, title: 'Day-wise Itinerary', desc: 'Plan every day with activities, timings, and locations.' },
  { icon: Users, title: 'Collaborative Planning', desc: 'Invite friends as editors or viewers — plan together in real time.' },
  { icon: CheckSquare, title: 'Smart Checklists', desc: 'Packing lists, to-dos, documents — all organized by category.' },
  { icon: DollarSign, title: 'Budget Tracking', desc: 'Track expenses per category and split costs among the group.' },
  { icon: MapPin, title: 'Reservation Manager', desc: 'Store flights, hotels, and tours with booking references.' },
  { icon: Plane, title: 'File Uploads', desc: 'Attach tickets, itineraries, and photos via Cloudinary.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* ── Nav ─────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-nav__logo">
          <Plane size={22} className="landing-nav__icon" />
          <span>TripSync</span>
        </div>
        <div className="landing-nav__actions">
          <button className="btn btn-ghost" onClick={() => navigate({ to: '/login' })}>Sign in</button>
          <button className="btn btn-primary" onClick={() => navigate({ to: '/register' })}>Get started</button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────── */}
      <section className="hero-section">
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          ✈️ Your trips. Perfectly planned.
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Plan trips together,
          <br />
          <span className="hero-gradient">without the chaos.</span>
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          TripSync is a collaborative platform for planning group trips — itineraries,
          budgets, checklists, reservations, and file uploads in one beautiful workspace.
        </motion.p>

        <motion.div
          className="hero-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <button className="btn btn-primary hero-cta__btn" onClick={() => navigate({ to: '/register' })}>
            Start planning free <ArrowRight size={16} />
          </button>
          <button className="btn btn-ghost" onClick={() => navigate({ to: '/login' })}>
            Sign in to your account
          </button>
        </motion.div>
      </section>

      {/* ── Features ────────────────────── */}
      <section className="features-section">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          Everything your group trip needs
        </motion.h2>
        <div className="features-grid">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              className="feature-card"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="feature-card__icon">
                <feat.icon size={22} />
              </div>
              <h3 className="feature-card__title">{feat.title}</h3>
              <p className="feature-card__desc">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────── */}
      <section className="cta-banner">
        <motion.div
          className="cta-banner__inner"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>Ready to plan your next adventure?</h2>
          <p>Join thousands of travelers who use TripSync to plan stress-free group trips.</p>
          <button className="btn btn-primary" onClick={() => navigate({ to: '/register' })}>
            Create free account <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>

      <footer className="landing-footer">
        <Plane size={16} />
        <span>TripSync © {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
