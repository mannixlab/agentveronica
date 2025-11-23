

import React, { useState, useMemo } from 'react';
import { RecognizedSong, MissionCategory, MissionSubcategory, ClueMission } from '../types';
import { MissionIcon, SpinnerIcon } from './icons';

interface ClueInterrogationMatrixProps {
    song: RecognizedSong;
    timestamp: number;
    onAcceptMission: (clue: ClueMission, category: MissionCategory, subcategory: MissionSubcategory) => void;
    onCancel: () => void;
}

export const ClueInterrogationMatrix: React.FC<ClueInterrogationMatrixProps> = ({ song, timestamp, onAcceptMission, onCancel }) => {
    const [selectedTime, setSelectedTime] = useState<number>(Math.floor(timestamp / 60));
    const [selectedCategory, setSelectedCategory] = useState<MissionCategory | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<MissionSubcategory | null>(null);

    const timeSegments = useMemo(() => {
        const numSegments = Math.floor(song.duration / 60) + 1;
        const segments = [];
        for (let i = 0; i < numSegments && i < 5; i++) {
            const end = i === 4 ? '+' : `:${(59).toString().padStart(2, '0')}`;
            segments.push({ index: i, label: `${i}:00-${i}${end}` });
        }
        return segments;
    }, [song.duration]);

    const revealedClue: ClueMission | null = useMemo(() => {
        if (selectedCategory && selectedSubcategory && selectedTime !== null) {
            return song.clueMatrix[selectedCategory]?.[selectedSubcategory]?.[selectedTime] || null;
        }
        return null;
    }, [selectedTime, selectedCategory, selectedSubcategory, song.clueMatrix]);

    const handleAccept = () => {
        if (revealedClue && selectedCategory && selectedSubcategory) {
            onAcceptMission(revealedClue, selectedCategory, selectedSubcategory);
        }
    };

    const renderStep = () => {
        if (!selectedCategory) {
            return (
                <div>
                    <h3 className="text-lg font-bold text-amber-300 mb-4">STEP 2: Select Mission Category</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.values(MissionCategory).map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)} className="p-4 bg-gray-800/60 hover:bg-red-800/50 border border-gray-700 rounded-lg text-red-300 font-bold transition-colors">
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }
        if (!selectedSubcategory) {
            return (
                <div>
                    <h3 className="text-lg font-bold text-amber-300 mb-4">STEP 3: Select Mission Subcategory</h3>
                     <div className="grid grid-cols-1 gap-3">
                        {Object.values(MissionSubcategory).map(sub => (
                            <button key={sub} onClick={() => setSelectedSubcategory(sub)} className="p-3 bg-gray-800/60 hover:bg-red-800/50 border border-gray-700 rounded-lg text-red-300 transition-colors">
                                {sub}
                            </button>
                        ))}
                    </div>
                     <button onClick={() => setSelectedCategory(null)} className="text-xs text-gray-500 mt-4 hover:text-white">Back to Categories</button>
                </div>
            );
        }

        return (
            <div>
                 <h3 className="text-lg font-bold text-green-400 mb-4">STEP 4: Mission Directive Received</h3>
                 {revealedClue ? (
                    <div className="p-4 bg-gray-900/80 border border-green-500/50 rounded-lg text-center">
                        <p className="text-gray-300 mb-2">"{revealedClue.description}"</p>
                        <p className="font-bold text-green-400 text-2xl">{revealedClue.points} PP</p>
                    </div>
                 ) : (
                    <div className="p-4 bg-gray-900/80 border border-red-500/50 rounded-lg text-center">
                        <p className="text-red-400">Signal corrupted. No mission data found for this selection.</p>
                    </div>
                 )}
                <div className="flex gap-2 mt-4">
                    <button onClick={() => setSelectedSubcategory(null)} className="flex-1 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md">Back</button>
                    <button onClick={handleAccept} disabled={!revealedClue} className="flex-1 py-2 text-sm bg-green-700 hover:bg-green-600 rounded-md disabled:bg-gray-600">Accept Mission</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-grow flex flex-col items-center justify-center">
            <div className="w-full max-w-lg p-6 bg-black/50 rounded-lg border-2 border-red-500/30">
                <div className="text-center mb-6">
                    <MissionIcon className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <h2 className="text-2xl font-bold text-red-400">CLUE INTERROGATION</h2>
                    <p className="text-gray-400 text-sm">Signal Matched: <span className="text-white font-bold">{song.title}</span></p>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-bold text-amber-300 mb-4">STEP 1: Select Time Segment</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {timeSegments.map(segment => (
                            <button
                                key={segment.index}
                                onClick={() => setSelectedTime(segment.index)}
                                className={`p-2 text-xs font-bold rounded-md transition-all ${
                                    selectedTime === segment.index
                                        ? 'bg-red-600 text-white ring-2 ring-red-400'
                                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                }`}
                            >
                                {segment.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-700 my-6"></div>
                
                {renderStep()}

                <button onClick={onCancel} className="w-full mt-6 py-2 bg-gray-800 hover:bg-gray-700 text-sm rounded-md">Cancel Interrogation</button>
            </div>
        </div>
    );
};