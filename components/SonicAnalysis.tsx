
import React, { useState, useRef, useEffect } from 'react';
import { SoundWaveIcon, SpinnerIcon, TrashIcon, EditIcon } from './icons';
import { RecognizedSong, AgentProfile } from '../types';
import { generateClueMatrixForSong } from '../services/api';
import * as db from '../services/database';

// A sub-component for the admin to add or edit a song's metadata
const SignalEditor: React.FC<{
    initialSong?: RecognizedSong;
    onSave: (songData: Omit<RecognizedSong, 'clueMatrix' | 'isAvailableToAgents'> & { title: string, artist: string, album?: string }) => Promise<void>;
    onCancel: () => void;
    isSaving: boolean;
}> = ({ initialSong, onSave, onCancel, isSaving }) => {
    const [acrid, setAcrid] = useState(initialSong?.id || '');
    const [title, setTitle] = useState(initialSong?.title || '');
    const [artist, setArtist] = useState(initialSong?.artist || 'Eddie Sing & The 31 Days');
    const [album, setAlbum] = useState(initialSong?.album || 'American Split AI');
    const [duration, setDuration] = useState(initialSong?.duration ? `${Math.floor(initialSong.duration / 60)}:${(initialSong.duration % 60).toString().padStart(2, '0')}` : '');
    const [error, setError] = useState('');

    const parseDuration = (time: string): number | null => {
        const parts = time.split(':');
        if (parts.length !== 2) return null;
        const minutes = parseInt(parts[0], 10);
        const seconds = parseInt(parts[1], 10);
        if (isNaN(minutes) || isNaN(seconds) || seconds > 59) return null;
        return minutes * 60 + seconds;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const durationInSeconds = parseDuration(duration);
        if (!acrid.trim() || !title.trim() || !artist.trim() || !durationInSeconds) {
            setError('ACRID, Title, Artist, and a valid Duration (MM:SS) are required.');
            return;
        }

        await onSave({
            id: acrid.trim(),
            title: title.trim(),
            artist: artist.trim(),
            album: album.trim(),
            duration: durationInSeconds
        });
    };

    return (
        <form onSubmit={handleSave} className="w-full max-w-xl mx-auto p-4 border border-dashed border-red-500/30 rounded-lg space-y-4 bg-gray-900/30">
            <h3 className="text-xl font-bold text-red-400 text-center">{initialSong ? 'Edit Signal Metadata' : 'Register New Signal'}</h3>
            <div className="space-y-2">
                <label className="block text-xs text-gray-400">ACRCloud ID (Required for recognition)</label>
                <input type="text" placeholder="e.g. acr_abc123" value={acrid} onChange={e => setAcrid(e.target.value)} required disabled={!!initialSong} className="bg-black/50 border-2 border-amber-500/50 focus:border-amber-400 w-full px-3 py-2 rounded-md disabled:opacity-50 text-white" />
                
                <label className="block text-xs text-gray-400">Song Title</label>
                <input type="text" placeholder="Song Title" value={title} onChange={e => setTitle(e.target.value)} required className="bg-black/50 border-2 border-amber-500/50 focus:border-amber-400 w-full px-3 py-2 rounded-md text-white" />
                
                <label className="block text-xs text-gray-400">Artist</label>
                <input type="text" placeholder="Artist" value={artist} onChange={e => setArtist(e.target.value)} required className="bg-black/50 border-2 border-amber-500/50 focus:border-amber-400 w-full px-3 py-2 rounded-md text-white" />

                <label className="block text-xs text-gray-400">Album</label>
                <input type="text" placeholder="Album" value={album} onChange={e => setAlbum(e.target.value)} required className="bg-black/50 border-2 border-amber-500/50 focus:border-amber-400 w-full px-3 py-2 rounded-md text-white" />
                
                <label className="block text-xs text-gray-400">Duration (MM:SS)</label>
                <input type="text" placeholder="3:45" value={duration} onChange={e => setDuration(e.target.value)} required className="bg-black/50 border-2 border-amber-500/50 focus:border-amber-400 w-full px-3 py-2 rounded-md text-white" />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-2 mt-2">
                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded-md flex justify-center items-center disabled:bg-gray-600">
                    {isSaving ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : (initialSong ? 'Save Changes' : 'Register Signal')}
                </button>
                <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-md">Cancel</button>
            </div>
        </form>
    );
};

