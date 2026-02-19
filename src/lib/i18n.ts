// Supported languages: English (en), German (de), Spanish (es), French (fr), Italian (it)



export interface Translations {
    // App metadata
    appName: string;

    // File operations
    openFile: string;
    save: string;
    saveAs: string;
    fileName: string;
    audioFile: string;
    audioFileResolved: string;
    audioFileNotFound: string;
    newCueFile: string;

    // Metadata fields
    albumTitle: string;
    performer: string;
    date: string;
    genre: string;
    title: string;
    startTime: string;
    duration: string;

    // Actions
    addRow: string;
    viewCue: string;
    clear: string;
    clearAll: string;
    splitAudio: string;
    cancel: string;
    ok: string;
    confirm: string;
    close: string;

    // Import sources
    getDataFrom: string;
    importFromMusicBrainz: string;
    importFromGnudb: string;
    importFromDiscogs: string;
    importAudacityLabels: string;
    importFrom1001Tracklists: string;
    getMetadata: string;
    overwriteHeader: string;
    overwriteTrackTitles: string;
    overwriteTrackPerformers: string;
    overwriteTimings: string;
    interpolateTimings: string;
    gnucdidPlaceholder: string;
    releaseCodePlaceholder: string;
    discNumberPlaceholder: string;
    discIdPlaceholder: string;
    modalTitleGnudb: string;
    modalTitleDiscogs: string;
    modalTitleMusicBrainz: string;
    helpGnudbPre: string;
    helpGnudbPost: string;
    helpDiscogsPre: string;
    helpDiscogsPost: string;
    helpMusicBrainzPre: string;
    helpMusicBrainzPost: string;
    modalTitleTracklist: string;
    searchOnTracklist: string;
    visitTracklist: string; // fallback if no search
    helpTracklist: string;
    pullFromBrowser: string;
    importFromFile: string;

    // Modals
    deleteTrack: string;
    deleteTrackConfirm: string;
    clearAllConfirm: string;

    // Alerts
    error: string;
    errorOpeningFile: string;
    errorSelectingAudio: string;
    errorSaving: string;
    errorSaveAs: string;
    importFailed: string;
    importNotImplemented: string;
    audacityImportFailed: string;
    missingAudio: string;
    missingAudioMessage: string;
    noTracks: string;
    noTracksMessage: string;
    missingDuration: string;
    missingDurationMessage: string;
    splittingError: string;

    connectionFailed: string;
    invalidXmcd: string;
    failedToFetch: string;

    // Progress
    splitting: string;
    splittingComplete: string;
    processingTrack: string;
    openFolder: string;
    preparing: string;
    filesCreated: string;

    // Toast messages
    savedSuccessfully: string;

    // Table headers
    trackNumber: string;

    // Settings
    language: string;
    selectLanguage: string;
    settings: string;
    lightMode: string;
    darkMode: string;

    // New labels
    searchingFor: string;
    searchOnDiscogs: string;
    searchOnMusicBrainz: string;
    visitDiscogs: string;
    visitMusicBrainz: string;
    visitGnuDb: string;
    useDiscId: string;
    useReleaseCode: string;
    useGnuCdId: string;
    copy: string;
    copyLink: string;
    openInNewWindow: string;

    // Text Editing
    textEditing: string;
    modalTitleTextEditing: string;
    opChangeSeparator: string;
    opSplitTitlePerformer: string;
    opSwapTitlePerformer: string;
    opToPropercase: string;
    from: string;
    to: string;
    separator: string;

    // Discogs OAuth
    discogsAccount: string;
    connectToDiscogs: string;
    disconnectFromDiscogs: string;
    discogsConnectedAs: string;
    discogsNotConnected: string;
    discogsAuthenticating: string;
    discogsAuthFailed: string;
    discogsAuthSuccess: string;

    // About Modal
    aboutTagline: string;
    aboutVersion: string;
    aboutCheckUpdates: string;
    aboutHelpLink: string;
    aboutSupport: string;
}

