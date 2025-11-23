
// --- IndexedDB Service ---
// This service provides a robust, high-capacity database layer for the application,
// replacing the fragile localStorage system and permanently solving storage quota errors.

import { AgentProfile, RecognizedSong } from '../types';

const DB_NAME = 'ResistanceDB';
const DB_VERSION = 5; // Incrementing version to clean up stores if needed
const AGENTS_STORE = 'agents';
const SONGS_STORE = 'songs';

let db: IDBDatabase;

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            if (!dbInstance.objectStoreNames.contains(AGENTS_STORE)) {
                dbInstance.createObjectStore(AGENTS_STORE, { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains(SONGS_STORE)) {
                dbInstance.createObjectStore(SONGS_STORE, { keyPath: 'id' });
            }
            // Cleanup old stores if they exist
            if (dbInstance.objectStoreNames.contains('broadcast')) {
                dbInstance.deleteObjectStore('broadcast');
            }
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
            reject('Error opening database');
        };
    });
}

// ====================================================================================
// AGENT PROFILE FUNCTIONS
// ====================================================================================

export async function getAllAgents(): Promise<AgentProfile[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(AGENTS_STORE, 'readonly');
        const store = transaction.objectStore(AGENTS_STORE);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getAgentByName(name: string): Promise<AgentProfile | undefined> {
    const allAgents = await getAllAgents();
    return allAgents.find(agent => agent.name.toLowerCase() === name.toLowerCase());
}

export async function addAgent(agent: AgentProfile): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(AGENTS_STORE, 'readwrite');
        const store = transaction.objectStore(AGENTS_STORE);
        const request = store.add(agent);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function updateAgent(agent: AgentProfile): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(AGENTS_STORE, 'readwrite');
        const store = transaction.objectStore(AGENTS_STORE);
        const request = store.put(agent);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}


// ====================================================================================
// SONG / SIGNAL FUNCTIONS
// ====================================================================================

export async function getAllSongs(): Promise<RecognizedSong[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(SONGS_STORE, 'readonly');
        const store = transaction.objectStore(SONGS_STORE);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getSongById(songId: string): Promise<RecognizedSong | undefined> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(SONGS_STORE, 'readonly');
        const store = transaction.objectStore(SONGS_STORE);
        const request = store.get(songId);

        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = (event) => {
            console.error(`Error fetching song with id ${songId}:`, (event.target as IDBRequest).error);
            reject(request.error);
        };
    });
}


export async function addSong(song: RecognizedSong): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(SONGS_STORE, 'readwrite');
        const store = transaction.objectStore(SONGS_STORE);
        const request = store.add(song);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function updateSong(song: RecognizedSong): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(SONGS_STORE, 'readwrite');
        const store = transaction.objectStore(SONGS_STORE);
        const request = store.put(song);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function deleteSong(songId: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(SONGS_STORE, 'readwrite');
        const store = transaction.objectStore(SONGS_STORE);
        const request = store.delete(songId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}
