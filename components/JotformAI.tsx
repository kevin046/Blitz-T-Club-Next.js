'use client';

import { useEffect } from 'react';

export default function JotformAI() {
    useEffect(() => {
        // Check if script is already loaded
        const existingScript = document.getElementById('jotform-ai-script');
        if (existingScript) {
            return; // Script already exists, don't add it again
        }

        // Add JotForm AI Agent script
        const script = document.createElement('script');
        script.src = 'https://cdn.jotfor.ms/agent/embedjs/0197a4f8c2107841a0d93e4272525cea385d/embed.js';
        script.async = true;
        script.id = 'jotform-ai-script'; // Add ID for easy identification
        document.body.appendChild(script);

        // We do NOT remove the script on unmount because re-adding it causes
        // "Identifier 'jfAgentCacheName' has already been declared" error.
        // The script declares global const/let variables that persist.

        return () => {
            // Only cleanup JotForm-created UI elements if needed, but usually better to leave them
            // or let the script handle it. For now, we'll leave them to avoid state issues.
        };
    }, []);

    return null; // This component doesn't render anything visible
}