// ====================================================================================
// MAIN SONIC ANALYSIS ADMIN COMPONENT
// ====================================================================================
export const SonicAnalysis: React.FC<{ agent: AgentProfile }> = () => {
    const [songDatabase, setSongDatabase] = useState<RecognizedSong[]>([]);
    const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
    const [editingSong, setEditingSong] = useState<RecognizedSong | null>(null);
    const [loadingState, setLoadingState] = useState<{ [songId: string]: 'intel' | 'save' | boolean }>({});
    const [error, setError] = useState<string | null>(null);

    const loadSongs = async () => {
        const songs = await db.getAllSongs();
        setSongDatabase(songs);
    };

    useEffect(() => {
        loadSongs();
    }, []);

    const handleRegisterNewSignal = async (songData: Omit<RecognizedSong, 'clueMatrix' | 'isAvailableToAgents' > & { title: string, artist: string, album?: string }) => {
        setError(null);
        setLoadingState(prev => ({ ...prev, save: true }));
        try {
            const existingSong = await db.getSongById(songData.id);
            if (existingSong) {
                setError(`A signal with ACRID "${songData.id}" is already registered.`);
                setLoadingState({});
                return;
            }

            const { clueMatrix } = await generateClueMatrixForSong(songData.title, songData.duration);
            const newSong: RecognizedSong = {
                ...songData,
                clueMatrix,
                isAvailableToAgents: true,
            };
            await db.addSong(newSong);
            setView('list');
            loadSongs();
        } catch (err) {
            console.error(err);
            setError("Failed to generate intel. The AI service may be unavailable or the song data is invalid.");
        } finally {
            setLoadingState({});
        }
    };

    const handleUpdateSignal = async (songData: Omit<RecognizedSong, 'clueMatrix' | 'isAvailableToAgents'> & { title: string, artist: string, album?: string }) => {
        const originalSong = songDatabase.find(s => s.id === editingSong?.id); // Use editingSong.id to find original, as ID might be changing
        
        if (originalSong) {
            setLoadingState(prev => ({ ...prev, save: true }));
            
            // If ID changed, we need to delete old and add new
            if (originalSong.id !== songData.id) {
                 const newSong = { ...originalSong, ...songData };
                 await db.addSong(newSong);
                 await db.deleteSong(originalSong.id);
            } else {
                const updatedSong = { ...originalSong, ...songData };
                await db.updateSong(updatedSong);
            }

            setView('list');
            setEditingSong(null);
            loadSongs();
            setLoadingState({});
        }
    };

    const handleDeleteSong = async (songId: string) => {
        if (window.confirm("Are you sure you want to permanently delete this signal? This action cannot be undone.")) {
            await db.deleteSong(songId);
            loadSongs();
        }
    };

    const handleGenerateIntel = async (song: RecognizedSong) => {
        setError(null);
        setLoadingState(prev => ({ ...prev, [song.id]: 'intel' }));
        try {
            const { clueMatrix } = await generateClueMatrixForSong(song.title, song.duration);
            const updatedSong = { ...song, clueMatrix };
            await db.updateSong(updatedSong);
            loadSongs();
        } catch (err) {
            console.error(err);
            setError(`Failed to generate intel for "${song.title}". The AI service may be unavailable.`);
        } finally {
            setLoadingState(prev => ({ ...prev, [song.id]: false }));
        }
    };
    
    return (
        <div className="flex-grow flex flex-col w-full p-4 bg-black/50 rounded-lg border border-red-500/30 overflow-y-auto">
            <div className="text-center mb-6">
                <SoundWaveIcon className="w-12 h-12 text-red-500 mx-auto mb-2" />
                <h2 className="text-2xl font-bold text-red-400">SIGNAL REGISTRY</h2>
                <p className="text-gray-400">Manage Resistance signals. All registered signals are live.</p>
            </div>
            
            {view === 'list' && (
                 <div className="flex flex-col gap-4 mb-6">
                     <button onClick={() => setView('add')} className="w-full max-w-xl mx-auto px-4 py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-md shadow-lg">
                        + Register New Signal
                    </button>
                </div>
            )}
            
            {error && <p className="text-red-400 text-sm text-center mb-4 p-2 bg-red-900/50 rounded-md">{error}</p>}
            
            {view === 'add' && <SignalEditor onSave={handleRegisterNewSignal} onCancel={() => setView('list')} isSaving={!!loadingState['save']} />}
            {view === 'edit' && editingSong && <SignalEditor initialSong={editingSong} onSave={handleUpdateSignal} onCancel={() => { setView('list'); setEditingSong(null); }} isSaving={!!loadingState['save']} />}

            {view === 'list' && (
                <div className="w-full max-w-4xl mx-auto space-y-3 mt-2 pt-2">
                    {songDatabase.length > 0 ? (
                        songDatabase.map(song => (
                            <div key={song.id} className={`w-full p-4 rounded-lg bg-gray-800/40 border border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3 hover:border-amber-500/50 transition-colors`}>
                                <div className="truncate flex-grow text-left w-full">
                                    <div className="flex items-center gap-2">
                                        <p className="text-lg font-bold text-gray-200 truncate">{song.title}</p>
                                        {song.id.startsWith('temp_') && <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded font-bold">NEEDS ID</span>}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{song.artist}</p>
                                    <p className="text-xs text-gray-600 font-mono">ID: {song.id}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
                                    <button onClick={() => handleGenerateIntel(song)} disabled={!!loadingState[song.id]} className="px-3 py-1 text-xs bg-amber-900/50 hover:bg-amber-800 text-amber-200 rounded-md disabled:bg-gray-600 flex items-center justify-center w-24 border border-amber-700/50">
                                        {loadingState[song.id] === 'intel' ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : 'Regen Intel'}
                                    </button>
                                    <button onClick={() => { setEditingSong(song); setView('edit'); }} className="p-2 rounded-md bg-gray-700 hover:bg-blue-600 text-white transition-colors" title="Edit ID/Metadata"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDeleteSong(song.id)} className="p-2 rounded-md bg-gray-700 hover:bg-red-600 text-white transition-colors" title="Delete"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 p-8 bg-gray-900/50 rounded-lg border border-dashed border-gray-700">
                            <p className="mb-4">No signals registered.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
