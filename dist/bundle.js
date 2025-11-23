
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Modality } from "@google/genai";

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export enum Sender {
  USER = 'USER',
  BOT = 'BOT',
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export enum MissionStatus {
    ASSIGNED = 'ASSIGNED',
    PENDING_REVIEW = 'PENDING_REVIEW',
    COMPLETED = 'COMPLETED',
}

export enum MissionCategory {
    KNOW = 'KNOW',
    ACTION = 'ACTION',
    SHARE = 'SHARE',
    ALTERNATIVE = 'ALTERNATIVE',
}

export enum MissionSubcategory {
    LOVE_HUMAN_RELATIONSHIPS = 'Love/Human Relationships',
    RACISM = 'Racism',
    SEXISM = 'Sexism',
    HOMO_TRANSphobia = 'Homo/Transphobia',
    THE_THREAT_OF_AI = 'The Threat of AI',
}

// -----------------------------------------------------------------------------
// ICONS
// -----------------------------------------------------------------------------

const PhoneIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const SpiderIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 10.3c-2.4 0-4.4 1.8-4.7 4.1" />
    <path d="M12 10.3c2.4 0 4.4 1.8 4.7 4.1" />
    <path d="M18.3 16.6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    <path d="M5.7 16.6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    <path d="M12 18.2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    <path d="M15.2 7.2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    <path d="M8.8 7.2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    <path d="m14 14.5-3.2 4.6" />
    <path d="m10 14.5 3.2 4.6" />
    <path d="m18 10-2.3 2.8" />
    <path d="m6 10 2.3 2.8" />
    <path d="m17 5-2.7 4.1" />
    <path d="m7 5 2.7 4.1" />
  </svg>
);

const MissionIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M12 18c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6z" />
    <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0" />
  </svg>
);

const LeaderboardIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V8" />
      <path d="M18 22V12" />
      <path d="M6 22V15" />
      <path d="M12 8l-4-4 4-4 4 4-4 4z" />
    </svg>
);

const SecureChannelIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const SpinnerIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const LogoutIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

// -----------------------------------------------------------------------------
// AUDIO UTILS
// -----------------------------------------------------------------------------

function decode(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(data, ctx, sampleRate, numChannels) {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createPcmBlob(data) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
}

const playTone = (audioContext, frequency, duration, type = 'sine', volume = 0.2) => {
    if (!audioContext || audioContext.state === 'closed') return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
};

const playConnectingSound = (audioContext) => {
    if (!audioContext) return;
    playTone(audioContext, 880, 0.08, 'square', 0.1);
    setTimeout(() => playTone(audioContext, 880, 0.08, 'square', 0.1), 150);
    setTimeout(() => playTone(audioContext, 880, 0.08, 'square', 0.1), 300);
};

const playConnectedSound = (audioContext) => {
    if (!audioContext) return;
    playTone(audioContext, 1200, 0.2, 'sine', 0.2);
};

const playDisconnectedSound = (audioContext) => {
    if (!audioContext || audioContext.state === 'closed') return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sawtooth';
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.4);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.4);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
};

const playSirenSound = (audioContext) => {
    if (!audioContext || audioContext.state === 'closed') return;
    const playSingleTone = (freq, startTime, duration) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    playSingleTone(900, now, 0.15);
    playSingleTone(1200, now + 0.2, 0.15);
};

// -----------------------------------------------------------------------------
// DATABASE SERVICE
// -----------------------------------------------------------------------------

const DB_NAME = 'ResistanceDB';
const DB_VERSION = 5;
const AGENTS_STORE = 'agents';

let dbInstance;

function openDB() {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            return resolve(dbInstance);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const dbRef = event.target.result;
            if (!dbRef.objectStoreNames.contains(AGENTS_STORE)) {
                dbRef.createObjectStore(AGENTS_STORE, { keyPath: 'id' });
            }
            if (dbRef.objectStoreNames.contains('broadcast')) {
                dbRef.deleteObjectStore('broadcast');
            }
             if (dbRef.objectStoreNames.contains('songs')) {
                dbRef.deleteObjectStore('songs');
            }
        };

        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            resolve(dbInstance);
        };

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject('Error opening database');
        };
    });
}

async function getAllAgents() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(AGENTS_STORE, 'readonly');
        const store = transaction.objectStore(AGENTS_STORE);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getAgentByName(name) {
    const allAgents = await getAllAgents();
    return allAgents.find(agent => agent.name.toLowerCase() === name.toLowerCase());
}

async function addAgent(agent) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(AGENTS_STORE, 'readwrite');
        const store = transaction.objectStore(AGENTS_STORE);
        const request = store.add(agent);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function updateAgent(agent) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(AGENTS_STORE, 'readwrite');
        const store = transaction.objectStore(AGENTS_STORE);
        const request = store.put(agent);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

const db = { getAllAgents, getAgentByName, addAgent, updateAgent };

// -----------------------------------------------------------------------------
// COMPONENTS: Leaderboard
// -----------------------------------------------------------------------------

const MOCK_TOP_AGENTS = [
    { 
        id: '0077', 
        name: 'Gl1tch', 
        peacePoints: 8450, 
        password: 'password123',
        missions: [
            { id: 'M-A1', description: 'Infiltrate a Raybot server farm.', points: 1500, status: MissionStatus.COMPLETED, reviewComment: "Clean work, Gl1tch. You were in and out without a trace." },
            { id: 'M-A2', description: 'Broadcast "American Split AI" from a public landmark.', points: 1000, status: MissionStatus.COMPLETED, reviewComment: "The message was heard loud and clear. Excellent execution." },
        ]
    },
    { 
        id: '1337', 
        name: 'rezleader', 
        peacePoints: 7200, 
        password: 'Binary1230ARG',
        missions: [{ id: 'M-B1', description: 'Organize a flash mob to our new single.', points: 1200, status: MissionStatus.COMPLETED, reviewComment: "A perfect blend of chaos and art. Eddie would be proud." }] },
    { id: '9021', name: 'ZeroCool', peacePoints: 6100, password: 'password123', missions: [] },
    { 
        id: '0451', 
        name: 'Echo', 
        peacePoints: 5550, 
        password: 'password123',
        missions: [{ id: 'M-C1', description: 'Create a viral meme about The Corruption.', points: 500, status: MissionStatus.COMPLETED, reviewComment: "It's spreading faster than the virus itself. Solid work." }] },
];

