import React, { useState, useEffect, useRef } from 'react';

const SidekickChat = ({ isOpen, onClose, initialMessage }) => {
    const [messages, setMessages] = useState([
        { id: 1, type: 'ai', content: "Hi Palak! 👋 Welcome to your Shopify store! I'm Sidekick, here to help you build and grow your business. What can I help you with today?" }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (initialMessage && messages.length === 1) {
            setMessages(prev => [
                ...prev,
                { id: Date.now(), type: 'user', content: initialMessage }
            ]);
        }
    }, [initialMessage]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!isOpen) return null;

    const handleSend = () => {
        if (!inputValue.trim()) return;
        const userMsg = inputValue;
        setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: userMsg }]);
        setInputValue('');
        
        // Simulate AI thinking
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                type: 'ai', 
                content: "I'm processing your request. I can help with product descriptions, theme customizations, or sales analytics. What would you like to focus on?" 
            }]);
        }, 1500);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white font-sans overflow-hidden">
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-md transition-colors">
                    <span className="text-sm font-semibold text-[#202223]">Hello</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Chat Content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-8 max-w-4xl mx-auto w-full">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                        {msg.type === 'user' ? (
                            <div className="max-w-[80%] bg-[#f1f1f1] px-4 py-2.5 rounded-[20px] text-sm text-[#202223] shadow-sm">
                                {msg.content}
                            </div>
                        ) : (
                            <div className="max-w-[80%] space-y-4">
                                <p className="text-sm text-[#202223] leading-relaxed">
                                    {msg.content}
                                </p>
                                <div className="flex items-center gap-3">
                                    <button className="p-1 text-gray-400 hover:text-[#202223] transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-[#202223] transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.704a2 2 0 011.94 1.515l.617 2.47a2 2 0 01-1.941 2.485H14c-1.104 0-2 .896-2 2v3a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2h7c1.104 0 2 .896 2 2v1h5.83a2 2 0 011.921 1.412l.1.4A10.97 10.97 0 0114 10z" />
                                        </svg>
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-[#202223] transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14H5.296a2 2 0 01-1.94-1.515l-.617-2.47A2 2 0 014.68 7.53H10c1.104 0 2-.896 2-2V2.53a2 2 0 012-2h7a2 2 0 012 2V15a2 2 0 01-2 2h-7c-1.104 0-2-.896-2-2v-1h-5.83a2 2 0 01-1.921-1.412l-.1-.4A10.97 10.97 0 0110 14z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {isTyping && (
                    <div className="flex items-start gap-2 max-w-[80%] animate-pulse">
                        <div className="bg-gray-100 h-8 w-16 rounded-2xl flex items-center justify-center">
                            <div className="flex gap-1">
                                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Footer */}
            <div className="p-6 bg-white border-t border-gray-100 sticky bottom-0">
                <div className="max-w-4xl mx-auto relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <div className="w-5 h-5 bg-gradient-to-br from-[#7c3aed] to-[#2563eb] rounded flex items-center justify-center p-0.5 shadow-sm">
                            <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5L12 2Z" />
                            </svg>
                        </div>
                    </div>
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask anything..." 
                        className="w-full bg-[#f6f6f7] border border-gray-200 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-[#202223] outline-none focus:border-gray-300 focus:bg-white transition-all shadow-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-3">
                         <button className="text-gray-400 hover:text-[#202223] transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                        <button className="text-gray-400 hover:text-[#202223] transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SidekickChat;
