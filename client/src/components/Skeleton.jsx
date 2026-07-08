import React from 'react';
import './Skeleton.css';

const Skeleton = ({ type }) => {
  if (type === 'card') {
    return (
      <div className="skeleton-card">
        <div className="skeleton-poster"></div>
        <div className="skeleton-info">
          <div className="skeleton-line title"></div>
          <div className="skeleton-line meta"></div>
        </div>
      </div>
    );
  }
  return <div className="skeleton-line"></div>;
};

export default Skeleton;
