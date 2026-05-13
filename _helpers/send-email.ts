import nodemailer from 'nodemailer';

export default async function sendEmail({ to, subject, html, from }: any) {

    // Use Resend if API key exists
    const hasResend = !!process.env['RESEND_API_KEY'];

    if (hasResend) {

        const transporter = nodemailer.createTransport({
            host: 'smtp.resend.com',
            port: 587,
            secure: false,
            auth: {
                user: 'resend',
                pass: process.env['RESEND_API_KEY']
            }
        } as any);

        return await transporter.sendMail({
            from: from || process.env['EMAIL_FROM'],
            to,
            subject,
            html
        });
    }

    // Default SMTP fallback
    from = from || process.env['EMAIL_FROM'];

    const transporter = nodemailer.createTransport({
        host: process.env['SMTP_HOST'],
        port: parseInt(process.env['SMTP_PORT'] || '587'),
        secure: false,
        auth: {
            user: process.env['SMTP_USER'],
            pass: process.env['SMTP_PASS']
        }
    } as any);

    await transporter.sendMail({ from, to, subject, html });
}