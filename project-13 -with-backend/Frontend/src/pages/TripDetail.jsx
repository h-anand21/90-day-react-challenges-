import { useParams, useNavigate, Link, Outlet, useLocation } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Globe, Users, DollarSign, CheckSquare, MapPin, FileText, Settings, Loader2 } from 'lucide-react';
import api from '../lib/api';
import './TripDetail.css';

const STATUS_BADGE = {
  planning: 'badge-gray', upcoming: 'badge-blue', ongoing: 'badge-green',
  completed: 'badge-orange', cancelled: 'badge-red',
};

const NAV_TABS = [
  { key: 'itinerary', label: 'Itinerary', icon: Calendar },
  { key: 'members', label: 'Members', icon: Users },
  { key: 'checklist', label: 'Checklist', icon: CheckSquare },
  { key: 'reservations', label: 'Reservations', icon: MapPin },
  { key: 'budget', label: 'Budget', icon: DollarSign },
];

export default function TripDetailPage() {
  const { tripId } = useParams({ strict: false });
  const navigate = useNavigate();
  const location = useLocation();

  const isBaseRoute = location.pathname === `/trips/${tripId}` || location.pathname === `/trips/${tripId}/`;

  const { data, isLoading, error } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => api.get(`/trips/${tripId}`).then(r => r.data),
    enabled: !!tripId,
  });

  if (isLoading) return (
    <div className="trip-detail-loading">
      <Loader2 size={32} className="spin" /><span>Loading trip…</span>
    </div>
  );

  if (error) return (
    <div className="trip-detail-loading" style={{ color: 'var(--danger)' }}>
      Failed to load trip.
    </div>
  );

  const { trip, members, myRole } = data;

  const days = trip.startDate && trip.endDate
    ? Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000) + 1
    : 0;

  return (
    <div className="trip-detail page-enter">
      {/* Header */}
      <div className="trip-detail__header">
        <button className="btn btn-ghost trip-back-btn" onClick={() => navigate({ to: '/dashboard' })}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="trip-detail__meta">
          <span className="trip-detail__dest"><Globe size={14} />{trip.destination}</span>
          <span className={`badge ${STATUS_BADGE[trip.status] || 'badge-gray'}`}>{trip.status}</span>
          <span className="badge badge-orange">{myRole}</span>
        </div>
      </div>

      <motion.h1
        className="trip-detail__title"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {trip.title}
      </motion.h1>
      {trip.description && <p className="trip-detail__desc">{trip.description}</p>}

      {/* Stats Row */}
      <div className="trip-detail__stats">
        {[
          { label: 'Duration', value: `${days} days`, icon: Calendar },
          { label: 'Members', value: members.length, icon: Users },
          { label: 'Budget', value: `${trip.currency} ${(trip.totalBudget || 0).toLocaleString()}`, icon: DollarSign },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="trip-stat-chip">
            <Icon size={14} />
            <span className="trip-stat-chip__label">{label}:</span>
            <span className="trip-stat-chip__value">{value}</span>
          </div>
        ))}
        <span className="trip-stat-chip">
          <Calendar size={14} />
          <span className="trip-stat-chip__label">Dates:</span>
          <span className="trip-stat-chip__value">
            {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
            {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </span>
      </div>

      {/* Tab Nav */}
      <nav className="trip-detail__tabs">
        {NAV_TABS.map(({ key, label, icon: Icon }) => (
          <Link
            key={key}
            to={`/trips/${tripId}/${key}`}
            className="trip-tab"
            activeProps={{ className: 'trip-tab trip-tab--active' }}
          >
            <Icon size={15} /> {label}
          </Link>
        ))}
      </nav>

      {/* Sub-page Content */}
      <div className="trip-detail__content">
        {isBaseRoute ? (
          <div className="trip-detail__placeholder">
            <Calendar size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <p>Select a tab above to view trip details</p>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}
