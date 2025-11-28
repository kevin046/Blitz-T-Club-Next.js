import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Email configuration
const transporter = nodemailer.createTransport({
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

const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

export async function POST(request: NextRequest) {
    try {
        const { userId, email } = await request.json();

        if (!userId || !email) {
            return NextResponse.json(
                { error: 'User ID and email are required' },
                { status: 400 }
            );
        }

        const verificationToken = generateVerificationToken();

        // Update verification token in user profile
        const { error: updateError } = await supabase
            .from('users')
            .update({ verification_token: verificationToken })
            .eq('id', userId);

        if (updateError) {
            throw updateError;
        }

        // Get site URL from environment or use default
        const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
        const verificationUrl = `${siteUrl}/verify-email?token=${verificationToken}`;

        // Send verification email
        await transporter.sendMail({
            from: 'info@blitztclub.com',
            to: email,
            subject: 'Verify Your Blitz Tesla Club Membership',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="https://qhkcrrphsjpytdfqfamq.supabase.co/storage/v1/object/public/avatars//logo.png" alt="Blitz Tesla Club Logo" style="width: 150px; margin: 20px auto; display: block;">
          <h1 style="color: #171a20; text-align: center;">Verify Your Email</h1>
          <p>Please verify your email to activate your Blitz Tesla Club membership.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #171a20; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this email, please ignore it.
          </p>
        </div>
      `,
        });

        return NextResponse.json({
            message: 'Verification email resent successfully',
        });
    } catch (error: any) {
        console.error('Resend verification error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
