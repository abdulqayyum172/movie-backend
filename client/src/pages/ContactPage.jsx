import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import './ContactPage.css';

const ContactPage = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
    }, 5000);
  };

  const contactOptions = [
    {
      title: 'Technical Support',
      desc: 'Problems playing movies or logging in? Get support instantly.',
      email: 'tech@cinestream.com',
      icon: <MessageSquare size={24} />
    },
    {
      title: 'General Inquiries',
      desc: 'Have questions about features, feedback, or testing details?',
      email: 'hello@cinestream.com',
      icon: <Mail size={24} />
    }
  ];

  return (
    <main className="container page-view contact-page-view">
      <div className="page-header">
        <h2 className="page-title">Contact CineStream</h2>
        <p className="page-subtitle">We are here to help. Reach out to our technical support team or send general inquiries.</p>
      </div>

      <div className="contact-grid">
        <div className="contact-info-panel">
          <div className="info-cards-list">
            {contactOptions.map((opt, i) => (
              <div key={i} className="info-card-premium">
                <div className="info-card-icon">{opt.icon}</div>
                <h3>{opt.title}</h3>
                <p>{opt.desc}</p>
                <a href={`mailto:${opt.email}`} className="info-card-link">{opt.email}</a>
              </div>
            ))}
          </div>

          <div className="contact-details-box">
            <div className="detail-row">
              <MapPin size={20} />
              <div>
                <h4>Headquarters</h4>
                <p>100 CineStream Blvd, Los Angeles, CA 90028</p>
              </div>
            </div>
            <div className="detail-row">
              <Phone size={20} />
              <div>
                <h4>Helpline</h4>
                <p>+1 (800) 555-CINE (Mock Line)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-panel">
          <h3>Send Us a Message</h3>
          {formSubmitted ? (
            <div className="form-success-box">
              <Send size={48} className="success-icon" />
              <h3>Message Sent!</h3>
              <p>Thank you for contacting CineStream support. Our team will review your message and reach out to you within 24 hours.</p>
            </div>
          ) : (
            <form className="premium-contact-form" onSubmit={handleSubmit}>
              <div className="form-row-two">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="John Doe" required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="john@example.com" required />
                </div>
              </div>
              
              <div className="form-group">
                <label>Subject</label>
                <input type="text" placeholder="How can we help you?" required />
              </div>

              <div className="form-group">
                <label>Message Content</label>
                <textarea rows="6" placeholder="Describe your issue or query in detail..." required></textarea>
              </div>

              <button type="submit" className="btn-primary btn-submit-contact">
                Submit Message <Send size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
