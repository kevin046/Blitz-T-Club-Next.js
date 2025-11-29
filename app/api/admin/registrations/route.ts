import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(supabaseUrl, supabaseServiceKey);
};

export async function GET(request: NextRequest) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        // Verify authentication
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Verify admin role
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role, membership_type')
            .eq('id', user.id)
            .single();

        if (profileError || (profile?.role !== 'admin' && profile?.membership_type !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Fetch all registrations
        const { data: registrations, error } = await supabaseAdmin
            .from('event_registrations')
            .select('*')
            .order('registered_at', { ascending: false });

        if (error) throw error;

        // Manually fetch related profiles and events
        const userIds = [...new Set(registrations?.map((r: any) => r.user_id) || [])];
        const eventIds = [...new Set(registrations?.map((r: any) => r.event_id) || [])];

        let profiles: any[] = [];
        let events: any[] = [];

        if (userIds.length > 0) {
            const { data: profilesData } = await supabaseAdmin
                .from('profiles')
                .select('id, full_name, email, member_id, phone')
                .in('id', userIds);
            profiles = profilesData || [];
        }

        if (eventIds.length > 0) {
            const { data: eventsData } = await supabaseAdmin
                .from('events')
                .select('id, title, date, location')
                .in('id', eventIds);
            events = eventsData || [];
        }

        // Map data back to registrations
        const enrichedRegistrations = registrations?.map((reg: any) => ({
            ...reg,
            profiles: profiles.find((p: any) => p.id === reg.user_id) || null,
            events: events.find((e: any) => e.id === reg.event_id) || null
        }));

        return NextResponse.json(enrichedRegistrations);
    } catch (error: any) {
        console.error('Error fetching registrations:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
