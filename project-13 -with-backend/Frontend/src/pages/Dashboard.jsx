import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, MapPin, Calendar, Users, ArrowRight, Loader2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import CreateTripModal from '../components/CreateTripModal';
import { useState } from 'react';
import './Dashboard.css';

const statusColors = {
  planning: 'badge-gray',
  upcoming: 'badge-blue',
  ongoing: 'badge-green',
  completed: 'badge-orange',
  cancelled: 'badge-red',
};

function TripCard({ trip, onClick }) {
  return (
    <motion.div
      className="trip-card"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      <div className="trip-card__header">
        <div className="trip-card__destination">
          <Globe size={14} />
          {trip.destination}
        </div>
        <span className={`badge ${statusColors[trip.status] || 'badge-gray'}`}>
          {trip.status}
        </span>
      </div>

      <h3 className="trip-card__title">{trip.title}</h3>
      {trip.description && (
        <p className="trip-card__desc">{trip.description}</p>
      )}

      <div className="trip-card__meta">
        <span className="trip-card__meta-item">
          <Calendar size={13} />
          {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {' – '}
          {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <span className="trip-card__meta-item">
          <Users size={13} />
          {trip.myRole}
        </span>
      </div>

      <div className="trip-card__footer">
        <span className="trip-card__budget">
          {trip.currency} {trip.totalBudget?.toLocaleString() || 0} budget
        </span>
        <ArrowRight size={16} className="trip-card__arrow" />
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['trips'],
    queryFn: () => api.get('/trips').then((r) => r.data),
  });

  return (
    <div className="dashboard page-enter">
      {/* ── Header ── */}
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">
            Hello, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="dashboard__sub">Here are all your trips</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Trip
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="dashboard__stats">
        {[
          { label: 'Total Trips', value: data?.pagination?.total ?? 0 },
          { label: 'Upcoming', value: data?.trips?.filter((t) => t.status === 'upcoming').length ?? 0 },
          { label: 'Planning', value: data?.trips?.filter((t) => t.status === 'planning').length ?? 0 },
          { label: 'Completed', value: data?.trips?.filter((t) => t.status === 'completed').length ?? 0 },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <span className="stat-card__value">{stat.value}</span>
            <span className="stat-card__label">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── Trips Grid ── */}
      {isLoading ? (
        <div className="dashboard__loading">
          <Loader2 size={28} className="spin" />
          <span>Loading trips…</span>
        </div>
      ) : error ? (
        <div className="dashboard__error">
          Failed to load trips. <button className="auth-link" onClick={refetch}>Retry</button>
        </div>
      ) : data?.trips?.length === 0 ? (
        <div className="dashboard__empty">
          <MapPin size={40} className="dashboard__empty-icon" />
          <h3>No trips yet</h3>
          <p>Create your first trip to get started</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create trip
          </button>
        </div>
      ) : (
        <div className="trips-grid">
          {data.trips.map((trip) => (
            <TripCard
              key={trip._id}
              trip={trip}
              onClick={() => navigate({ to: `/trips/${trip._id}` })}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateTripModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); refetch(); toast.success('Trip created!'); }}
        />
      )}
    </div>
  );
}
