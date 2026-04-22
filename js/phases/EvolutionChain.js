// EvolutionChain.js - Wires all gods together into a continuous synthesis pipeline

import { DIVINE_BANDS, BAND_ORDER, getBandInfo } from '../kernel/Config.js';
import { getRandomWords } from '../kernel/Database.js';
import Hermes from '../gods/Hermes.js';
import Apollo from '../gods/Apollo.js';
import Hephaestus from '../gods/Hephaestus.js';
import Demeter from '../gods/Demeter.js';
import Poseidon from '../gods/Poseidon.js';
import Athena from '../gods/Athena.js';
import Zeus from '../gods/Zeus.js';

// Evolution state
let evolutionState = {
    isActive: true,
    currentBand: 'hermes',
    currentChain: {
        hermes: null,
        apollo: null,
        hephaestus: null,
        demeter: null,
        poseidon: null,
        athena: null,
        zeus: null
    },
    timer: null,
    onStep: null,  // Callback for UI updates
    onComplete: null  // Callback when Zeus thunders
};

// Get the band config
function getBandConfig(band) {
    return DIVINE_BANDS[band];
}

// Get the next band in sequence
function getNextBand(currentBand) {
    const idx = BAND_ORDER.indexOf(currentBand);
    if (idx === -1 || idx === BAND_ORDER.length - 1) return null;
    return BAND_ORDER[idx + 1];
}

// Synthesize at a specific band
async function synthesizeAtBand(band, sourceText) {
    const config = getBandConfig(band);
    const targetMin = config.targetWords[0];
    
    // If no source and this is Hermes, start fresh
    if (!sourceText && band === 'hermes') {
        const words = await getRandomWords(3);
        sourceText = words.join(' · ');
    }
    
    if (!sourceText) return null;
    
    // Apply band-specific transformation
    let result = sourceText;
    let currentWords = result.split(/\s+/).length;
    
    // Expand to target word count
    while (currentWords < targetMin) {
        const newWords = await getRandomWords(2);
        if (newWords && newWords.length) {
            result += ' · ' + newWords.join(' · ');
        }
        currentWords = result.split(/\s+/).length;
    }
    
    return result;
}

