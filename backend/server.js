import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com MySQL
const createConnection = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sistema_login'
  });
};

// Inicializar banco de dados
const initDatabase = async () => {
  try {
    const connection = await createConnection();
    
    // Criar tabela de usuários
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        tipo ENUM('user', 'admin') DEFAULT 'user',
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Verificar se existe algum admin
    const [admins] = await connection.execute(
      'SELECT id FROM usuarios WHERE tipo = "admin" LIMIT 1'
    );

    if (admins.length === 0) {
      // Criar admin padrão
      const senhaHash = await bcrypt.hash('admin123', 10);
      await connection.execute(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['Administrador', 'admin@email.com', senhaHash, 'admin']
      );
      console.log('Admin padrão criado: admin@email.com / admin123');
    }

    await connection.end();
    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
};

// Middleware de autenticação
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const connection = await createConnection();
    const [users] = await connection.execute(
      'SELECT id, nome, email, tipo FROM usuarios WHERE id = ?',
      [decoded.id]
    );
    await connection.end();

    if (users.length === 0) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware de admin
const adminMiddleware = (req, res, next) => {
  if (req.user.tipo !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Admin apenas.' });
  }
  next();
};

// Rotas

// Cadastro
app.post('/api/cadastro', async (req, res) => {
  let connection;
  try {
    const { nome, email, senha, tipo = 'user' } = req.body;

    connection = await createConnection();

    // Verificar se email já existe
    const [existingUsers] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email já cadastrado!' 
      });
    }

    // Criptografar senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Inserir usuário
    await connection.execute(
      'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
      [nome, email, senhaHash, tipo]
    );

    res.status(201).json({
      success: true,
      message: 'Cadastro realizado com sucesso!'
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor'
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Login
app.post('/api/login', async (req, res) => {
  let connection;
  try {
    const { email, senha } = req.body;

    connection = await createConnection();

    // Buscar usuário
    const [users] = await connection.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Usuário não encontrado!'
      });
    }

    const usuario = users[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(400).json({
        success: false,
        message: 'Senha incorreta!'
      });
    }

    // Gerar token
    const token = jwt.sign(
      { id: usuario.id }, 
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor'
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Rota do admin - obter estatísticas
app.get('/api/admin/estatisticas', authMiddleware, adminMiddleware, async (req, res) => {
  let connection;
  try {
    connection = await createConnection();

    // Contar total de usuários
    const [totalResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM usuarios'
    );

    // Buscar todos os usuários
    const [usuarios] = await connection.execute(
      'SELECT id, nome, email, tipo, data_criacao FROM usuarios ORDER BY data_criacao DESC'
    );

    res.json({
      success: true,
      totalUsuarios: totalResult[0].total,
      usuarios
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados'
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Rota protegida para usuário comum
app.get('/api/user/dashboard', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: `Bem-vindo, ${req.user.nome}!`,
    user: req.user
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  await initDatabase();
});