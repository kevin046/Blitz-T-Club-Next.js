
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        // Find user by verification token
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('verification_token', token)
            .single();

        if (error || !profile) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        // Update profile status
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
                membership_status: 'active',
                verification_token: null,
            })
            .eq('id', profile.id);

        if (updateError) throw updateError;

        return NextResponse.json({ message: 'Email verified successfully' });
    } catch (error: any) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
