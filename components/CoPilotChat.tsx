import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getCopilotResponse } from '../services/geminiService';
import Icon from './Icon';
import { useI18n } from '../i18n';

// For browsers that don't have this typed
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const CoPilotChat: React.FC = () => {
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: t('copilot.welcome'),
      sender: 'bot',
      timestamp: Date.now(),
    },
 
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Effect for setting up Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        alert(t('copilot.errors.permission').replace('{error}', event.error));
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
    }
    return () => recognitionRef.current?.stop();
  }, [t]);


  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botResponseText = await getCopilotResponse(input);

    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: botResponseText,
      sender: 'bot',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleVoiceInput = () => {
     if (!recognitionRef.current) {
      alert(t('copilot.errors.unsupported'));
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Error starting speech recognition:", err)
        alert(t('copilot.errors.startError'))
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-[#0a2540] flex items-center justify-center text-white flex-shrink-0">
                <Icon icon="copilot" className="w-5 h-5" />
              </div>
            )}
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-[#0a2540] text-white rounded-br-none'
                  : 'bg-white shadow-sm text-black rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-2 justify-start">
             <div className="w-8 h-8 rounded-full bg-[#0a2540] flex items-center justify-center text-white flex-shrink-0">
                <Icon icon="copilot" className="w-5 h-5" />
              </div>
              <div className="bg-white shadow-sm p-3 rounded-2xl rounded-bl-none">
                  <div className="flex items-center justify-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-0"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                  </div>
              </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t('copilot.placeholder')}
          className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a2540] bg-white text-black"
          disabled={isLoading}
        />
        <button
          onClick={handleVoiceInput}
          className={`p-3 rounded-full transition-colors ${
            isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-black text-white'
          }`}
        >
          <Icon icon="microphone" className="w-6 h-6" />
        </button>
        <button onClick={handleSend} disabled={isLoading || input.trim() === ''} className="p-3 bg-black text-white rounded-full disabled:bg-gray-400">
          <Icon icon="send" className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default CoPilotChat;