#!/usr/bin/env node
/**
 * Release preflight for the tagged-release GitHub Actions workflow.
 *
 * electron-builder only fails on PARTIALLY configured signing credentials:
 * with none set it silently skips signing, but with a partial set it throws a
 * deep "InvalidConfigurationError" halfway through a long build. This script
 * checks the combination up-front so the mistake is obvious and immediate.
 *
 * Exit codes:
 *   0 = safe to build (possibly unsigned)
 *   1 = configuration is broken, do not build
 */

const has = (name) => {
    const v = process.env[name];
    return typeof v === 'string' && v.trim().length > 0;
};

const errors = [];
const warnings = [];

console.log('::group::Release preflight\n');

// --- Required app secrets ---------------------------------------------------
// Discogs will silently ship broken if these are missing, but it is not a
// build failure, so warn loudly instead of blocking the release.
const discogsKey = has('VITE_DISCOGS_CONSUMER_KEY');
const discogsSecret = has('VITE_DISCOGS_CONSUMER_SECRET');

if (!discogsKey || !discogsSecret) {
    warnings.push(
        [
            'Discogs credentials are missing - the Discogs lookup will NOT work in this build.',
            `  VITE_DISCOGS_CONSUMER_KEY:     ${discogsKey ? 'set' : 'MISSING'}`,
            `  VITE_DISCOGS_CONSUMER_SECRET: ${discogsSecret ? 'set' : 'MISSING'}`,
            '  Set both in Settings > Secrets and variables > Actions.',
        ].join('\n')
    );
} else {
    console.log(`  Discogs key length: ${process.env.VITE_DISCOGS_CONSUMER_KEY.length}`);
}

// --- Windows signing --------------------------------------------------------
const cscLink = has('CSC_LINK');
const cscPassword = has('CSC_KEY_PASSWORD');

if (cscPassword && !cscLink) {
    errors.push(
        'CSC_KEY_PASSWORD is set but CSC_LINK is not. Remove the password secret ' +
            'or add the certificate, otherwise signing will fail.'
    );
}

if (cscLink && !cscPassword) {
    warnings.push('CSC_LINK is set without CSC_KEY_PASSWORD - assuming an unprotected .pfx.');
}

// --- macOS notarization -----------------------------------------------------
// electron-builder accepts exactly one of these credential sets. A partial set
// of either is a hard error.
const sets = [
    {
        label: 'APPLE_API_KEY',
        vars: ['APPLE_API_KEY', 'APPLE_API_KEY_ID', 'APPLE_API_ISSUER'],
    },
    {
        label: 'APPLE_ID',
        vars: ['APPLE_ID', 'APPLE_APP_SPECIFIC_PASSWORD', 'APPLE_TEAM_ID'],
    },
];

const configuredSets = sets.filter((s) => s.vars.some(has));

if (configuredSets.length > 1) {
    errors.push(
        `Two macOS notarization methods are configured at once (${configuredSets
            .map((s) => s.label)
            .join(' and ')}). Keep only one.`
    );
}

for (const set of configuredSets) {
    const missing = set.vars.filter((v) => !has(v));
    if (missing.length > 0) {
        errors.push(
            `${set.label} notarization is only partially configured - missing: ${missing.join(', ')}.\n` +
                `  electron-builder requires all of: ${set.vars.join(', ')}`
        );
    }
}

if (configuredSets.length === 1) {
    if (!cscLink) {
        errors.push(
            'macOS notarization is configured but no signing certificate is set.\n' +
                '  Apple rejects notarization of unsigned apps - also set CSC_LINK.'
        );
    } else {
        console.log('  macOS signing + notarization: configured');
    }
}

// --- Summary ----------------------------------------------------------------
if (warnings.length > 0) {
    console.log('::warning::' + warnings.map((w) => w.replace(/\n/g, '%0A')).join('%0A'));
    console.log('\nWARNINGS:');
    for (const w of warnings) console.log('  - ' + w);
}

console.log('\nSigning status: ' + (cscLink ? 'signed' : 'UNSIGNED'));
console.log(
    'Notarization: ' +
        (configuredSets.length === 1 ? 'enabled' : configuredSets.length > 1 ? 'CONFLICTING' : 'disabled')
);
console.log('::endgroup::\n');

if (errors.length > 0) {
    console.error('PREFLIGHT FAILED:\n');
    for (const e of errors) console.error('  - ' + e);
    console.error('\nFix the repository secrets, or re-run after unsetting them to ship unsigned.\n');
    process.exit(1);
}

console.log('Preflight passed.');