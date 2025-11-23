
import React, { useState } from 'react';
import { SpiderIcon, SpinnerIcon } from './icons';

interface OnboardingProps {
  onProfileCreate: (name: string, password: string, phone?: string, email?: string) => Promise<{ success: boolean, error?: string }>;
  onBack: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onProfileCreate, onBack }) => {
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
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


  const getHintColor = (isValid: boolean, isInvalid: boolean) => {
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