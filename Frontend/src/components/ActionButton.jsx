import React from 'react';

const icons = {
  ticket: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  car: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 16v3H5v-3m14 0H5m14 0l-2-7H7l-2 7m5-3V9a1 1 0 011-1h2a1 1 0 011 1v4" />
    </svg>
  ),
};

const ActionButton = ({ title, description, icon, onClick, bgColor, hoverColor }) => {
  return (
    <button
      className={`${bgColor} ${hoverColor} text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center`}
      onClick={onClick}
    >
      {icons[icon]}
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="opacity-90">{description}</p>
    </button>
  );
};

export default ActionButton;