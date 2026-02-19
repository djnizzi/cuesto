export const DISCOGS_CONSUMER_KEY = process.env.DISCOGS_CONSUMER_KEY || '';
export const DISCOGS_CONSUMER_SECRET = process.env.DISCOGS_CONSUMER_SECRET || '';
export const DISCOGS_CALLBACK_URL = 'cuesto://oauth/callback';

// App info - read from package.json
import { version, name } from '../package.json';

export const APP_NAME = name || 'CUEsto';
export const APP_VERSION = version;