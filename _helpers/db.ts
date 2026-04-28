import config from '../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: any = {};
export default db;

// run init safely
initialize().catch(err => {
  console.error('Database initialization failed:', err.message);
});

async function initialize() {
  const { host, port, user, password, database } = config.database;

  try {
    const connection = await mysql.createConnection({
      host: host || '127.0.0.1',
      port: port || 3306,
      user: user || 'root',
      password: password || '' // ← IMPORTANT for XAMPP
    });

    console.log(' MySQL connected');

    // Create DB if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // Sequelize connection
    const sequelize = new Sequelize(database, user, password || '', {
      dialect: 'mysql',
      host: host || '127.0.0.1',
      port: port || 3306,
      logging: false
    });

    // Init models
    db.Account = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);

    // Relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    // Sync DB
    await sequelize.sync();

    console.log(' Database synced');
  } catch (error: any) {
    console.error(' DB ERROR:', error.message);

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(' Fix: Check your MySQL username/password in config.json');
    }

    if (error.code === 'ECONNREFUSED') {
      console.error(' Fix: Make sure MySQL is running (XAMPP)');
    }

    throw error; // keep crash for visibility
  }
}