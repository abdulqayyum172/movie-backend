import React, { useState } from 'react';
import { Tv, Radio, Heart, Users, ShieldAlert } from 'lucide-react';
import './LiveTV.css';

const LiveTV = () => {
  const channels = [
    {
      id: 'news',
      name: 'Sky News International',
      category: 'News',
      logo: '📰',
      viewers: '12.4K',
      url: 'https://www.youtube.com/embed/9AuqeaGP1nE?autoplay=1&mute=1'
    },
    {
      id: 'space',
      name: 'NASA TV Live',
      category: 'Science',
      logo: '🚀',
      viewers: '8.1K',
      url: 'https://www.youtube.com/embed/21X5lGlDOfg?autoplay=1&mute=1'
    },
    {
      id: 'retro',
      name: 'Classic Cinema TV',
      category: 'Movies',
      logo: '🎞️',
      viewers: '5.6K',
      url: 'https://www.youtube.com/embed/5F7tN3Qh-wY?autoplay=1&mute=1'
    },
    {
      id: 'nature',
      name: 'CineStream Earth',
      category: 'Relaxation',
      logo: '🌿',
      viewers: '3.2K',
      url: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1'
    }
  ];

  const [activeChannel, setActiveChannel] = useState(channels[0]);

  return (
    <main className="container page-view live-tv-view">
      <div className="page-header">
        <h2 className="page-title"><span className="live-badge">LIVE</span> CineStream Broadcast</h2>
        <p className="page-subtitle">Watch live broadcasts, space missions, documentaries, and news channels 24/7.</p>
      </div>

      <div className="live-tv-grid">
        <div className="live-player-area">
          <div className="live-iframe-wrapper">
            <iframe
              key={activeChannel.id}
              src={activeChannel.url}
              title={activeChannel.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
          
          <div className="live-player-info">
            <div className="channel-detail">
              <span className="channel-emoji">{activeChannel.logo}</span>
              <div>
                <h3>{activeChannel.name}</h3>
                <span className="category-tag">{activeChannel.category}</span>
              </div>
            </div>
            <div className="channel-status">
              <span className="live-indicator"><span className="pulse-dot"></span> LIVE</span>
              <span className="viewers-count"><Users size={16} /> {activeChannel.viewers} watching</span>
            </div>
          </div>
        </div>

        <div className="channel-sidebar">
          <h3>Channel List</h3>
          <div className="channels-list">
            {channels.map((channel) => (
              <button
                key={channel.id}
                className={`channel-item ${activeChannel.id === channel.id ? 'active' : ''}`}
                onClick={() => setActiveChannel(channel)}
              >
                <span className="channel-item-logo">{channel.logo}</span>
                <div className="channel-item-details">
                  <div className="channel-item-name">{channel.name}</div>
                  <div className="channel-item-sub">
                    <span>{channel.category}</span>
                    <span>•</span>
                    <span>{channel.viewers}</span>
                  </div>
                </div>
                {activeChannel.id === channel.id && <Tv size={16} className="active-channel-icon" />}
              </button>
            ))}
          </div>
          <div className="sidebar-footer">
            <ShieldAlert size={16} />
            <span>Broadcasts are loaded from official open-source live feeds.</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LiveTV;
