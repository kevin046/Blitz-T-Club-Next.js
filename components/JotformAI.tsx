'use client';

import { useEffect } from 'react';

export default function JotformAI() {
    useEffect(() => {
        // Check if script is already loaded
        const existingScript = document.querySelector('script[src*="jotfor.ms/agent"]');
        if (existingScript) {
            return; // Script already exists, don't add it again
        }

        // Add JotForm AI Agent script
        const script = document.createElement('script');
        script.src = 'https://cdn.jotfor.ms/agent/embedjs/0197a4f8c2107841a0d93e4272525cea385d/embed.js';
        script.async = true;
        script.id = 'jotform-ai-script'; // Add ID for easy identification
        document.body.appendChild(script);

        return () => {
            // Cleanup script on unmount
            const scriptElement = document.getElementById('jotform-ai-script');
            if (scriptElement && scriptElement.parentNode) {
                scriptElement.parentNode.removeChild(scriptElement);
            }

            // Also cleanup any JotForm-created elements
            const jotformElements = document.querySelectorAll('[id*="jotform"], [class*="jotform"]');
            jotformElements.forEach(el => {
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
        };
    }, []);

    return null; // This component doesn't render anything visible
}
