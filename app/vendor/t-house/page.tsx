'use client';

import VendorDashboard from '@/components/VendorDashboard';
import '@/components/vendor-dashboard.css';

export default function THouseTrackingPage() {
    const VENDOR_ID = '00000000-0000-0000-0000-000000000003';
    const VENDOR_NAME = 'T-House';

    const dealOptionsList = [
        // Color Wrapping
        {
            type: 'color_wrapping',
            label: { zh: '改色贴膜 (Color Change Wrapping)', en: 'Color Change Wrapping' },
            desc: { zh: 'Tesla车身改色贴膜服务', en: 'Tesla vehicle color change wrapping service' },
            price: 2200
        },

        // Tesla Accessories
        {
            type: 'navigator_lights',
            label: { zh: 'Model Y 领航灯', en: 'Model Y Navigator Lights (Zebra/Light Motion)' },
            desc: { zh: 'Zebra系列/光影系列', en: 'Zebra Series / Light Motion Series' },
            price: 298
        },
        {
            type: 'yoke_steering',
            label: { zh: 'Model 3 Highland/Juniper YOKE方向盘', en: 'Model 3 Highland/Juniper YOKE Steering Wheel' },
            desc: { zh: '适用于Model 3 Highland和Juniper车型', en: 'Compatible with Model 3 Highland and Juniper' },
            price: 380
        },
        {
            type: 'shift_paddles_3',
            label: { zh: 'Model 3 Highland 换挡拨杆', en: 'Model 3 Highland Shift Paddles' },
            desc: { zh: '高质量换挡拨杆', en: 'Premium shift paddles' },
            price: 400
        },
        {
            type: 'shift_paddles_y',
            label: { zh: 'Model Y Juniper 换挡拨杆', en: 'Model Y Juniper Shift Paddles' },
            desc: { zh: '高质量换挡拨杆', en: 'Premium shift paddles' },
            price: 400
        },
        {
            type: 'floor_mats',
            label: { zh: 'Model Y/Highland/Juniper 360°全包脚垫', en: 'Model Y/Highland/Juniper 360° Full Floor Mats' },
            desc: { zh: '全车覆盖脚垫', en: 'Complete vehicle coverage floor mats' },
            price: 560
        },
        {
            type: 'electric_sunshade',
            label: { zh: 'Model Y/Juniper 电动遮阳帘', en: 'Model Y/Juniper Electric Sunshade' },
            desc: { zh: '电动控制遮阳帘', en: 'Electric control sunshade' },
            price: 640
        },
        {
            type: 'haloblk_disc',
            label: { zh: 'HaloBLK Disc轮毂', en: 'HaloBLK Disc (19"/20"/21")' },
            desc: { zh: '19寸/20寸/21寸轮毂可选（库存有限）', en: '19", 20", 21" wheels available (limited stock)' },
            price: 228
        }
    ];

    const brandLogo = (
        <>
            <div className="ee-auto-logo" style={{
                background: 'radial-gradient(circle at center, #4a4a4a 0%, #1a1a1a 100%)',
                padding: '15px',
                borderRadius: '12px'
            }}>
                <img
                    src="https://static.wixstatic.com/media/50c807_42ad4abd00e24074baa45e4ccdfc7d16~mv2.png/v1/fill/w_113,h_55,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/50c807_42ad4abd00e24074baa45e4ccdfc7d16~mv2.png"
                    alt="T-House Toronto"
                    style={{ width: '100%', maxWidth: '150px', height: 'auto', objectFit: 'contain' }}
                />
            </div>
            <div className="ee-auto-subtitle">Tesla Customization Specialists</div>
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
