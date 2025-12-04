import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key
const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(supabaseUrl, supabaseServiceKey);
};

export async function GET(request: NextRequest) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        console.log('[Admin Users API] Received request');

        // Verify authentication
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            console.error('[Admin Users API] Missing authorization header');
            return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        console.log('[Admin Users API] Verifying token...');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            console.error('[Admin Users API] Invalid token:', authError?.message);
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        console.log('[Admin Users API] User authenticated:', user.id);

        // Verify admin role
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role, membership_type')
            .eq('id', user.id)
            .single();

        console.log('[Admin Users API] Profile data:', profile);
        console.log('[Admin Users API] Profile error:', profileError);

        if (profileError || (profile?.role !== 'admin' && profile?.membership_type !== 'admin')) {
            console.error('[Admin Users API] Unauthorized - role:', profile?.role, 'membership_type:', profile?.membership_type);
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        console.log('[Admin Users API] Admin verified, fetching users from profiles...');

        // Fetch all users from profiles table with their vehicles
        const { data: users, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('*, vehicles(*)')
            .order('created_at', { ascending: false });

        if (fetchError) {
            console.error('[Admin Users API] Fetch error:', fetchError);
            throw fetchError;
        }

        if (users && users.length > 0) {
            console.log('[Admin Users API] First user keys:', Object.keys(users[0]));
        }

        console.log('[Admin Users API] Successfully fetched', users?.length, 'users from profiles');
        return NextResponse.json(users);
    } catch (error: any) {
        console.error('[Admin Users API] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