const translations: Record<Language, Translations> = {
    en: {
        appName: 'CUEsto',

        openFile: 'open file',
        save: 'save',
        saveAs: 'save as',
        fileName: 'file name',
        audioFile: 'audio file',
        audioFileResolved: 'audio file resolved',
        audioFileNotFound: 'select audio file',
        newCueFile: 'new CUE file',

        albumTitle: 'album title',
        performer: 'performer',
        date: 'date',
        genre: 'genre',
        title: 'title',
        startTime: 'start time',
        duration: 'duration',

        addRow: 'add row',
        viewCue: 'view cue',
        clear: 'clear',
        clearAll: 'clear all',
        splitAudio: 'split audio',
        cancel: 'cancel',
        ok: 'ok',
        confirm: 'confirm',
        close: 'close',

        getDataFrom: 'get data from',
        importFromMusicBrainz: 'import from musicbrainz',
        importFromGnudb: 'import from gnudb',
        importFromDiscogs: 'import from discogs',
        importAudacityLabels: 'import audacity labels',
        importFrom1001Tracklists: 'import 1001tracklists html',
        getMetadata: 'get metadata',
        overwriteHeader: 'overwrite header (album title, performer etc.)',
        overwriteTrackTitles: 'overwrite track titles',
        overwriteTrackPerformers: 'overwrite track performers',
        overwriteTimings: 'overwrite start times/durations',
        interpolateTimings: 'interpolate start times/durations',
        gnucdidPlaceholder: 'gnucdid',
        releaseCodePlaceholder: 'release code [r###...]',
        discNumberPlaceholder: 'disc #',
        discIdPlaceholder: 'disc ID',
        modalTitleGnudb: 'import metadata and durations from gnudb',
        modalTitleDiscogs: 'import metadata from discogs',
        modalTitleMusicBrainz: 'import metadata from musicbrainz',
        helpGnudbPre: 'search cd from',
        helpGnudbPost: 'and copy the gnucdid',
        helpDiscogsPre: 'search release from',
        helpDiscogsPost: ', and copy the release code from a release page (master releases won\'t work). it is possible to interpolate start times and durations from a release, if it has track durations, with the selected audio file\'s total duration.',
        helpMusicBrainzPre: 'search a release on',
        helpMusicBrainzPost: 'and copy the disc ID, if any, from the second tab',
        modalTitleTracklist: 'import metadata and tracks from 1001tracklists',
        searchOnTracklist: 'search on 1001tracklists.com',
        visitTracklist: 'search on 1001tracklists.com',
        helpTracklist: 'find the tracklist on 1001Tracklists and use the button in the browser to import the metadata',
        pullFromBrowser: 'pull from browser',
        importFromFile: 'import from file',

        deleteTrack: 'delete track',
        deleteTrackConfirm: 'are you sure you want to delete track',
        clearAllConfirm: 'are you sure you want to clear all data? this will reset the entire cue sheet and tracklist. any unsaved changes will be lost.',

        error: 'error',
        errorOpeningFile: 'failed to open file',
        errorSelectingAudio: 'failed to select audio file',
        errorSaving: 'failed to save file',
        errorSaveAs: 'failed to save file',
        importFailed: 'import failed',
        importNotImplemented: 'import not implemented',
        audacityImportFailed: 'audacity import failed',
        missingAudio: 'missing audio',
        missingAudioMessage: 'please select an audio file first using the icon in the file name field.',
        noTracks: 'no tracks',
        noTracksMessage: 'the CUE sheet has no tracks to split.',
        missingDuration: 'missing duration',
        missingDurationMessage: 'total audio duration is unknown. the last track might not split correctly.',
        splittingError: 'splitting error',
        connectionFailed: 'connection failed',
        invalidXmcd: 'invalid xmcd format returned',
        failedToFetch: 'failed to fetch metadata',

        splitting: 'splitting',
        splittingComplete: 'splitting complete',
        processingTrack: 'processing track',
        openFolder: 'open folder',
        preparing: 'preparing...',
        filesCreated: 'files created',

        savedSuccessfully: 'saved successfully',

        trackNumber: '#',

        language: 'language',
        selectLanguage: 'language',
        settings: 'settings',
        lightMode: 'light mode',
        darkMode: 'dark mode',

        searchingFor: 'searching for',
        searchOnDiscogs: 'search on discogs.com',
        searchOnMusicBrainz: 'search on musicbrainz.org',
        visitDiscogs: 'search on discogs.com',
        visitMusicBrainz: 'search on musicbrainz.org',
        visitGnuDb: 'search on gnudb.org',
        useDiscId: 'use this disc id',
        useReleaseCode: 'use this release code',
        useGnuCdId: 'use this gnucdid',
        copy: 'copy',
        copyLink: 'copy link',
        openInNewWindow: 'open in new window',

        textEditing: 'text editing',
        modalTitleTextEditing: 'text editing',
        opChangeSeparator: 'change separator in tracks performers from',
        opSplitTitlePerformer: 'split tracks titles to title and performers by separator',
        opSwapTitlePerformer: 'swap track titles and performers',
        opToPropercase: 'change to propercase',
        from: 'from',
        to: 'to',
        separator: 'separator',

        // Discogs OAuth
        discogsAccount: 'discogs account',
        connectToDiscogs: 'connect to discogs',
        disconnectFromDiscogs: 'disconnect from discogs',
        discogsConnectedAs: 'connected as',
        discogsNotConnected: 'not connected',
        discogsAuthenticating: 'authenticating with discogs...',
        discogsAuthFailed: 'authentication failed',
        discogsAuthSuccess: 'authentication successful',

        // About Modal
        aboutTagline: 'CUEsto is for CUE Sheet TOolbox',
        aboutVersion: 'version',
        aboutCheckUpdates: 'check for updates',
        aboutHelpLink: 'need help? here\'s the guide',
        aboutSupport: 'if you find it useful, you can buy me a coffee',
    },

    de: {
        appName: 'CUEsto',

        openFile: 'datei öffnen',
        save: 'speichern',
        saveAs: 'speichern unter',
        fileName: 'dateiname',
        audioFile: 'audiodatei',
        audioFileResolved: 'audiodatei gefunden',
        audioFileNotFound: 'auswählen',
        newCueFile: 'neue CUE-datei',

        albumTitle: 'albumtitel',
        performer: 'interpret',
        date: 'datum',
        genre: 'genre',
        title: 'titel',
        startTime: 'startzeit',
        duration: 'dauer',

        addRow: 'zeile hinzufügen',
        viewCue: 'CUE anzeigen',
        clear: 'löschen',
        clearAll: 'alles löschen',
        splitAudio: 'audio teilen',
        cancel: 'abbrechen',
        ok: 'ok',
        confirm: 'bestätigen',
        close: 'schließen',

        getDataFrom: 'daten abrufen von',
        importFromMusicBrainz: 'von musicbrainz importieren',
        importFromGnudb: 'von gnudb importieren',
        importFromDiscogs: 'von discogs importieren',
        importAudacityLabels: 'audacity-labels importieren',
        importFrom1001Tracklists: 'von 1001tracklists importieren',
        getMetadata: 'metadaten abrufen',
        overwriteHeader: 'header überschreiben (album, interpret etc.)',
        overwriteTrackTitles: 'titelnamen überschreiben',
        overwriteTrackPerformers: 'interpreten überschreiben',
        overwriteTimings: 'startzeiten/dauer überschreiben',
        interpolateTimings: 'startzeiten/dauer interpolieren',
        gnucdidPlaceholder: 'gnucdid',
        releaseCodePlaceholder: 'release-code [r###...]',
        discNumberPlaceholder: 'disc #',
        discIdPlaceholder: 'disc ID',
        modalTitleGnudb: 'metadaten und dauer von gnudb importieren',
        modalTitleDiscogs: 'metadaten von discogs importieren',
        modalTitleMusicBrainz: 'metadaten von musicbrainz importieren',
        helpGnudbPre: 'cd suchen bei',
        helpGnudbPost: 'und gnucdid kopieren',
        helpDiscogsPre: 'release suchen bei',
        helpDiscogsPost: ', und release-code kopieren (keine master-releases). interpolation ist möglich, wenn track-dauern vorhanden sind.',
        helpMusicBrainzPre: 'release suchen bei',
        helpMusicBrainzPost: 'und disc ID vom zweiten tab kopieren',
        modalTitleTracklist: 'metadaten und tracks von 1001tracklists importieren',
        searchOnTracklist: 'besuche 1001tracklists.com',
        visitTracklist: 'besuche 1001tracklists.com',
        helpTracklist: 'finde die trackliste auf 1001tracklists und nutze die schaltfläche im browser, um die metadaten zu importieren',
        pullFromBrowser: 'aus browser laden',
        importFromFile: 'aus datei importieren',

        deleteTrack: 'track löschen',
        deleteTrackConfirm: 'möchten sie track wirklich löschen',
        clearAllConfirm: 'möchten sie wirklich alle daten löschen? dies setzt das gesamte CUE-sheet und die trackliste zurück. alle nicht gespeicherten änderungen gehen verloren.',

        error: 'fehler',
        errorOpeningFile: 'datei konnte nicht geöffnet werden',
        errorSelectingAudio: 'audiodatei konnte nicht ausgewählt werden',
        errorSaving: 'datei konnte nicht gespeichert werden',
        errorSaveAs: 'datei konnte nicht gespeichert werden',
        importFailed: 'import fehlgeschlagen',
        importNotImplemented: 'import nicht implementiert',
        audacityImportFailed: 'audacity-import fehlgeschlagen',
        missingAudio: 'audiodatei fehlt',
        missingAudioMessage: 'bitte wählen sie zuerst eine audiodatei über das symbol im dateinamenfeld aus.',
        noTracks: 'keine tracks',
        noTracksMessage: 'das CUE-sheet enthält keine tracks zum teilen.',
        missingDuration: 'dauer fehlt',
        missingDurationMessage: 'die gesamtdauer der audiodatei ist unbekannt. der letzte track wird möglicherweise nicht korrekt geteilt.',
        splittingError: 'fehler beim teilen',
        connectionFailed: 'verbindung fehlgeschlagen',
        invalidXmcd: 'ungültiges xmcd-format zurückgegeben',
        failedToFetch: 'abrufen der metadaten fehlgeschlagen',

        splitting: 'wird geteilt',
        splittingComplete: 'teilen abgeschlossen',
        processingTrack: 'verarbeite track',
        openFolder: 'ordner öffnen',
        preparing: 'vorbereiten...',
        filesCreated: 'dateien erstellt',

        savedSuccessfully: 'erfolgreich gespeichert',

        trackNumber: '#',

        language: 'sprache',
        selectLanguage: 'sprache',
        settings: 'einstellungen',
        lightMode: 'hellmodus',
        darkMode: 'dunkelmodus',

        searchingFor: 'suche nach',
        searchOnDiscogs: 'besuche discogs.com',
        searchOnMusicBrainz: 'besuche musicbrainz.org',
        visitDiscogs: 'besuche discogs.com',
        visitMusicBrainz: 'besuche musicbrainz.org',
        visitGnuDb: 'besuche gnudb.org',
        useDiscId: 'diese disc-id verwenden',
        useReleaseCode: 'diesen release-code verwenden',
        useGnuCdId: 'diese gnucdid verwenden',
        copy: 'kopieren',
        copyLink: 'link kopieren',
        openInNewWindow: 'in neuem fenster öffnen',

        textEditing: 'textbearbeitung',
        modalTitleTextEditing: 'textbearbeitung',
        opChangeSeparator: 'trennzeichen bei interpreten ändern von',
        opSplitTitlePerformer: 'titel in titel und interpreten trennen durch',
        opSwapTitlePerformer: 'titel und interpreten tauschen',
        opToPropercase: 'in wortanfangsgroßschreibung umwandeln',
        from: 'von',
        to: 'nach',
        separator: 'trennzeichen',

        // Discogs OAuth
        discogsAccount: 'discogs konto',
        connectToDiscogs: 'mit discogs verbinden',
        disconnectFromDiscogs: 'von discogs trennen',
        discogsConnectedAs: 'verbunden als',
        discogsNotConnected: 'nicht verbunden',
        discogsAuthenticating: 'authenticierung mit discogs...',
        discogsAuthFailed: 'authenticierung fehlgeschlagen',
        discogsAuthSuccess: 'authenticierung erfolgreich',

        // About Modal
        aboutTagline: 'CUEsto steht für CUE Sheet TOolbox',
        aboutVersion: 'version',
        aboutCheckUpdates: 'nach updates suchen',
        aboutHelpLink: 'hilfe benötigt? hier ist die anleitung',
        aboutSupport: 'wenn du es nützlich findest, kannst du mir einen kaffee kaufen',
    },

    es: {
        appName: 'CUEsto',

        openFile: 'abrir archivo',
        save: 'guardar',
        saveAs: 'guardar como',
        fileName: 'nombre de archivo',
        audioFile: 'archivo de audio',
        audioFileResolved: 'archivo de audio encontrado',
        audioFileNotFound: 'seleccionar',
        newCueFile: 'nuevo archivo CUE',

        albumTitle: 'título del álbum',
        performer: 'intérprete',
        date: 'fecha',
        genre: 'género',
        title: 'título',
        startTime: 'inicio',
        duration: 'duración',

        addRow: 'añadir fila',
        viewCue: 'ver CUE',
        clear: 'limpiar',
        clearAll: 'limpiar todo',
        splitAudio: 'dividir audio',
        cancel: 'cancelar',
        ok: 'aceptar',
        confirm: 'confirmar',
        close: 'cerrar',

        getDataFrom: 'obtener datos de',
        importFromMusicBrainz: 'importar desde musicbrainz',
        importFromGnudb: 'importar desde gnudb',
        importFromDiscogs: 'importar desde discogs',
        importAudacityLabels: 'importar etiquetas de audacity',
        importFrom1001Tracklists: 'importar desde 1001tracklists',
        getMetadata: 'obtener metadatos',
        overwriteHeader: 'sobrescribir cabecera (álbum, intérprete, etc.)',
        overwriteTrackTitles: 'sobrescribir títulos',
        overwriteTrackPerformers: 'sobrescribir intérpretes',
        overwriteTimings: 'sobrescribir tiempos/duración',
        interpolateTimings: 'interpolación de tiempos',
        gnucdidPlaceholder: 'gnucdid',
        releaseCodePlaceholder: 'código release [r###...]',
        discNumberPlaceholder: 'disc #',
        discIdPlaceholder: 'disc ID',
        modalTitleGnudb: 'importar metadatos y duración de gnudb',
        modalTitleDiscogs: 'importar metadatos de discogs',
        modalTitleMusicBrainz: 'importar metadatos de musicbrainz',
        helpGnudbPre: 'buscar cd en',
        helpGnudbPost: 'y copiar el gnucdid',
        helpDiscogsPre: 'buscar lanzamiento en',
        helpDiscogsPost: ', y copiar el código de la página (no master). es posible interpolar tiempos si hay duraciones.',
        helpMusicBrainzPre: 'buscar lanzamiento en',
        helpMusicBrainzPost: 'y copiar el disc ID de la segunda pestaña',
        modalTitleTracklist: 'importar metadatos y pistas de 1001tracklists',
        searchOnTracklist: 'buscar en 1001tracklists.com',
        visitTracklist: 'buscar en 1001tracklists.com',
        helpTracklist: 'busca la lista de canciones en 1001tracklists y usa el botón del navegador para importar los metadatos',
        pullFromBrowser: 'extraer del navegador',
        importFromFile: 'importar desde archivo',

        deleteTrack: 'eliminar pista',
        deleteTrackConfirm: '¿está seguro de que desea eliminar la pista',
        clearAllConfirm: '¿está seguro de que desea borrar todos los datos? Esto restablecerá toda la hoja CUE y la lista de pistas. se perderán todos los cambios no guardados.',

        error: 'error',
        errorOpeningFile: 'no se pudo abrir el archivo',
        errorSelectingAudio: 'no se pudo seleccionar el archivo de audio',
        errorSaving: 'no se pudo guardar el archivo',
        errorSaveAs: 'no se pudo guardar el archivo',
        importFailed: 'importación fallida',
        importNotImplemented: 'importación no implementada',
        audacityImportFailed: 'importación de audacity fallida',
        missingAudio: 'audio faltante',
        missingAudioMessage: 'por favor, seleccione primero un archivo de audio usando el icono en el campo de nombre de archivo.',
        noTracks: 'sin pistas',
        noTracksMessage: 'la hoja CUE no tiene pistas para dividir.',
        missingDuration: 'duración faltante',
        missingDurationMessage: 'la duración total del audio es desconocida. la última pista podría no dividirse correctamente.',
        splittingError: 'error al dividir',
        connectionFailed: 'conexión fallida',
        invalidXmcd: 'formato xmcd inválido devuelto',
        failedToFetch: 'error al obtener metadatos',

        splitting: 'dividiendo',
        splittingComplete: 'división completa',
        processingTrack: 'procesando pista',
        openFolder: 'abrir carpeta',
        preparing: 'preparando...',
        filesCreated: 'archivos creados',

        savedSuccessfully: 'guardado exitosamente',

        trackNumber: '#',

        language: 'idioma',
        selectLanguage: 'idioma',
        settings: 'ajustes',
        lightMode: 'modo claro',
        darkMode: 'modo oscuro',

        searchingFor: 'buscando',
        searchOnDiscogs: 'buscar en discogs.com',
        searchOnMusicBrainz: 'buscar en musicbrainz.org',
        visitDiscogs: 'buscar en discogs.com',
        visitMusicBrainz: 'buscar en musicbrainz.org',
        visitGnuDb: 'buscar en gnudb.org',
        useDiscId: 'usar este disc id',
        useReleaseCode: 'usar este código de release',
        useGnuCdId: 'usar este gnucdid',
        copy: 'copiar',
        copyLink: 'copiar enlace',
        openInNewWindow: 'abrir en una ventana nuova',

        textEditing: 'edición de texto',
        modalTitleTextEditing: 'edición de texto',
        opChangeSeparator: 'cambiar separador en artistas de',
        opSplitTitlePerformer: 'dividir títulos en título y artista por separador',
        opSwapTitlePerformer: 'intercambiar títulos y artistas',
        opToPropercase: 'cambiar a mayúsculas iniciales',
        from: 'de',
        to: 'a',
        separator: 'separador',

        // Discogs OAuth
        discogsAccount: 'cuenta discogs',
        connectToDiscogs: 'conectar a discogs',
        disconnectFromDiscogs: 'desconectar de discogs',
        discogsConnectedAs: 'conectado como',
        discogsNotConnected: 'no conectado',
        discogsAuthenticating: 'autenticando con discogs...',
        discogsAuthFailed: 'autenticación fallida',
        discogsAuthSuccess: 'autenticación exitosa',

        // About Modal
        aboutTagline: 'CUEsto significa CUE Sheet TOolbox',
        aboutVersion: 'versión',
        aboutCheckUpdates: 'buscar actualizaciones',
        aboutHelpLink: '¿necesitas ayuda? aquí está la guía',
        aboutSupport: 'si te resulta útil, puedes invitarme a un café',
    },

    fr: {
        appName: 'CUEsto',

        openFile: 'ouvrir le fichier',
        save: 'enregistrer',
        saveAs: 'enregistrer sous',
        fileName: 'nom du fichier',
        audioFile: 'fichier audio',
        audioFileResolved: 'fichier audio trouvé',
        audioFileNotFound: 'sélectionner',
        newCueFile: 'nouveau fichier CUE',

        albumTitle: 'titre de l\'album',
        performer: 'interprète',
        date: 'date',
        genre: 'genre',
        title: 'titre',
        startTime: 'début',
        duration: 'durée',

        addRow: 'ajouter une ligne',
        viewCue: 'voir CUE',
        clear: 'effacer',
        clearAll: 'tout effacer',
        splitAudio: 'diviser l\'audio',
        cancel: 'annuler',
        ok: 'ok',
        confirm: 'confirmer',
        close: 'fermer',

        getDataFrom: 'obtenir les données de',
        importFromMusicBrainz: 'importer depuis musicbrainz',
        importFromGnudb: 'importer depuis gnudb',
        importFromDiscogs: 'importer depuis discogs',
        importAudacityLabels: 'importer les étiquettes audacity',
        importFrom1001Tracklists: 'importer un html de 1001tracklists',
        getMetadata: 'obtenir les métadonnées',
        overwriteHeader: 'écraser l\'en-tête (album, artiste, etc.)',
        overwriteTrackTitles: 'écraser les titres',
        overwriteTrackPerformers: 'écraser les interprètes',
        overwriteTimings: 'écraser les temps/durées',
        interpolateTimings: 'interpoler les temps/durées',
        gnucdidPlaceholder: 'gnucdid',
        releaseCodePlaceholder: 'code release [r###...]',
        discNumberPlaceholder: 'disque #',
        discIdPlaceholder: 'disc ID',
        modalTitleGnudb: 'importer métadonnées et durées depuis gnudb',
        modalTitleDiscogs: 'importer métadonnées depuis discogs',
        modalTitleMusicBrainz: 'importer métadonnées depuis musicbrainz',
        helpGnudbPre: 'chercher cd sur',
        helpGnudbPost: 'et copier le gnucdid',
        helpDiscogsPre: 'chercher version sur',
        helpDiscogsPost: ', et copier le code (pas master). interpolation possible si durées présentes.',
        helpMusicBrainzPre: 'chercher version sur',
        helpMusicBrainzPost: 'et copier le disc ID du deuxième onglet',
        modalTitleTracklist: 'importer métadonnées et pistes de 1001tracklists',
        searchOnTracklist: 'rechercher sur 1001tracklists.com',
        visitTracklist: 'rechercher sur 1001tracklists.com',
        helpTracklist: 'trouve la tracklist sur 1001tracklists et utilise le bouton du navigateur pour importer les métadonnées',
        pullFromBrowser: 'extraire du navigateur',
        importFromFile: 'importer depuis un fichier',

        deleteTrack: 'supprimer',
        deleteTrackConfirm: 'êtes-vous sûr de vouloir supprimer la piste',
        clearAllConfirm: 'êtes-vous sûr de vouloir effacer toutes les données ? cela réinitialisera toute la feuille CUE et la liste des pistes. toutes les modifications non enregistrées seront perdues.',

        error: 'erreur',
        errorOpeningFile: 'impossible d\'ouvrir le fichier',
        errorSelectingAudio: 'impossible de sélectionner le fichier audio',
        errorSaving: 'impossible d\'enregistrer le fichier',
        errorSaveAs: 'impossible d\'enregistrer le fichier',
        importFailed: 'échec de l\'importation',
        importNotImplemented: 'importation non implémentée',
        audacityImportFailed: 'échec de l\'importation Audacity',
        missingAudio: 'audio manquant',
        missingAudioMessage: 'veuillez d\'abord sélectionner un fichier audio en utilisant l\'icône dans le champ du nom de fichier.',
        noTracks: 'aucune piste',
        noTracksMessage: 'la feuille CUE n\'a pas de pistes à diviser.',
        missingDuration: 'durée manquante',
        missingDurationMessage: 'la durée totale de l\'audio est inconnue. la dernière piste pourrait ne pas se diviser correctement.',
        splittingError: 'erreur de division',
        connectionFailed: 'échec de la connexion',
        invalidXmcd: 'format xmcd invalide retourné',
        failedToFetch: 'échec de la récupération des métadonnées',

        splitting: 'division en cours',
        splittingComplete: 'division terminée',
        processingTrack: 'traitement de la piste',
        openFolder: 'ouvrir le dossier',
        preparing: 'préparation...',
        filesCreated: 'fichiers créés',

        savedSuccessfully: 'enregistré avec succès',

        trackNumber: '#',

        language: 'langue',
        selectLanguage: 'langue',
        settings: 'paramètres',
        lightMode: 'mode clair',
        darkMode: 'mode sombre',

        searchingFor: 'recherche de',
        searchOnDiscogs: 'rechercher sur discogs.com',
        searchOnMusicBrainz: 'rechercher sur musicbrainz.org',
        visitDiscogs: 'rechercher sur discogs.com',
        visitMusicBrainz: 'rechercher sur musicbrainz.org',
        visitGnuDb: 'rechercher sur gnudb.org',
        useDiscId: 'utiliser ce disc id',
        useReleaseCode: 'utiliser ce code de release',
        useGnuCdId: 'utiliser ce gnucdid',
        copy: 'copier',
        copyLink: 'copier le lien',
        openInNewWindow: 'ouvrir dans une nouvelle fenêtre',

        textEditing: 'édition de texte',
        modalTitleTextEditing: 'édition de texte',
        opChangeSeparator: 'changer le séparateur des artistes de',
        opSplitTitlePerformer: 'diviser les titres en titre et artiste par',
        opSwapTitlePerformer: 'inverser titres et artistes',
        opToPropercase: 'mettre des majuscules aux mots',
        from: 'de',
        to: 'à',
        separator: 'séparateur',

        // Discogs OAuth
        discogsAccount: 'compte discogs',
        connectToDiscogs: 'connecter à discogs',
        disconnectFromDiscogs: 'déconnecter de discogs',
        discogsConnectedAs: 'connecté en tant que',
        discogsNotConnected: 'non connecté',
        discogsAuthenticating: 'authentification avec discogs...',
        discogsAuthFailed: 'authentification échouée',
        discogsAuthSuccess: 'authentification réussie',

        // About Modal
        aboutTagline: 'CUEsto signifie CUE Sheet TOolbox',
        aboutVersion: 'version',
        aboutCheckUpdates: 'vérifier les mises à jour',
        aboutHelpLink: 'besoin d\'aide ? voici le guide',
        aboutSupport: 'si vous le trouvez utile, vous pouvez m\'offrir un café',
    },

    it: {
        appName: 'CUEsto',

        openFile: 'apri file',
        save: 'salva',
        saveAs: 'salva con nome',
        fileName: 'nome file',
        audioFile: 'file audio',
        audioFileResolved: 'file audio trovato',
        audioFileNotFound: 'seleziona file audio',
        newCueFile: 'nuovo file CUE',

        albumTitle: 'titolo album',
        performer: 'artista',
        date: 'data',
        genre: 'genere',
        title: 'titolo',
        startTime: 'inizio',
        duration: 'durata',

        addRow: 'aggiungi riga',
        viewCue: 'vedi CUE',
        clear: 'svuota',
        clearAll: 'svuota tutto',
        splitAudio: 'dividi audio',
        cancel: 'annulla',
        ok: 'ok',
        confirm: 'conferma',
        close: 'chiudi',

        getDataFrom: 'ottieni dati da',
        importFromMusicBrainz: 'importa da musicbrainz',
        importFromGnudb: 'importa da gnudb',
        importFromDiscogs: 'importa da discogs',
        importAudacityLabels: 'importa etichette audacity',
        importFrom1001Tracklists: 'importa da 1001tracklists',
        getMetadata: 'ottieni metadati',
        overwriteHeader: 'sovrascrivi intestazione (album, artista ecc.)',
        overwriteTrackTitles: 'sovrascrivi titoli tracce',
        overwriteTrackPerformers: 'sovrascrivi artisti tracce',
        overwriteTimings: 'sovrascrivi tempi/durate',
        interpolateTimings: 'interpola tempi/durate',
        gnucdidPlaceholder: 'gnucdid',
        releaseCodePlaceholder: 'codice release [r###...]',
        discNumberPlaceholder: 'disco #',
        discIdPlaceholder: 'disc ID',
        modalTitleGnudb: 'importa metadati e durate da gnudb',
        modalTitleDiscogs: 'importa metadati da discogs',
        modalTitleMusicBrainz: 'importa metadati da musicbrainz',
        helpGnudbPre: 'cerca cd su',
        helpGnudbPost: 'e copia il gnucdid',
        helpDiscogsPre: 'cerca release su',
        helpDiscogsPost: ', e copia il codice dalla pagina release (no master release). è possibile interpolare i tempi se presenti su Discogs.',
        helpMusicBrainzPre: 'cerca release su',
        helpMusicBrainzPost: 'e copia il disc ID, se presente, dal secondo tab',
        modalTitleTracklist: 'importa metadati e tracce da 1001tracklists',
        searchOnTracklist: 'cerca su 1001tracklists.com',
        visitTracklist: 'cerca su 1001tracklists.com',
        helpTracklist: 'trova la tracklist su 1001tracklists e usa il pulsante nel browser per importare i metadati',
        pullFromBrowser: 'estrai dal browser',
        importFromFile: 'importa da file',

        deleteTrack: 'elimina',
        deleteTrackConfirm: 'sei sicuro di voler eliminare la traccia',
        clearAllConfirm: 'sei sicuro di voler cancellare tutti i dati? questo resetterà l\'intero CUE sheet. tutte le modifiche non salvate saranno perse.',

        error: 'errore',
        errorOpeningFile: 'impossibile aprire il file',
        errorSelectingAudio: 'impossibile selezionare il file audio',
        errorSaving: 'impossibile salvare il file',
        errorSaveAs: 'impossibile salvare il file',
        importFailed: 'importazione fallita',
        importNotImplemented: 'importazione non implementata',
        audacityImportFailed: 'importazione audacity fallita',
        missingAudio: 'audio mancante',
        missingAudioMessage: 'per favore seleziona prima un file audio usando l\'icona nel campo nome file.',
        noTracks: 'nessuna traccia',
        noTracksMessage: 'il foglio CUE non ha tracce da dividere.',
        missingDuration: 'durata mancante',
        missingDurationMessage: 'la durata totale dell\'audio è sconosciuta. l\'ultima traccia potrebbe non essere divisa correttamente.',
        splittingError: 'errore divisione',
        connectionFailed: 'connessione fallita',
        invalidXmcd: 'formato xmcd non valido',
        failedToFetch: 'impossibile recuperare metadati',

        splitting: 'divisione in corso',
        splittingComplete: 'divisione completata',
        processingTrack: 'elaborazione traccia',
        openFolder: 'apri cartella',
        preparing: 'preparazione...',
        filesCreated: 'file creati',

        savedSuccessfully: 'salvato con successo',

        trackNumber: '#',

        language: 'lingua',
        selectLanguage: 'lingua',
        settings: 'impostazioni',
        lightMode: 'modalità chiara',
        darkMode: 'modalità scura',

        searchingFor: 'ricerca di',
        searchOnDiscogs: 'cerca su discogs.com',
        searchOnMusicBrainz: 'cerca su musicbrainz.org',
        visitDiscogs: 'cerca su discogs.com',
        visitMusicBrainz: 'cerca su musicbrainz.org',
        visitGnuDb: 'cerca su gnudb.org',
        useDiscId: 'usa questo disc id',
        useReleaseCode: 'usa questo codice release',
        useGnuCdId: 'usa questo gnucdid',
        copy: 'copia',
        copyLink: 'copia link',
        openInNewWindow: 'apri in una nuova finestra',

        textEditing: 'editing testuale',
        modalTitleTextEditing: 'editing testuale',
        opChangeSeparator: 'cambia separatore negli artisti da',
        opSplitTitlePerformer: 'dividi titoli tracce in titolo e artista dal separatore',
        opSwapTitlePerformer: 'inverti titoli e artisti',
        opToPropercase: 'converti in minuscolo con iniziali maiuscole',
        from: 'da',
        to: 'a',
        separator: 'separatore',

        // Discogs OAuth
        discogsAccount: 'account discogs',
        connectToDiscogs: 'collega a discogs',
        disconnectFromDiscogs: 'dissocia da discogs',
        discogsConnectedAs: 'collegato come',
        discogsNotConnected: 'non collegato',
        discogsAuthenticating: 'autenticazione con discogs...',
        discogsAuthFailed: 'autenticazione fallita',
        discogsAuthSuccess: 'autenticazione riuscita',

        // About Modal
        aboutTagline: 'CUEsto sta per CUE Sheet TOolbox',
        aboutVersion: 'versione',
        aboutCheckUpdates: 'controlla aggiornamenti',
        aboutHelpLink: 'hai bisogno di aiuto? ecco la guida',
        aboutSupport: 'se lo trovi utile, puoi offrirmi un caffè',
    },
};

// Language storage key
const LANGUAGE_STORAGE_KEY = 'cuesto_language';

// Define Language type
export type Language = 'en' | 'de' | 'es' | 'fr' | 'it';

// Get current language from localStorage or default to English
export function getCurrentLanguage(): Language {
    if (typeof window === 'undefined') return 'en';

    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
    if (stored && (stored === 'en' || stored === 'de' || stored === 'es' || stored === 'fr' || stored === 'it')) {
        return stored;
    }

    // Try to detect browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'de' || browserLang === 'es' || browserLang === 'fr' || browserLang === 'it') {
        return browserLang as Language;
    }

    return 'en';
}

// Set current language
export function setCurrentLanguage(lang: Language): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

// Get translations for current language
export function getTranslations(lang?: Language): Translations {
    const currentLang = lang || getCurrentLanguage();
    return translations[currentLang];
}

// Get specific translation
export function t(key: keyof Translations, lang?: Language): string {
    const trans = getTranslations(lang);
    return trans[key];
}

// Language names for display
export const languageNames: Record<Language, string> = {
    en: 'english',
    de: 'deutsch',
    es: 'español',
    fr: 'français',
    it: 'italiano',
};
