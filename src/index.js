const fs = require('fs');
const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(express.json());

// Função para criar uma conexão com o banco de dados
function createConnection(config) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      ssl: {
        ca: fs.readFileSync('path/to/ca.pem'), // Caminho para o arquivo de certificado CA
        cert: fs.readFileSync('path/to/cert.pem'), // Caminho para o arquivo de certificado do cliente
        key: fs.readFileSync('path/to/key.pem'), // Caminho para o arquivo de chave do cliente
      },
    });

    connection.connect((err) => {
      if (err) {
        reject(err);
      } else {
        resolve(connection);
      }
    });

    connection.on('error', (err) => {
      console.error('Erro na conexão com o banco de dados:', err);
    });
  });
}

// Rota POST para verificar a conexão com o banco de dados
app.post('/verificar-conexao', async (req, res) => {
  try {
    const { host, user, password, database } = req.body;

    const connection = await createConnection({
      host,
      user,
      password,
      database,
    });

    console.log('Conexão estabelecida com sucesso!');
    res.json({ message: 'Conexão estabelecida com sucesso!' });

    connection.end();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    res.status(500).json({ error: 'Erro ao conectar ao banco de dados' });
  }
});

// Rota POST para criar a tabela
app.post('/criar-tabela', async (req, res) => {
  try {
    const { host, user, password, database, tableName } = req.body;

    const connection = await createConnection({
      host,
      user,
      password,
      database,
    });

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id INT PRIMARY KEY AUTO_INCREMENT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    connection.query(createTableSQL, (err) => {
      if (err) {
        console.error('Erro ao criar a tabela:', err);
        res.status(500).json({ error: 'Erro ao criar a tabela' });
      } else {
        res.json({ message: 'Tabela criada com sucesso!' });
      }

      connection.end();
    });
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

    const connection = await createConnection({
      host,
      user,
      password,
      database,
    });

    const deleteTableSQL = `DROP TABLE IF EXISTS ${tableName}`;

    connection.query(deleteTableSQL, (err) => {
      if (err) {
        console.error('Erro ao deletar a tabela:', err);
        res.status(500).json({ error: 'Erro ao deletar a tabela' });
      } else {
        res.json({ message: 'Tabela deletada com sucesso!' });
      }

      connection.end();
    });
  } catch (error) {
    console.error('Erro ao deletar a tabela:', error);
    res.status(500).json({ error: 'Erro ao deletar a tabela' });
  }
});

// Rota GET para listar todas as tabelas
app.get('/listar-tabelas', async (req, res) => {
  try {
    const { host, user, password, database } = req.body;

    const connection = await createConnection({
      host,
      user,
      password,
      database,
    });

    const showTablesSQL = 'SHOW TABLES';

    connection.query(showTablesSQL, (err, results) => {
      if (err) {
        console.error('Erro ao listar as tabelas:', err);
        res.status(500).json({ error: 'Erro ao listar as tabelas' });
      } else {
        const tables = results.map((result) => result[`Tables_in_${database}`]);
        res.json({ tables });
      }

      connection.end();
    });
  } catch (error) {
    console.error('Erro ao listar as tabelas:', error);
    res.status(500).json({ error: 'Erro ao listar as tabelas' });
  }
});

app.listen(3333, () => {
  console.log('Servidor rodando na porta 3333');
});
