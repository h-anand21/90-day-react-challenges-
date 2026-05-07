import { useAuth } from '../context/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { User, Mail, Shield, LogOut, Plane } from 'lucide-react';
import toast from 'react-hot-toast';
import './Settings.css';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    navigate({ to: '/login' });
  };

  return (
    <div className="settings page-enter">
      <h1 className="settings__title">Settings</h1>

      {/* Profile Card */}
      <motion.div className="settings-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="settings-card__header">
          <div className="settings-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <h2 className="settings-card__name">{user?.name}</h2>
            <p className="settings-card__email">{user?.email}</p>
          </div>
        </div>

        <div className="settings-info-list">
          {[
            { icon: User, label: 'Name', value: user?.name },
            { icon: Mail, label: 'Email', value: user?.email },
            { icon: Shield, label: 'Role', value: user?.role || 'user' },
            { icon: Plane, label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="settings-info-item">
              <div className="settings-info-item__icon"><Icon size={15} /></div>
              <div>
                <div className="settings-info-item__label">{label}</div>
                <div className="settings-info-item__value">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div className="settings-card settings-card--danger" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h3 className="settings-card__section-title">Account</h3>
        <p className="settings-card__desc">Sign out of your TripSync account on this device.</p>
        <button className="btn btn-danger" onClick={handleLogout}>
          <LogOut size={15} /> Sign out
        </button>
      </motion.div>
    </div>
  );
}
