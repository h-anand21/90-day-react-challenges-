import { useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import './Checklist.css';

const CATEGORY_COLORS = {
  packing: 'badge-orange', todo: 'badge-blue', documents: 'badge-yellow',
  shopping: 'badge-green', other: 'badge-gray',
};

function ChecklistCard({ cl, myRole }) {
  const qc = useQueryClient();
  const [newItem, setNewItem] = useState('');
  const [adding, setAdding] = useState(false);
  const canEdit = myRole === 'owner' || myRole === 'editor';

  const addMut = useMutation({
    mutationFn: () => api.post(`/checklists/${cl._id}/items`, { label: newItem }),
    onSuccess: () => { qc.invalidateQueries(['checklists']); setNewItem(''); toast.success('Item added'); },
  });

  const toggleMut = useMutation({
    mutationFn: (id) => api.patch(`/checklist-items/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries(['checklists']),
  });

  const delItemMut = useMutation({
    mutationFn: (id) => api.delete(`/checklist-items/${id}`),
    onSuccess: () => qc.invalidateQueries(['checklists']),
  });

  const delListMut = useMutation({
    mutationFn: () => api.delete(`/checklists/${cl._id}`),
    onSuccess: () => { qc.invalidateQueries(['checklists']); toast.success('Checklist deleted'); },
  });

  const completed = cl.items?.filter(i => i.isCompleted).length || 0;
  const total = cl.items?.length || 0;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="cl-card">
      <div className="cl-card__header">
        <div>
          <span className={`badge ${CATEGORY_COLORS[cl.category] || 'badge-gray'}`}>{cl.category}</span>
          <h3 className="cl-card__title">{cl.title}</h3>
        </div>
        {canEdit && (
          <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => delListMut.mutate()}>
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {total > 0 && (
        <div className="cl-progress">
          <div className="cl-progress__bar">
            <div className="cl-progress__fill" style={{ width: `${pct}%` }} />
          </div>
          <span>{completed}/{total} done</span>
        </div>
      )}

      <div className="cl-items">
        {cl.items?.map(item => (
          <div key={item._id} className={`cl-item ${item.isCompleted ? 'cl-item--done' : ''}`}>
            <button
              className={`cl-item__check ${item.isCompleted ? 'cl-item__check--checked' : ''}`}
              onClick={() => toggleMut.mutate(item._id)}
            >
              {item.isCompleted ? <Check size={12} /> : null}
            </button>
            <span className="cl-item__label">{item.label}</span>
            {canEdit && (
              <button className="cl-item__del" onClick={() => delItemMut.mutate(item._id)}>
                <Trash2 size={11} />
              </button>
            )}
          </div>
        ))}
      </div>

      {canEdit && (
        <div className="cl-add">
          {adding ? (
            <div className="cl-add__form">
              <input
                className="input"
                style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                placeholder="Item label…"
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && newItem.trim() && addMut.mutate()}
                autoFocus
              />
              <button className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                disabled={!newItem.trim() || addMut.isPending} onClick={() => addMut.mutate()}>
                Add
              </button>
              <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }} onClick={() => setAdding(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="cl-add__btn" onClick={() => setAdding(true)}>
              <Plus size={13} /> Add item
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChecklistPage() {
  const { tripId } = useParams({ strict: false });
  const qc = useQueryClient();
  const { data: tripData } = useQuery({ queryKey: ['trip', tripId], queryFn: () => api.get(`/trips/${tripId}`).then(r => r.data) });
  const myRole = tripData?.myRole || 'viewer';
  const canEdit = myRole === 'owner' || myRole === 'editor';

  const { data, isLoading } = useQuery({
    queryKey: ['checklists', tripId],
    queryFn: () => api.get(`/trips/${tripId}/checklists`).then(r => r.data),
    enabled: !!tripId,
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'todo' });

  const createMut = useMutation({
    mutationFn: () => api.post(`/trips/${tripId}/checklists`, form),
    onSuccess: () => { qc.invalidateQueries(['checklists', tripId]); setShowForm(false); setForm({ title: '', category: 'todo' }); toast.success('Checklist created'); },
    onError: e => toast.error(e.message),
  });

  if (isLoading) return <div className="trip-detail-loading"><Loader2 size={24} className="spin" /></div>;

  return (
    <div className="subpage">
      <div className="subpage__header">
        <h2 className="subpage__title">Checklists ({data?.checklists?.length || 0})</h2>
        {canEdit && (
          <button className="btn btn-primary" style={{ fontSize: '0.8rem' }} onClick={() => setShowForm(p => !p)}>
            <Plus size={15} /> New Checklist
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="cl-create-form" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <input className="input" placeholder="Checklist title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {['packing', 'todo', 'documents', 'shopping', 'other'].map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" disabled={!form.title.trim() || createMut.isPending} onClick={() => createMut.mutate()}>Create</button>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {data?.checklists?.length === 0 ? (
        <div className="trip-detail__placeholder">No checklists yet. {canEdit && 'Create one above!'}</div>
      ) : (
        <div className="cl-grid">
          {data?.checklists?.map(cl => (
            <ChecklistCard key={cl._id} cl={cl} myRole={myRole} />
          ))}
        </div>
      )}
    </div>
  );
}
