import React, { useState, useEffect } from 'react';
import { useTheme } from '../lib/themeContext';
import { Translations } from '../lib/i18n';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  appVersion: string;
  t: Translations;
}

type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error';

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  appVersion,
  t,
}) => {
  const { theme } = useTheme();
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');
  const [updateVersion, setUpdateVersion] = useState<string>('');
  const [downloadPercent, setDownloadPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!isOpen || !(window as any).ipcRenderer) return;

    // Reset status each time the modal opens
    setUpdateStatus('idle');

    const ipc = (window as any).ipcRenderer;

    ipc.on('updater:checking', () => setUpdateStatus('checking'));
    ipc.on('updater:not-available', () => setUpdateStatus('not-available'));
    ipc.on('updater:available', (_: any, info: { version: string }) => {
      setUpdateVersion(info.version);
      setUpdateStatus('available');
    });
    ipc.on('updater:progress', (_: any, info: { percent: number }) => {
      setDownloadPercent(info.percent);
      setUpdateStatus('downloading');
    });
    ipc.on('updater:downloaded', (_: any, info: { version: string }) => {
      setUpdateVersion(info.version);
      setUpdateStatus('downloaded');
    });
    ipc.on('updater:error', (_: any, info: { message: string }) => {
      setErrorMessage(info.message);
      setUpdateStatus('error');
    });

    return () => {
      ipc.removeAllListeners('updater:checking');
      ipc.removeAllListeners('updater:not-available');
      ipc.removeAllListeners('updater:available');
      ipc.removeAllListeners('updater:progress');
      ipc.removeAllListeners('updater:downloaded');
      ipc.removeAllListeners('updater:error');
    };
  }, [isOpen]);

  const handleCheckUpdates = async () => {
    setUpdateStatus('checking');
    setErrorMessage('');
    await (window as any).ipcRenderer?.invoke('updater:check');
  };

  const handleDownload = async () => {
    setUpdateStatus('downloading');
    setDownloadPercent(0);
    await (window as any).ipcRenderer?.invoke('updater:download');
  };

  const handleInstall = async () => {
    await (window as any).ipcRenderer?.invoke('updater:install');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  const handleOpenLink = async (url: string) => {
    if ((window as any).ipcRenderer) {
      await (window as any).ipcRenderer.invoke('shell:openExternal', url);
    }
  };

  // Render the update control based on current status
  const renderUpdateControl = () => {
    switch (updateStatus) {
      case 'idle':
        return (
          <button
            onClick={handleCheckUpdates}
            className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
            data-tooltip={t.aboutCheckUpdates}
          >
            <img src="icons/update.svg" alt="Update" className="size-6" />
          </button>

        );
      case 'checking':
        return (
          <span className="text-brand-text text-sm font-light animate-pulse">
            checking…
          </span>
        );
      case 'not-available':
        return (
          <span className="text-brand-text text-sm font-light">
            up to date
          </span>
        );
      case 'available':
        return (
          <button
            onClick={handleDownload}
            className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all text-sm font-medium"
          >
            v{updateVersion} available
          </button>
        );
      case 'downloading':
        return (
          <span className="text-brand-text text-sm font-light">
            downloading… {downloadPercent}%
          </span>
        );
      case 'downloaded':
        return (
          <button
            onClick={handleInstall}
            className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all text-sm font-medium"
          >
            restart to install v{updateVersion}
          </button>
        );
      case 'error':
        return (
          <button
            onClick={handleCheckUpdates}
            title={errorMessage}
            className="text-red-400 hover:text-red-300 transition-all text-sm font-light"
          >
            update error — retry
          </button>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div
        className="bg-brand-surface p-8 rounded-modal shadow-2xl w-full max-w-[360px] border border-white/5 transition-all duration-300 relative overflow-hidden flex flex-col gap-6"
        onKeyDown={handleKeyDown}
      >
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src={`images/logo${theme === 'light' ? '-light' : ''}.png`}
            alt="CUEsto Logo"
            className="h-16 w-auto"
          />
        </div>

        {/* Tagline */}
        <div className="text-center">
          <p className="text-brand-text text-modal-body text-sm font-light">
            {t.aboutTagline}
          </p>
        </div>

        {/* Version + update control */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-brand-text font-light">
            {t.aboutVersion} {appVersion}
          </span>
          {renderUpdateControl()}
        </div>

        {/* Links */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleOpenLink('https://djnizzi.github.io/cuesto/help.html')}
            className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
            data-tooltip={t.aboutHelpLink}
          >
            <img src="icons/help.svg" alt="Help" className="size-6" />
          </button>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleOpenLink('https://ko-fi.com/djnizzi')}
            className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
            data-tooltip-bottom={t.aboutSupport}
          >
            <img src="icons/coffee.svg" alt="Coffee" className="size-6" />
          </button>
        </div>

        {/* Copyright */}
        <div className="flex justify-center mt-6">
          <img
            src={`images/bynizdesign.png`}
            alt="byNiZDesign"
          />
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
    </div >
  );
};