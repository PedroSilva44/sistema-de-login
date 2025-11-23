import React from 'react';
import '../styles/Dashboard.scss';

const UserDashboard = ({ user, onLogout }) => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Painel do Usuário</h1>
        <div className="user-info">
          <span>Olá, {user.nome}</span>
          <button onClick={onLogout} className="logout-btn">Sair</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Bem-vindo ao sistema!</h2>
          <div style={{ textAlign: 'left', marginTop: '1.5rem' }}>
            <p><strong>Nome:</strong> {user.nome}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p>
              <strong>Tipo de usuário:</strong>{' '}
              <span className={`user-type ${user.tipo}`}>
                {user.tipo}
              </span>
            </p>
            <p><strong>ID:</strong> {user.id}</p>
          </div>
          <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '5px' }}>
            <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>Recursos Disponíveis</h3>
            <ul style={{ textAlign: 'left', color: '#666' }}>
              <li>Acesso ao sistema</li>
              <li>Perfil de usuário</li>
              <li>Recursos básicos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;