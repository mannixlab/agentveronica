import React from 'react';
import { AgentProfile, MissionStatus } from '../types';
import { LeaderboardIcon } from './icons';

interface LeaderboardProps {
  allAgents: AgentProfile[];
  currentAgent: AgentProfile;
  onSelectAgent: (agent: AgentProfile) => void;
}

const MOCK_PROOF_SPIDER_SVG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNlZjQ0NDQiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xMiAxMC4zYy0yLjQgMC00LjQgMS44LTQuNyA0LjEiIC8+PHBhdGggZD0iTTEyIDEwLjNjMi40IDAgNC40IDEuOCA0LjcgNC4xIiAvPjxwYXRoIGQ9Ik0xOC4zIDE2LjZhMS41IDEuNSAwIDEgMCAwLTMgMS41IDEuNSAwIDAgMCAwIDNaIiAvPjxwYXRoIGQ9Ik01LjcgMTYuNmExLjUgMS41IDAgMSAwIDAtMyAxLjUgMS41IDAgMCAwIDAgM1oiIC8+PHBhdGggZD0iTTEyIDE4LjJhMS41IDEuNSAwIDEgMCAwLTMgMS41IDEuNSAwIDAgMCAwIDNaIiAvPjxwYXRoIGQ9Ik0xNS4yIDcuMmExLjUgMS41IDAgMSAwIDAtMyAxLjUgMS41IDAgMCAwIDAgM1oiIC8+PHBhdGggZD0iTTguOCA3LjJhMS41IDEuNSAwIDEgMCAwLTMgMS41IDEuNSAwIDAgMCAwIDNaIiAvPjxwYXRoIGQ9Im0xNCAxNC41LTMuMiA0LjYiIC8+PHBhdGggZD0ibTEwIDE0LjUgMy4yIDQuLjYiIC8+PHBhdGggZD0ibTE4IDEwLTIuMyAyLjgiIC8+PHBhdGggZD0ibTYgMTAgMi4zIDIuOCIgLz48cGF0aCBkPSJtMTcgNS0yLjcgNC4xIiAvPjxwYXRoIGQ9Im03IDUgMi43IDQuMSIgLz48L3N2Zz4=';


// Mock data for a more lively leaderboard, now with missions
export const MOCK_TOP_AGENTS: AgentProfile[] = [
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

export const Leaderboard: React.FC<LeaderboardProps> = ({ allAgents, currentAgent, onSelectAgent }) => {
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