'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthErrorHandler() {
    const router = useRouter();

    useEffect(() => {
        // Check for auth errors in URL hash
        const hash = window.location.hash;
        if (hash.includes('error=') || hash.includes('error_code=')) {
            // Extract error parameters
            const params = new URLSearchParams(hash.substring(1));
            const error = params.get('error');
            const errorCode = params.get('error_code');
            const errorDescription = params.get('error_description');

            // Redirect to error page with these params
            const errorUrl = new URLSearchParams();
            if (error) errorUrl.set('error', error);
            if (errorCode) errorUrl.set('error_code', errorCode);
            if (errorDescription) errorUrl.set('error_description', errorDescription);

            router.push(`/auth/error?${errorUrl.toString()}`);
        }
    }, [router]);

    return null; // This component doesn't render anything
}
