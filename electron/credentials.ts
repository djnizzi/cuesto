export const DISCOGS_CONSUMER_KEY = process.env.DISCOGS_CONSUMER_KEY || '';
export const DISCOGS_CONSUMER_SECRET = process.env.DISCOGS_CONSUMER_SECRET || '';
// Use localhost callback for better cross-platform compatibility
// The local HTTP server will handle the OAuth redirect
export const DISCOGS_CALLBACK_URL = 'http://localhost:41234/oauth/callback';
// Alternative callback URL for platforms that support custom protocols
export const DISCOGS_CALLBACK_URL_ALT = 'cuesto://oauth/callback';

// App info - read from package.json
import { version, name } from '../package.json';

export const APP_NAME = name || 'CUEsto';
export const APP_VERSION = version;