import { useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Trash2, UserCheck, UserX, Loader2, Crown, Edit3, Eye } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import './Members.css';

const ROLE_ICONS = { owner: Crown, editor: Edit3, viewer: Eye };
const ROLE_BADGE = { owner: 'badge-orange', editor: 'badge-blue', viewer: 'badge-gray' };

export default function MembersPage() {
  const { tripId } = useParams({ strict: false });
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: tripData } = useQuery({ queryKey: ['trip', tripId], queryFn: () => api.get(`/trips/${tripId}`).then(r => r.data) });
  const myRole = tripData?.myRole || 'viewer';
  const members = tripData?.members || [];
  const isOwner = myRole === 'owner';
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('viewer');

  const addMut = useMutation({
    mutationFn: ({ email, role }) => api.post(`/trips/${tripId}/members`, { email, role }),
    onSuccess: () => {
      qc.invalidateQueries(['trip', tripId]);
      setNewEmail('');
      setNewRole('viewer');
      toast.success('Member added successfully');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to add member'),
  });

  const roleMut = useMutation({
    mutationFn: ({ userId, role }) => api.patch(`/trips/${tripId}/members/${userId}/role`, { role }),
    onSuccess: () => { qc.invalidateQueries(['trip', tripId]); toast.success('Role updated'); },
    onError: (e) => toast.error(e.message),
  });

  const removeMut = useMutation({
    mutationFn: (userId) => api.delete(`/trips/${tripId}/members/${userId}`),
    onSuccess: () => { qc.invalidateQueries(['trip', tripId]); toast.success('Member removed'); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="subpage">
      <div className="subpage__header">
        <h2 className="subpage__title">Members ({members.length})</h2>
      </div>

      {isOwner && (
        <motion.div className="member-add-form" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <input
              className="input"
              placeholder="Friend's email address..."
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && newEmail.trim() && addMut.mutate({ email: newEmail, role: newRole })}
            />
          </div>
          <div className="form-group" style={{ width: '120px' }}>
            <select
              className="input"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
          </div>
          <button
            className="btn btn-primary"
            disabled={!newEmail.trim() || addMut.isPending}
            onClick={() => addMut.mutate({ email: newEmail, role: newRole })}
          >
            {addMut.isPending ? <Loader2 size={16} className="spin" /> : <><Plus size={16} /> Add</>}
          </button>
        </motion.div>
      )}

      <div className="members-list">
        {members.map((m, i) => {
          const RoleIcon = ROLE_ICONS[m.role] || Eye;
          const isSelf = m.user._id === user?._id;
          return (
            <motion.div
              key={m._id}
              className="member-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="member-card__avatar">
                {m.user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="member-card__info">
                <span className="member-card__name">
                  {m.user.name} {isSelf && <span className="member-card__you">(you)</span>}
                </span>
                <span className="member-card__email">{m.user.email}</span>
              </div>
              <span className={`badge ${ROLE_BADGE[m.role]}`}>
                <RoleIcon size={11} /> {m.role}
              </span>

              {isOwner && !isSelf && m.role !== 'owner' && (
                <div className="member-card__actions">
                  <select
                    className="role-select"
                    value={m.role}
                    onChange={e => roleMut.mutate({ userId: m.user._id, role: e.target.value })}
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={() => removeMut.mutate(m.user._id)}
                  >
                    <UserX size={13} />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="members-info">
        <div className="members-info__roles">
          <h3>Role Permissions</h3>
          <div className="role-legend">
            {[
              { role: 'owner', perms: ['Manage everything', 'Delete trip', 'Change roles'] },
              { role: 'editor', perms: ['Edit itinerary', 'Manage checklists', 'Add expenses'] },
              { role: 'viewer', perms: ['View all content', 'Add comments'] },
            ].map(r => (
              <div key={r.role} className="role-legend__item">
                <span className={`badge ${ROLE_BADGE[r.role]}`}>{r.role}</span>
                <ul>
                  {r.perms.map(p => <li key={p}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