// Run one step of evolution
async function evolutionStep() {
    if (!evolutionState.isActive) return;
    
    const band = evolutionState.currentBand;
    const bandInfo = getBandInfo(band);
    const config = getBandConfig(band);
    
    // Get source from previous band or generate new
    let sourceText = null;
    if (band === 'hermes') {
        // Hermes: start from scratch
        sourceText = await synthesizeAtBand(band, null);
    } else {
        const prevBand = BAND_ORDER[BAND_ORDER.indexOf(band) - 1];
        const prevEntry = evolutionState.currentChain[prevBand];
        if (prevEntry) {
            sourceText = prevEntry.body || prevEntry;
        } else {
            // No source yet, wait
            evolutionState.timer = setTimeout(() => evolutionStep(), 1000);
            return;
        }
    }
    
    if (!sourceText) {
        evolutionState.timer = setTimeout(() => evolutionStep(), 1000);
        return;
    }
    
    // Apply band-specific processing
    let processedText = sourceText;
    
    switch(band) {
        case 'hermes':
            // Hermes frames the concept
            const framed = Hermes.frame(sourceText);
            if (framed.success) {
                processedText = framed.original;
            }
            break;
        case 'apollo':
            // Apollo validates syntax
            const validation = Apollo.validate(sourceText);
            if (!validation.passed) {
                // Try to fix common issues
                let fixed = sourceText;
                if (!/[A-Z]/.test(fixed)) {
                    fixed = fixed.charAt(0).toUpperCase() + fixed.slice(1);
                }
                if (!/[.!?]$/.test(fixed)) {
                    fixed += '.';
                }
                processedText = fixed;
            }
            break;
        case 'hephaestus':
            // Hephaestus forges structure
            const forged = await Hephaestus.forge(sourceText, band, config.targetWords, getRandomWords);
            if (forged.success) {
                processedText = forged.body;
            }
            break;
        case 'demeter':
            // Demeter nurtures growth
            processedText = Demeter.nurture(sourceText, config.targetWords[0]);
            break;
        case 'poseidon':
            // Poseidon deepens
            processedText = Poseidon.deepen(sourceText, config.targetWords[0]);
            break;
        case 'athena':
            // Athena judges - this is the gatekeeper
            const judgment = Athena.judge({ body: sourceText });
            if (!judgment.passed) {
                // Rejected - stay at Athena and try again with refinement
                if (evolutionState.onStep) {
                    evolutionState.onStep({
                        band: band,
                        status: 'rejected',
                        score: judgment.score,
                        feedback: judgment.feedback,
                        entry: sourceText
                    });
                }
                // Try to refine and retry
                const refined = Athena.suggestRefinement({ body: sourceText });
                processedText = refined.refined;
                evolutionState.timer = setTimeout(() => evolutionStep(), config.time);
                return;
            }
            processedText = sourceText;
            if (evolutionState.onStep) {
                evolutionState.onStep({
                    band: band,
                    status: 'passed',
                    score: judgment.score,
                    entry: processedText
                });
            }
            break;
        case 'zeus':
            // Zeus thunders
            const thunder = await Zeus.thunder({ label: `evolution_${Date.now()}`, body: sourceText });
            processedText = thunder.final_text || sourceText;
            break;
    }
    
    // Store in chain
    evolutionState.currentChain[band] = processedText;
    
    // Notify UI
    if (evolutionState.onStep) {
        evolutionState.onStep({
            band: band,
            status: 'complete',
            entry: processedText,
            wordCount: processedText.split(/\s+/).length,
            time: config.time,
            icon: bandInfo.icon
        });
    }
    
    // Move to next band or complete
    const nextBand = getNextBand(band);
    if (nextBand) {
        evolutionState.currentBand = nextBand;
        evolutionState.timer = setTimeout(() => evolutionStep(), config.time);
    } else {
        // Evolution complete!
        if (evolutionState.onComplete) {
            evolutionState.onComplete({
                chain: evolutionState.currentChain,
                zeusEntry: evolutionState.currentChain.zeus
            });
        }
        // Reset for next cycle
        evolutionState.currentBand = 'hermes';
        evolutionState.currentChain = {
            hermes: null,
            apollo: null,
            hephaestus: null,
            demeter: null,
            poseidon: null,
            athena: null,
            zeus: null
        };
        // Start next cycle after a pause
        evolutionState.timer = setTimeout(() => evolutionStep(), 5000);
    }
}

// Start the evolution chain
export function startEvolution(onStep, onComplete) {
    if (evolutionState.timer) {
        clearTimeout(evolutionState.timer);
    }
    
    evolutionState = {
        ...evolutionState,
        isActive: true,
        currentBand: 'hermes',
        currentChain: {
            hermes: null,
            apollo: null,
            hephaestus: null,
            demeter: null,
            poseidon: null,
            athena: null,
            zeus: null
        },
        onStep: onStep,
        onComplete: onComplete,
        timer: null
    };
    
    evolutionStep();
}

// Pause evolution
export function pauseEvolution() {
    evolutionState.isActive = false;
    if (evolutionState.timer) {
        clearTimeout(evolutionState.timer);
        evolutionState.timer = null;
    }
}

// Resume evolution
export function resumeEvolution() {
    if (!evolutionState.isActive) {
        evolutionState.isActive = true;
        evolutionStep();
    }
}

// Get current evolution state
export function getEvolutionState() {
    return {
        currentBand: evolutionState.currentBand,
        currentChain: evolutionState.currentChain,
        isActive: evolutionState.isActive
    };
}

export default {
    startEvolution,
    pauseEvolution,
    resumeEvolution,
    getEvolutionState
};
