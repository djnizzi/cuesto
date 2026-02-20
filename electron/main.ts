import './env';
import { app, BrowserWindow, ipcMain, dialog, WebContentsView, Menu, MenuItem, clipboard, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import * as mm from 'music-metadata'
import { MusicBrainzApi } from 'musicbrainz-api'
import OAuth from 'oauth-1.0a'
import crypto from 'crypto'
import Store from 'electron-store'
import { DISCOGS_CONSUMER_KEY, DISCOGS_CONSUMER_SECRET, DISCOGS_CALLBACK_URL, APP_NAME } from './credentials'

const require = createRequire(import.meta.url)
let ffmpegPath = require('ffmpeg-static')

// Fix for asarUnpack
if (ffmpegPath && typeof ffmpegPath === 'string') {
  ffmpegPath = ffmpegPath.replace('app.asar', 'app.asar.unpacked');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const mbApi = new MusicBrainzApi({
  appName: 'CUEsto',
  appVersion: app.getVersion(),
  appContactInfo: 'https://github.com/NiZDesign/cuesto'
});

// ============================================
// Discogs OAuth Implementation
// ============================================

// Token storage (encrypted)
const store = new Store({
  name: 'discogs-oauth',
  encryptionKey: 'cuesto-discogs-key-2024' // In production, use a more secure key
});

// OAuth 1.0a setup
const oauth = new OAuth({
  consumer: {
    key: DISCOGS_CONSUMER_KEY,
    secret: DISCOGS_CONSUMER_SECRET
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  }
});

// Initialize custom protocol for OAuth callback
function setupOAuthProtocol() {
  // Register custom protocol for OAuth callback
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('cuesto', process.execPath, [path.resolve(process.argv[1])]);
    }
  } else {
    app.setAsDefaultProtocolClient('cuesto');
  }
  console.log('OAuth protocol registered: cuesto://');
}

// Get stored OAuth tokens
function getStoredTokens(): { accessToken: string; accessTokenSecret: string; username: string } | null {
  const tokens = store.get('oauthTokens') as { accessToken: string; accessTokenSecret: string; username: string } | null;
  return tokens || null;
}

// Save OAuth tokens
function saveTokens(accessToken: string, accessTokenSecret: string, username: string) {
  store.set('oauthTokens', { accessToken, accessTokenSecret, username });
}

// Clear OAuth tokens
function clearTokens() {
  store.delete('oauthTokens');
}

