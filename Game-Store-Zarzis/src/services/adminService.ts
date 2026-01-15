/**
 * Admin Service API Client
 * Protected endpoints for admin operations
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://bck.gamestorezarzis.com.tn';
const API_BASE_URL = `${API_URL}/api/admin`;
const REQUEST_TIMEOUT = 30000; // 30 seconds

export interface CreateStaffData {
    email: string;
    password: string;
    role: 'owner' | 'worker';
    full_name: string;
    phone?: string;
}

/**
 * Create a new staff member (Admin only)
 * This creates the user in Auth, assigns role, creates profile, and sends invite
 */
export async function createStaffMember(data: CreateStaffData, token: string): Promise<any> {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(`${API_BASE_URL}/staff`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorMessage = 'Failed to create staff member';
            try {
                const error = await response.json();
                errorMessage = error.detail || error.message || errorMessage;
            } catch {
                // If response is not JSON, use status text
                errorMessage = `Server error: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error: any) {
        clearTimeout(timeoutId);

        console.error('❌ API Call Failed:', error);

        // Handle specific error types
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - Le serveur ne répond pas. Vérifiez que le backend est configuré correctement.');
        }

        if (error.message === 'Failed to fetch') {
            throw new Error('Impossible de se connecter au serveur. Vérifiez que le backend est en cours d\'exécution sur http://localhost:8000');
        }

        throw error;
    }
}
