
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { to, subject, html } = await request.json();

        if (!to || !subject || !html) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await sendEmail(to, subject, html);

        return NextResponse.json({ message: 'Email sent successfully' });
    } catch (error: any) {
        console.error('Error sending email:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
