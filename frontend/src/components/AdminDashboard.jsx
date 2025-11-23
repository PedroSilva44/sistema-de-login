import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.scss';

const AdminDashboard = ({ user, onLogout }) => {
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEstatisticas();
  }, []);

  const fetchEstatisticas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/estatisticas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setEstatisticas(data);
      } else {
        setError(data.message || 'Erro ao carregar estatísticas');
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Painel Administrativo</h1>
          <div className="user-info">
            <span>Olá, {user.nome}</span>
            <button onClick={onLogout} className="logout-btn">Sair</button>
          </div>
        </header>
        <div className="dashboard-loading">Carregando dados...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Painel Administrativo</h1>
          <div className="user-info">
            <span>Olá, {user.nome}</span>
            <button onClick={onLogout} className="logout-btn">Sair</button>
          </div>
        </header>
        <div className="dashboard-content">
          <div className="message error">{error}</div>
          <button onClick={fetchEstatisticas} className="logout-btn">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Painel Administrativo</h1>
        <div className="user-info">
          <span>Olá, {user.nome}</span>
          <button onClick={onLogout} className="logout-btn">Sair</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total de Usuários</h3>
            <div className="stat-number">
              {estatisticas?.totalUsuarios || 0}
            </div>
          </div>
          <div className="stat-card">
            <h3>Administradores</h3>
            <div className="stat-number">
              {estatisticas?.usuarios?.filter(u => u.tipo === 'admin').length || 0}
            </div>
          </div>
          <div className="stat-card">
            <h3>Usuários Comuns</h3>
            <div className="stat-number">
              {estatisticas?.usuarios?.filter(u => u.tipo === 'user').length || 0}
            </div>
          </div>
        </div>

        <div className="users-table-container">
          <h2>Usuários Cadastrados</h2>
          {estatisticas?.usuarios && estatisticas.usuarios.length > 0 ? (
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Tipo</th>
                  <th>Data de Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {estatisticas.usuarios.map(usuario => (
                  <tr key={usuario.id}>
                    <td>{usuario.id}</td>
                    <td>{usuario.nome}</td>
                    <td>{usuario.email}</td>
                    <td>
                      <span className={`user-type ${usuario.tipo}`}>
                        {usuario.tipo}
                      </span>
                    </td>
                    <td>
                      {new Date(usuario.data_criacao).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
              Nenhum usuário cadastrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;