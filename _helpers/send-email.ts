import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendEmail({
    to,
    subject,
    html,
    from
}: any) {

    const hasResend = !!process.env.RESEND_API_KEY;

    if (hasResend) {

        try {

            const data = await resend.emails.send({
                from: from || process.env.EMAIL_FROM,
                to,
                subject,
                html
            });

            console.log('EMAIL SENT:', data);

            return;

        } catch (err) {

            console.error('RESEND ERROR:', err);
            throw err;
        }
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,

        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {

        const info: any = await transporter.sendMail({
            from: from || process.env.EMAIL_FROM,
            to,
            subject,
            html
        });

        console.log('EMAIL SENT:', info.messageId);

    } catch (err) {

        console.error('EMAIL ERROR:', err);
        throw err;
    }
}