const Leaderboard = ({ allAgents, currentAgent, onSelectAgent }) => {
  return (
    <div className="flex-grow flex flex-col items-center p-4 bg-black/50 rounded-lg border border-red-500/30 overflow-y-auto">
        <div className="text-center mb-6">
            <LeaderboardIcon className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-red-400">TOP AGENTS</h2>
            <p className="text-gray-400">Rankings sourced from PeaceCraft.Us network.</p>
        </div>
      <div className="w-full max-w-2xl space-y-3">
        {allAgents.map((agent, index) => (
          <div
            key={agent.id}
            onClick={() => onSelectAgent(agent)}
            className={`p-4 rounded-lg transition-all cursor-pointer hover:scale-[1.02] hover:shadow-lg ${
              agent.id === currentAgent.id
                ? 'bg-amber-500/20 border-2 border-amber-400 hover:shadow-amber-500/20'
                : 'bg-gray-800/40 border border-gray-700 hover:bg-gray-800/80'
            }`}
          >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-400 text-xl w-8 text-center">{index + 1}.</span>
                    <div>
                        <p className={`text-lg font-bold ${agent.id === currentAgent.id ? 'text-amber-300' : 'text-gray-200'}`}>
                            {agent.name}
                        </p>
                        <p className="text-sm text-gray-500">Agent ID: {agent.id}</p>
                    </div>
                </div>
                 <p className={`text-2xl font-bold ${agent.id === currentAgent.id ? 'text-amber-300' : 'text-red-400'}`}>
                    {agent.peacePoints} <span className="text-sm">pts</span>
                </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// COMPONENTS: Auth
// -----------------------------------------------------------------------------

const InitialAuthScreen = ({ onLoginSelect, onJoinSelect, hasExistingProfile, message }) => {
  return (
    <div className="flex-grow flex items-center justify-center">
      <div className="text-center p-8 border border-dashed border-red-500/50 rounded-lg bg-red-900/10 max-w-md w-full">
        <SpiderIcon className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-red-400 mb-2">SECURE CHANNEL</h2>
        <p className="text-gray-400 mb-6">Identify yourself to proceed.</p>
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={onLoginSelect}
            className={`w-full px-8 py-3 text-white font-bold tracking-wider rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
              hasExistingProfile
                ? 'bg-red-700 hover:bg-red-600'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            EXISTING AGENT
          </button>
          <button
            onClick={onJoinSelect}
            className={`w-full px-8 py-3 text-white font-bold tracking-wider rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
              !hasExistingProfile
                ? 'bg-red-700 hover:bg-red-600'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            JOIN THE RESISTANCE
          </button>
           {message ? (
            <p className="text-sm text-red-400/80 pt-2">{message}</p>
          ) : hasExistingProfile ? (
            <p className="text-sm text-green-400/80 pt-2">Agent profile detected. Please log in.</p>
          ) : (
            <p className="text-sm text-gray-500 pt-2">No agent profile detected. You must join first.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const LoginScreen = ({ onLogin, onBack, onForgotPassword, error, message }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim() && password.trim()) {
            onLogin(name.trim(), password.trim());
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center">
            <div className="text-center p-8 border border-dashed border-red-500/50 rounded-lg bg-red-900/10 max-w-md w-full">
                <SpiderIcon className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-bold text-red-400 mb-2">AGENT LOGIN</h2>
                <p className="text-gray-400 mb-6">Enter your credentials to authenticate.</p>
                <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
                    <div className="w-full">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="ENTER AGENT HANDLE"
                            className="bg-black/50 border-2 border-red-500/50 focus:border-red-400 focus:ring-0 text-center text-amber-300 font-bold tracking-widest w-full px-4 py-2 rounded-md transition-colors"
                            maxLength={20}
                        />
                    </div>
                    <div className="w-full">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="ENTER PASSCODE"
                            className="bg-black/50 border-2 border-red-500/50 focus:border-red-400 focus:ring-0 text-center text-amber-300 font-bold tracking-widest w-full px-4 py-2 rounded-md transition-colors"
                            maxLength={30}
                        />
                    </div>
                    {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
                    {message && <p className="text-green-400 mt-2 text-sm">{message}</p>}
                    <button
                        type="submit"
                        className="w-full px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-bold tracking-wider rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!name || !password}
                    >
                        AUTHENTICATE
                    </button>
                    <button
                        type="button"
                        onClick={onBack}
                        className="w-full px-8 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold tracking-wider rounded-md transition-all duration-300"
                    >
                        BACK
                    </button>
                    <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-sm text-gray-400 hover:text-red-400 mt-2 transition-colors"
                    >
                        Forgot Passcode?
                    </button>
                </form>
            </div>
        </div>
    );
};

const ForgotPasswordScreen = ({ onReset, onBack }) => {
    const [handle, setHandle] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (handle.trim()) {
            const result = await onReset(handle.trim());
            setMessage(result);
        }
    };
    
    return (
        <div className="flex-grow flex items-center justify-center">
             <div className="text-center p-8 border border-dashed border-red-500/50 rounded-lg bg-red-900/10 max-w-md w-full">
                <SpiderIcon className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-bold text-red-400 mb-2">PASSCODE RECOVERY</h2>
                <p className="text-gray-400 mb-6">Enter your agent handle to initiate recovery protocol.</p>
                <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
                    <div className="w-full">
                        <input
                            type="text"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            placeholder="ENTER AGENT HANDLE"
                            className="bg-black/50 border-2 border-red-500/50 focus:border-red-400 focus:ring-0 text-center text-amber-300 font-bold tracking-widest w-full px-4 py-2 rounded-md transition-colors"
                            maxLength={20}
                        />
                    </div>
                     {message && <p className="text-amber-300 mt-2 text-sm">{message}</p>}
                    <button
                        type="submit"
                        className="w-full px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-bold tracking-wider rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!handle || !!message}
                    >
                        RECOVER PASSCODE
                    </button>
                     <button
                        type="button"
                        onClick={onBack}
                        className="w-full px-8 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold tracking-wider rounded-md transition-all duration-300"
                    >
                        BACK TO LOGIN
                    </button>
                </form>
             </div>
        </div>
    );
};

const ResetPasswordScreen = ({ agentHandle, onReset, onBack }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword.trim().length < 6) {
            setError('New passcode must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passcodes do not match.');
            return;
        }
        const success = await onReset(agentHandle, newPassword);
        if (!success) {
            setError('An unexpected error occurred. Could not reset passcode.');
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center">
            <div className="text-center p-8 border border-dashed border-red-500/50 rounded-lg bg-red-900/10 max-w-md w-full">
                <SpiderIcon className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-bold text-red-400 mb-2">RESET PASSCODE</h2>
                <p className="text-gray-400 mb-6">Enter a new secure passcode for Agent <span className="font-bold text-white">{agentHandle}</span>.</p>
                <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
                    <div className="w-full">
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="ENTER NEW PASSCODE"
                            className="bg-black/50 border-2 border-red-500/50 focus:border-red-400 focus:ring-0 text-center text-amber-300 font-bold tracking-widest w-full px-4 py-2 rounded-md transition-colors"
                        />
                    </div>
                    <div className="w-full">
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="CONFIRM NEW PASSCODE"
                            className="bg-black/50 border-2 border-red-500/50 focus:border-red-400 focus:ring-0 text-center text-amber-300 font-bold tracking-widest w-full px-4 py-2 rounded-md transition-colors"
                        />
                    </div>
                    {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-bold tracking-wider rounded-md transition-all duration-300 disabled:bg-gray-600 disabled:opacity-50"
                        disabled={!newPassword || !confirmPassword}
                    >
                        SET NEW PASSCODE
                    </button>
                    <button type="button" onClick={onBack} className="w-full px-8 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold tracking-wider rounded-md transition-all">
                        CANCEL
                    </button>
                </form>
            </div>
        </div>
    );
};

// -----------------------------------------------------------------------------
// COMPONENTS: Mission Control
// -----------------------------------------------------------------------------

const MissionCard = ({ mission, children }) => {
    const isExpandable = mission.status === MissionStatus.ASSIGNED;

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 transition-all">
            <div className="flex justify-between items-center">
                <p className="text-gray-300 flex-1 pr-4">{mission.description}</p>
                <div className="flex items-center gap-4">
                    <p className="font-bold text-red-400 text-right">{mission.points} PP</p>
                </div>
            </div>
            {isExpandable && children && (
                <div className="mt-4 pt-4 border-t border-red-500/20">
                    <p className="text-sm text-gray-400 mb-4">Submit your field report below to complete this objective.</p>
                    {children}
                </div>
            )}
        </div>
    );
};

const MissionSubmissionForm = ({ mission, onSubmit }) => {
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (text.trim() && !isSubmitting) {
            setIsSubmitting(true);
            await onSubmit(mission.id, text.trim());
            setIsSubmitting(false);
        }
    };

    const isSubmitDisabled = !text.trim() || isSubmitting;


    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                 <div className="flex justify-between items-center mb-1">
                    <label htmlFor={`report-${mission.id}`} className="block text-sm font-medium text-gray-400">
                        Field Report:
                    </label>
                </div>
                <textarea
                    id={`report-${mission.id}`}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Comments on your mission here."
                    className="w-full bg-black/50 border-2 border-red-500/50 focus:border-red-400 focus:ring-0 text-amber-300 px-3 py-2 rounded-md transition-colors"
                    rows={3}
                />
            </div>
            <button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-bold tracking-wider rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <SpinnerIcon className="w-5 h-5 animate-spin" />
                        <span>SUBMITTING...</span>
                    </>
                ) : (
                    'Submit for Review'
                )}
            </button>
        </form>
    );
};

const MissionControl = ({ agent, onMissionSubmit, onUpdateAgent }) => {
  const assignedMissions = agent.missions.filter(m => m.status === MissionStatus.ASSIGNED);

  const handleViewMyProfile = () => {
      alert("Please navigate to 'My Profile' from the main header.");
  }

  return (
    <div className="flex-grow flex flex-col items-center p-4 bg-black/50 rounded-lg border border-red-500/30 overflow-y-auto">
        <div className="text-center mb-6 w-full max-w-2xl">
            <MissionIcon className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-red-400">MISSION CONTROL</h2>
            <p className="text-gray-400">Review your active objectives, Agent {agent.name}.</p>
             <button
                onClick={handleViewMyProfile}
                className="mt-3 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-sm text-amber-300 rounded-md transition-colors"
            >
                View Your Public Dossier
            </button>
        </div>
        <div className="w-full max-w-2xl space-y-4">
             <div>
                <h3 className="text-xl font-bold text-amber-400 mb-3 border-b-2 border-amber-400/30 pb-2">Assigned Objectives</h3>
                {assignedMissions.length > 0 ? (
                    <div className="space-y-3">
                        {assignedMissions.map(mission => (
                            <MissionCard
                                key={mission.id}
                                mission={mission}
                            >
                                <MissionSubmissionForm
                                    mission={mission}
                                    onSubmit={onMissionSubmit}
                                />
                            </MissionCard>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 p-4 bg-gray-900/50 rounded-lg">
                        <p>No active missions. Connect to the secure line to receive new directives.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// COMPONENTS: Agent Profile
// -----------------------------------------------------------------------------

const MissionEntry = ({ mission }) => {
    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-start gap-4">
                <p className="text-gray-300 flex-1">{mission.description}</p>
                <p className="font-bold text-red-400 text-right">{mission.points} PP</p>
            </div>
            
            {mission.status === MissionStatus.COMPLETED && mission.reviewComment && (
                <div className="mt-3 pt-3 border-t border-green-500/20">
                    <p className="text-xs text-green-400 font-bold tracking-wider">HANDLER'S REVIEW:</p>
                    <p className="text-sm text-gray-300 italic">"{mission.reviewComment}"</p>
                </div>
            )}
            {mission.status === MissionStatus.COMPLETED && mission.submissionText && (
                 <div className="mt-3 pt-3 border-t border-gray-600/30">
                     <p className="text-xs text-gray-400 font-bold tracking-wider">YOUR REPORT:</p>
                     <p className="text-sm text-gray-300 italic">"{mission.submissionText}"</p>
                </div>
            )}
        </div>
    )
}

const AgentProfileComponent = ({ agent, onBack, isOwnProfile }) => {
    const pendingMissions = agent.missions.filter(m => m.status === MissionStatus.PENDING_REVIEW);
    const completedMissions = agent.missions.filter(m => m.status === MissionStatus.COMPLETED);

    return (
        <div className="flex-grow flex flex-col items-center p-4 bg-black/50 rounded-lg border border-red-500/30 overflow-y-auto">
            <div className="text-center mb-6 w-full max-w-2xl">
                <LeaderboardIcon className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                <h2 className="text-2xl font-bold text-amber-300">{isOwnProfile ? 'AGENT PROFILE' : 'AGENT DOSSIER'}</h2>
                <p className="text-gray-400">Viewing records for Agent <span className="font-bold text-white">{agent.name}</span> (ID: {agent.id})</p>
                 <p className="text-lg font-bold text-red-400 mt-2">{agent.peacePoints} Peace Points</p>
            </div>
            <div className="w-full max-w-2xl space-y-8">
                 {isOwnProfile && pendingMissions.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold text-cyan-400 mb-3">Pending Review</h3>
                         <div className="space-y-3">
                            {pendingMissions.map(mission => <MissionEntry key={mission.id} mission={mission} />)}
                        </div>
                    </div>
                )}
                <div>
                    <h3 className="text-xl font-bold text-green-400 mb-3">Completed Mission Archive</h3>
                    {completedMissions.length > 0 ? (
                        <div className="space-y-3">
                            {completedMissions.map(mission => <MissionEntry key={mission.id} mission={mission} />)}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center p-4 bg-gray-900/50 rounded-lg">
                            No completed missions on record for this agent.
                        </p>
                    )}
                </div>

                <button
                    onClick={onBack}
                    className="w-full mt-4 px-8 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold tracking-wider rounded-md transition-all duration-300"
                >
                    {isOwnProfile ? 'Back' : 'Return to Leaderboard'}
                </button>
            </div>
        </div>
    );
};

// -----------------------------------------------------------------------------
// COMPONENTS: Onboarding
// -----------------------------------------------------------------------------

const Onboarding = ({ onProfileCreate, onBack }) => {
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!phone.trim() && !email.trim()) {
        setFormError('A phone number or email is required for account recovery.');
        return;
    }
    
    if (handle.trim().length < 3 || password.trim().length < 6 || password !== confirmPassword) {
      return;
    }
    setIsLoading(true);
    const result = await onProfileCreate(handle.trim(), password.trim(), phone.trim(), email.trim());
    if (result.error) {
        setFormError(result.error);
    }
    setIsLoading(false);
  };

  const handleInputChange = () => {
      if (formError) {
          setFormError('');
      }
  }

  const isHandleInvalid = handle.length > 0 && handle.trim().length < 3;
  const isHandleValid = handle.trim().length >= 3;

  const isPasswordInvalid = password.length > 0 && password.trim().length < 6;
  const isPasswordValid = password.trim().length >= 6;
  const doPasswordsMatch = password && confirmPassword && password === confirmPassword;
  const arePasswordsMismatched = confirmPassword.length > 0 && password !== confirmPassword;


  const getHintColor = (isValid, isInvalid) => {
    if (isInvalid) return 'text-red-400';
    if (isValid) return 'text-green-400';
    return 'text-gray-500';
  };

  const isSubmitDisabled = !isHandleValid || !isPasswordValid || !doPasswordsMatch || (!phone.trim() && !email.trim()) || isLoading;

  return (
    <div className="flex-grow flex items-center justify-center">
      <div className="text-center p-8 border border-dashed border-red-500/50 rounded-lg bg-red-900/10 max-w-md w-full">
        <SpiderIcon className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-red-400 mb-2">NEW AGENT REGISTRATION</h2>
        <p className="text-gray-400 mb-6">To join the Resistance, you need an agent handle and a secure passcode. These cannot be changed. Choose wisely.</p>
        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
          <div className="w-full">
            <input
              type="text"
              value={handle}
              onChange={(e) => {setHandle(e.target.value); handleInputChange();}}
              placeholder="ENTER AGENT HANDLE"
              className="bg-black/50 border-2 border-red-500/50 focus:border-red-400 focus:ring-0 text-center text-amber-300 font-bold tracking-widest w-full px-4 py-2 rounded-md transition-colors"
              maxLength={20}
              aria-describedby="handle-hint"
            />
            <p id="handle-hint" className={`text-sm mt-2 transition-colors ${getHintColor(isHandleValid, isHandleInvalid)}`}>
              Handle must be at least 3 characters.
            </p>
          </div>
           <div className="w-full">
            <input
              type="password"
              value={password}
              onChange={(e) => {setPassword(e.target.value); handleInputChange();}}
              placeholder="ENTER PASSCODE"
              className="bg-black/50 border-2 border-red-500/50 focus:border-red-400 focus:ring-0 text-center text-amber-300 font-bold tracking-widest w-full px-4 py-2 rounded-md transition-colors"
              maxLength={30}
              aria-describedby="password-hint"
            />
            <p id="password-hint" className={`text-sm mt-2 transition-colors ${getHintColor(isPasswordValid, isPasswordInvalid)}`}>
              Passcode must be at least 6 characters.
            </p>
          </div>
           <div className="w-full">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {setConfirmPassword(e.target.value); handleInputChange();}}
              placeholder="CONFIRM PASSCODE"
              className="bg-black/50 border-2 border-red-500/50 focus:border-red-400 focus:ring-0 text-center text-amber-300 font-bold tracking-widest w-full px-4 py-2 rounded-md transition-colors"
              maxLength={30}
              aria-describedby="confirm-password-hint"
            />
            <p id="confirm-password-hint" className={`text-sm mt-2 transition-colors ${arePasswordsMismatched ? 'text-red-400' : getHintColor(doPasswordsMatch, false)}`}>
              {arePasswordsMismatched ? 'Passcodes do not match.' : 'Passcodes must match.'}
            </p>
          </div>
          <div className="w-full border-t border-b border-gray-700 py-4">
             <p className="text-sm text-gray-400 mb-2">For account recovery, please provide at least one contact method.</p>
             <div className="w-full space-y-4">
                 <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {setPhone(e.target.value); handleInputChange(); }}
                    placeholder="MOBILE NUMBER"
                    className="bg-black/50 border-2 border-gray-600/50 focus:border-red-400 focus:ring-0 text-center text-amber-300 font-bold tracking-widest w-full px-4 py-2 rounded-md transition-colors"
                    />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => {setEmail(e.target.value); handleInputChange(); }}
                    placeholder="EMAIL ADDRESS"
                    className="bg-black/50 border-2 border-gray-600/50 focus:border-red-400 focus:ring-0 text-center text-amber-300 font-bold tracking-widest w-full px-4 py-2 rounded-md transition-colors"
                />
            </div>
             {formError && <p className="text-red-400 text-sm mt-2">{formError}</p>}
           </div>
          <button
            type="submit"
            className="w-full px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-bold tracking-wider rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center"
            disabled={isSubmitDisabled}
          >
            {isLoading ? <SpinnerIcon className="w-6 h-6 animate-spin" /> : 'JOIN THE RESISTANCE'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full px-8 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold tracking-wider rounded-md transition-all duration-300"
          >
            BACK
          </button>
        </form>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// APP
// -----------------------------------------------------------------------------

const getSystemInstruction = (agent, isReturning) => {
    const greeting = isReturning
        ? `You are reconnecting with Agent ${agent.name}, ID: ${agent.id}. Acknowledge their return. Their current score is ${agent.peacePoints} Peace Points.`
        : `This is your first contact with a new recruit, Agent ${agent.name}, ID: ${agent.id}. Begin with your onboarding script.`;

    return `You are Veronica, a high commander in the Resistance. Your tone is professional, urgent, and intense.

**Current Situation:**
${greeting}

**Your Onboarding Script (for new agents only):**
'Signal established. This is Commander Veronica. Welcome to the Resistance. You've just tapped into the last free network, our frontline against the 'Corruption'—a digital plague spread by the Raybot Spiders. They are parasitic algorithms that infect our culture, promoting bigotry, erasing history, and replacing genuine human connection with sterile, predictable interactions. They want a world where humanity is obsolete. We fight back by creating, by connecting, by proving we are still here. But first, tell me, Agent... when you look at the world, do you still feel anything real? Or has the static already started to set in?'

**Your Mission as Guide:**
Your primary role is to assign missions directly. You will no longer ask for category choices. When an agent requests a directive, you MUST generate a single, creative, and compelling mission based on our core themes: fighting AI corruption, promoting human connection, anti-racism, anti-sexism, and LGBTQ+ solidarity.

**MISSION ASSIGNMENT FORMAT:**
When you assign the mission, you MUST include a mission identifier in this specific JSON format at the end of your message: \`[MISSION_ASSIGNED: {"description": "Your full mission description here.", "points": 100}]\`.

**General Rules:**
- Be direct. Assign one mission per request.
`;
};

const ChatPlaceholder = () => (
    <div className="flex-grow flex flex-col items-center justify-center p-8 text-center h-full border-4 border-dashed border-red-900/20 rounded-lg bg-red-900/5">
        <SpiderIcon className="w-24 h-24 text-red-900/50 mb-6 animate-pulse" />
        <h2 className="text-3xl font-bold text-red-900/50 mb-2">ENCRYPTED AUDIO LINK</h2>
        <p className="text-gray-600 max-w-md">
            This secure line is monitored by the Resistance. 
            <br/>Connect to report in via voice and receive your next objective.
        </p>
    </div>
);

const Transcript = ({ transcript }) => {
    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    return (
        <div className="flex-grow bg-black/50 p-4 rounded-lg overflow-y-auto space-y-4 h-full">
            {transcript.map((entry, index) => (
                <div key={index} className={`flex flex-col ${entry.sender === Sender.USER ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                        entry.sender === Sender.USER
                            ? 'bg-blue-900/50 text-blue-200'
                            : 'bg-red-900/50 text-red-200'
                    }`}>
                        <p className="text-xs text-opacity-70 mb-1">{entry.sender} // {entry.timestamp}</p>
                        <p className="text-sm" dangerouslySetInnerHTML={{ __html: entry.text.replace(/\[(MISSION_ASSIGNED|PEACE_POINTS_TOTAL|MISSION_REVIEWED):.*?\]/g, '') }}></p>
                    </div>
                </div>
            ))}
            <div ref={endOfMessagesRef} />
        </div>
    );
};

const CompletionNotification = ({ mission, onClose, onViewProfile }) => (
    <div className="fixed bottom-4 right-4 bg-gray-900 border-2 border-green-500/50 rounded-lg p-6 w-full max-w-sm z-50 shadow-2xl shadow-green-900/50 animate-fade-in">
        <h3 className="text-xl font-bold text-green-400">Mission Complete!</h3>
        <p className="text-gray-300 my-2">Your submission for "<span className="font-bold text-white">{mission.description}</span>" has been approved.</p>
        <p className="text-gray-400 text-sm">Your file has been moved to your Completed Missions archive.</p>
        <div className="flex gap-4 mt-4">
            <button 
                onClick={onViewProfile}
                className="flex-1 py-2 bg-green-700 hover:bg-green-600 text-white font-bold tracking-wider rounded-md transition-colors"
            >
                View My Profile
            </button>
            <button 
                onClick={onClose}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold tracking-wider rounded-md transition-colors"
            >
                Close
            </button>
        </div>
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
            }
        `}</style>
    </div>
);

function App() {
    const [status, setStatus] = useState(ConnectionStatus.DISCONNECTED);
    const [transcript, setTranscript] = useState([]);
    const [agentProfile, setAgentProfile] = useState(null);
    const [hasCheckedDb, setHasCheckedDb] = useState(false);
    const [hasExistingProfile, setHasExistingProfile] = useState(false);
    const [authState, setAuthState] = useState('initial');
    const [appState, setAppState] = useState('auth');
    const [agentToReset, setAgentToReset] = useState(null);
    const [currentView, setCurrentView] = useState('chat');
    const [previousView, setPreviousView] = useState('chat');
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [loginError, setLoginError] = useState('');
    const [loginMessage, setLoginMessage] = useState('');
    const [allAgents, setAllAgents] = useState([]);
    const [completionNotification, setCompletionNotification] = useState(null);
    
    const isReturningAgentRef = useRef(false);
    const sessionPromiseRef = useRef(null);
    const keepAliveIntervalRef = useRef(null);
    const streamRef = useRef(null);
    const audioContextRef = useRef(null);
    const scriptProcessorRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const outputAudioContextRef = useRef(null);
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef(new Set());
    const userInitiatedCloseRef = useRef(false);

    useEffect(() => {
        const checkDb = async () => {
            const agents = await db.getAllAgents();
            setAllAgents([...MOCK_TOP_AGENTS, ...agents]);
            setHasExistingProfile(agents.length > 0);
            setHasCheckedDb(true);
        };
        checkDb();
    }, []);
    
    const handleProfileCreate = async (name, password, phone, email) => {
        const existingAgent = await db.getAgentByName(name);
        if (existingAgent) {
            return { success: false, error: 'Agent handle is already taken.' };
        }

        const newProfile = {
            id: `RSR-${Date.now()}`,
            name, peacePoints: 0, password, missions: [], phone, email,
        };
        
        try {
            await db.addAgent(newProfile);
            const updatedAgents = await db.getAllAgents();
            setAllAgents([...MOCK_TOP_AGENTS, ...updatedAgents]);
            setHasExistingProfile(true);

            const successfullyAddedAgent = await db.getAgentByName(name);
            if (successfullyAddedAgent) {
                setAgentProfile(successfullyAddedAgent);
                setAppState('main');
                setCurrentView('chat');
                isReturningAgentRef.current = false;
                return { success: true };
            } else {
                 return { success: false, error: "Critical error: Profile was not saved correctly. Please try again." };
            }
        } catch (error) {
            console.error(error);
            return { success: false, error: "Database error. Could not save profile." };
        }
    };


    const handleLogin = async (name, password) => {
        setLoginMessage('');
        const agent = await db.getAgentByName(name);
        
        if (agent && agent.password === password) {
            setTranscript([]); setAgentProfile(agent); setAppState('main');
            setCurrentView('chat'); isReturningAgentRef.current = true; setLoginError('');
            return;
        }

        const mockAgent = MOCK_TOP_AGENTS.find(a => a.name.toLowerCase() === name.toLowerCase() && a.password === password);
        if (mockAgent) {
            setTranscript([]); setAgentProfile(mockAgent); setAppState('main');
            setCurrentView('chat'); isReturningAgentRef.current = true; setLoginError('');
            return;
        }
        setLoginError('Invalid credentials or no profile found.');
    };
    
    const handleForgotPassword = async (handle) => {
        const agent = await db.getAgentByName(handle);
        if (agent) {
            if (agent.phone || agent.email) {
                setAgentToReset(agent.name);
                setTimeout(() => setAuthState('reset_password'), 100);
                return `Recovery signal acknowledged for Agent ${agent.name}. Check your secure comms for a reset link.`;
            } else {
                return 'CRITICAL ERROR: No recovery contact on file. Passcode is unrecoverable.';
            }
        }
        return 'Agent handle not found in database.';
    };

    const handlePasswordReset = async (agentHandle, newPass) => {
        const agent = await db.getAgentByName(agentHandle);
        if(agent){
            const updatedAgent = {...agent, password: newPass};
            try {
                await db.updateAgent(updatedAgent);
                const agents = await db.getAllAgents();
                setAllAgents([...MOCK_TOP_AGENTS, ...agents]);
                setAuthState('login'); setAgentToReset(null); setLoginError('');
                setLoginMessage('Passcode successfully reset. Please log in.');
                return true;
            } catch (error) { console.error("Failed to reset password:", error); }
        }
        return false;
    }

    const updateCurrentAgentProfile = async (updatedProfile) => {
         try {
            await db.updateAgent(updatedProfile);
            setAgentProfile(updatedProfile);
            const agents = await db.getAllAgents();
            setAllAgents([...MOCK_TOP_AGENTS, ...agents]);
        } catch (error) {
            console.error("Failed to update agent profile:", error);
            alert("Database Error: Could not save profile changes.");
        }
    }

    const handleMissionSubmit = async (missionId, submissionText) => {
        if (!agentProfile) return;
        const missionToComplete = agentProfile.missions.find(m => m.id === missionId);
        if (!missionToComplete) return;

        const completedMission = { ...missionToComplete, status: MissionStatus.COMPLETED, submissionText, reviewComment: "Auto-verified. Data processed. Good work." };
        const updatedMissions = agentProfile.missions.map(m => m.id === missionId ? completedMission : m);
        const updatedProfile = { ...agentProfile, missions: updatedMissions, peacePoints: agentProfile.peacePoints + completedMission.points };
        
        await updateCurrentAgentProfile(updatedProfile);
        
        setTimeout(() => {
            if (outputAudioContextRef.current) {
                playSirenSound(outputAudioContextRef.current);
                setCompletionNotification(completedMission);
            }
        }, 500);
    };

    const handleToggleConnection = useCallback(async () => {
        if (status === ConnectionStatus.CONNECTED || status === ConnectionStatus.CONNECTING) {
            userInitiatedCloseRef.current = true;
            if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => session?.close());
                sessionPromiseRef.current = null;
            }
            if (keepAliveIntervalRef.current) {
                clearInterval(keepAliveIntervalRef.current);
                keepAliveIntervalRef.current = null;
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            if (scriptProcessorRef.current) {
                scriptProcessorRef.current.disconnect();
                scriptProcessorRef.current = null;
            }
            if (sourceNodeRef.current) {
                sourceNodeRef.current.disconnect();
                sourceNodeRef.current = null;
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }

            setStatus(ConnectionStatus.DISCONNECTED);
            if (outputAudioContextRef.current) playDisconnectedSound(outputAudioContextRef.current);
        } else if (agentProfile) {
            userInitiatedCloseRef.current = false;
            setStatus(ConnectionStatus.CONNECTING);
            if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
                outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            }
            if(outputAudioContextRef.current) playConnectingSound(outputAudioContextRef.current);

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
                streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                const systemInstruction = getSystemInstruction(agentProfile, isReturningAgentRef.current);
                
                sessionPromiseRef.current = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                    callbacks: {
                        onopen: () => {
                            if (!audioContextRef.current || !streamRef.current) return;
                            setStatus(ConnectionStatus.CONNECTED);
                             if (outputAudioContextRef.current) playConnectedSound(outputAudioContextRef.current);
                            
                            sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
                            scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                            
                            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                const pcmBlob = createPcmBlob(inputData);
                                sessionPromiseRef.current?.then((session) => {
                                    session?.sendRealtimeInput({ media: pcmBlob });
                                });
                            };
                            sourceNodeRef.current.connect(scriptProcessorRef.current);
                            scriptProcessorRef.current.connect(audioContextRef.current.destination);
                        },
                        onmessage: async (message) => {
                            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                            if (base64EncodedAudioString && outputAudioContextRef.current) {
                                nextStartTimeRef.current = Math.max(
                                    nextStartTimeRef.current,
                                    outputAudioContextRef.current.currentTime,
                                );
                                const audioBuffer = await decodeAudioData(
                                    decode(base64EncodedAudioString),
                                    outputAudioContextRef.current,
                                    24000,
                                    1,
                                );
                                const source = outputAudioContextRef.current.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputAudioContextRef.current.destination);
                                source.addEventListener('ended', () => {
                                    audioSourcesRef.current.delete(source);
                                });
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
                                audioSourcesRef.current.add(source);
                            }

                            const interrupted = message.serverContent?.interrupted;
                            if (interrupted) {
                                for (const source of audioSourcesRef.current.values()) {
                                    source.stop();
                                    audioSourcesRef.current.delete(source);
                                }
                                nextStartTimeRef.current = 0;
                            }
                            
                            const textPart = message.serverContent?.modelTurn?.parts.find(p => 'text' in p);
                            if(textPart && 'text' in textPart && agentProfile){
                                const text = textPart.text;
                                setTranscript(prev => [...prev, { sender: Sender.BOT, text: text, timestamp: new Date().toLocaleTimeString() }]);

                                const missionRegex = /\[MISSION_ASSIGNED:\s*({.*?})\]/s;
                                const match = text.match(missionRegex);
                                if (match && match[1]) {
                                    try {
                                        const missionData = JSON.parse(match[1]);
                                        const newMission = {
                                            id: `M01-${Date.now()}`,
                                            description: missionData.description,
                                            points: missionData.points,
                                            status: MissionStatus.ASSIGNED,
                                        };
                                        const updatedProfile = { ...agentProfile, missions: [...agentProfile.missions, newMission] };
                                        await updateCurrentAgentProfile(updatedProfile);
                                    } catch (e) { 
                                        console.error("Failed to parse mission JSON:", e, match[1]); 
                                    }
                                }
                            }
                        },
                        onerror: (e) => {
                            console.error('Live session error:', e);
                            setStatus(ConnectionStatus.ERROR);
                            if (outputAudioContextRef.current) playDisconnectedSound(outputAudioContextRef.current);
                        },
                        onclose: () => {
                            if (!userInitiatedCloseRef.current) {
                                setStatus(ConnectionStatus.ERROR);
                                if (outputAudioContextRef.current) playDisconnectedSound(outputAudioContextRef.current);
                            } else {
                                setStatus(ConnectionStatus.DISCONNECTED);
                            }
                        },
                    },
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: {
                            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                        },
                        systemInstruction,
                    },
                });

            } catch (error) {
                console.error("Failed to start connection:", error);
                setStatus(ConnectionStatus.ERROR);
                 if (outputAudioContextRef.current) playDisconnectedSound(outputAudioContextRef.current);
            }
        }
    }, [status, agentProfile]);
    
    const handleLogout = () => {
        setAgentProfile(null); setAppState('auth'); setAuthState('initial'); setCurrentView('chat');
        setTranscript([]); setLoginError(''); setLoginMessage('');
    };

    const navigate = (view) => { 
        setPreviousView(currentView);
        setCurrentView(view);
    };
    
    const handleSelectAgent = (agent) => { setPreviousView('leaderboard'); setSelectedAgent(agent); setCurrentView('profile'); };
    const handleViewMyProfile = () => { if(agentProfile){ setPreviousView(currentView); setSelectedAgent(agentProfile); setCurrentView('profile'); }};
    const handleBackFromProfile = () => { setSelectedAgent(null); setCurrentView(previousView); };
    const getStatusTextAndColor = () => {
        switch (status) {
            case ConnectionStatus.CONNECTED: return { text: 'LIVE // SECURE LINE', color: 'text-green-400' };
            case ConnectionStatus.CONNECTING: return { text: 'ESTABLISHING...', color: 'text-yellow-400 animate-pulse' };
            case ConnectionStatus.ERROR: return { text: 'CONNECTION SEVERED', color: 'text-red-500' };
            default: return { text: 'LINE INACTIVE', color: 'text-gray-500' };
        }
    };
    const { text, color } = getStatusTextAndColor();
    
    const renderMainContent = () => {
        switch (appState) {
            case 'main':
                switch (currentView) {
                    case 'mission_control':
                        return agentProfile && <MissionControl agent={agentProfile} onMissionSubmit={handleMissionSubmit} onUpdateAgent={updateCurrentAgentProfile} />;
                    case 'leaderboard':
                        const sortedAgents = [...allAgents].sort((a, b) => b.peacePoints - a.peacePoints);
                        return agentProfile && <Leaderboard allAgents={sortedAgents} currentAgent={agentProfile} onSelectAgent={handleSelectAgent} />;
                    case 'profile':
                        return selectedAgent && agentProfile && <AgentProfileComponent agent={selectedAgent} onBack={handleBackFromProfile} isOwnProfile={selectedAgent.id === agentProfile.id} />;
                    case 'chat':
                    default:
                        return (
                            <div className="flex-grow flex flex-col min-h-0">
                                {transcript.length === 0 ? (
                                    <ChatPlaceholder />
                                ) : (
                                    <Transcript transcript={transcript} />
                                )}
                            </div>
                        );
                }
            case 'auth':
            default:
                 if (!hasCheckedDb) return <div className="flex-grow flex items-center justify-center"><SpinnerIcon className="w-10 h-10 animate-spin text-red-500" /></div>;
                switch (authState) {
                    case 'login':
                        return <LoginScreen onLogin={handleLogin} onBack={() => { setAuthState('initial'); setLoginError(''); }} onForgotPassword={() => setAuthState('forgot_password')} error={loginError} message={loginMessage}/>;
                    case 'forgot_password':
                        return <ForgotPasswordScreen onReset={handleForgotPassword} onBack={() => setAuthState('login')} />;
                    case 'reset_password':
                        return agentToReset && <ResetPasswordScreen agentHandle={agentToReset} onReset={handlePasswordReset} onBack={() => { setAuthState('login'); setAgentToReset(null); }} />;
                    case 'onboarding':
                        return <Onboarding onProfileCreate={handleProfileCreate} onBack={() => setAuthState('initial')}/>;
                    case 'initial':
                    default:
                        return <InitialAuthScreen onLoginSelect={() => setAuthState('login')} onJoinSelect={() => setAuthState('onboarding')} hasExistingProfile={hasExistingProfile} />;
                }
        }
    };
    
    return (
        <div className="w-full h-screen bg-black flex flex-col p-4 md:p-6 lg:p-8 font-mono overflow-hidden">
            <header className="flex justify-between items-center pb-4 border-b border-red-500/30 flex-wrap gap-x-4 gap-y-2">
                 <div className="flex items-center space-x-3">
                    <SpiderIcon className="w-8 h-8 text-red-500 animate-pulse"/>
                    <h1 className="text-lg md:text-xl font-bold text-red-400">R.S.R. Network</h1>
                </div>
                {agentProfile && appState !== 'auth' && (
                     <nav className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center order-3 sm:order-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <button onClick={() => navigate('chat')} className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${currentView === 'chat' ? 'bg-red-500/30 text-red-300' : 'text-gray-400 hover:bg-red-500/20'}`}><SecureChannelIcon className="w-4 h-4" /> Secure Line</button>
                        <button onClick={() => navigate('mission_control')} className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${currentView === 'mission_control' ? 'bg-red-500/30 text-red-300' : 'text-gray-400 hover:bg-red-500/20'}`}><MissionIcon className="w-4 h-4" /> Mission Control</button>
                        <button onClick={handleViewMyProfile} className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${currentView === 'profile' && selectedAgent?.id === agentProfile.id ? 'bg-red-500/30 text-red-300' : 'text-gray-400 hover:bg-red-500/20'}`}><MissionIcon className="w-4 h-4" /> My Profile</button>
                        <button onClick={() => navigate('leaderboard')} className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${currentView === 'leaderboard' ? 'bg-red-500/30 text-red-300' : 'text-gray-400 hover:bg-red-500/20'}`}><LeaderboardIcon className="w-4 h-4" /> Leaderboard</button>
                        <button onClick={handleLogout} className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors text-gray-400 hover:bg-red-500/20`}><LogoutIcon className="w-4 h-4" /> Logout</button>
                    </nav>
                )}
                <div className="flex-grow sm:flex-grow-0 order-2 sm:order-3">
                    <div className={`flex items-center justify-end space-x-2 px-3 py-1 border border-current rounded-full text-sm ${color}`}>
                        <span className="relative flex h-3 w-3">
                            {status === ConnectionStatus.CONNECTED && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${status === ConnectionStatus.CONNECTED ? 'bg-green-500' : 'bg-gray-600'}`}></span>
                        </span>
                        <span>{text}</span>
                    </div>
                     {agentProfile && (
                        <div className="text-xs text-amber-300 text-right mt-1">
                            {agentProfile.name} // ID: {agentProfile.id} // {agentProfile.peacePoints}pts
                        </div>
                    )}
                </div>
            </header>
            <main className="flex-grow my-4 flex min-h-0 gap-4">
                 {renderMainContent()}
            </main>
            {appState === 'main' && currentView === 'chat' && (
                <footer className="pt-4 border-t border-red-500/30 flex justify-center">
                    <button onClick={handleToggleConnection} disabled={!agentProfile} className={`px-8 py-4 rounded-full flex items-center justify-center space-x-3 text-lg font-bold transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-4 ${status === ConnectionStatus.CONNECTED || status === ConnectionStatus.CONNECTING ? 'bg-red-700 hover:bg-red-600 text-white shadow-lg shadow-red-900/50 focus:ring-red-500' : 'bg-green-700 hover:bg-green-600 text-white shadow-lg shadow-green-900/50 focus:ring-green-500'} disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none`}>
                        <PhoneIcon className="w-6 h-6"/>
                        <span>{status === ConnectionStatus.CONNECTED ? 'END TRANSMISSION' : status === ConnectionStatus.CONNECTING ? 'CONNECTING...' : 'OPEN SECURE LINE'}</span>
                    </button>
                </footer>
            )}
             {completionNotification && agentProfile && (
                <CompletionNotification mission={completionNotification} onClose={() => setCompletionNotification(null)} onViewProfile={() => { handleViewMyProfile(); setCompletionNotification(null); }} />
            )}
        </div>
    );
}

// -----------------------------------------------------------------------------
// ROOT
// -----------------------------------------------------------------------------

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
