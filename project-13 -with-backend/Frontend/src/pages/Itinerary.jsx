import { useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Plus, Clock, MapPin, Trash2, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import './Itinerary.css';

const CATEGORY_COLORS = {
  transport: '#3b82f6', accommodation: '#8b5cf6', food: '#f59e0b',
  activity: '#f97316', sightseeing: '#22c55e', other: '#6b7280',
};

const STATUS_ICONS = {
  planned: <Circle size={14} />, confirmed: <CheckCircle2 size={14} />,
  completed: <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />,
  cancelled: <Circle size={14} style={{ color: 'var(--danger)', opacity: 0.5 }} />,
};

function ActivityForm({ dayId, tripId, onSave, onCancel }) {
  const [form, setForm] = useState({ title: '', category: 'activity', startTime: '', location: '', cost: '' });
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () => api.post(`/days/${dayId}/activities`, { ...form, cost: Number(form.cost) || 0 }),
    onSuccess: () => { qc.invalidateQueries(['itinerary', tripId]); toast.success('Activity added'); onSave(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <motion.div className="activity-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
      <input className="input" placeholder="Activity title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
      <div className="activity-form__row">
        <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
          {['transport', 'accommodation', 'food', 'activity', 'sightseeing', 'other'].map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <input className="input" placeholder="HH:MM" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
        <input className="input" type="number" placeholder="Cost" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
      </div>
      <input className="input" placeholder="Location (optional)" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
      <div className="activity-form__actions">
        <button className="btn btn-ghost" style={{ fontSize: '0.8rem' }} onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" style={{ fontSize: '0.8rem' }} disabled={!form.title.trim() || mut.isPending} onClick={() => mut.mutate()}>
          {mut.isPending ? <Loader2 size={14} className="spin" /> : 'Save Activity'}
        </button>
      </div>
    </motion.div>
  );
}

function DayCard({ day, tripId, myRole }) {
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const qc = useQueryClient();

  const delMut = useMutation({
    mutationFn: (id) => api.delete(`/activities/${id}`),
    onSuccess: () => { qc.invalidateQueries(['itinerary', tripId]); toast.success('Deleted'); },
  });

  const canEdit = myRole === 'owner' || myRole === 'editor';

  return (
    <div className="day-card">
      <div className="day-card__header" onClick={() => setOpen(p => !p)}>
        <div className="day-card__day-num">Day {day.dayNumber}</div>
        <div className="day-card__date">
          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
        {day.location && <span className="day-card__loc"><MapPin size={12} />{day.location}</span>}
        <span className="day-card__count">{day.activities?.length || 0} activities</span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="day-card__body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {day.activities?.length === 0 && !adding && (
              <p className="day-card__empty">No activities yet.</p>
            )}

            {day.activities?.map(act => (
              <motion.div key={act._id} className="activity-item" layout>
                <div className="activity-item__dot" style={{ background: CATEGORY_COLORS[act.category] }} />
                <div className="activity-item__info">
                  <div className="activity-item__top">
                    <span className="activity-item__title">{act.title}</span>
                    <span className="activity-item__status">{STATUS_ICONS[act.status]}</span>
                  </div>
                  <div className="activity-item__meta">
                    {act.startTime && <span><Clock size={11} />{act.startTime}</span>}
                    {act.location && <span><MapPin size={11} />{act.location}</span>}
                    {act.cost > 0 && <span>💰 {act.cost}</span>}
                    <span className="activity-item__cat">{act.category}</span>
                  </div>
                </div>
                {canEdit && (
                  <button className="activity-item__del" onClick={() => delMut.mutate(act._id)}>
                    <Trash2 size={13} />
                  </button>
                )}
              </motion.div>
            ))}

            <AnimatePresence>
              {adding && (
                <ActivityForm dayId={day._id} tripId={tripId} onSave={() => setAdding(false)} onCancel={() => setAdding(false)} />
              )}
            </AnimatePresence>

            {canEdit && !adding && (
              <button className="day-card__add" onClick={() => setAdding(true)}>
                <Plus size={14} /> Add activity
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ItineraryPage() {
  const { tripId } = useParams({ strict: false });

  const { data: tripData } = useQuery({ queryKey: ['trip', tripId], queryFn: () => api.get(`/trips/${tripId}`).then(r => r.data) });
  const { data, isLoading } = useQuery({
    queryKey: ['itinerary', tripId],
    queryFn: async () => {
      const daysRes = await api.get(`/trips/${tripId}/days`);
      const days = daysRes.data.days;
      const withActivities = await Promise.all(days.map(async d => {
        const actRes = await api.get(`/days/${d._id}/activities`);
        return { ...d, activities: actRes.data.activities };
      }));
      return withActivities;
    },
    enabled: !!tripId,
  });

  const myRole = tripData?.myRole || 'viewer';

  if (isLoading) return <div className="trip-detail-loading"><Loader2 size={28} className="spin" /><span>Loading itinerary…</span></div>;

  return (
    <div className="subpage">
      <div className="subpage__header">
        <h2 className="subpage__title">Itinerary</h2>
      </div>

      {data?.length === 0 ? (
        <div className="trip-detail__placeholder">No days found for this trip.</div>
      ) : (
        <div className="itinerary-days">
          {data?.map(day => (
            <DayCard key={day._id} day={day} tripId={tripId} myRole={myRole} />
          ))}
        </div>
      )}
    </div>
  );
}
