// Database.js - Supabase connection and CRUD operations

import { SUPABASE_URL, SUPABASE_ANON_KEY, FALLBACK_WORDS, shuffleArray } from './Config.js';

let db = null;
let isConnected = false;

// Initialize database connection
export async function initDatabase() {
    if (!window.supabase) {
        throw new Error('Supabase client not loaded. Check internet connection.');
    }
    
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    isConnected = true;
    
    // Test connection
    const { error } = await db.from('terminal_entries').select('count', { count: 'exact', head: true });
    if (error) {
        console.warn('Database connection warning:', error.message);
    }
    
    return db;
}

export function getDb() {
    if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
    return db;
}

export function isDbConnected() {
    return isConnected && db !== null;
}

// ============================================================
// TERMINAL ENTRIES CRUD
// ============================================================

export async function insertEntry(entry) {
    const { data, error } = await getDb().from('terminal_entries').insert(entry).select();
    if (error) throw new Error(`Insert failed: ${error.message}`);
    return data?.[0] || null;
}

export async function getEntries(limit = 20, offset = 0, orderBy = 'created_at', ascending = false) {
    const { data, error } = await getDb()
        .from('terminal_entries')
        .select('*')
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1);
    
    if (error) throw new Error(`Query failed: ${error.message}`);
    return data || [];
}

export async function getEntryCount() {
    const { count, error } = await getDb().from('terminal_entries').select('*', { count: 'exact', head: true });
    if (error) throw new Error(`Count failed: ${error.message}`);
    return count || 0;
}

export async function getRandomEntry() {
    const { data, error } = await getDb().from('terminal_entries').select('*');
    if (error) throw new Error(`Random query failed: ${error.message}`);
    if (!data || data.length === 0) return null;
    return data[Math.floor(Math.random() * data.length)];
}

export async function getEntriesByBand(band, limit = 20) {
    const { data, error } = await getDb()
        .from('terminal_entries')
        .select('*')
        .eq('divine_band', band)
        .limit(limit);
    
    if (error) throw new Error(`Band query failed: ${error.message}`);
    return data || [];
}

export async function searchEntries(searchTerm, limit = 30) {
    const { data, error } = await getDb()
        .from('terminal_entries')
        .select('*')
        .or(`label.ilike.%${searchTerm}%,body.ilike.%${searchTerm}%`)
        .limit(limit);
    
    if (error) throw new Error(`Search failed: ${error.message}`);
    return data || [];
}

// ============================================================
// ONE WORD PRIMITIVES (Well of Chaos)
// ============================================================

export async function getRandomWords(count = 5) {
    try {
        const { data, error } = await getDb()
            .from('one_word_primitives')
            .select('word')
            .limit(Math.min(count * 3, 50));
        
        if (error) throw error;
        if (!data || data.length === 0) {
            // Fallback to hardcoded words
            const shuffled = shuffleArray([...FALLBACK_WORDS]);
            return shuffled.slice(0, count);
        }
        
        const shuffled = shuffleArray([...data]);
        return shuffled.slice(0, count).map(w => w.word);
    } catch (err) {
        console.warn('Failed to fetch from one_word_primitives, using fallback:', err);
        const shuffled = shuffleArray([...FALLBACK_WORDS]);
        return shuffled.slice(0, count);
    }
}

export async function getRandomWordsByBand(band, count = 5) {
    // For now, just return random words - band filtering can be added later
    return getRandomWords(count);
}

// ============================================================
// RELATIONSHIPS (Weaving)
// ============================================================

export async function createRelationship(sourceId, targetId, type = 'connection') {
    const { data, error } = await getDb().from('terminal_relationships').insert({
        source_id: sourceId,
        target_id: targetId,
        type: type
    }).select();
    
    if (error) throw new Error(`Relationship creation failed: ${error.message}`);
    return data?.[0] || null;
}

export async function getRelationshipsForEntry(entryId, direction = 'outgoing') {
    let query;
    if (direction === 'outgoing') {
        query = getDb().from('terminal_relationships').select('*').eq('source_id', entryId);
    } else {
        query = getDb().from('terminal_relationships').select('*').eq('target_id', entryId);
    }
    
    const { data, error } = await query;
    if (error) throw new Error(`Relationship query failed: ${error.message}`);
    return data || [];
}

// ============================================================
// SPECTRUM / STATS
// ============================================================

export async function getSpectrumDistribution() {
    const { data, error } = await getDb().from('terminal_entries').select('divine_band');
    if (error) throw new Error(`Spectrum query failed: ${error.message}`);
    
    const counts = {
        hermes: 0, apollo: 0, hephaestus: 0,
        demeter: 0, poseidon: 0, athena: 0, zeus: 0
    };
    
    for (const entry of data) {
        const band = entry.divine_band || 'hermes';
        if (counts[band] !== undefined) counts[band]++;
    }
    
    return counts;
}

export async function getRecentEntries(limit = 10) {
    return getEntries(limit, 0, 'created_at', false);
}
