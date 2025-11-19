const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Arquivo deve ser uma imagem'));
    }
  }
});


const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cadastro_alunos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

pool.getConnection()
  .then(connection => {
    console.log('✅ Conectado ao MySQL com sucesso!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao MySQL:', err);
    process.exit(1);
  });


const validarAluno = (data) => {
  const erros = [];

  // Nome completo
  if (!data.nome_completo || data.nome_completo.trim().length < 3) {
    erros.push('Nome deve ter pelo menos 3 caracteres');
  }
  if (data.nome_completo && data.nome_completo.length > 100) {
    erros.push('Nome deve ter no máximo 100 caracteres');
  }
  if (data.nome_completo && !/^[a-zA-ZÀ-ÿ\s]+$/.test(data.nome_completo)) {
    erros.push('Nome deve conter apenas letras');
  }

  // Usuário de acesso
  if (!data.usuario_acesso || data.usuario_acesso.trim().length < 4) {
    erros.push('Usuário deve ter pelo menos 4 caracteres');
  }
  if (data.usuario_acesso && data.usuario_acesso.length > 50) {
    erros.push('Usuário deve ter no máximo 50 caracteres');
  }
  if (data.usuario_acesso && !/^[a-zA-Z0-9_]+$/.test(data.usuario_acesso)) {
    erros.push('Usuário deve conter apenas letras, números e underscore');
  }

  // Senha
  if (!data.senha || data.senha.length < 8) {
    erros.push('Senha deve ter pelo menos 8 caracteres');
  }
  if (data.senha && data.senha.length > 128) {
    erros.push('Senha deve ter no máximo 128 caracteres');
  }
  if (data.senha && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.senha)) {
    erros.push('Senha deve conter letras maiúsculas, minúsculas e números');
  }

  // Email
  if (!data.email_aluno) {
    erros.push('Email é obrigatório');
  }
  if (data.email_aluno && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email_aluno)) {
    erros.push('Email inválido');
  }
  if (data.email_aluno && data.email_aluno.length > 255) {
    erros.push('Email deve ter no máximo 255 caracteres');
  }

  // Observação (opcional)
  if (data.observacao && data.observacao.length > 500) {
    erros.push('Observação deve ter no máximo 500 caracteres');
  }

  return erros;
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando' });
});

app.post('/api/alunos', upload.single('foto'), async (req, res) => {
  try {
    const { nome_completo, usuario_acesso, senha, email_aluno, observacao } = req.body;
    
    // Validar dados
    const erros = validarAluno(req.body);
    if (erros.length > 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Erros de validação',
        erros
      });
    }

    // Verificar se usuário ou email já existem
    const [existentes] = await pool.query(
      'SELECT usuario_acesso, email_aluno FROM alunos WHERE usuario_acesso = ? OR email_aluno = ?',
      [usuario_acesso, email_aluno]
    );

    if (existentes.length > 0) {
      const usuarioExiste = existentes.some(e => e.usuario_acesso === usuario_acesso);
      const emailExiste = existentes.some(e => e.email_aluno === email_aluno);
      
      return res.status(409).json({
        sucesso: false,
        mensagem: usuarioExiste ? 'Usuário já cadastrado' : 'Email já cadastrado'
      });
    }

    const SALT_ROUNDS = 12;
    const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS);

    let fotoBuffer = null;
    let fotoTipo = null;
    
    if (req.file) {
      fotoBuffer = req.file.buffer;
      fotoTipo = req.file.mimetype;
    }

    const [result] = await pool.query(
      `INSERT INTO alunos 
       (nome_completo, usuario_acesso, senha_hash, email_aluno, observacao, foto, foto_tipo) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nome_completo.trim(), usuario_acesso.trim(), senha_hash, email_aluno.trim(), 
       observacao?.trim() || null, fotoBuffer, fotoTipo]
    );

    res.status(201).json({
      sucesso: true,
      mensagem: 'Aluno cadastrado com sucesso!',
      id_aluno: result.insertId
    });

  } catch (error) {
    console.error('Erro ao cadastrar aluno:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor',
      erro: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/alunos', async (req, res) => {
  try {
    const [alunos] = await pool.query(
      `SELECT id_aluno, nome_completo, usuario_acesso, email_aluno, 
              observacao, data_cadastro, data_atualizacao,
              CASE WHEN foto IS NOT NULL THEN true ELSE false END as tem_foto
       FROM alunos 
       ORDER BY data_cadastro DESC`
    );

    res.json({
      sucesso: true,
      total: alunos.length,
      alunos
    });
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar alunos'
    });
  }
});

// Buscar aluno por ID (com foto)
app.get('/api/alunos/:id', async (req, res) => {
  try {
    const [alunos] = await pool.query(
      'SELECT * FROM alunos WHERE id_aluno = ?',
      [req.params.id]
    );

    if (alunos.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Aluno não encontrado'
      });
    }

    const aluno = alunos[0];
    
    // Converter foto para base64 se existir
    if (aluno.foto) {
      aluno.foto = `data:${aluno.foto_tipo};base64,${aluno.foto.toString('base64')}`;
    }

    res.json({
      sucesso: true,
      aluno
    });
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar aluno'
    });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}/api`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('Erro não tratado:', err);
  process.exit(1);
});
