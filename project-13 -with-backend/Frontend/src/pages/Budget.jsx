import { useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Plus, Trash2, Loader2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import './Budget.css';

const CATEGORY_COLORS_MAP = {
  transport: '#3b82f6', accommodation: '#8b5cf6', food: '#f59e0b',
  entertainment: '#ec4899', shopping: '#06b6d4', health: '#22c55e',
  visa: '#f97316', misc: '#6b7280',
};

const CATEGORIES = ['transport', 'accommodation', 'food', 'entertainment', 'shopping', 'health', 'visa', 'misc'];

function ExpenseForm({ tripId, onDone }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', amount: '', category: 'misc', currency: 'USD', notes: '' });

  const mut = useMutation({
    mutationFn: () => api.post(`/trips/${tripId}/expenses`, { ...form, amount: Number(form.amount) }),
    onSuccess: () => { qc.invalidateQueries(['expenses', tripId]); toast.success('Expense added'); onDone(); },
    onError: e => toast.error(e.message),
  });

  return (
    <motion.div className="expense-form" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="expense-form__row">
        <input className="input" placeholder="Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={{ flex: 2 }} />
        <input className="input" type="number" placeholder="Amount *" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} style={{ flex: 1 }} />
        <select className="input" value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} style={{ flex: 1 }}>
          {['USD', 'EUR', 'GBP', 'INR', 'JPY'].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="expense-form__row">
        <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <input className="input" placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ flex: 2 }} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" style={{ fontSize: '0.8rem' }} onClick={onDone}>Cancel</button>
        <button className="btn btn-primary" style={{ fontSize: '0.8rem' }}
          disabled={!form.title.trim() || !form.amount || mut.isPending}
          onClick={() => mut.mutate()}>
          {mut.isPending ? <Loader2 size={14} className="spin" /> : 'Add Expense'}
        </button>
      </div>
    </motion.div>
  );
}

export default function BudgetPage() {
  const { tripId } = useParams({ strict: false });
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: tripData } = useQuery({ queryKey: ['trip', tripId], queryFn: () => api.get(`/trips/${tripId}`).then(r => r.data) });
  const myRole = tripData?.myRole || 'viewer';
  const canEdit = myRole === 'owner' || myRole === 'editor';
  const totalBudget = tripData?.trip?.totalBudget || 0;

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => api.get(`/trips/${tripId}/expenses`).then(r => r.data),
    enabled: !!tripId,
  });

  const delMut = useMutation({
    mutationFn: id => api.delete(`/expenses/${id}`),
    onSuccess: () => { qc.invalidateQueries(['expenses', tripId]); toast.success('Deleted'); },
  });

  const totalSpent = data?.summary?.total || 0;
  const remaining = totalBudget - totalSpent;
  const pct = totalBudget ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  const pieData = Object.entries(data?.summary?.byCategory || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), value,
  }));

  const barData = CATEGORIES.map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    amount: data?.summary?.byCategory?.[cat] || 0,
  })).filter(d => d.amount > 0);

  if (isLoading) return <div className="trip-detail-loading"><Loader2 size={24} className="spin" /></div>;

  return (
    <div className="subpage">
      <div className="subpage__header">
        <h2 className="subpage__title">Budget & Expenses</h2>
        {canEdit && (
          <button className="btn btn-primary" style={{ fontSize: '0.8rem' }} onClick={() => setShowForm(p => !p)}>
            <Plus size={15} /> Add Expense
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && <ExpenseForm tripId={tripId} onDone={() => setShowForm(false)} />}
      </AnimatePresence>

      {/* Summary Cards */}
      <div className="budget-summary">
        {[
          { label: 'Total Budget', value: `$${totalBudget.toLocaleString()}`, icon: DollarSign, color: 'var(--brand-400)' },
          { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, icon: TrendingUp, color: 'var(--warning)' },
          { label: 'Remaining', value: `$${remaining.toLocaleString()}`, icon: TrendingDown, color: remaining >= 0 ? 'var(--success)' : 'var(--danger)' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} className="budget-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="budget-card__icon" style={{ background: `${color}20` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <div className="budget-card__value" style={{ color }}>{value}</div>
              <div className="budget-card__label">{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Bar */}
      {totalBudget > 0 && (
        <div className="budget-progress">
          <div className="budget-progress__bar">
            <div
              className="budget-progress__fill"
              style={{ width: `${pct}%`, background: pct > 90 ? 'var(--danger)' : pct > 70 ? 'var(--warning)' : 'var(--brand-500)' }}
            />
          </div>
          <span className="budget-progress__label">{pct}% of budget used</span>
        </div>
      )}

      {/* Charts */}
      {pieData.length > 0 && (
        <div className="budget-charts">
          <div className="chart-card">
            <h3 className="chart-card__title">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value" labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS_MAP[entry.name.toLowerCase()] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Amount']} contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '8px', color: '#f5f5f5' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3 className="chart-card__title">Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
                <XAxis dataKey="name" tick={{ fill: '#a3a3a3', fontSize: 11 }} />
                <YAxis tick={{ fill: '#a3a3a3', fontSize: 11 }} />
                <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Amount']} contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '8px', color: '#f5f5f5' }} />
                <Bar dataKey="amount" fill="var(--brand-500)" radius={[4, 4, 0, 0]}>
                  {barData.map(entry => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS_MAP[entry.name.toLowerCase()] || 'var(--brand-500)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Expense List */}
      <div className="expense-list">
        <h3 className="expense-list__title">All Expenses ({data?.expenses?.length || 0})</h3>
        {data?.expenses?.length === 0 ? (
          <div className="trip-detail__placeholder" style={{ padding: '2rem' }}>No expenses recorded yet.</div>
        ) : (
          data?.expenses?.map((exp, i) => (
            <motion.div key={exp._id} className="expense-item"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
              <div className="expense-item__dot" style={{ background: CATEGORY_COLORS_MAP[exp.category] || '#6b7280' }} />
              <div className="expense-item__info">
                <span className="expense-item__title">{exp.title}</span>
                <span className="expense-item__meta">
                  {exp.category} · {exp.paidBy?.name} · {new Date(exp.date).toLocaleDateString()}
                  {exp.notes && ` · ${exp.notes}`}
                </span>
              </div>
              <span className="expense-item__amount">₹{exp.amount.toLocaleString()}</span>
              {canEdit && (
                <button className="activity-item__del" onClick={() => delMut.mutate(exp._id)}><Trash2 size={13} /></button>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
