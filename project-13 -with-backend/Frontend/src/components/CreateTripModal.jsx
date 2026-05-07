import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import api from '../lib/api';
import './CreateTripModal.css';

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  destination: z.string().min(1, 'Destination is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  description: z.string().max(500).optional(),
  totalBudget: z.coerce.number().min(0).optional(),
  currency: z.string().max(3).default('USD'),
}).refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});

export default function CreateTripModal({ onClose, onCreated }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'USD', totalBudget: 0 },
  });

  const onSubmit = async (data) => {
    await api.post('/trips', data);
    onCreated();
  };

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className="modal"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal__header">
            <h2 className="modal__title">Create New Trip</h2>
            <button className="modal__close" onClick={onClose}><X size={18} /></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="modal__body" noValidate>
            {/* Title */}
            <div className="form-group">
              <label className="label">Trip Title *</label>
              <input className={`input ${errors.title ? 'error' : ''}`} placeholder="Summer in Europe" {...register('title')} />
              {errors.title && <p className="error-text">{errors.title.message}</p>}
            </div>

            {/* Destination */}
            <div className="form-group">
              <label className="label">Destination *</label>
              <input className={`input ${errors.destination ? 'error' : ''}`} placeholder="Paris, France" {...register('destination')} />
              {errors.destination && <p className="error-text">{errors.destination.message}</p>}
            </div>

            {/* Dates */}
            <div className="modal__row">
              <div className="form-group">
                <label className="label">Start Date *</label>
                <input type="date" className={`input ${errors.startDate ? 'error' : ''}`} {...register('startDate')} />
                {errors.startDate && <p className="error-text">{errors.startDate.message}</p>}
              </div>
              <div className="form-group">
                <label className="label">End Date *</label>
                <input type="date" className={`input ${errors.endDate ? 'error' : ''}`} {...register('endDate')} />
                {errors.endDate && <p className="error-text">{errors.endDate.message}</p>}
              </div>
            </div>

            {/* Budget */}
            <div className="modal__row">
              <div className="form-group" style={{ flex: 2 }}>
                <label className="label">Budget</label>
                <input type="number" min="0" className="input" placeholder="0" {...register('totalBudget')} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="label">Currency</label>
                <select className="input" {...register('currency')}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="label">Description</label>
              <textarea className="input" rows={3} placeholder="Optional trip notes…" {...register('description')} />
            </div>

            <div className="modal__footer">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 size={15} className="spin" /> Creating…</> : 'Create Trip'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
