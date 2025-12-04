import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const { scan_id, vendor_name } = await request.json();

        if (!scan_id || !vendor_name) {
            return NextResponse.json({ error: 'Missing scan_id or vendor_name' }, { status: 400 });
        }

        // Create Supabase client with service role to bypass RLS
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error } = await supabase
            .from('qr_code_scans')
            .update({ vendor_id: vendor_name })
            .eq('id', scan_id);

        if (error) {
            console.error('Error updating scan log:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Server error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
