
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { AgentProfile, ConnectionStatus, Mission, MissionStatus, Sender, TranscriptEntry, RecognizedSong } from './types';
import * as db from './services/database';
import { createPcmBlob, decode, decodeAudioData, playConnectingSound, playConnectedSound, playDisconnectedSound, playSirenSound } from './services/audioUtils';
import { MissionIcon, PhoneIcon, SpiderIcon, LeaderboardIcon, SecureChannelIcon, LogoutIcon, SpinnerIcon } from './components/icons';
import { Onboarding } from './components/Onboarding';
import { Leaderboard, MOCK_TOP_AGENTS } from './components/Leaderboard';
import { InitialAuthScreen, LoginScreen, ForgotPasswordScreen, ResetPasswordScreen } from './components/Auth';
import { MissionControl } from './components/MissionControl';
import { AgentProfile as AgentProfileComponent } from './components/AgentProfile';

const getSystemInstruction = (agent: AgentProfile, isReturning: boolean): string => {
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

type AppState = 'auth' | 'main';

const ChatPlaceholder: React.FC = () => (
    <div className="flex-grow flex flex-col items-center justify-center p-8 text-center h-full border-4 border-dashed border-red-900/20 rounded-lg bg-red-900/5">
        <SpiderIcon className="w-24 h-24 text-red-900/50 mb-6 animate-pulse" />
        <h2 className="text-3xl font-bold text-red-900/50 mb-2">CHANNEL ENCRYPTED</h2>
        <p className="text-gray-600 max-w-md">
            This line is monitored by the Resistance. 
            <br/>Connect to report in and receive your next objective.
        </p>
    </div>
);

const Transcript: React.FC<{ transcript: TranscriptEntry[] }> = ({ transcript }) => {
    const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

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

const CompletionNotification: React.FC<{ mission: Mission, onClose: () => void, onViewProfile: () => void }> = ({ mission, onClose, onViewProfile }) => (
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

type AuthState = 'initial' | 'login' | 'onboarding' | 'forgot_password' | 'reset_password';
type AppView = 'chat' | 'mission_control' | 'leaderboard' | 'profile';

function App() {
    const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
    const [hasCheckedDb, setHasCheckedDb] = useState(false);
    const [hasExistingProfile, setHasExistingProfile] = useState(false);
    const [authState, setAuthState] = useState<AuthState>('initial');
    const [appState, setAppState] = useState<AppState>('auth');
    const [agentToReset, setAgentToReset] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<AppView>('chat');
    const [previousView, setPreviousView] = useState<AppView>('chat');
    const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);
    const [loginError, setLoginError] = useState('');
    const [loginMessage, setLoginMessage] = useState('');
    const [allAgents, setAllAgents] = useState<AgentProfile[]>([]);
    const [completionNotification, setCompletionNotification] = useState<Mission | null>(null);
    
    const isReturningAgentRef = useRef(false);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const keepAliveIntervalRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
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
    
    const handleProfileCreate = async (name: string, password: string, phone?: string, email?: string): Promise<{ success: boolean, error?: string }> => {
        const existingAgent = await db.getAgentByName(name);
        if (existingAgent) {
            return { success: false, error: 'Agent handle is already taken.' };
        }

        const newProfile: AgentProfile = {
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


    const handleLogin = async (name: string, password: string) => {
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
    
    const handleForgotPassword = async (handle: string): Promise<string> => {
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

    const handlePasswordReset = async (agentHandle: string, newPass: string): Promise<boolean> => {
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

    const updateCurrentAgentProfile = async (updatedProfile: AgentProfile) => {
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

    const handleMissionSubmit = async (missionId: string, submissionText: string) => {
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
                sessionPromiseRef.current.then((session: any) => session?.close());
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
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            if(outputAudioContextRef.current) playConnectingSound(outputAudioContextRef.current);

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
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
                                sessionPromiseRef.current?.then((session: any) => {
                                    session?.sendRealtimeInput({ media: pcmBlob });
                                });
                            };
                            sourceNodeRef.current.connect(scriptProcessorRef.current);
                            scriptProcessorRef.current.connect(audioContextRef.current.destination);
                        },
                        onmessage: async (message: LiveServerMessage) => {
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
                                        const newMission: Mission = {
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
                        onerror: (e: ErrorEvent) => {
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

    const navigate = (view: AppView) => { 
        setPreviousView(currentView);
        setCurrentView(view);
    };
    
    const handleSelectAgent = (agent: AgentProfile) => { setPreviousView('leaderboard'); setSelectedAgent(agent); setCurrentView('profile'); };
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
export default App;
