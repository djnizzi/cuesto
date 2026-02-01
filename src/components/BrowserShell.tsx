import React, { useEffect, useState } from 'react';
import { useTheme } from '../lib/themeContext';
import { getTranslations, getCurrentLanguage } from '../lib/i18n';

export const BrowserShell: React.FC = () => {
    const { theme } = useTheme();
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [title, setTitle] = useState('Loading...');
    const [url, setUrl] = useState('');
    const t = getTranslations(getCurrentLanguage());

    useEffect(() => {
        if (!(window as any).ipcRenderer) return;

        const updateStatus = async () => {
            const status = await (window as any).ipcRenderer.invoke('browser:get-status');
            if (status) {
                setCanGoBack(status.canGoBack);
                setCanGoForward(status.canGoForward);
                setTitle(status.title);
                setUrl(status.url);
            }
        };

        const interval = setInterval(updateStatus, 500);

        // Also listen for events from main process
        (window as any).ipcRenderer.on('browser:status-updated', (_: any, status: any) => {
            setCanGoBack(status.canGoBack);
            setCanGoForward(status.canGoForward);
            setTitle(status.title);
            setUrl(status.url);
        });

        updateStatus();

        return () => {
            clearInterval(interval);
            (window as any).ipcRenderer.removeAllListeners('browser:status-updated');
        };
    }, []);

    const handleBack = () => {
        (window as any).ipcRenderer.send('browser:go-back');
    };

    const handleForward = () => {
        (window as any).ipcRenderer.send('browser:go-forward');
    };

    const handleTriggerImport = () => {
        (window as any).ipcRenderer.send('browser:trigger-import-1001');
    };

    const is1001TracklistPage = url.includes('1001tracklists.com/tracklist/');

    return (
        <div className="flex flex-col h-screen bg-brand-surface text-brand-text font-sans">
            {/* Navigation Header */}
            <div className="flex items-center gap-4 px-6 py-3 border-b border-white/10 bg-brand-surface drag">
                <div className="flex items-center gap-3 no-drag">
                    <button
                        onClick={handleBack}
                        disabled={!canGoBack}
                        className={`transition-all ${canGoBack ? 'text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)]' : 'text-brand-placeholder'}`}

                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.32,22c-.68,0-1.34-.27-1.86-.78L1.12,14.67c-1.48-1.48-1.48-3.85-.02-5.31L8.48,2.77c.75-.76,1.86-.98,2.88-.56,1.01,.42,1.64,1.36,1.65,2.45v2.34h7.53c1.92,0,3.47,1.57,3.47,3.5v2.99c0,1.93-1.56,3.51-3.47,3.51h-7.53v2.34c0,1.1-.64,2.04-1.65,2.45-.34,.14-.69,.21-1.03,.21Zm0-19c-.38,0-.8,.13-1.16,.49L1.78,10.08c-1.05,1.05-1.05,2.79,.02,3.86l7.34,6.55s.01,.01,.02,.02c.58,.58,1.31,.57,1.81,.36,.5-.2,1.03-.71,1.03-1.53v-2.84c0-.28,.22-.5,.5-.5h8.03c1.36,0,2.47-1.12,2.47-2.51v-2.99c0-1.38-1.11-2.51-2.47-2.51H12.5s0,0,0,0c-.13,0-.26-.05-.35-.15s-.15-.22-.15-.35v-2.84c0-.82-.53-1.33-1.03-1.53-.19-.08-.41-.13-.65-.13Z" />
                        </svg>
                    </button>
                    <button
                        onClick={handleForward}
                        disabled={!canGoForward}
                        className={`transition-all ${canGoForward ? 'text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)]' : 'text-brand-placeholder'}`}


                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13.68,22c-.34,0-.69-.07-1.03-.21-1.01-.42-1.65-1.36-1.65-2.45v-2.34H3.47c-1.92,0-3.47-1.57-3.47-3.51v-2.99c0-1.93,1.56-3.51,3.47-3.51h7.53s0-2.33,0-2.33c0-1.1,.64-2.04,1.65-2.45,1.01-.42,2.12-.19,2.9,.58l7.34,6.55c1.48,1.48,1.48,3.85,.02,5.31l-7.37,6.58c-.51,.51-1.17,.78-1.86,.78ZM3.47,7.99c-1.36,0-2.47,1.12-2.47,2.51v2.99c0,1.38,1.11,2.51,2.47,2.51H11.5c.28,0,.5,.22,.5,.5v2.84c0,.82,.54,1.32,1.03,1.53,.5,.2,1.23,.22,1.81-.36,0,0,.01-.01,.02-.02l7.36-6.57c1.05-1.05,1.05-2.79-.02-3.86L14.86,3.51c-.6-.6-1.33-.59-1.83-.38-.5,.2-1.03,.71-1.03,1.53v2.84c0,.13-.05,.26-.15,.35s-.22,.15-.35,.15H3.47Z" />
                        </svg>

                    </button>
                </div>


                <div className="flex flex-col flex-1 min-w-0">
                    <h1 className="text-sm font-medium truncate opacity-90">{title}</h1>
                    <span className="text-sm font-light opacity-90 truncate">{url}</span>
                </div>

                <div className="flex items-center gap-3 no-drag">
                    <button
                        onClick={handleTriggerImport}
                        disabled={!is1001TracklistPage}
                        className={`transition-all ${is1001TracklistPage ? 'text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)]' : 'text-brand-placeholder opacity-40'}`}
                        data-tooltip-left={t.importFrom1001Tracklists}
                    >
                        <svg width="24" height="24" viewBox="3177 2031 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3195.302001953125,2038.1209716796875C3193.952880859375,2035,3190.922119140625,2033,3187.5,2033C3182.81298828125,2033,3179,2036.81298828125,3179,2041.5C3179,2042.0909423828125,3179.06103515625,2042.6800537109375,3179.180908203125,2043.2540283203125C3177.826904296875,2044.125,3177,2045.623046875,3177,2047.25C3177,2049.868896484375,3179.131103515625,2052,3181.75,2052L3194,2052C3197.860107421875,2052,3201,2048.85888671875,3201,2045C3201,2041.64501953125,3198.570068359375,2038.737060546875,3195.302001953125,2038.1209716796875ZM3194,2051L3181.75,2051C3179.681884765625,2051,3178,2049.31689453125,3178,2047.25C3178,2045.863037109375,3178.760986328125,2044.593994140625,3179.987060546875,2043.93896484375L3180.3330078125,2043.7530517578125L3180.235107421875,2043.373046875C3180.077880859375,2042.7640380859375,3179.9990234375,2042.134033203125,3179.9990234375,2041.4990234375C3179.9990234375,2037.363037109375,3183.363037109375,2033.9990234375,3187.4990234375,2033.9990234375C3190.60205078125,2033.9990234375,3193.342041015625,2035.864013671875,3194.47900390625,2038.7509765625L3194.5849609375,2039.02099609375L3194.8720703125,2039.06298828125C3197.794921875,2039.489013671875,3199.998046875,2042.041015625,3199.998046875,2045C3199.998046875,2048.30908203125,3197.306884765625,2051,3193.998046875,2051ZM3192.14599609375,2043.56103515625L3192.85302734375,2044.2679443359375L3189.56005859375,2047.56103515625C3189.26806640625,2047.85302734375,3188.884033203125,2047.9990234375,3188.4990234375,2047.9990234375C3188.114013671875,2047.9990234375,3187.73095703125,2047.85302734375,3187.43798828125,2047.56103515625L3184.14501953125,2044.2679443359375L3184.85205078125,2043.56103515625L3187.998046875,2046.70703125L3187.998046875,2039L3188.998046875,2039L3188.998046875,2046.70703125L3192.14404296875,2043.56103515625Z" fill="currentColor" />
                        </svg>
                    </button>
                    {(() => {
                        if (url.includes('musicbrainz.org')) {
                            return <img src="images/musicbrainz.svg" alt="MusicBrainz" className="w-[21.69px] h-[24px]" />;
                        }
                        if (url.includes('gnudb.org')) {
                            return <img src="images/gnudb.svg" alt="GnuDB" className="w-[23.65px] h-[24px]" />;
                        }
                        if (url.includes('discogs.com')) {
                            return <img src="images/discogs.svg" alt="Discogs" className="w-[23.78px] h-[24px]" />;
                        }
                        if (url.includes('1001tracklists.com')) {
                            return <img src="images/tracklists.svg" alt="1001Tracklists" className="w-[24px] h-[19.75px]" />;
                        }
                        return <img src={`images/logo${theme === 'light' ? '-light' : ''}.png`} alt="Logo" className="h-6 w-auto" />;
                    })()}
                </div>
            </div>

            {/* The WebContentsView will be placed below this header by the main process */}
            <div className="flex-1 bg-black" id="browser-view-container" />
        </div>
    );
};
