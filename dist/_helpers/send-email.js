"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
async function sendEmail({ to, subject, html, from }) {
    from = from || process.env['EMAIL_FROM'];
    const transporter = nodemailer_1.default.createTransport({
        host: process.env['SMTP_HOST'],
        port: parseInt(process.env['SMTP_PORT'] || '587'),
        auth: {
            user: process.env['SMTP_USER'],
            pass: process.env['SMTP_PASS']
        }
    });
    await transporter.sendMail({ from, to, subject, html });
}
