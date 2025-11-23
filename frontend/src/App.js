import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Cadastro from './components/Cadastro';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import './styles/App.scss';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, [token]);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('login');
  };

  const renderView = () => {
    if (!user) {
      switch (currentView) {
        case 'login':
          return <Login onLogin={handleLogin} onSwitchToCadastro={() => setCurrentView('cadastro')} />;
        case 'cadastro':
          return <Cadastro onSwitchToLogin={() => setCurrentView('login')} />;
        default:
          return <Login onLogin={handleLogin} onSwitchToCadastro={() => setCurrentView('cadastro')} />;
      }
    }

    if (user.tipo === 'admin') {
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    } else {
      return <UserDashboard user={user} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;