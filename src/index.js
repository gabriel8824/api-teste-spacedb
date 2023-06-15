const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const PORT = process.env.PORT || 3333;

const app = express();
app.use(express.json());

// Rota POST para verificar a conexão com o banco de dados
app.post('/verificar-conexao', async (req, res) => {
  try {
    const { host, user, password, database } = req.body;

    // Configuração da conexão com o banco de dados
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database,
    });

    // Verificar a conexão
    await connection.ping();

    console.log('Conexão estabelecida com sucesso!');
    res.json({ message: 'Conexão estabelecida com sucesso!' });

    // Fechar a conexão com o banco de dados
    await connection.end();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    res.status(500).json({ error: 'Erro ao conectar ao banco de dados' });
  }
});

// Rota POST para criar a tabela
app.post('/criar-tabela', async (req, res) => {
  try {
    const { host, user, password, database, tableName } = req.body;

    // Configurações do banco de dados
    const dbConfig = {
      host,
      user,
      password,
      database,
    };

    // Conectar ao banco de dados
    const connection = await mysql.createConnection(dbConfig);

    // Comando SQL para criar a tabela
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INT PRIMARY KEY AUTO_INCREMENT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

    // Executar o comando SQL
    await connection.execute(createTableSQL);

    // Fechar a conexão com o banco de dados
    await connection.end();

    res.json({ message: 'Tabela criada com sucesso!' });
  } catch (error) {
    console.error('Erro ao criar a tabela:', error);
    res.status(500).json({ error: 'Erro ao criar a tabela' });
  }
});

// Rota DELETE para deletar uma tabela
app.delete('/deletar-tabela/:tableName', async (req, res) => {
  try {
    const { host, user, password, database } = req.body;
    const tableName = req.params.tableName;

    // Configurações do banco de dados
    const dbConfig = {
      host,
      user,
      password,
      database,
    };

    // Conectar ao banco de dados
    const connection = await mysql.createConnection(dbConfig);

    // Comando SQL para deletar a tabela
    const deleteTableSQL = `DROP TABLE IF EXISTS ${tableName}`;

    // Executar o comando SQL
    await connection.execute(deleteTableSQL);

    // Fechar a conexão com o banco de dados
    await connection.end();

    res.json({ message: 'Tabela deletada com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar a tabela:', error);
    res.status(500).json({ error: 'Erro ao deletar a tabela' });
  }
});

// Rota GET para listar todas as tabelas
app.get('/listar-tabelas', async (req, res) => {
  try {
    const { host, user, password, database } = req.body;

    // Configurações do banco de dados
    const dbConfig = {
      host,
      user,
      password,
      database,
    };

    // Conectar ao banco de dados
    const connection = await mysql.createConnection(dbConfig);

    // Comando SQL para listar todas as tabelas do banco de dados
    const listTablesSQL = `SELECT table_name FROM information_schema.tables WHERE table_schema = '${database}'`;

    // Executar o comando SQL
    const [rows] = await connection.execute(listTablesSQL);

    // Fechar a conexão com o banco de dados
    await connection.end();

    // Extrair o nome das tabelas da resposta do banco de dados
    const tables = rows.map(row => row.table_name);

    res.json({ tables });
  } catch (error) {
    console.error('Erro ao listar as tabelas:', error);
    res.status(500).json({ error: 'Erro ao listar as tabelas' });
  }
});


// Rota padrão para lidar com rotas inválidas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
