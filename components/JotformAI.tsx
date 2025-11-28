'use client';

import { useEffect } from 'react';

export default function JotformAI() {
    useEffect(() => {
        // Add JotForm AI Agent script
        const script = document.createElement('script');
        script.src = 'https://cdn.jotfor.ms/agent/embedjs/0197a4f8c2107841a0d93e4272525cea385d/embed.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // Cleanup script on unmount
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    return null; // This component doesn't render anything visible
}
