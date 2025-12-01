
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin client for server-side operations
const getSupabaseAdmin = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { email, password, fullName, username, phoneNumber, dateOfBirth, carModels, address } = await request.json();

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

        // Determine redirect URL based on environment
        const isDev = process.env.NODE_ENV === 'development';
        const redirectUrl = isDev
            ? 'http://localhost:3000/verify'
            : 'https://www.blitztclub.com/verify';

        // Register with Supabase Auth - it will automatically send verification email
        const { data, error } = await supabaseAdmin.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: redirectUrl,
                data: {
                    full_name: fullName,
                    username,
                    phone: phoneNumber,
                    date_of_birth: dateOfBirth,
                    car_models: carModels,
                    street: address?.street,
                    city: address?.city,
                    province: address?.province,
                    postal_code: address?.postalCode,
                    membership_status: 'pending',
                    membership_type: 'regular',
                    member_id: memberId,
                },
            },
        });

        if (error) throw error;
        if (!data.user) throw new Error('Registration failed');

        // Check if profile already exists (might be created by a trigger)
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

        // Only insert if profile doesn't exist
        if (!existingProfile) {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        email: email,
                        username: username,
                        full_name: fullName,
                        phone: phoneNumber,
                        date_of_birth: dateOfBirth,
                        car_models: carModels,
                        street: address?.street,
                        city: address?.city,
                        province: address?.province,
                        postal_code: address?.postalCode,
                        membership_status: 'pending',
                        membership_type: 'regular',
                        member_id: memberId,
                    },
                ]);

            if (profileError) throw profileError;
        } else {
            // Profile exists, update it with the new data
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({
                    username: username,
                    full_name: fullName,
                    phone: phoneNumber,
                    date_of_birth: dateOfBirth,
                    car_models: carModels,
                    street: address?.street,
                    city: address?.city,
                    province: address?.province,
                    postal_code: address?.postalCode,
                    member_id: memberId,
                })
                .eq('id', data.user.id);

            if (updateError) throw updateError;
        }

        return NextResponse.json({
            message: 'Registration successful! Please check your email to verify your account.',
            userId: data.user.id,
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

