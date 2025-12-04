-- Create QR scan logs table
CREATE TABLE IF NOT EXISTS public.qr_scan_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    scan_type TEXT DEFAULT 'member_verification',
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    additional_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_member_id ON public.qr_scan_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_scanned_at ON public.qr_scan_logs(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_vendor_id ON public.qr_scan_logs(vendor_id);

-- Enable RLS
ALTER TABLE public.qr_scan_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all scan logs
CREATE POLICY "Admins can view all scan logs"
ON public.qr_scan_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Policy: System can insert scan logs
CREATE POLICY "Anyone can insert scan logs"
ON public.qr_scan_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Service role has full access
CREATE POLICY "Service role has full access to scan logs"
ON public.qr_scan_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON TABLE public.qr_scan_logs IS 'Tracks all QR code scans for member verification and vendor visits';
