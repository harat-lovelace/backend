/**
 * Central API Configuration File
 * Configured for Laragon Apache development server
 * Use environment variables from .env.local
 */

// Get API base URL from environment or use default for Laragon
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/jenjen-po-main/backend';

export const API_BASE_URL = API_URL;
