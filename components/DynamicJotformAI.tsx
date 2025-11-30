'use client';

import dynamic from 'next/dynamic';

const JotformAI = dynamic(() => import('./JotformAI'), { ssr: false });

export default function DynamicJotformAI() {
    return <JotformAI />;
}
