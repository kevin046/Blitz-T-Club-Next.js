import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
    try {
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

        // 1. Stats
        // Total Users (Highest Member ID logic)
        const { data: profiles } = await supabaseAdmin
            .from('profiles')
            .select('member_id, membership_status')
            .not('member_id', 'is', null);

        let highestMemberNumber = 0;
        let active = 0, pending = 0, suspended = 0;

        profiles?.forEach(p => {
            // Member ID logic
            if (p.member_id?.startsWith('BTC')) {
                const num = parseInt(p.member_id.replace('BTC', ''), 10);
                if (!isNaN(num) && num > highestMemberNumber) highestMemberNumber = num;
            }

            // Status logic
            if (p.membership_status === 'active') active++;
            else if (['pending', 'pending_verification'].includes(p.membership_status)) pending++;
            else if (p.membership_status === 'suspended') suspended++;
        });

        // Events
        const { data: eventsData } = await supabaseAdmin.from('events').select('date');
        const upcoming = eventsData?.filter(e => new Date(e.date) > new Date()).length || 0;

        // Recent Registrations (30d)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { count: recentRegs } = await supabaseAdmin
            .from('event_registrations')
            .select('id', { count: 'exact' })
            .gt('registered_at', thirtyDaysAgo.toISOString())
            .is('cancelled_at', null);

        const stats = {
            totalUsers: highestMemberNumber,
            activeEvents: upcoming,
            totalEvents: eventsData?.length || 0,
            recentRegistrations: recentRegs || 0,
            activeUsers: active,
            pendingUsers: pending,
            suspendedUsers: suspended,
        };

        // 2. Recent Activity
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentMembers } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: false })
            .limit(5);

        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const { data: recentRegistrations, error: regError } = await supabaseAdmin
            .from('event_registrations')
            .select('*')
            .gte('registered_at', threeDaysAgo.toISOString())
            .is('cancelled_at', null)
            .order('registered_at', { ascending: false })
            .limit(5);

        if (regError) {
            console.error('[Dashboard Stats] Recent registrations error:', regError);
        }

        return NextResponse.json({
            stats,
            recentMembers: recentMembers || [],
            recentRegistrations: recentRegistrations || []
        });

    } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
