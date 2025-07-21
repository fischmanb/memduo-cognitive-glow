import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  RefreshCw
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  reasoning_nodes?: any[];
  sources?: string[];
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
    setInputMessage('');
    setIsLoading(true);

    try {
      // Use GraphRAG query endpoint
      const response = await fetch('https://api.memduo.com/api/v1/rag/query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('memduo_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          use_graph_rag: true,
          include_reasoning: true
        }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date(),
        reasoning_nodes: data.reasoning_nodes || [],
        sources: data.sources || []
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If this is a new session, refresh sessions list
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
          <h2 className="text-xl font-semibold text-white mb-2">Backend Access Required</h2>
          <p className="text-gray-400">Chat requires full backend access to use GraphRAG functionality.</p>
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
                          
                          {message.reasoning_nodes && message.reasoning_nodes.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <p className="text-xs text-gray-400 mb-2">Reasoning nodes used:</p>
                              <div className="flex flex-wrap gap-1">
                                {message.reasoning_nodes.slice(0, 3).map((node, index) => (
                                  <Badge
                                    key={index}
                                    className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs"
                                  >
                                    {node.name || `Node ${index + 1}`}
                                  </Badge>
                                ))}
                                {message.reasoning_nodes.length > 3 && (
                                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                                    +{message.reasoning_nodes.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
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