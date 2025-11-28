
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: 'smtp.privateemail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'info@blitztclub.com',
        pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const info = await transporter.sendMail({
            from: 'info@blitztclub.com',
            to,
            subject,
            html,
        });
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
