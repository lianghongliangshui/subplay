import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { AISettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSave: (settings: AISettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AISettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof AISettings, value: string) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">AI Settings</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Provider</label>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => handleChange('provider', 'gemini')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  localSettings.provider === 'gemini' 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Google Gemini
              </button>
              <button
                onClick={() => handleChange('provider', 'deepseek')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  localSettings.provider === 'deepseek' 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                DeepSeek / OpenAI
              </button>
            </div>
          </div>

          {localSettings.provider === 'deepseek' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">API Key</label>
                <input
                  type="password"
                  value={localSettings.deepseekApiKey || ''}
                  onChange={(e) => handleChange('deepseekApiKey', e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Full API Endpoint URL</label>
                <input
                  type="text"
                  value={localSettings.deepseekBaseUrl || ''}
                  onChange={(e) => handleChange('deepseekBaseUrl', e.target.value)}
                  placeholder="https://ark.cn-beijing.volces.com/api/v1/chat/completions"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <p className="text-[10px] text-slate-500">Must include the full path (e.g. .../chat/completions)</p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Model Name</label>
                <input
                  type="text"
                  value={localSettings.deepseekModel || ''}
                  onChange={(e) => handleChange('deepseekModel', e.target.value)}
                  placeholder="deepseek-chat"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          )}
          
          {localSettings.provider === 'gemini' && (
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-300 text-sm">
              Using built-in Google Gemini API key.
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} className="px-4 py-1.5 text-sm">Cancel</Button>
          <Button onClick={handleSave} className="px-4 py-1.5 text-sm">Save Settings</Button>
        </div>
      </div>
    </div>
  );
};