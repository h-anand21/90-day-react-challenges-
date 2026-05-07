import { useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Plane, Hotel, Car, Map, Utensils, Package, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import './Reservations.css';

const TYPE_ICONS = { flight: Plane, hotel: Hotel, car: Car, tour: Map, restaurant: Utensils, other: Package };
const TYPE_COLORS = { flight: '#3b82f6', hotel: '#8b5cf6', car: '#f59e0b', tour: '#22c55e', restaurant: '#f97316', other: '#6b7280' };
const STATUS_BADGE = { pending: 'badge-yellow', confirmed: 'badge-green', cancelled: 'badge-red', completed: 'badge-gray' };

function ReservationForm({ tripId, onDone }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ type: 'hotel', title: '', vendor: '', confirmationCode: '', checkIn: '', checkOut: '', cost: '', currency: 'USD', status: 'pending', notes: '' });

  const mut = useMutation({
    mutationFn: () => api.post(`/trips/${tripId}/reservations`, { ...form, cost: Number(form.cost) || 0 }),
    onSuccess: () => { qc.invalidateQueries(['reservations', tripId]); toast.success('Reservation added'); onDone(); },
    onError: e => toast.error(e.message),
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <motion.div className="res-form" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="res-form__row">
        <select className="input" value={form.type} onChange={set('type')}>
          {Object.keys(TYPE_ICONS).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <input className="input" placeholder="Title *" value={form.title} onChange={set('title')} style={{ flex: 2 }} />
      </div>
      <div className="res-form__row">
        <input className="input" placeholder="Vendor / Provider" value={form.vendor} onChange={set('vendor')} />
        <input className="input" placeholder="Confirmation Code" value={form.confirmationCode} onChange={set('confirmationCode')} />
      </div>
      <div className="res-form__row">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="label">Check-in</label>
          <input type="date" className="input" value={form.checkIn} onChange={set('checkIn')} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="label">Check-out</label>
          <input type="date" className="input" value={form.checkOut} onChange={set('checkOut')} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="label">Cost</label>
          <input type="number" className="input" placeholder="0" value={form.cost} onChange={set('cost')} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={set('status')}>
            {['pending', 'confirmed', 'cancelled', 'completed'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <input className="input" placeholder="Notes (optional)" value={form.notes} onChange={set('notes')} />
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" style={{ fontSize: '0.8rem' }} onClick={onDone}>Cancel</button>
        <button className="btn btn-primary" style={{ fontSize: '0.8rem' }}
          disabled={!form.title.trim() || mut.isPending} onClick={() => mut.mutate()}>
          {mut.isPending ? <Loader2 size={14} className="spin" /> : 'Save Reservation'}
        </button>
      </div>
    </motion.div>
  );
}

export default function ReservationsPage() {
  const { tripId } = useParams({ strict: false });
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('');

  const { data: tripData } = useQuery({ queryKey: ['trip', tripId], queryFn: () => api.get(`/trips/${tripId}`).then(r => r.data) });
  const myRole = tripData?.myRole || 'viewer';
  const canEdit = myRole === 'owner' || myRole === 'editor';

  const { data, isLoading } = useQuery({
    queryKey: ['reservations', tripId, filterType],
    queryFn: () => api.get(`/trips/${tripId}/reservations${filterType ? `?type=${filterType}` : ''}`).then(r => r.data),
    enabled: !!tripId,
  });

  const delMut = useMutation({
    mutationFn: id => api.delete(`/reservations/${id}`),
    onSuccess: () => { qc.invalidateQueries(['reservations', tripId]); toast.success('Deleted'); },
  });

  if (isLoading) return <div className="trip-detail-loading"><Loader2 size={24} className="spin" /></div>;

  return (
    <div className="subpage">
      <div className="subpage__header">
        <h2 className="subpage__title">Reservations ({data?.reservations?.length || 0})</h2>
        {canEdit && (
          <button className="btn btn-primary" style={{ fontSize: '0.8rem' }} onClick={() => setShowForm(p => !p)}>
            <Plus size={15} /> Add Reservation
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && <ReservationForm tripId={tripId} onDone={() => setShowForm(false)} />}
      </AnimatePresence>

      {/* Type filter */}
      <div className="res-filters">
        {['', ...Object.keys(TYPE_ICONS)].map(t => (
          <button key={t} className={`res-filter-btn ${filterType === t ? 'res-filter-btn--active' : ''}`} onClick={() => setFilterType(t)}>
            {t ? t.charAt(0).toUpperCase() + t.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {data?.reservations?.length === 0 ? (
        <div className="trip-detail__placeholder">No reservations yet.</div>
      ) : (
        <div className="res-list">
          {data?.reservations?.map((res, i) => {
            const Icon = TYPE_ICONS[res.type] || Package;
            const color = TYPE_COLORS[res.type] || '#6b7280';
            return (
              <motion.div key={res._id} className="res-card"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="res-card__icon" style={{ background: `${color}20`, color }}>
                  <Icon size={20} />
                </div>
                <div className="res-card__info">
                  <div className="res-card__top">
                    <h3 className="res-card__title">{res.title}</h3>
                    <span className={`badge ${STATUS_BADGE[res.status] || 'badge-gray'}`}>{res.status}</span>
                  </div>
                  <div className="res-card__meta">
                    {res.vendor && <span>🏢 {res.vendor}</span>}
                    {res.confirmationCode && <span>🎫 {res.confirmationCode}</span>}
                    {res.checkIn && <span>📅 {new Date(res.checkIn).toLocaleDateString()}</span>}
                    {res.checkOut && <span>→ {new Date(res.checkOut).toLocaleDateString()}</span>}
                    {res.cost > 0 && <span className="res-card__cost">{res.currency} {res.cost.toLocaleString()}</span>}
                  </div>
                  {res.notes && <p className="res-card__notes">{res.notes}</p>}
                </div>
                {canEdit && (
                  <button className="activity-item__del" onClick={() => delMut.mutate(res._id)}><Trash2 size={14} /></button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
