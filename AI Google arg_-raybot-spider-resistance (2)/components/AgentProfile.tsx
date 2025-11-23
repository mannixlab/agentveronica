

import React, { useState } from 'react';
import { AgentProfile as AgentProfileType, Mission, MissionStatus } from '../types';
import { LeaderboardIcon } from './icons';

const MissionEntry: React.FC<{ mission: Mission }> = ({ mission }) => {

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

interface AgentProfileProps {
  agent: AgentProfileType;
  onBack: () => void;
  isOwnProfile: boolean;
}

export const AgentProfile: React.FC<AgentProfileProps> = ({ agent, onBack, isOwnProfile }) => {
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