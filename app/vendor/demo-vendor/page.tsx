'use client';

import VendorDashboard from '@/components/VendorDashboard';


export default function DemoVendorTrackingPage() {
    const VENDOR_ID = '00000000-0000-0000-0000-000000000002';
    const VENDOR_NAME = 'Demo Vendor';

    const dealOptionsList = [
        { type: 'basic_service', label: { zh: '基础服务', en: 'Basic Service' }, desc: { zh: '标准服务套餐', en: 'Standard service package' }, price: 50 },
        { type: 'premium_service', label: { zh: '高级服务', en: 'Premium Service' }, desc: { zh: '包含额外检查', en: 'Includes extra inspection' }, price: 120 },
        { type: 'full_package', label: { zh: '全套服务', en: 'Full Package' }, desc: { zh: '全方位服务体验', en: 'Complete service experience' }, price: 250 }
    ];

    return (
        <VendorDashboard
            vendorId={VENDOR_ID}
            vendorName={VENDOR_NAME}
            vendorSubtitle="Quality Services for Tesla"
            dealOptions={dealOptionsList}
        />
    );
}
