import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { 
  HelpCircle,
  Book,
  MessageCircle,
  Mail,
  ExternalLink,
  Search,
  Brain,
  Upload,
  Settings,
  Shield,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Send
} from "lucide-react";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Simulate contact form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent",
        description: "We'll get back to you within 24 hours.",
      });
      
      setContactForm({ subject: '', message: '', priority: 'medium' });
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      id: 'what-is-memduo',
      category: 'General',
      question: 'What is MemDuo and how does it work?',
      answer: `MemDuo is a memory-enhanced document understanding system that uses GraphRAG (Graph-based Retrieval Augmented Generation) to create an intelligent knowledge companion. Unlike traditional AI assistants, MemDuo builds a dynamic knowledge graph from your documents and conversations, enabling it to:

• Detect contradictions between new and existing information
• Evolve its understanding through epistemic revision
• Provide reasoning that's grounded in your specific knowledge base
• Maintain temporal awareness of how your knowledge changes over time

The system combines document processing, vector similarity search, and graph-based reasoning to create a truly personalized AI experience.`
    },
    {
      id: 'graphrag-explained',
      category: 'Technology',
      question: 'What is GraphRAG and how is it different from regular RAG?',
      answer: `GraphRAG (Graph-based Retrieval Augmented Generation) extends traditional RAG by adding a knowledge graph layer:

**Traditional RAG:**
• Splits documents into chunks
• Stores chunks as vectors
• Retrieves similar chunks for context

**GraphRAG adds:**
• Entity and relationship extraction
• Knowledge graph construction
• Graph-based reasoning and traversal
• Temporal and episodic memory
• Contradiction detection across connected concepts

This allows for more nuanced understanding, better context integration, and the ability to reason about relationships between concepts rather than just similarity matches.`
    },
    {
      id: 'contradiction-detection',
      category: 'Features',
      question: 'How does contradiction detection work?',
      answer: `MemDuo's FCS (Formal Cognitive System) automatically detects when new information contradicts existing knowledge in your graph:

**Detection Process:**
1. New information is processed and compared against existing nodes
2. Semantic similarity and logical relationships are analyzed
3. Contradictions are flagged with confidence scores
4. You're notified when significant contradictions are found

**Handling Contradictions:**
• View contradictory statements side-by-side
• Choose which information to prioritize
• Merge contradictory information with nuanced understanding
• Track the evolution of your beliefs over time

You can adjust your contradiction tolerance in Settings to control how sensitive the system is to potential conflicts.`
    },
    {
      id: 'document-upload',
      category: 'Usage',
      question: 'What types of documents can I upload?',
      answer: `MemDuo supports various document formats:

**Supported Formats:**
• PDF files (including scanned documents via OCR)
• Text files (.txt)
• Markdown files (.md)
• Word documents (.docx)

**Processing Pipeline:**
1. Upload documents to the Knowledge Base
2. Automatic text extraction and OCR (for scanned PDFs)
3. Content analysis and entity extraction
4. Integration into your personal knowledge graph
5. Indexing for vector search

**Best Practices:**
• Upload documents in logical batches
• Use descriptive filenames
• Wait for processing to complete before uploading large batches
• Review the processing status in Knowledge Base`
    },
    {
      id: 'privacy-security',
      category: 'Privacy',
      question: 'How is my data protected and stored?',
      answer: `Your privacy and data security are paramount:

**Data Storage:**
• Your documents and knowledge graph are stored securely
• All data is encrypted in transit and at rest
• Your personal knowledge graph is isolated from other users
• No data is shared with third parties without explicit consent

**Data Control:**
• Export all your data at any time
• Delete your account and all associated data
• Control data retention periods
• Opt out of anonymous usage analytics

**Processing:**
• Document processing happens on secure servers
• AI processing uses your personal context only
• No training data is retained from your documents
• Full audit trail of all data operations

You can manage all privacy settings in the Settings page.`
    },
    {
      id: 'getting-started',
      category: 'Usage',
      question: 'How do I get started with MemDuo?',
      answer: `Getting started is simple:

**Step 1: Upload Documents**
• Go to Knowledge Base
• Upload your first documents (PDFs, docs, etc.)
• Wait for processing to complete

**Step 2: Start Chatting**
• Open the Chat interface
• Ask questions about your uploaded content
• Watch as MemDuo builds understanding over time

**Step 3: Customize AI Behavior**
• Visit Settings to personalize your AI
• Adjust contradiction tolerance
• Set your preferred AI name
• Configure belief sensitivity

**Step 4: Monitor Knowledge Growth**
• Check Dashboard for knowledge graph metrics
• Review processed documents in Knowledge Base
• Observe how your AI partner evolves`
    },
    {
      id: 'personalization',
      category: 'Features',
      question: 'How can I personalize my AI assistant?',
      answer: `MemDuo offers extensive personalization options:

**AI Personality:**
• Give your AI assistant a custom name
• Adjust response style and behavior
• Set preferred communication patterns

**Cognitive Settings:**
• Contradiction Tolerance: How readily it accepts conflicting info
• Belief Sensitivity: How it handles challenges to existing beliefs
• Memory Decay Speed: How quickly older information becomes less influential

**System Behavior:**
• Auto-indexing preferences
• Notification settings
• Processing automation
• Data retention policies

**Learning Adaptation:**
• The AI learns your communication style over time
• Adapts to your domain expertise and interests
• Develops understanding of your preferences and priorities

All settings can be adjusted in the Settings page and take effect immediately.`
    }
  ];

  const quickLinks = [
    {
      title: 'Knowledge Base',
      description: 'Upload and manage your documents',
      icon: Upload,
      href: '/knowledge-base',
      color: 'text-blue-400'
    },
    {
      title: 'Chat Interface',
      description: 'Start conversations with your AI',
      icon: MessageCircle,
      href: '/chat',
      color: 'text-emerald-400'
    },
    {
      title: 'Settings',
      description: 'Customize your AI behavior',
      icon: Settings,
      href: '/settings',
      color: 'text-purple-400'
    },
    {
      title: 'Dashboard',
      description: 'View your knowledge metrics',
      icon: Brain,
      href: '/dashboard',
      color: 'text-yellow-400'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <HelpCircle className="h-8 w-8 text-emerald-400" />
          <div>
            <h1 className="text-3xl font-bold bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
              Help & Support
            </h1>
            <p className="text-muted-foreground">
              Get help with MemDuo's GraphRAG features and cognitive AI system
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Card key={link.href} className="neural-glass neural-glass-hover cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 neural-glass rounded-lg">
                  <link.icon className={`h-5 w-5 ${link.color}`} />
                </div>
                <div>
                  <h3 className="font-medium text-white group-hover:text-primary transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-xs text-gray-400">{link.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Help Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <Card className="neural-glass">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 neural-glass"
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="neural-glass-premium">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Book className="mr-2 h-5 w-5 text-blue-400" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Find answers to common questions about MemDuo's GraphRAG system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
                  <p className="text-gray-400">Try different search terms or browse all categories</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-2">
                  {filteredFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="neural-glass rounded-lg">
                      <AccordionTrigger className="px-4 py-3 text-left">
                        <div className="flex items-start space-x-3">
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                            {faq.category}
                          </Badge>
                          <span className="text-white font-medium">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="neural-glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">GraphRAG API</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Document Processing</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Knowledge Graph</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Vector Search</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Operational
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="space-y-6">
          <Card className="neural-glass-premium">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Mail className="mr-2 h-5 w-5 text-yellow-400" />
                Contact Support
              </CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Subject</label>
                  <Input
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    placeholder="Brief description of your issue"
                    required
                    className="neural-glass"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Priority</label>
                  <select
                    value={contactForm.priority}
                    onChange={(e) => setContactForm({...contactForm, priority: e.target.value})}
                    className="w-full neural-glass px-3 py-2 rounded-lg border border-white/10 bg-black/20 text-white"
                  >
                    <option value="low">Low - General question</option>
                    <option value="medium">Medium - Issue affecting usage</option>
                    <option value="high">High - Critical problem</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Message</label>
                  <Textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    placeholder="Describe your issue or question in detail..."
                    required
                    rows={4}
                    className="neural-glass resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full neural-glass-premium"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card className="neural-glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-emerald-400" />
                Additional Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="https://github.com/NeuroPad/fcs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 neural-glass-hover rounded-lg group"
              >
                <span className="text-white group-hover:text-primary transition-colors">
                  GitHub Repository
                </span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
              
              <a
                href="#"
                className="flex items-center justify-between p-3 neural-glass-hover rounded-lg group"
              >
                <span className="text-white group-hover:text-primary transition-colors">
                  API Documentation
                </span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
              
              <a
                href="#"
                className="flex items-center justify-between p-3 neural-glass-hover rounded-lg group"
              >
                <span className="text-white group-hover:text-primary transition-colors">
                  GraphRAG Guide
                </span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;