// Get authenticated user info
async function getDiscogsUser(): Promise<{ username: string } | null> {
  const tokens = getStoredTokens();
  if (!tokens) return null;

  try {
    const url = 'https://api.discogs.com/oauth/identity';
    const request = {
      url,
      method: 'GET'
    };

    const authHeader = oauth.toHeader(oauth.authorize(request, {
      key: tokens.accessToken,
      secret: tokens.accessTokenSecret
    }));

    const response = await fetch(url, {
      headers: {
        'Authorization': authHeader['Authorization'],
        'User-Agent': `${APP_NAME}/1.0`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return { username: data.username };
    }
    return null;
  } catch (e) {
    console.error('Failed to get Discogs user:', e);
    return null;
  }
}

// IPC Handlers for OAuth
ipcMain.handle('discogs:getAuthStatus', async () => {
  const tokens = getStoredTokens();
  if (!tokens) {
    return { connected: false };
  }

  const user = await getDiscogsUser();
  return {
    connected: !!user,
    username: user?.username || tokens.username
  };
});

ipcMain.handle('discogs:startOAuth', async () => {
  try {
    // Generate state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');
    store.set('oauthState', state);

    // Step 1: Get request token
    const requestTokenUrl = 'https://api.discogs.com/oauth/request_token';
    const request = {
      url: requestTokenUrl,
      method: 'POST',
      data: { oauth_callback: DISCOGS_CALLBACK_URL }
    };

    const authHeader = oauth.toHeader(oauth.authorize(request));

    const response = await fetch(requestTokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader['Authorization'],
        'User-Agent': `${APP_NAME}/1.0`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get request token: ${response.status}`);
    }

    const body = await response.text();
    const params = new URLSearchParams(body);
    const oauthToken = params.get('oauth_token');
    const oauthTokenSecret = params.get('oauth_token_secret');

    if (!oauthToken || !oauthTokenSecret) {
      throw new Error('Invalid response: missing oauth_token');
    }

    // Store temporarily
    store.set('pendingTokenSecret', oauthTokenSecret);

    // Step 2: Return authorization URL
    const authUrl = `https://www.discogs.com/oauth/authorize?oauth_token=${oauthToken}&oauth_callback=${encodeURIComponent(DISCOGS_CALLBACK_URL)}`;

    return { authUrl };
  } catch (e: any) {
    console.error('OAuth start error:', e);
    return { error: e.message };
  }
});

ipcMain.handle('discogs:handleOAuthCallback', async (_, oauthToken: string, oauthVerifier: string) => {
  try {
    const tokens = getStoredTokens();
    const pendingSecret = store.get('pendingTokenSecret') as string;

    if (!tokens || !pendingSecret) {
      // Try to exchange request token for access token
      const requestTokenUrl = 'https://api.discogs.com/oauth/access_token';
      const request = {
        url: requestTokenUrl,
        method: 'POST',
        data: {
          oauth_verifier: oauthVerifier,
          oauth_token: oauthToken
        }
      };

      const authHeader = oauth.toHeader(oauth.authorize(request, {
        key: oauthToken,
        secret: pendingSecret
      }));

      const response = await fetch(requestTokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader['Authorization'],
          'User-Agent': `${APP_NAME}/1.0`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to exchange token: ${response.status}`);
      }

      const body = await response.text();
      const params = new URLSearchParams(body);
      const accessToken = params.get('oauth_token');
      const accessTokenSecret = params.get('oauth_token_secret');

      if (!accessToken || !accessTokenSecret) {
        throw new Error('Invalid response: missing access token');
      }

      // Get username
      const user = await getDiscogsUserWithTokens(accessToken, accessTokenSecret);

      // Save tokens
      saveTokens(accessToken, accessTokenSecret, user?.username || 'Unknown');

      // Clean up
      store.delete('pendingTokenSecret');
      store.delete('oauthState');

      return { success: true, username: user?.username };
    }

    return { error: 'No pending token found' };
  } catch (e: any) {
    console.error('OAuth callback error:', e);
    return { error: e.message };
  }
});

async function getDiscogsUserWithTokens(accessToken: string, accessTokenSecret: string): Promise<{ username: string } | null> {
  try {
    const url = 'https://api.discogs.com/oauth/identity';
    const request = {
      url,
      method: 'GET'
    };

    const authHeader = oauth.toHeader(oauth.authorize(request, {
      key: accessToken,
      secret: accessTokenSecret
    }));

    const response = await fetch(url, {
      headers: {
        'Authorization': authHeader['Authorization'],
        'User-Agent': `${APP_NAME}/1.0`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return { username: data.username };
    }
    return null;
  } catch (e) {
    console.error('Failed to get user with tokens:', e);
    return null;
  }
}

ipcMain.handle('discogs:logout', async () => {
  clearTokens();
  return { success: true };
});

// Updated Discogs fetch with OAuth support
async function fetchDiscogsWithOAuth(releaseCode: string): Promise<{ result?: any; error?: string }> {
  const tokens = getStoredTokens();
  const userAgent = `${APP_NAME}/1.0`;

  const releaseId = releaseCode.replace(/\D/g, '');
  if (!releaseId) {
    return { error: 'Invalid release code format. Please provide the numeric release ID.' };
  }
  const url = `https://api.discogs.com/releases/${releaseId}`;

  try {
    let headers: Record<string, string> = {
      'User-Agent': userAgent
    };

    if (!tokens) {
      return { error: 'Please connect your Discogs account in Settings to fetch metadata.' };
    }

    // Use OAuth
    const request = {
      url,
      method: 'GET'
    };

    const authHeader = oauth.toHeader(oauth.authorize(request, {
      key: tokens.accessToken,
      secret: tokens.accessTokenSecret
    }));
    headers['Authorization'] = authHeader['Authorization'];

    const response = await fetch(url, { headers });

    if (response.ok) {
      const data = await response.json();
      const result = parseDiscogsData(data, releaseId);
      if (result) {
        return { result };
      } else {
        return { error: 'Failed to parse Discogs response.' };
      }
    }

    if (response.status === 404) {
      return { error: 'Release not found in Discogs (404).' };
    }

    return { error: `Discogs returned an error: ${response.status} ${response.statusText}` };
  } catch (e: any) {
    console.error(`Discogs fetch error:`, e.message);
    return { error: `Connection error: ${e.message}` };
  }
}

// ============================================
// End Discogs OAuth Implementation
// ============================================


// Handlers
ipcMain.handle('shell:open-folder', async (_, filePath: string) => {
  const dir = path.dirname(filePath);
  shell.openPath(dir);
});

ipcMain.handle('shell:openExternal', async (_, url: string) => {
  await shell.openExternal(url);
});

ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'CUE Sheet', extensions: ['cue', 'txt'] }]
  })
  if (canceled) {
    return null
  } else {
    const cuePath = filePaths[0]
    const content = await fs.readFile(cuePath, 'utf-8')

    // Try to find the audio file referenced in the cue
    let audioPath: string | null = null;
    const fileMatch = content.match(/^\s*FILE\s+"?([^"]*)"?\s+\w+/mi);
    if (fileMatch) {
      const audioFileName = fileMatch[1];
      const potentialPath = path.join(path.dirname(cuePath), audioFileName);
      try {
        await fs.access(potentialPath);
        audioPath = potentialPath;
      } catch {
        // Not found or not accessible
      }
    }

    return { content, filepath: cuePath, audioPath }
  }
})

