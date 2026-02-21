import React, { useState, useEffect } from 'react';
import { useTheme } from '../lib/themeContext';
import { getTranslations, Language } from '../lib/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLanguageChange: (lang: Language) => void;
  currentLanguage: Language;
  onDiscogsConnect?: () => void;
  onDiscogsDisconnect?: () => void;
}

interface DiscogsAuthStatus {
  connected: boolean;
  username?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onLanguageChange,
  currentLanguage,
  onDiscogsConnect,
  onDiscogsDisconnect,
}) => {
  const { theme, setTheme } = useTheme();
  const t = getTranslations(currentLanguage);
  const [discogsAuth, setDiscogsAuth] = useState<DiscogsAuthStatus>({ connected: false });
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Fetch auth status on mount and when modal opens
  useEffect(() => {
    if (isOpen && (window as any).ipcRenderer) {
      checkDiscogsAuth();

      // Listen for OAuth callback
      (window as any).ipcRenderer.on('discogs:oauth-callback', async (_: any, data: { oauthToken: string; oauthVerifier: string }) => {
        await handleOAuthCallback(data.oauthToken, data.oauthVerifier);
      });

      return () => {
        (window as any).ipcRenderer.removeAllListeners('discogs:oauth-callback');
      };
    }
  }, [isOpen]);

  const checkDiscogsAuth = async () => {
    try {
      const result = await (window as any).ipcRenderer.invoke('discogs:getAuthStatus');
      setDiscogsAuth(result);
    } catch (e) {
      console.error('Failed to check Discogs auth status:', e);
    }
  };

  const handleConnectDiscogs = async () => {
    setIsAuthenticating(true);
    try {
      const result = await (window as any).ipcRenderer.invoke('discogs:startOAuth');
      if (result.authUrl) {
        // Open the auth URL in the OS default browser (not in-app)
        await (window as any).ipcRenderer.invoke('shell:openExternal', result.authUrl);
      } else if (result.error) {
        console.error('Failed to start OAuth:', result.error);
        setIsAuthenticating(false);
      }
    } catch (e) {
      console.error('Failed to start OAuth:', e);
      setIsAuthenticating(false);
    }
  };

  const handleDisconnectDiscogs = async () => {
    try {
      await (window as any).ipcRenderer.invoke('discogs:logout');
      setDiscogsAuth({ connected: false });
      onDiscogsDisconnect?.();
    } catch (e) {
      console.error('Failed to logout:', e);
    }
  };

  const handleOAuthCallback = async (oauthToken: string, oauthVerifier: string) => {
    try {
      const result = await (window as any).ipcRenderer.invoke('discogs:handleOAuthCallback', oauthToken, oauthVerifier);
      if (result.success) {
        setDiscogsAuth({ connected: true, username: result.username });
        onDiscogsConnect?.();
      } else {
        console.error('OAuth callback failed:', result.error);
      }
    } catch (e) {
      console.error('OAuth callback error:', e);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isOpen) return null;

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'english' },
    { code: 'de', name: 'deutsch' },
    { code: 'es', name: 'español' },
    { code: 'fr', name: 'français' },
    { code: 'it', name: 'italiano' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div
        className="bg-brand-surface p-8 rounded-modal shadow-2xl w-full max-w-[360px] border border-white/5 transition-all duration-300 relative overflow-hidden flex flex-col gap-6"
        onKeyDown={handleKeyDown}
      >
        {/* Title */}
        <h2 className="text-brand-text font-semibold text-modal-body leading-tight">
          {t.settings}
        </h2>

        {/* Content */}
        <div className="flex gap-8">
          {/* Language Section */}
          <div className="flex-1">
            <div className="space-y-3">
              {languages.map((lang) => (
                <label key={lang.code} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="language"
                    value={lang.code}
                    checked={currentLanguage === lang.code}
                    onChange={() => onLanguageChange(lang.code)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-1 flex items-center justify-center ${currentLanguage === lang.code
                    ? 'border-brand-orange bg-brand-orange'
                    : 'border-brand-muted-text'
                    }`}>
                    {currentLanguage === lang.code && (
                      <div className="w-2 h-2 rounded-full bg-brand-surface"></div>
                    )}
                  </div>
                  <span className="text-brand-text text-modal-body font-light leading-relaxed">{lang.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Theme Section */}
          <div className="flex">
            <div className="flex py-10 flex-col gap-4 pr-10">

              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center w-8 h-8 rounded-lg border-1 transition-all hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] ${theme === 'dark'
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-brand-muted-text/0 hover:border-brand-orange text-brand-muted-text'
                  }`}
                data-tooltip-left={t.darkMode}
              >
                <img src="icons/moon.svg" alt="Dark mode" className="w-6 h-6" style={{ filter: theme === 'dark' ? 'none' : 'brightness(0.9)' }} />
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center w-8 h-8 rounded-lg border-1 transition-all hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] ${theme === 'light'
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-brand-muted-text/0 hover:border-brand-orange text-brand-muted-text'
                  }`}
                data-tooltip-left={t.lightMode}
              >
                <img src="icons/sun.svg" alt="Light mode" className="w-6 h-6" style={{ filter: theme === 'light' ? 'none' : 'brightness(0.9)' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Discogs Account Section */}
        <div className="border-t border-brand-text/10 pt-2">
          <div className="flex flex-col gap-3">
            <span className="text-brand-text text-modal-small font-light">
              {t.discogsAccount}
            </span>

            {discogsAuth.connected ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-orange"></div>
                  <span className="text-brand-text text-modal-body font-light">
                    <span className="font-semibold">{discogsAuth.username}</span>
                  </span>
                </div>
                <button
                  onClick={handleDisconnectDiscogs}
                  className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                  data-tooltip-left={t.disconnectFromDiscogs}
                >
                  <img src="icons/disconnect.svg" alt="Disconnect" className="size-6" />

                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-input-border"></div>
                  <span className="text-brand-text text-modal-body font-light">
                    {t.discogsNotConnected}
                  </span>
                </div>
                <button
                  onClick={handleConnectDiscogs}
                  disabled={isAuthenticating}
                  className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] disabled:opacity-50 disabled:cursor-not-allowed"
                  data-tooltip-left={isAuthenticating ? t.discogsAuthenticating : t.connectToDiscogs}
                >
                  <img src={isAuthenticating ? "icons/wait.svg" : "icons/connect.svg"} alt={isAuthenticating ? t.discogsAuthenticating : t.connectToDiscogs} className="size-6" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
            data-tooltip-left={t.close}
          >
            <img src="icons/ok.svg" alt="Close" className="size-6" />
          </button>
        </div>
      </div>
      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10 cursor-default" 
        onClick={onClose}
        onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
        role="presentation"
      />
    </div>
  );
};