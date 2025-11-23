import React, { useState } from 'react';
import '../styles/Auth.scss';

const Cadastro = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo: 'user'
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Cadastro realizado com sucesso! Redirecionando...');
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Cadastro</h2>
        
        {message && (
          <div className={`message ${message.includes('sucesso') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome:</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Senha:</label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Tipo de Usuário:</label>
            <select name="tipo" value={formData.tipo} onChange={handleChange}>
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="auth-links">
          <a href="#" onClick={onSwitchToLogin}>
            Já tem conta? Faça login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;