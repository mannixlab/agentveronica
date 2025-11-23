

import React, { useState } from 'react';
import { AgentProfile } from '../types';
import { SpiderIcon } from './icons';

interface InitialAuthScreenProps {
  onLoginSelect: () => void;
  onJoinSelect: () => void;
  hasExistingProfile: boolean;
  message?: string;
}

export const InitialAuthScreen: React.FC<InitialAuthScreenProps> = ({ onLoginSelect, onJoinSelect, hasExistingProfile, message }) => {
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


interface LoginScreenProps {
    onLogin: (name: string, password: string) => void;
    onBack: () => void;
    onForgotPassword: () => void;
    error?: string;
    message?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onBack, onForgotPassword, error, message }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
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

interface ForgotPasswordScreenProps {
    onReset: (handle: string) => Promise<string>;
    onBack: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onReset, onBack }) => {
    const [handle, setHandle] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
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


interface ResetPasswordScreenProps {
    agentHandle: string;
    onReset: (agentHandle: string, newPass: string) => Promise<boolean>;
    onBack: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ agentHandle, onReset, onBack }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
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