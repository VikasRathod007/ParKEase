import './App.css';
import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import CreateTicketModal from './components/CreateTicketModal';
import DispatchTicketModal from './components/DispatchTicketModal';
import { AuthProvider } from './contexts/AuthContext';
import { TicketProvider } from './contexts/TicketContext';

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [createTicketModalOpen, setCreateTicketModalOpen] = useState(false);
  const [dispatchTicketModalOpen, setDispatchTicketModalOpen] = useState(false);

  const openLoginModal = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const openSignupModal = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const openCreateTicketModal = () => {
    setCreateTicketModalOpen(true);
  };

  const closeCreateTicketModal = () => {
    setCreateTicketModalOpen(false);
  };

  const openDispatchTicketModal = () => {
    setDispatchTicketModalOpen(true);
  };

  const closeDispatchTicketModal = () => {
    setDispatchTicketModalOpen(false);
  };

  return (
    <AuthProvider>
      <TicketProvider>
        <div className="min-h-screen bg-gray-100">
          <LandingPage
            onLoginClick={openLoginModal}
            onSignupClick={openSignupModal}
            onCreateTicketClick={openCreateTicketModal}
            onDispatchTicketClick={openDispatchTicketModal}
          />
          <AuthModal
            isOpen={authModalOpen}
            mode={authMode}
            onClose={closeAuthModal}
            onSwitchMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
          />
          <CreateTicketModal
            isOpen={createTicketModalOpen}
            onClose={closeCreateTicketModal}
          />
          <DispatchTicketModal
            isOpen={dispatchTicketModalOpen}
            onClose={closeDispatchTicketModal}
          />
        </div>
      </TicketProvider>
    </AuthProvider>
  );
}

export default App;
