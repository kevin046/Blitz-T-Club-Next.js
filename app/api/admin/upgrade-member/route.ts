import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminKey = process.env.ADMIN_KEY;

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

async function generateMemberId(membershipType: string): Promise<string> {
    try {
        const prefix = membershipType === 'premium' ? 'VIP-' : 'REG-';

        const { data, error } = await supabase
            .from('users')
            .select('member_id')
            .like('member_id', `${prefix}%`)
            .order('member_id', { ascending: false })
            .limit(1);

        if (error) throw error;

        let nextNumber = 1;
        if (data && data.length > 0) {
            const latestId = data[0].member_id;
            const currentNumber = parseInt(latestId.split('-')[1]);
            nextNumber = currentNumber + 1;
        }

        return `${prefix}${String(nextNumber).padStart(4, '0')}`;
    } catch (error) {
        console.error('Error generating member ID:', error);
        throw error;
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId, adminKey: requestAdminKey, specificMemberId } = await request.json();

        // Verify admin key
        if (requestAdminKey !== adminKey) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get current member details
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError) {
            throw userError;
        }

        // Generate or use specific member ID
        const newMemberId = specificMemberId || await generateMemberId('premium');

        // Update user to premium
        const { error: updateError } = await supabase
            .from('users')
            .update({
                membership_type: 'premium',
                member_id: newMemberId,
            })
            .eq('id', userId);

        if (updateError) {
            throw updateError;
        }

        // Send premium membership confirmation email
        await transporter.sendMail({
            from: 'info@blitztclub.com',
            to: user.email,
            subject: 'Welcome to Blitz Tesla Club Premium Membership!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="https://qhkcrrphsjpytdfqfamq.supabase.co/storage/v1/object/public/avatars//logo.png" alt="Blitz Tesla Club Logo" style="width: 150px; margin: 20px auto; display: block;">
          <h1 style="color: #171a20; text-align: center;">Welcome to Premium Membership!</h1>
          <p>Hi ${user.full_name},</p>
          <p>Congratulations! Your membership has been upgraded to Premium status.</p>
          <p>Your new VIP Member ID is: <strong>${newMemberId}</strong></p>
          <p>Enjoy your exclusive premium benefits!</p>
        </div>
      `,
        });

        return NextResponse.json({
            message: 'Member upgraded to premium successfully',
            newMemberId,
        });
    } catch (error: any) {
        console.error('Upgrade error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
