
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

// Initialize Supabase Admin client for server-side operations
const getSupabaseAdmin = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

export async function POST(request: Request) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { email, password, fullName, username } = await request.json();
        const verificationToken = generateVerificationToken();

        // Generate Member ID
        const { data: latestMember } = await supabaseAdmin
            .from('profiles')
            .select('member_id')
            .like('member_id', 'BTC%')
            .order('member_id', { ascending: false })
            .limit(1);

        let nextNumber = 1;
        if (latestMember && latestMember.length > 0 && latestMember[0].member_id) {
            const currentNumber = parseInt(latestMember[0].member_id.replace('BTC', ''));
            if (!isNaN(currentNumber)) {
                nextNumber = currentNumber + 1;
            }
        }

        const memberId = `BTC${String(nextNumber).padStart(4, '0')}`;

        // Register with Supabase
        const { data, error } = await supabaseAdmin.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    username,
                    membership_status: 'pending',
                    membership_type: 'regular',
                    verification_token: verificationToken,
                    member_id: memberId,
                },
            },
        });

        if (error) throw error;
        if (!data.user) throw new Error('Registration failed');

        // Create profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert([
                {
                    id: data.user.id,
                    email: email,
                    username: username,
                    full_name: fullName,
                    membership_status: 'pending',
                    membership_type: 'regular',
                    verification_token: verificationToken,
                    member_id: memberId,
                },
            ]);

        if (profileError) throw profileError;

        // Send verification email
        const verificationUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
        await sendEmail(
            email,
            'Verify Your Blitz Tesla Club Membership',
            `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <img src="https://qhkcrrphsjpytdfqfamq.supabase.co/storage/v1/object/public/avatars//logo.png" alt="Blitz Tesla Club Logo" style="width: 150px; margin: 20px auto; display: block;">
            <h1 style="color: #171a20; text-align: center;">Welcome to Blitz Tesla Club!</h1>
            <p>Hi ${fullName},</p>
            <p>Thank you for joining Blitz Tesla Club! Please verify your email to activate your membership.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: #171a20; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Verify Email Address
                </a>
            </div>
            <p style="color: #666; font-size: 14px;">
                If you didn't create this account, please ignore this email.
            </p>
        </div>
      `
        );

        return NextResponse.json({
            message: 'Registration successful! Please check your email to verify your account.',
            userId: data.user.id,
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
