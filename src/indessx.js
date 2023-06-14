const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

// Rota POST para criar a tabela
app.post('/criar-tabela', async (req, res) => {
  try {
    const { host, user, password, database, tableName } = req.body;

    // Configurações do banco de dados
    const dbConfig = {
      host: host,
      user: user,
      password: password,
      database: database,
    };

    // Conectar ao banco de dados
    const connection = await mysql.createConnection(dbConfig);

    // Comando SQL para criar a tabela
    const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (id INT PRIMARY KEY AUTO_INCREMENT)`;

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

// Iniciar o servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
