// Config.js - Divine constants and thresholds

// Supabase Configuration
export const SUPABASE_URL = 'https://kzcucjcyxybypncbdbws.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_saeUHGocDah-T2_709M6Fg_g26JtLXw';

// Temporal Constants
export const PHI = 1618;        // φ = 1.618 seconds (awake rhythm)
export const PI = 3142;         // π = 3.14159 seconds (dream rhythm)

// Divine Bands Configuration
export const DIVINE_BANDS = {
    hermes: {
        index: 1,
        icon: '✈️',
        name: 'Hermes',
        domain: 'Messages, Thresholds, Speed',
        freqValue: 6,
        freqRange: '4-8 Hz',
        light: 'Infrared',
        color: '#e8a87c',
        targetWords: [3, 5],
        time: 1618,
        minWords: 1,
        maxWords: 10
    },
    apollo: {
        index: 2,
        icon: '☀️',
        name: 'Apollo',
        domain: 'Light, Truth, Oracles',
        freqValue: 10,
        freqRange: '8-12 Hz',
        light: 'Sun Gold',
        color: '#f4d03f',
        targetWords: [5, 10],
        time: 3236,
        minWords: 11,
        maxWords: 25
    },
    hephaestus: {
        index: 3,
        icon: '🔥',
        name: 'Hephaestus',
        domain: 'Forge, Craft, Fire',
        freqValue: 13.5,
        freqRange: '12-15 Hz',
        light: 'Orange',
        color: '#d45500',
        targetWords: [10, 20],
        time: 4854,
        minWords: 26,
        maxWords: 50
    },
    demeter: {
        index: 4,
        icon: '🌾',
        name: 'Demeter',
        domain: 'Growth, Harvest, Seasons',
        freqValue: 17.5,
        freqRange: '15-20 Hz',
        light: 'Green',
        color: '#6b8e23',
        targetWords: [20, 40],
        time: 6472,
        minWords: 51,
        maxWords: 100
    },
    poseidon: {
        index: 5,
        icon: '🌊',
        name: 'Poseidon',
        domain: 'Depth, Flow, Earthquakes',
        freqValue: 25,
        freqRange: '20-30 Hz',
        light: 'Blue',
        color: '#2c6e9e',
        targetWords: [40, 80],
        time: 8090,
        minWords: 101,
        maxWords: 150
    },
    athena: {
        index: 6,
        icon: '🦉',
        name: 'Athena',
        domain: 'Wisdom, Weaving, Strategy',
        freqValue: 35,
        freqRange: '30-40 Hz',
        light: 'Purple',
        color: '#8e44ad',
        targetWords: [80, 150],
        time: 9708,
        minWords: 151,
        maxWords: 225,
        isGatekeeper: true,
        wisdomThreshold: 65
    },
    zeus: {
        index: 7,
        icon: '⚡',
        name: 'Zeus',
        domain: 'Thunder, Fate, Kingship',
        freqValue: 70,
        freqRange: '40-100 Hz',
        light: 'Ultraviolet',
        color: '#9b59b6',
        targetWords: [150, 300],
        time: 11326,
        minWords: 226,
        maxWords: 325
    }
};

// Fallback words for when database is unavailable
export const FALLBACK_WORDS = [
    'threshold', 'whisper', 'wing', 'light', 'truth', 'forge', 'fire',
    'depth', 'weave', 'thunder', 'echo', 'shadow', 'ember', 'thread',
    'memory', 'longing', 'courage', 'fate', 'dream', 'silence', 'chaos',
    'veil', 'spark', 'drift', 'pulse', 'ghost', 'shard', 'cipher'
];

// Order of bands for evolution chain
export const BAND_ORDER = ['hermes', 'apollo', 'hephaestus', 'demeter', 'poseidon', 'athena', 'zeus'];

// Awake/Dream thresholds
export const AWAKE_PULSES_TO_DREAM = 30;  // 30 pulses = ~48.5 seconds

// Helper functions
export function getBandInfo(band) {
    return DIVINE_BANDS[band];
}

export function getBandFromWordCount(wordCount) {
    if (wordCount <= 10) return 'hermes';
    if (wordCount <= 25) return 'apollo';
    if (wordCount <= 50) return 'hephaestus';
    if (wordCount <= 100) return 'demeter';
    if (wordCount <= 150) return 'poseidon';
    if (wordCount <= 225) return 'athena';
    return 'zeus';
}

export function getNextBand(currentBand) {
    const idx = BAND_ORDER.indexOf(currentBand);
    if (idx === -1 || idx === BAND_ORDER.length - 1) return null;
    return BAND_ORDER[idx + 1];
}

export function getPreviousBand(currentBand) {
    const idx = BAND_ORDER.indexOf(currentBand);
    if (idx <= 0) return null;
    return BAND_ORDER[idx - 1];
}

export function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
