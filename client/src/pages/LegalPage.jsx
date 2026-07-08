import React from 'react';
import { Shield, Scale, Info } from 'lucide-react';
import './LegalPage.css';

const LegalPage = ({ type }) => {
  const getContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: <Shield size={36} />,
          date: 'July 8, 2026',
          sections: [
            {
              h: '1. Information We Collect',
              p: 'We collect information that you directly provide to us, including your username, email address, and hashed password during registration. We also collect basic usage analytics, such as the titles you watch and search queries, to customize your recommendation feed.'
            },
            {
              h: '2. Cookies and Trackers',
              p: 'We use cookies and similar tracking tools to save your session status, remember whether you prefer light or dark mode, and collect anonymous platform usage statistics to help us optimize server performance.'
            },
            {
              h: '3. Data Security',
              p: 'We implement industry-standard encryption protocols (including bcrypt password hashing and secure token-based authentication) to ensure that your private profile details are shielded from unauthorized access.'
            }
          ]
        };
      case 'terms':
        return {
          title: 'Terms of Use',
          icon: <Scale size={36} />,
          date: 'July 8, 2026',
          sections: [
            {
              h: '1. Account Responsibility',
              p: 'By registering a profile, you agree to safeguard your password and accept full responsibility for all activities that occur under your account. Creating multiple duplicate accounts or sharing accounts outside your immediate household is strictly prohibited.'
            },
            {
              h: '2. Permitted Streaming Use',
              p: 'All movies, series, and live TV feeds provided on CineStream are for personal, non-commercial entertainment only. Re-recording, copying, distributing, or broadcasting any stream contents without explicit developer consent is forbidden.'
            },
            {
              h: '3. Platform Access Restrictions',
              p: 'We reserve the right to suspend or terminate accounts, refuse service, or block access to specific content segments at our discretion if terms are breached.'
            }
          ]
        };
      case 'cookies':
        return {
          title: 'Cookie Policy',
          icon: <Info size={36} />,
          date: 'July 8, 2026',
          sections: [
            {
              h: '1. What Are Cookies?',
              p: 'Cookies are small text files stored on your browser when you visit a website. They help the platform identify your browser session and load your personalized settings.'
            },
            {
              h: '2. How CineStream Uses Cookies',
              p: 'We use strictly necessary cookies to keep you logged in to your account. We also use functional cookies to save user interface settings (like your volume preferences or player server settings) so they carry over when you open new movies.'
            },
            {
              h: '3. Managing Cookie Settings',
              p: 'Most modern web browsers allow you to disable cookies completely or block cookies from specific sites. Note that disabling cookies will prevent you from logging in or saving preferences on CineStream.'
            }
          ]
        };
      default:
        return {
          title: 'Legal Documents',
          icon: <Scale size={36} />,
          date: 'July 2026',
          sections: []
        };
    }
  };

  const doc = getContent();

  return (
    <main className="container page-view legal-page-view">
      <div className="legal-doc-container">
        <div className="legal-doc-header">
          <div className="legal-doc-icon">{doc.icon}</div>
          <div>
            <h1 className="legal-title">{doc.title}</h1>
            <p className="legal-date">Last Updated: {doc.date}</p>
          </div>
        </div>

        <div className="legal-doc-body">
          <p className="legal-intro">
            Please read these {doc.title.toLowerCase()} guidelines carefully before using the CineStream streaming service. By registering or browsing content, you agree to these practices.
          </p>

          {doc.sections.map((sec, i) => (
            <div key={i} className="legal-section">
              <h3>{sec.h}</h3>
              <p>{sec.p}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default LegalPage;
