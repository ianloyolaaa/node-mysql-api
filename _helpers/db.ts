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

    // In production, skip CREATE DATABASE (managed hosts don't allow it)
    if (process.env['NODE_ENV'] !== 'production') {
        const connection = await mysql.createConnection({ host, port, user, password });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    }

    const sequelize = new Sequelize(database, user, password, {
        dialect: 'mysql',
        host,
        port,
        logging: false,
        dialectOptions: process.env['DB_SSL'] === 'true'
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {}
    });

    db.Account      = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);

    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    await sequelize.sync();
}