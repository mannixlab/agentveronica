

import React, { useState, useRef } from 'react';
import { AgentProfile, Mission, MissionStatus } from '../types';
import { MissionIcon, SecureChannelIcon, SpinnerIcon } from './icons';

interface MissionCardProps {
    mission: Mission;
    children?: React.ReactNode;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, children }) => {
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

interface MissionSubmissionFormProps {
    mission: Mission;
    onSubmit: (missionId: string, submissionText: string) => Promise<void>;
}

const MissionSubmissionForm: React.FC<MissionSubmissionFormProps> = ({ mission, onSubmit }) => {
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
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

interface MissionControlProps {
    agent: AgentProfile;
    onMissionSubmit: (missionId: string, submissionText: string) => Promise<void>;
    onUpdateAgent: (agent: AgentProfile) => Promise<void>; // To reflect changes like new missions
}

export const MissionControl: React.FC<MissionControlProps> = ({ agent, onMissionSubmit, onUpdateAgent }) => {
  const assignedMissions = agent.missions.filter(m => m.status === MissionStatus.ASSIGNED);

  const handleViewMyProfile = () => {
      // This is a placeholder as navigation is handled in App.tsx
      // In a more complex app, you might use a context or callback.
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