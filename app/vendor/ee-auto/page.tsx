'use client';

import VendorDashboard from '@/components/VendorDashboard';

export default function EEAutoTrackingPage() {
    const VENDOR_ID = '00000000-0000-0000-0000-000000000001';
    const VENDOR_NAME = 'EE Auto';

    const dealOptionsList = [
        { type: 'driver_regular', label: { zh: '前排驾驶/副驾（普通膜）', en: 'Driver & Passenger (Regular)' }, desc: { zh: '高端汽车贴膜服务', en: 'Premium window tinting service' }, price: 100 },
        { type: 'driver_ceramic', label: { zh: '前排驾驶/副驾（陶瓷隔热膜）', en: 'Driver & Passenger (IR Ceramic)' }, desc: { zh: '高端汽车贴膜服务', en: 'Premium window tinting service' }, price: 150 },
        { type: 'windshield_regular', label: { zh: '前挡风玻璃（普通膜）', en: 'Windshield (Regular)' }, desc: { zh: '高端汽车贴膜服务', en: 'Premium window tinting service' }, price: 130 },
        { type: 'all_regular', label: { zh: '除前挡/天窗外全车（普通膜）', en: 'All Except Windshield/Sunroof (Regular)' }, desc: { zh: '高端汽车贴膜服务', en: 'Premium window tinting service' }, price: 200 },
        { type: 'all_ceramic', label: { zh: '除前挡/天窗外全车（陶瓷隔热膜）', en: 'All Except Windshield/Sunroof (IR Ceramic)' }, desc: { zh: '高端汽车贴膜服务', en: 'Premium window tinting service' }, price: 270 },
        { type: 'best_package', label: { zh: '顶级套餐（陶瓷隔热膜，除天窗外全车）', en: 'Best Film Package (IR Ceramic, All Except Sunroof)' }, desc: { zh: '高端汽车贴膜服务', en: 'Premium window tinting service' }, price: 400 }
    ];

    const brandLogo = (
        <>
            <div className="ee-auto-logo">
                <span className="ee">EE</span><span className="auto">AUTO</span>
            </div>
            <div className="ee-auto-subtitle">Premium Window Tinting</div>
        </>
    );

    return (
        <VendorDashboard
            vendorId={VENDOR_ID}
            vendorName={VENDOR_NAME}
            dealOptions={dealOptionsList}
            brandLogo={brandLogo}
        />
    );
}
