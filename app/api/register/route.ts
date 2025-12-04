
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
        const { email, password, fullName, username, phoneNumber, dateOfBirth, carModels, licensePlate, address } = await request.json();

        // Generate Member ID - Find first unused number
        const { data: allMembers } = await supabaseAdmin
            .from('profiles')
            .select('member_id');

        const usedNumbers = new Set<number>();
        if (allMembers) {
            allMembers.forEach(m => {
                if (m.member_id && m.member_id.startsWith('BTC')) {
                    const num = parseInt(m.member_id.replace('BTC', ''));
                    if (!isNaN(num)) {
                        usedNumbers.add(num);
                    }
                }
            });
        }

        let nextNumber = 1;
        while (usedNumbers.has(nextNumber)) {
            nextNumber++;
        }

        const memberId = `BTC${String(nextNumber).padStart(4, '0')}`;

        // Determine redirect URL based on environment
        const isDev = process.env.NODE_ENV === 'development';
        const redirectUrl = isDev
            ? 'http://localhost:3000/verify-email'
            : 'https://www.blitztclub.com/verify-email';

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
                    license_plate: licensePlate,
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
                        license_plate: licensePlate,
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
                    license_plate: licensePlate,
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

