import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Send, 
  MessageSquare, 
  Bot, 
  User, 
  Loader2, 
  AlertCircle,
  Brain,
  Network,
  Lightbulb,
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  TreePine,
  BookOpen,
  BarChart3
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

interface Hypothesis {
  hypothesis: string;
  confidence: number;
  reasoning: string;
  sources?: string[];
}

interface ReasoningNode {
  id: string;
  name: string;
  type: string;
  confidence: number;
  salience: number;
  content?: string;
  relationships?: string[];
}

interface DocumentSource {
  id: string;
  filename: string;
  confidence: number;
  salience: number;
  excerpt?: string;
  page?: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hypotheses?: Hypothesis[];
  reasoning_nodes?: ReasoningNode[];
  sources?: DocumentSource[];
  avg_confidence?: number;
  avg_salience?: number;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  message_count: number;
}

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isBackendAuth } = useAuth();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat sessions on component mount
  useEffect(() => {
    if (isBackendAuth) {
      loadChatSessions();
    }
  }, [isBackendAuth]);

  const loadChatSessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await apiClient.getChatSessions();
      setSessions(response || []);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive"
      });
    } finally {
      setLoadingSessions(false);
    }
  };

  const createNewSession = () => {
    setCurrentSession(null);
    setMessages([]);
    setInputMessage('');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuestion = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      let sessionId = currentSession;
      
      // Create new session if needed
      if (!sessionId) {
        const newSession = await apiClient.createNewChat();
        sessionId = newSession.id;
        setCurrentSession(sessionId);
      }

      // Use the /chat/session/{session_id}/ask endpoint for revolutionary SAS probability distributions
      const data = await apiClient.askChatQuestion(sessionId, currentQuestion);

      // Extract hypotheses and build content showing probability distributions
      let content = data.response || '';
      const hypotheses = data.hypotheses || [];
      
      if (hypotheses.length > 0) {
        content = `Based on the analysis, here are the potential hypotheses:\n\n`;
        hypotheses.forEach((hyp: Hypothesis, index: number) => {
          const confidencePercent = (hyp.confidence * 100).toFixed(1);
          content += `**Hypothesis ${index + 1}** (${confidencePercent}% confidence):\n${hyp.hypothesis}\n\n*Reasoning:* ${hyp.reasoning}\n\n`;
        });
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: content,
        timestamp: new Date(),
        hypotheses: hypotheses,
        reasoning_nodes: data.reasoning_nodes || [],
        sources: data.sources || [],
        avg_confidence: data.avg_confidence,
        avg_salience: data.avg_salience
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Refresh sessions list if this was a new session
      if (!currentSession) {
        await loadChatSessions();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please check your connection and try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Message Failed",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isBackendAuth) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Backend Connection Issue</h2>
          <p className="text-gray-400 mb-6">
            The backend at http://3.144.130.186:3000 appears to be unavailable. 
            This could be due to network issues or the server being offline.
          </p>
          <div className="space-y-4">
            <Button 
              onClick={() => window.location.reload()} 
              className="neural-glass-premium mr-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
            <div className="text-sm text-gray-500">
              Backend Status: {navigator.onLine ? 'Online' : 'Offline'} • 
              Server: http://3.144.130.186:3000/api/v1
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] space-x-6 animate-fade-in">
      {/* Sessions Sidebar */}
      <div className="w-80 space-y-4">
        <Card className="neural-glass">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-purple-400" />
                Chat Sessions
              </CardTitle>
              <Button
                size="sm"
                onClick={createNewSession}
                className="neural-glass-hover"
              >
                New Chat
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingSessions ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-sm">
                No chat sessions yet
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setCurrentSession(session.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    currentSession === session.id
                      ? 'bg-purple-500/20 border border-purple-500/30'
                      : 'neural-glass-hover'
                  }`}
                >
                  <h3 className="text-sm font-medium text-white truncate">
                    {session.title || 'Untitled Chat'}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">
                      {session.message_count} messages
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(session.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Chat Features Info */}
        <Card className="neural-glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">GraphRAG Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2 text-xs">
              <Brain className="h-4 w-4 text-purple-400" />
              <span className="text-gray-300">Contradiction Detection</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <Network className="h-4 w-4 text-blue-400" />
              <span className="text-gray-300">Knowledge Graph Reasoning</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <FileText className="h-4 w-4 text-green-400" />
              <span className="text-gray-300">Document Integration</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <Lightbulb className="h-4 w-4 text-yellow-400" />
              <span className="text-gray-300">Epistemic Evolution</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <Card className="neural-glass-premium flex-1 flex flex-col">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center">
                <Bot className="mr-2 h-5 w-5 text-emerald-400" />
                MemDuo GraphRAG Chat
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Graph Mode
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="neural-glass-hover"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 flex flex-col p-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Welcome to MemDuo</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    I'm your cognitive growth partner. Ask me anything about your documents, 
                    and I'll use graph reasoning to provide thoughtful, contradiction-aware responses.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`flex items-start space-x-3 ${
                          message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                      >
                        <div className="p-2 neural-glass rounded-full">
                          {message.role === 'user' ? (
                            <User className="h-4 w-4 text-blue-400" />
                          ) : (
                            <Bot className="h-4 w-4 text-emerald-400" />
                          )}
                        </div>
                        
                         <div
                           className={`p-4 rounded-2xl ${
                             message.role === 'user'
                               ? 'bg-blue-500/20 border border-blue-500/30'
                               : 'neural-glass'
                           }`}
                         >
                            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                            
                            {/* Probability Distributions for SAS Hypotheses */}
                            {message.role === 'assistant' && message.hypotheses && message.hypotheses.length > 0 && (
                              <div className="mt-4 space-y-3">
                                <Collapsible defaultOpen>
                                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 hover:from-orange-500/15 hover:to-red-500/15 transition-all">
                                    <div className="flex items-center space-x-2">
                                      <BarChart3 className="h-4 w-4 text-orange-400" />
                                      <span className="text-sm font-medium text-white">
                                        SAS Probability Distributions ({message.hypotheses.length} hypotheses)
                                      </span>
                                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                                        Revolutionary
                                      </Badge>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-orange-400" />
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="mt-2">
                                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                                      <div className="space-y-3">
                                        {message.hypotheses.map((hypothesis, index) => (
                                          <div key={index} className="bg-slate-800/50 rounded-md p-4 border border-slate-600/30">
                                            <div className="flex items-center justify-between mb-3">
                                              <div className="flex items-center space-x-2">
                                                <Lightbulb className="h-4 w-4 text-yellow-400" />
                                                <span className="text-sm font-medium text-white">
                                                  Hypothesis {index + 1}
                                                </span>
                                              </div>
                                              <Badge className="bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/30 text-sm font-bold">
                                                {(hypothesis.confidence * 100).toFixed(1)}% confidence
                                              </Badge>
                                            </div>
                                            
                                            {/* Visual probability bar */}
                                            <div className="mb-3">
                                              <div className="w-full bg-slate-700/50 rounded-full h-2">
                                                <div 
                                                  className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                                  style={{ width: `${hypothesis.confidence * 100}%` }}
                                                />
                                              </div>
                                              <div className="flex justify-between text-xs text-gray-400 mt-1">
                                                <span>0%</span>
                                                <span className="text-orange-400 font-medium">
                                                  {(hypothesis.confidence * 100).toFixed(1)}%
                                                </span>
                                                <span>100%</span>
                                              </div>
                                            </div>
                                            
                                            <p className="text-white text-sm mb-2 leading-relaxed">
                                              {hypothesis.hypothesis}
                                            </p>
                                            <p className="text-gray-400 text-xs italic">
                                              <strong>Reasoning:</strong> {hypothesis.reasoning}
                                            </p>
                                            
                                            {hypothesis.sources && hypothesis.sources.length > 0 && (
                                              <div className="mt-2 flex flex-wrap gap-1">
                                                <span className="text-xs text-gray-500">Sources:</span>
                                                {hypothesis.sources.slice(0, 3).map((source, sourceIndex) => (
                                                  <Badge key={sourceIndex} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                                    {source}
                                                  </Badge>
                                                ))}
                                                {hypothesis.sources.length > 3 && (
                                                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                                                    +{hypothesis.sources.length - 3} more
                                                  </Badge>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            )}
                            
                            {/* Sources Auditing */}
                           {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                             <div className="mt-4 space-y-3">
                               <Collapsible>
                                 <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-all">
                                   <div className="flex items-center space-x-2">
                                     <BookOpen className="h-4 w-4 text-emerald-400" />
                                     <span className="text-sm font-medium text-white">
                                       Document Sources ({message.sources.length})
                                     </span>
                                     <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                                       {message.sources.length}
                                     </Badge>
                                   </div>
                                   <ChevronDown className="h-4 w-4 text-emerald-400" />
                                 </CollapsibleTrigger>
                                 <CollapsibleContent className="mt-2">
                                   <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                                     {/* Average Scores */}
                                     <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-600/50">
                                       <div className="flex items-center space-x-4">
                                         <div className="flex items-center space-x-2">
                                           <BarChart3 className="h-3 w-3 text-blue-400" />
                                           <span className="text-xs text-gray-300">Avg Confidence:</span>
                                           <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                             {((message.sources.reduce((sum, s) => sum + s.confidence, 0) / message.sources.length) * 100).toFixed(1)}%
                                           </Badge>
                                         </div>
                                         <div className="flex items-center space-x-2">
                                           <TreePine className="h-3 w-3 text-purple-400" />
                                           <span className="text-xs text-gray-300">Avg Salience:</span>
                                           <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                                             {((message.sources.reduce((sum, s) => sum + s.salience, 0) / message.sources.length) * 100).toFixed(1)}%
                                           </Badge>
                                         </div>
                                       </div>
                                     </div>
                                     
                                     {/* Individual Sources */}
                                     <div className="space-y-2">
                                       {message.sources.map((source, index) => (
                                         <div key={index} className="bg-slate-800/50 rounded-md p-3 border border-slate-600/30">
                                           <div className="flex items-center justify-between mb-2">
                                             <div className="flex items-center space-x-2">
                                               <FileText className="h-3 w-3 text-gray-400" />
                                               <span className="text-xs font-medium text-white truncate max-w-48">
                                                 {source.filename}
                                               </span>
                                               {source.page && (
                                                 <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                                                   p.{source.page}
                                                 </Badge>
                                               )}
                                             </div>
                                             <div className="flex items-center space-x-2">
                                               <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                                 {(source.confidence * 100).toFixed(1)}%
                                               </Badge>
                                               <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                                                 {(source.salience * 100).toFixed(1)}%
                                               </Badge>
                                             </div>
                                           </div>
                                           {source.excerpt && (
                                             <p className="text-xs text-gray-400 italic">
                                               "{source.excerpt.substring(0, 120)}..."
                                             </p>
                                           )}
                                         </div>
                                       ))}
                                     </div>
                                   </div>
                                 </CollapsibleContent>
                               </Collapsible>
                             </div>
                           )}
                           
                           {/* Reasoning Nodes Auditing */}
                           {message.role === 'assistant' && message.reasoning_nodes && message.reasoning_nodes.length > 0 && (
                             <div className="mt-3">
                               <Collapsible>
                                 <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/15 transition-all">
                                   <div className="flex items-center space-x-2">
                                     <Brain className="h-4 w-4 text-violet-400" />
                                     <span className="text-sm font-medium text-white">
                                       Reasoning Nodes Used ({message.reasoning_nodes.length})
                                     </span>
                                     <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
                                       {message.reasoning_nodes.length}
                                     </Badge>
                                   </div>
                                   <ChevronDown className="h-4 w-4 text-violet-400" />
                                 </CollapsibleTrigger>
                                 <CollapsibleContent className="mt-2">
                                   <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                                     {/* Average Scores */}
                                     <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-600/50">
                                       <div className="flex items-center space-x-4">
                                         <div className="flex items-center space-x-2">
                                           <BarChart3 className="h-3 w-3 text-blue-400" />
                                           <span className="text-xs text-gray-300">Avg Confidence:</span>
                                           <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                             {((message.reasoning_nodes.reduce((sum, n) => sum + n.confidence, 0) / message.reasoning_nodes.length) * 100).toFixed(1)}%
                                           </Badge>
                                         </div>
                                         <div className="flex items-center space-x-2">
                                           <TreePine className="h-3 w-3 text-purple-400" />
                                           <span className="text-xs text-gray-300">Avg Salience:</span>
                                           <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                                             {((message.reasoning_nodes.reduce((sum, n) => sum + n.salience, 0) / message.reasoning_nodes.length) * 100).toFixed(1)}%
                                           </Badge>
                                         </div>
                                       </div>
                                     </div>
                                     
                                     {/* Individual Nodes */}
                                     <div className="space-y-2">
                                       {message.reasoning_nodes.map((node, index) => (
                                         <div key={index} className="bg-slate-800/50 rounded-md p-3 border border-slate-600/30">
                                           <div className="flex items-center justify-between mb-2">
                                             <div className="flex items-center space-x-2">
                                               <Network className="h-3 w-3 text-gray-400" />
                                               <span className="text-xs font-medium text-white truncate max-w-48">
                                                 {node.name}
                                               </span>
                                               <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                                                 {node.type}
                                               </Badge>
                                             </div>
                                             <div className="flex items-center space-x-2">
                                               <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                                 {(node.confidence * 100).toFixed(1)}%
                                               </Badge>
                                               <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                                                 {(node.salience * 100).toFixed(1)}%
                                               </Badge>
                                             </div>
                                           </div>
                                           {node.content && (
                                             <p className="text-xs text-gray-400">
                                               {node.content.substring(0, 100)}...
                                             </p>
                                           )}
                                           {node.relationships && node.relationships.length > 0 && (
                                             <div className="mt-2 flex flex-wrap gap-1">
                                               {node.relationships.slice(0, 3).map((rel, relIndex) => (
                                                 <Badge key={relIndex} className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                                                   {rel}
                                                 </Badge>
                                               ))}
                                               {node.relationships.length > 3 && (
                                                 <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                                                   +{node.relationships.length - 3}
                                                 </Badge>
                                               )}
                                             </div>
                                           )}
                                         </div>
                                       ))}
                                     </div>
                                   </div>
                                 </CollapsibleContent>
                               </Collapsible>
                             </div>
                           )}
                           
                           <div className="flex items-center justify-between mt-3">
                             <span className="text-xs text-gray-500">
                               {formatTime(message.timestamp)}
                             </span>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 neural-glass rounded-full">
                      <Bot className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="neural-glass p-4 rounded-2xl">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                        <span className="text-sm text-gray-400">Processing with GraphRAG...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 p-4">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your documents..."
                    disabled={isLoading}
                    className="neural-glass"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="neural-glass-premium"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;