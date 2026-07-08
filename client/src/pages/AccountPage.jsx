import React from 'react';
import { User, Shield, CreditCard, Play, Award, Settings } from 'lucide-react';
import './AccountPage.css';

const AccountPage = ({ user, onLogout }) => {
  if (!user) {
    return (
      <main className="container page-view account-page-view">
        <div className="no-results">
          <h2>Access Denied</h2>
          <p>Please log in or sign up to view your profile dashboard.</p>
        </div>
      </main>
    );
  }

  const stats = [
    { label: 'Hours Watched', value: '42.5 hrs', icon: <Play size={20} /> },
    { label: 'Saved Titles', value: '18', icon: <Award size={20} /> },
    { label: 'Profile Status', value: 'Verified', icon: <Shield size={20} /> }
  ];

  return (
    <main className="container page-view account-page-view">
      <div className="page-header">
        <h2 className="page-title">My Account Dashboard</h2>
        <p className="page-subtitle">Manage your profile configurations, streaming statistics, and plan details.</p>
      </div>

      <div className="account-grid">
        <div className="account-sidebar-card">
          <div className="profile-hero">
            <img 
              src={user.photo_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`} 
              alt={user.username} 
              className="profile-avatar-large"
            />
            <h3>{user.username}</h3>
            <span className="profile-email">{user.email}</span>
            <span className="membership-badge">FREE TESTER MEMBER</span>
          </div>

          <div className="sidebar-stats">
            {stats.map((stat, i) => (
              <div key={i} className="stat-row">
                <span className="stat-icon">{stat.icon}</span>
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
            ))}
          </div>

          <button className="btn-logout-premium" onClick={onLogout}>
            Log Out Account
          </button>
        </div>

        <div className="account-details-panel">
          <div className="panel-section">
            <h3><Settings size={20} /> Account Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">User ID</span>
                <span className="detail-val">#CS-{user.id * 1234}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Registered Email</span>
                <span className="detail-val">{user.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Account Created</span>
                <span className="detail-val">July 2026</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Preferred Server</span>
                <span className="detail-val">Server 1 (AutoEmbed)</span>
              </div>
            </div>
          </div>

          <div className="panel-section">
            <h3><CreditCard size={20} /> Subscription & Billing</h3>
            <div className="billing-box">
              <div className="billing-info">
                <h4>CineStream Beta Plan</h4>
                <p>Enjoy unlimited 4K streams with Dolby Atmos completely free during our public beta phase.</p>
              </div>
              <div className="billing-status">
                <span className="price-pill">$0.00 / month</span>
                <span className="active-pill">ACTIVE BETA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AccountPage;
