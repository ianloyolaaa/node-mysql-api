import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: any = {};
export default db;

initialize();

async function initialize() {
    const host     = process.env['DB_HOST']     || 'localhost';
    const port     = parseInt(process.env['DB_PORT'] || '3306');
    const user     = process.env['DB_USER']     || 'root';
    const password = process.env['DB_PASSWORD'] || '';
    const database = process.env['DB_NAME']     || 'node_mysql_api';
    const useSSL   = process.env['DB_SSL'] === 'true';

    // Only try to create DB locally — cPanel manages it already
    if (process.env['NODE_ENV'] !== 'production') {
        const connection = await mysql.createConnection({ host, port, user, password });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        await connection.end();
    }

    const sequelize = new Sequelize(database, user, password, {
        dialect: 'mysql',
        host,
        port,
        logging: false,
        dialectOptions: useSSL ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        } : {},
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });

    // Test connection
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        throw error;
    }

    db.Account      = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);

    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    await sequelize.sync();
    console.log('✅ Database synced.');
}