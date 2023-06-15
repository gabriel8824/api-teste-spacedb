const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();
app.use(express.json());

// Função para criar uma conexão com o banco de dados
async function createConnection(config) {
  try {
    const sequelize = new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      dialect: config.dialect,
      port: config.port,
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });

    await sequelize.authenticate();
    console.log('Conexão estabelecida com sucesso!');

    return sequelize;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    throw error;
  }
}

// Rota POST para verificar a conexão com o banco de dados
app.post('/verificar-conexao', async (req, res) => {
  try {
    const { host, port, username, password, database, dialect } = req.body;

    const connection = await createConnection({
      host,
      port,
      username,
      password,
      database,
      dialect,
    });

    res.json({ message: 'Conexão estabelecida com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao conectar ao banco de dados' });
  }
});

// Rota POST para criar a tabela
app.post('/criar-tabela', async (req, res) => {
  try {
    const { host, port, username, password, database, dialect, tableName } = req.body;

    const connection = await createConnection({
      host,
      port,
      username,
      password,
      database,
      dialect,
    });

    const sequelize = connection;

    const model = sequelize.define(tableName, {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      tableName,
      timestamps: false
    });

    await model.sync();

    res.json({ message: 'Tabela criada com sucesso!' });
  } catch (error) {
    console.error('Erro ao criar a tabela:', error);
    res.status(500).json({ error: 'Erro ao criar a tabela' });
  }
});

// Rota DELETE para deletar uma tabela
app.delete('/deletar-tabela/:tableName', async (req, res) => {
  try {
    const { host, port, username, password, database, dialect } = req.body;
    const tableName = req.params.tableName;

    const connection = await createConnection({
      host,
      port,
      username,
      password,
      database,
      dialect,
    });

    const sequelize = connection;

    await sequelize.query(`DROP TABLE IF EXISTS ${tableName}`);

    res.json({ message: 'Tabela deletada com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar a tabela:', error);
    res.status(500).json({ error: 'Erro ao deletar a tabela' });
  }
});

// Rota POST para listar todas as tabelas
app.post('/listar-tabelas', async (req, res) => {
  try {
    const { host, port, username, password, database, dialect } = req.body;

    const connection = await createConnection({
      host,
      port,
      username,
      password,
      database,
      dialect,
    });

    const sequelize = connection;

    const tables = await sequelize.showAllSchemas();

    res.json({
      success: true,
      message: 'Tabelas listadas com sucesso',
      data: {
        tables
      }
    });
  } catch (error) {
    console.error('Erro ao listar as tabelas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar as tabelas'
    });
  }
});

app.listen(3333, () => {
  console.log('Servidor rodando na porta 3333');
});
