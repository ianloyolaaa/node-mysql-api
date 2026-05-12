"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const sequelize_1 = require("sequelize");
const account_model_1 = __importDefault(require("../accounts/account.model"));
const refresh_token_model_1 = __importDefault(require("../accounts/refresh-token.model"));
const db = {};
exports.default = db;
initialize();
async function initialize() {
    const host = process.env['DB_HOST'] || 'localhost';
    const port = parseInt(process.env['DB_PORT'] || '3306');
    const user = process.env['DB_USER'] || 'root';
    const password = process.env['DB_PASSWORD'] || '';
    const database = process.env['DB_NAME'] || 'node_mysql_api';
    // In production, skip CREATE DATABASE (managed hosts don't allow it)
    if (process.env['NODE_ENV'] !== 'production') {
        const connection = await promise_1.default.createConnection({ host, port, user, password });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    }
    const sequelize = new sequelize_1.Sequelize(database, user, password, {
        dialect: 'mysql',
        host,
        port,
        logging: false,
        dialectOptions: process.env['DB_SSL'] === 'true'
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {}
    });
    db.Account = (0, account_model_1.default)(sequelize);
    db.RefreshToken = (0, refresh_token_model_1.default)(sequelize);
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);
    await sequelize.sync();
}
