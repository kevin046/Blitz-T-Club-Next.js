import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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
        const { data: adminProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role, membership_type')
            .eq('id', user.id)
            .single();

        if (profileError || (adminProfile?.role !== 'admin' && adminProfile?.membership_type !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { id } = params;

        // Fields allowed to be updated
        const updateData = {
            full_name: body.full_name,
            email: body.email,
            phone: body.phone,
            member_id: body.member_id,
            date_of_birth: body.date_of_birth,
            dob: body.dob, // Handle both fields just in case
            address: body.address,
            full_address: body.full_address,
            car_models: body.car_models,
            car_model: body.car_model,
            vehicle_model: body.vehicle_model,
            membership_status: body.membership_status,
            role: body.role,
        };

        // Remove undefined keys
        Object.keys(updateData).forEach(key => 
            (updateData as any)[key] === undefined && delete (updateData as any)[key]
        );

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error in PATCH /api/admin/users/[id]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
