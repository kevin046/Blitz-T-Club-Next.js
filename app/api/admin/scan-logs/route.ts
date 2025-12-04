import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
    try {
        // Create Supabase client with service role
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get auth header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify the token
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Fetch scan logs from existing qr_code_scans table
        const { data: scanLogs, error } = await supabase
            .from('qr_code_scans')
            .select(`
                id,
                created_at,
                member_id,
                vendor_id,
                member_id_string,
                device_info,
                profiles!member_id (
                    full_name,
                    email
                )
            `)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error fetching scan logs:', error);
            // If table doesn't exist yet, return empty array instead of error
            if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
                return NextResponse.json([]);
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(scanLogs || []);
    } catch (error: any) {
        console.error('Server error:', error);
        // Return empty array if table doesn't exist
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
            return NextResponse.json([]);
        }
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