ipcMain.handle('dialog:openHtml', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'HTML File', extensions: ['html', 'htm'] }]
  })
  if (canceled) {
    return null
  } else {
    const content = await fs.readFile(filePaths[0], 'utf-8')
    return { content, filepath: filePaths[0] }
  }
})

ipcMain.handle('dialog:openLabels', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Audacity Labels', extensions: ['txt'] }]
  })
  if (canceled) {
    return null
  } else {
    const content = await fs.readFile(filePaths[0], 'utf-8')
    return { content, filepath: filePaths[0] }
  }
})


ipcMain.handle('dialog:openAudioFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav', 'flac', 'm4a', 'ogg', 'opus'] }]
  })
  if (canceled) {
    return null
  } else {
    const filePath = filePaths[0]
    try {
      const metadata = await mm.parseFile(filePath)
      const durationSeconds = metadata.format.duration || 0
      // Convert to frames (75 fps)
      const totalFrames = Math.floor(durationSeconds * 75)
      const common = metadata.common;


      const formatArtists = (artists: any): string => {
        if (!artists) return '';
        // Native values are often returned as an array of objects or strings
        if (Array.isArray(artists)) {
          return artists.map(a => (typeof a === 'object' ? a.value : a)).join('; ');
        }
        return typeof artists === 'object' ? artists.value : artists;
      };

      const getAllNativeAlbumArtists = (metadata: mm.IAudioMetadata): string => {
        const albumArtists: string[] = [];

        // Define relevant tag IDs per format
        const tagMap: Record<string, string[]> = {
          'ID3v2.3': ['TPE2'],
          'ID3v2.4': ['TPE2'],
          'ID3v2.2': ['TP2'],
          'vorbis': ['ALBUMARTIST', 'ALBUM ARTIST'],
          'iTunes': ['aART']
        };

        // Iterate through available native formats
        for (const [format, tags] of Object.entries(metadata.native)) {
          const relevantIds = tagMap[format];
          if (relevantIds) {
            tags.forEach(tag => {
              if (relevantIds.includes(tag.id)) {
                const value = formatArtists(tag.value);
                if (value) albumArtists.push(value);
              }
            });
          }
        }

        // Deduplicate and join
        return [...new Set(albumArtists)].join('; ');
      };

      // Application logic
      const albumArtist = getAllNativeAlbumArtists(metadata).trim();
      const trackArtist = formatArtists(metadata.common.artists || metadata.common.artist).trim();

      // Final fallback chain
      const finalArtist = albumArtist || formatArtists(metadata.common.albumartist) || trackArtist;


      return {
        filename: path.basename(filePath),
        filepath: filePath,
        durationFrames: totalFrames,
        metadata: {
          title: common.album || '',
          artist: finalArtist,
          year: common.year?.toString() || '',
          genre: common.genre?.join('; ') || ''
        }
      }
    } catch (error) {
      console.error('Error parsing audio metadata:', error)
      return {
        filename: path.basename(filePath),
        filepath: filePath,
        durationFrames: 0,
        error: 'Could not extract duration'
      }
    }
  }
})

ipcMain.on('audio:split', async (event, cueSheet: any, sourceFilePath: string) => {
  const tracks = cueSheet.tracks;
  const totalDuration = cueSheet.totalDuration;
  const outDir = path.dirname(sourceFilePath);
  const ext = path.extname(sourceFilePath);

  if (!ffmpegPath) {
    event.sender.send('audio:split-error', 'FFmpeg binary not found.');
    return;
  }

  const framesToSeconds = (f: number) => (f / 75).toFixed(3);

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const startTime = framesToSeconds(track.index01);
    let endTime: string | null = null;

    if (i < tracks.length - 1) {
      endTime = framesToSeconds(tracks[i + 1].index01);
    } else if (totalDuration) {
      endTime = framesToSeconds(totalDuration);
    }

    const trackNum = track.number.toString().padStart(2, '0');
    const safeTitle = track.title.replace(/[\\/:"*?<>|]/g, '_');
    const outFileName = `${trackNum} - ${safeTitle}${ext}`;
    const outPath = path.join(outDir, outFileName);

    const args = [
      '-y',
      '-ss', startTime,
    ];

    if (endTime) {
      args.push('-to', endTime);
    }

    args.push('-i', sourceFilePath);

    // Metadata and Streams
    args.push(
      '-map', '0',
      '-map_metadata', '0',
      '-c', 'copy',
      '-metadata', `title=${track.title}`,
      '-metadata', `artist=${track.performer || (track.performer === '' ? cueSheet.performer : track.performer)}`,
      '-metadata', `album_artist=${cueSheet.performer}`,
      '-metadata', `album=${cueSheet.title}`,
      '-metadata', `date=${cueSheet.date || ''}`,
      '-metadata', `genre=${cueSheet.genre || ''}`,
      '-metadata', `track=${track.number}`,
      outPath
    );

    try {
      await new Promise<void>((resolve, reject) => {
        const ffmpeg = spawn(ffmpegPath as string, args);
        ffmpeg.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`FFmpeg exited with code ${code}`));
        });
        ffmpeg.on('error', reject);
      });

      // Send progress
      const progress = ((i + 1) / tracks.length) * 100;
      event.sender.send('audio:split-progress', {
        progress,
        currentTrack: i + 1,
        totalTracks: tracks.length,
        fileName: outFileName
      });
    } catch (err: any) {
      event.sender.send('audio:split-error', `Error splitting track ${trackNum}: ${err.message}`);
      return;
    }
  }

  event.sender.send('audio:split-complete');
});

