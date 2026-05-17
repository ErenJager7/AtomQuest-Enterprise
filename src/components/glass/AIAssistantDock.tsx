"use client";

import { GlassCard } from "./GlassCard";
import { User, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export function AIAssistantDock({ insights, onAIResponse }: { insights?: string[]; onAIResponse?: (data: any) => void }) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Start with an initial welcome state
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      text: "Hello! I am Atom AI. I'm connected to your live performance data. How can I help you analyze your team's velocity or identify bottlenecks today?",
      suggestedAction: null
    }
  ]);

  // Push new insights into chat history when they arrive
  useEffect(() => {
    if (insights && insights.length > 0) {
      const timer = setTimeout(() => {
        setChatHistory(prev => {
          const newHistory = [...prev];
          insights.forEach(insight => {
            // Avoid duplicates
            if (!newHistory.some(m => m.text === insight)) {
              newHistory.push({ role: 'assistant', text: insight, suggestedAction: null });
            }
          });
          return newHistory;
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [insights]);

  const handleAskAI = async () => {
    if (!query.trim() || !user) return;
    
    // Add user message to UI
    const userMsg = query;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg, suggestedAction: null }]);
    setQuery("");
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, query: userMsg }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setChatHistory(prev => [...prev, { role: 'assistant', text: data.text, suggestedAction: data.suggestedAction }]);
        if (onAIResponse) {
          onAIResponse(data);
        }
      } else {
        setChatHistory(prev => [...prev, { role: 'assistant', text: "I'm having trouble analyzing the data right now. Please try again later.", suggestedAction: null }]);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', text: "Network error connecting to the intelligence engine.", suggestedAction: null }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <GlassCard className="h-full flex flex-col p-0 overflow-hidden border-primary/20 bg-primary/5" gradient>
      <div className="p-4 border-b border-white/10 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-medium text-white">Atom AI Intelligence</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar flex flex-col">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`space-y-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
               <div className={`w-6 h-6 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-white/10' : 'bg-primary/20'}`}>
                 {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-muted-foreground" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
               </div>
               <span className={`text-sm ${msg.role === 'user' ? 'text-white' : 'font-medium text-primary'}`}>
                 {msg.role === 'user' ? 'You' : 'Atom AI'}
               </span>
            </div>
            
            <div className={`border border-white/10 rounded-2xl px-4 py-2 text-sm max-w-[90%] inline-block text-left ${msg.role === 'user' ? 'bg-white/10 rounded-tr-none text-white' : 'bg-black/20 rounded-tl-none text-muted-foreground'}`}>
              <p className="leading-relaxed">{msg.text}</p>
              
              {msg.suggestedAction && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs font-semibold text-white mb-2">Recommended Action:</p>
                  <button className="text-xs bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg px-3 py-1.5 transition-colors">
                    {msg.suggestedAction}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                 <Sparkles className="w-3.5 h-3.5 text-primary" />
               </div>
               <span className="text-sm font-medium text-primary">Atom AI</span>
            </div>
            <div className="bg-black/20 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-muted-foreground inline-block">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 bg-[#0f172a]">
        <div className="relative">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
            placeholder="Ask about team velocity, delayed goals, etc..." 
            className="w-full bg-white/5 border border-white/10 rounded-full pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50"
            disabled={isTyping}
          />
          <button 
            onClick={handleAskAI}
            disabled={!query.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
