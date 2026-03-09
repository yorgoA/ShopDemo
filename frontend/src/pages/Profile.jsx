import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile, updatePassword } from '../api';

export default function Profile() {
  const { token, login } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: '', email: '', address: '' });
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    getProfile(token)
      .then((data) => setProfile({ name: data.name || '', email: data.email, address: data.address || '' }))
      .catch(() => navigate('/login'))
      .finally(() => setLoadingProfile(false));
  }, [token, navigate]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    setSavingProfile(true);

    try {
      const updated = await updateProfile(token, {
        name: profile.name,
        email: profile.email,
        address: profile.address,
      });
      setProfile({ name: updated.name || '', email: updated.email, address: updated.address || '' });
      login(token, { email: updated.email, name: updated.name || '' });
      setProfileMsg('Profile saved successfully.');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      await updatePassword(token, currentPassword, newPassword);
      setPasswordMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setSavingPassword(false);
    }
  }

  if (loadingProfile) return <div className="loading" data-testid="loading">Loading profile...</div>;

  return (
    <div className="profile-page" data-testid="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-layout">
        {/* ── Profile Info ── */}
        <section className="profile-card" data-testid="profile-info-section">
          <h2>Account Details</h2>

          {profileMsg && <div className="success-message" data-testid="profile-success">{profileMsg}</div>}
          {profileError && <div className="error-message" data-testid="profile-error">{profileError}</div>}

          <form onSubmit={handleSaveProfile} data-testid="profile-form">
            <div className="form-group">
              <label htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                type="text"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your full name"
                data-testid="profile-name-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                required
                data-testid="profile-email-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-address">Address</label>
              <textarea
                id="profile-address"
                value={profile.address}
                onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                placeholder="123 Main St, City, Country"
                rows={3}
                data-testid="profile-address-input"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingProfile}
              data-testid="save-profile-button"
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </section>

        {/* ── Change Password ── */}
        <section className="profile-card" data-testid="change-password-section">
          <h2>Change Password</h2>

          {passwordMsg && <div className="success-message" data-testid="password-success">{passwordMsg}</div>}
          {passwordError && <div className="error-message" data-testid="password-error">{passwordError}</div>}

          <form onSubmit={handleChangePassword} data-testid="password-form">
            <div className="form-group">
              <label htmlFor="current-password">Current Password</label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••"
                required
                data-testid="current-password-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                data-testid="new-password-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-new-password">Confirm New Password</label>
              <input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
                data-testid="confirm-new-password-input"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingPassword}
              data-testid="change-password-button"
            >
              {savingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