ipcMain.handle('dialog:saveFile', async (_, content: string, pathOrSuggestion?: string) => {
  // If pathOrSuggestion is an absolute path, overwrite.
  // Otherwise, use it as defaultPath in showSaveDialog.

  if (pathOrSuggestion && path.isAbsolute(pathOrSuggestion)) {
    await fs.writeFile(pathOrSuggestion, content, 'utf-8');
    return true;
  }

  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: pathOrSuggestion || 'untitled.cue',
    filters: [{ name: 'CUE Sheet', extensions: ['cue'] }]
  });

  if (canceled || !filePath) return false;

  await fs.writeFile(filePath, content, 'utf-8');
  return filePath; // return new path
})

ipcMain.handle('getAppVersion', () => {
  return app.getVersion();
});

ipcMain.handle('gnudb:fetchMetadata', async (_, gnucdid: string) => {
  const name = 'cuesto';
  const email = 'svinchu@kancho.com';
  const hello = `${name}+${email}+test+1.0`;
  const proto = '6';
  const baseUrl = 'https://gnudb.gnudb.org/~cddb/cddb.cgi?cmd=cddb+read+data+';

  const id = gnucdid.trim().split(/\s+/).pop() || gnucdid.trim();
  const url = `${baseUrl}${id}&hello=${hello}&proto=${proto}`;

  const maxRetries = 2;
  const retryDelay = 2000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`GnuDB Retry attempt ${attempt}...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.text();
        const result = parseGnuDbData(data);
        if (result) {
          return { data, result };
        } else {
          return { error: 'Invalid XMCD format returned from GnuDB.' };
        }
      }

      if (response.status === 403) {
        return { error: 'GnuDB requires registration or a unique email address (403).' };
      }

      if (response.status === 404) {
        return { error: 'CD ID not found in GnuDB (404).' };
      }

      if (response.status >= 500 && attempt < maxRetries) {
        console.warn(`Attempt ${attempt + 1} failed with server error ${response.status}. Retrying...`);
        continue;
      }

      return { error: `GnuDB returned an error: ${response.status}` };

    } catch (e: any) {
      console.error(`Fetch attempt ${attempt + 1} error:`, e.message);
      if (attempt === maxRetries) {
        return { error: `Connection error: ${e.message}` };
      }
    }
  }

  return { error: 'Failed to retrieve metadata after multiple attempts.' };
});

ipcMain.handle('discogs:fetchMetadata', async (_, releaseCode: string) => {
  // Use OAuth if available, otherwise fallback to token
  return await fetchDiscogsWithOAuth(releaseCode);
});

ipcMain.handle('musicbrainz:fetchMetadata', async (_, discId: string) => {
  try {
    // lookupDiscId is not available in v1.0.0, use restGet instead
    // MusicBrainz API for discid: /ws/2/discid/<discid>?inc=recordings+artists+labels+release-groups&fmt=json
    // NOTE: 'releases' and 'discids' are not valid/needed here for the discid resource.
    const disc: any = await (mbApi as any).restGet(`/discid/${discId}`, {
      inc: 'recordings artists labels release-groups'
    });

    // MusicBrainz can return an error object with a 200 status code in some cases or via restGet
    if (disc && disc.error) {
      return { error: `MusicBrainz API error: ${disc.error}` };
    }

    if (disc && disc.releases && disc.releases.length > 0) {
      // Return the disc details (offsets) and the first release
      return { result: { disc, release: disc.releases[0] } };
    }

    if (disc && disc.id && (!disc.releases || disc.releases.length === 0)) {
      return { error: 'Disc ID found as a "CD Stub" but not yet attached to any release in MusicBrainz.' };
    }

    return { error: 'No releases found for this Disc ID.' };
  } catch (e: any) {
    console.error('MusicBrainz fetch error:', e);
    // If it's a 404 from the API, it means the Disc ID itself isn't known
    if (e.message?.includes('404')) {
      return { error: 'Disc ID not found in MusicBrainz database.' };
    }
    return { error: `MusicBrainz error: ${e.message}` };
  }
});

let viewerContent = '';

ipcMain.handle('window:open-viewer', (_, content: string) => {
  viewerContent = content;
  createViewerWindow();
});

ipcMain.handle('viewer:get-content', () => {
  return viewerContent;
});

function parseDiscogsData(data: any, releaseId?: string) {
  try {
    const artist = data.artists?.map((a: any) => a.name.replace(/\s\(\d+\)$/, '')).join(', ') || 'Unknown Artist';
    const album = data.title || 'Unknown Album';
    const year = data.year?.toString() || '';
    const genre = data.genres?.[0] || '';

    const tracks = (data.tracklist || [])
      .filter((t: any) => t.type_ === 'track')
      .map((t: any, i: number) => {
        let tArtist = artist;
        if (t.artists && t.artists.length > 0) {
          tArtist = t.artists.map((a: any) => a.name.replace(/\s\(\d+\)$/, '')).join(', ');
        }

        return {
          number: i + 1,
          title: t.title || 'Untitled',
          performer: tArtist || artist,
          duration: t.duration || '',
          position: t.position || ''
        };
      });

    return { artist, album, year, genre, tracks, releaseCode: releaseId };
  } catch (e) {
    console.error('Error parsing Discogs data:', e);
    return null;
  }
}

function getBrowserStatus(view: WebContentsView) {
  return {
    canGoBack: view.webContents.canGoBack(),
    canGoForward: view.webContents.canGoForward(),
    title: view.webContents.getTitle(),
    url: view.webContents.getURL()
  };
}

ipcMain.handle('browser:get-status', (event) => {
  // Find the view associated with the window that sent this
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return null;
  const view = (win as any).browserView; // We'll store it here
  if (!view) return null;
  return getBrowserStatus(view);
});

ipcMain.handle('browser:get-html', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return null;
  const view = (win as any).browserView;
  if (!view) return null;
  try {
    const html = await view.webContents.executeJavaScript('document.documentElement.outerHTML');
    return html;
  } catch (e) {
    console.error('Failed to get browser HTML', e);
    return null;
  }
});

ipcMain.on('browser:go-back', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const view = win ? (win as any).browserView : null;
  if (view && view.webContents.canGoBack()) {
    view.webContents.goBack();
  }
});

ipcMain.on('browser:go-forward', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const view = win ? (win as any).browserView : null;
  if (view && view.webContents.canGoForward()) {
    view.webContents.goForward();
  }
});

ipcMain.on('browser:trigger-import-1001', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  const view = (win as any).browserView;
  if (!view) return;

  try {
    const html = await view.webContents.executeJavaScript('document.documentElement.outerHTML');

    // Find the main window (the one that opened this search window, or just the first one)
    // Actually, we usually only have one main window 'win'.
    // But this 'win' is the search window. We need to find the parent or use the global 'win'.

    // Let's use the first browser window that isn't this one.
    const allWindows = BrowserWindow.getAllWindows();
    const mainWindow = allWindows.find(w => w !== win && !w.isDestroyed());

    if (mainWindow) {
      mainWindow.focus();
      mainWindow.webContents.send('1001tracklists:import-html', html);
    }
  } catch (e) {
    console.error('Failed to trigger 1001tracklists import', e);
  }
});

function createSearchWindow(url: string) {
  const searchWin = new BrowserWindow({
    width: 1024,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, 'cuesto.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    autoHideMenuBar: true,
  });
  searchWin.setMenu(null);

  const view = new WebContentsView();
  (searchWin as any).browserView = view;
  searchWin.contentView.addChildView(view);

  const HEADER_HEIGHT = 60; // Matching BrowserShell.tsx header

  const updateViewBounds = () => {
    const [width, height] = searchWin.getContentSize();
    view.setBounds({ x: 0, y: HEADER_HEIGHT, width, height: height - HEADER_HEIGHT });
  };

  searchWin.on('resize', updateViewBounds);
  updateViewBounds();

  // Load the React app in browser mode
  if (VITE_DEV_SERVER_URL) {
    searchWin.loadURL(`${VITE_DEV_SERVER_URL}?mode=browser`);
  } else {
    searchWin.loadFile(path.join(RENDERER_DIST, 'index.html'), { query: { mode: 'browser' } });
  }

  view.webContents.loadURL(url);

  // Sync status back to React
  const syncStatus = () => {
    if (searchWin.isDestroyed()) return;
    searchWin.webContents.send('browser:status-updated', getBrowserStatus(view));
  };

  view.webContents.on('did-navigate', syncStatus);
  view.webContents.on('did-navigate-in-page', syncStatus);
  view.webContents.on('page-title-updated', syncStatus);

  // Inject custom scrollbar styles to match the app's look
  const scrollbarCSS = `
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #FF7400; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #ff8c33; }
  `;
  view.webContents.on('did-finish-load', () => {
    view.webContents.insertCSS(scrollbarCSS);
  });

  view.webContents.on('context-menu', (_, params) => {
    const menu = new Menu();
    const currentUrl = view.webContents.getURL();
    const t = contextMenuTranslations[currentAppLanguage] || contextMenuTranslations.en;

    // 1. MusicBrainz Logic
    let discId: string | undefined;
    if (params.linkURL && params.linkURL.includes('/cdtoc/')) {
      discId = params.linkURL.split('/cdtoc/').pop()?.split('?')[0];
    } else if (currentUrl.includes('musicbrainz.org/cdtoc/')) {
      discId = currentUrl.split('/cdtoc/').pop()?.split('?')[0];
    }

    if (discId) {
      menu.append(new MenuItem({
        label: t.useDiscId,
        click: () => {
          win?.webContents.send('musicbrainz:set-discid', discId);
        }
      }));
      menu.append(new MenuItem({ type: 'separator' }));
    }

    // 2. Discogs Logic
    let releaseId: string | undefined;
    if (params.linkURL && params.linkURL.includes('discogs.com/release/')) {
      const parts = params.linkURL.split('/release/');
      releaseId = parts.pop()?.split('-')[0].split('?')[0];
    } else if (currentUrl.includes('discogs.com/release/')) {
      const parts = currentUrl.split('/release/');
      releaseId = parts.pop()?.split('-')[0].split('?')[0];
    }

    if (releaseId && /^\d+$/.test(releaseId)) {
      menu.append(new MenuItem({
        label: t.useReleaseCode,
        click: () => {
          win?.webContents.send('discogs:set-releasecode', `r${releaseId}`);
        }
      }));
      menu.append(new MenuItem({ type: 'separator' }));
    }

    // 3. GnuDb Logic
    let gnucdid: string | undefined;
    // GnuDb URLs: https://gnudb.org/gnudb/rock/8c09570a
    const gnudbRegex = /gnudb\.org\/gnudb\/[^/]+\/([a-f0-9]+)/i;
    if (params.linkURL) {
      const match = params.linkURL.match(gnudbRegex);
      if (match) gnucdid = match[1];
    }
    if (!gnucdid) {
      const match = currentUrl.match(gnudbRegex);
      if (match) gnucdid = match[1];
    }

    if (gnucdid) {
      menu.append(new MenuItem({
        label: t.useGnuCdId,
        click: () => {
          win?.webContents.send('gnudb:set-cdid', gnucdid);
        }
      }));
      menu.append(new MenuItem({ type: 'separator' }));
    }

    // Standard items: Only Copy
    menu.append(new MenuItem({
      role: 'copy',
      label: t.copy,
      enabled: params.editFlags.canCopy || !!params.selectionText
    }));

    if (params.linkURL) {
      menu.append(new MenuItem({
        label: t.copyLink,
        click: () => {
          clipboard.writeText(params.linkURL);
        }
      }));
      menu.append(new MenuItem({
        label: t.openInNewWindow,
        click: () => {
          createSearchWindow(params.linkURL);
        }
      }));
    }

    menu.popup();
  });

  view.webContents.setWindowOpenHandler(({ url }) => {
    createSearchWindow(url);
    return { action: 'deny' };
  });

  return searchWin;
}

function createViewerWindow() {
  const viewerWin = new BrowserWindow({
    width: 800,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, 'cuesto.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    autoHideMenuBar: true,
  });
  viewerWin.setMenu(null);

  if (VITE_DEV_SERVER_URL) {
    viewerWin.loadURL(`${VITE_DEV_SERVER_URL}?mode=viewer`);
  } else {
    viewerWin.loadFile(path.join(RENDERER_DIST, 'index.html'), { query: { mode: 'viewer' } });
  }

  return viewerWin;
}

function parseGnuDbData(data: string) {
  if (!data.trim().startsWith('210')) {
    console.warn('GnuDB response did not start with 210 status.');
    return null;
  }

  const lines = data.split(/\r?\n/);
  let artist = '';
  let album = '';
  let year = '';
  let genre = '';
  const trackTitles: string[] = [];
  const trackOffsets: number[] = [];

  const dtitlePattern = /^DTITLE=([^/]*)\s*\/\s*(.*)$/;
  const ttitlePattern = /^TTITLE(\d+)=(.+)$/;
  const dyearPattern = /^DYEAR=(.*)$/;
  const dgenrePattern = /^DGENRE=(.*)$/;
  const offsetPattern = /^#\s*(\d+)$/; // More robust: match # followed by 0 or more whitespace then digits

  lines.forEach(line => {
    const trimmed = line.trim();

    const dmatch = trimmed.match(dtitlePattern);
    if (dmatch) {
      artist = dmatch[1].trim();
      album = dmatch[2].trim();
    }

    const ymatch = trimmed.match(dyearPattern);
    if (ymatch) {
      year = ymatch[1].trim();
    }

    const gmatch = trimmed.match(dgenrePattern);
    if (gmatch) {
      genre = gmatch[1].trim();
    }

    const tmatch = trimmed.match(ttitlePattern);
    if (tmatch) {
      const idx = parseInt(tmatch[1], 10);
      const title = tmatch[2].trim();
      if (trackTitles[idx] !== undefined) {
        trackTitles[idx] += title;
      } else {
        trackTitles[idx] = title;
      }
    }

    const omatch = trimmed.match(offsetPattern);
    if (omatch) {
      trackOffsets.push(parseInt(omatch[1], 10));
    }
  });

  if (trackOffsets.length === 0) {
    console.error('No track offsets found in XMCD data');
    return null;
  }

  console.log('\x1b[33m%s\x1b[0m', '--- GnuDB Timing Transformation (Terminal) ---');
  console.log(`Original first offset: ${trackOffsets[0]}`);
  trackOffsets[0] = 0; // Reset as per functions.py

  const tracks = [];
  for (let i = 0; i < trackTitles.length; i++) {
    let tTitle = trackTitles[i];
    let tArtist = artist;

    if (tTitle.includes(' / ')) {
      const parts = tTitle.split(' / ');
      if (parts.length >= 2) {
        tArtist = parts[0].trim();
        tTitle = parts.slice(1).join(' / ').trim();
      }
    }

    const offset = trackOffsets[i] || 0;
    // We'll return the raw offset and let the renderer convert it, 
    // but we'll log the conversion here too for the user to see.
    const timeStr = framesToTimeMain(offset);
    console.log(`Track ${i + 1}: Offset ${offset} -> ${timeStr}`);

    tracks.push({
      number: i + 1,
      title: tTitle,
      performer: tArtist,
      index01: offset
    });
  }
  console.log('\x1b[33m%s\x1b[0m', '----------------------------------------------');

  return { artist, album, year, genre, tracks };
}

function framesToTimeMain(frames: number): string {
  const FRAMES_PER_SECOND = 75;
  const f = frames % FRAMES_PER_SECOND;
  const remainingSeconds = Math.floor(frames / FRAMES_PER_SECOND);
  const s = remainingSeconds % 60;
  const m = Math.floor(remainingSeconds / 60);
  const format = (n: number) => n.toString().padStart(2, '0');
  return `${m}:${format(s)}:${format(f)}`;
}

// ... (keep rest)

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let currentAppLanguage = 'en';

const contextMenuTranslations: Record<string, any> = {
  en: { useDiscId: 'use this disc id', useReleaseCode: 'use this release code', copy: 'copy', copyLink: 'copy link', openInNewWindow: 'open in new window' },
  de: { useDiscId: 'diese disc-id verwenden', useReleaseCode: 'diesen release-code verwenden', copy: 'kopieren', copyLink: 'link kopieren', openInNewWindow: 'in neuem fenster öffnen' },
  es: { useDiscId: 'usar este disc id', useReleaseCode: 'usar este código de release', copy: 'copiar', copyLink: 'copiar enlace', openInNewWindow: 'abrir en una ventana nueva' },
  fr: { useDiscId: 'utiliser ce disc id', useReleaseCode: 'utiliser ce code de release', copy: 'copier', copyLink: 'copier le lien', openInNewWindow: 'ouvrir dans une nouvelle fenêtre' },
  it: { useDiscId: 'usa questo disc id', useReleaseCode: 'usa questo codice release', copy: 'copia', copyLink: 'copia link', openInNewWindow: 'apri in una nuova finestra' }
};

ipcMain.on('app:sync-language', (_, lang) => {
  currentAppLanguage = lang;
});

const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', (_, argv) => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()

      // Handle file opened while app is running
      const filePath = argv.find(arg => arg.endsWith('.cue') || arg.endsWith('.txt'))
      if (filePath) {
        handleFileOpen(filePath)
      }
    }
  })
}

async function handleFileOpen(filePath: string) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    win?.webContents.send('file-opened', { content, filePath })
  } catch (e) {
    console.error('Failed to read file', e)
  }
}

// Store startup file for renderer to pull
let pendingStartupFile: string | null = null;

ipcMain.handle('app:check-pending-file', async () => {
  if (pendingStartupFile) {
    try {
      const content = await fs.readFile(pendingStartupFile, 'utf-8');
      const filepath = pendingStartupFile;

      let audioPath: string | null = null;
      const fileMatch = content.match(/^\s*FILE\s+"?([^"]*)"?\s+\w+/mi);
      if (fileMatch) {
        const audioFileName = fileMatch[1];
        const potentialPath = path.join(path.dirname(filepath), audioFileName);
        try {
          await fs.access(potentialPath);
          audioPath = potentialPath;
        } catch { }
      }

      pendingStartupFile = null; // Clear it
      return { content, filepath, audioPath };
    } catch (e) {
      console.error('Failed to read pending startup file', e);
      return null;
    }
  }
  return null;
});

function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 700,
    icon: path.join(process.env.VITE_PUBLIC, 'cuesto.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    autoHideMenuBar: true, // Hide the default menu
  })
  win.setMenu(null); // Explicitly remove it

  win.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
    createSearchWindow(url);
    return { action: 'deny' };
  });

  win.on('closed', () => {
    console.log('Main window closed, quitting app...');
    app.quit();
  });

  win.webContents.on('did-finish-load', async () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString());

    // Check for startup file (Windows File Association)
    const filePath = process.argv.find(arg => arg.endsWith('.cue') || arg.endsWith('.txt'))
    if (filePath) {
      // Instead of opening immediately (which might race), store it.
      pendingStartupFile = filePath;
      // Also trying to send it just in case renderer is somehow ready? 
      // Actually, let's rely on the pull model.
      console.log('Startup file found:', filePath);
    }
  })

  if (VITE_DEV_SERVER_URL) {
    console.log('Loading DEV server:', VITE_DEV_SERVER_URL)
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.on('did-fail-load', (_event: any, errorCode: number, errorDescription: string, validatedURL: string) => {
      console.error(`Load failed: ${errorCode} ${errorDescription} at ${validatedURL}`);
    });
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Handle OAuth callback from custom protocol
function handleOAuthCallback(url: string) {
  // Parse the callback URL: cuesto://oauth/callback?oauth_token=xxx&oauth_verifier=xxx
  try {
    const urlObj = new URL(url);
    const oauthToken = urlObj.searchParams.get('oauth_token');
    const oauthVerifier = urlObj.searchParams.get('oauth_verifier');

    if (oauthToken && oauthVerifier) {
      // Notify the renderer to handle the callback
      win?.webContents.send('discogs:oauth-callback', { oauthToken, oauthVerifier });
    }
  } catch (e) {
    console.error('Failed to parse OAuth callback:', e);
  }
}

// Register protocol handler before app is ready
app.setAsDefaultProtocolClient('cuesto');

// Handle protocol on Windows - single instance
const gotProtocolLock = app.requestSingleInstanceLock();

if (!gotProtocolLock) {
  app.quit();
} else {
  app.on('second-instance', (_, commandLine) => {
    // Handle OAuth callback from second instance
    const url = commandLine.find(arg => arg.startsWith('cuesto://oauth/callback'));
    if (url) {
      handleOAuthCallback(url);
    }

    // Handle file open
    const filePath = commandLine.find(arg => arg.endsWith('.cue') || arg.endsWith('.txt'));
    if (filePath) {
      handleFileOpen(filePath);
    }

    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

// Handle protocol on macOS
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleOAuthCallback(url);
});

// ============================================
// Auto-Updater
// ============================================

// Don't auto-download — ask the user first
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
// Allow prereleases? for testing: autoUpdater.allowPrerelease = true;

// Forward all updater events to the renderer
autoUpdater.on('checking-for-update', () => {
  win?.webContents.send('updater:checking');
});

autoUpdater.on('update-available', (info) => {
  win?.webContents.send('updater:available', { version: info.version });
});

autoUpdater.on('update-not-available', () => {
  win?.webContents.send('updater:not-available');
});

autoUpdater.on('download-progress', (progress) => {
  win?.webContents.send('updater:progress', { percent: Math.round(progress.percent) });
});

autoUpdater.on('update-downloaded', (info) => {
  win?.webContents.send('updater:downloaded', { version: info.version });
});

autoUpdater.on('error', (err) => {
  win?.webContents.send('updater:error', { message: err.message });
});

// IPC handlers so the renderer can drive the update flow
ipcMain.handle('updater:check', () => {
  if (VITE_DEV_SERVER_URL) {
    // Can't check for updates in dev mode
    win?.webContents.send('updater:not-available');
    return;
  }
  autoUpdater.checkForUpdates();
});

ipcMain.handle('updater:download', () => {
  autoUpdater.downloadUpdate();
});

ipcMain.handle('updater:install', () => {
  autoUpdater.quitAndInstall();
});

// ============================================

app.whenReady().then(() => {
  setupOAuthProtocol();
  createWindow();
});
