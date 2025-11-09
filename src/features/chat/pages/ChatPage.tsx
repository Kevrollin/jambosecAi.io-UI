import React, { useState, useRef, useEffect } from "react";
import { Send, User, X, Plus, MessageSquare, Shield, Menu, ChevronsLeft, ChevronsRight, ExternalLink, MoreVertical, Trash2, Edit2 } from "lucide-react";
import { listChatSessions, askChat, listChatMessages, deleteChatSession, updateChatSessionTitle } from "../services/chatService";
import type { ChatSession, ChatMessage } from "../types";
import { useNavbar } from "../../../components/NavbarContext";
import { useTypewriter } from "../hooks/useTypewriter";

// --- Translations ---
const translations = {
  en: {
    newChat: "New chat",
    placeholder: "Message JamboSec...",
    aiGreeting: "Hello! I'm JamboSec, your AI cybersecurity assistant. How can I help you stay safe online today?",
    navChat: "Chat",
    navKnowledge: "Knowledge",
    navPrivacy: "Privacy",
    noChats: "No chat history",
    startNewChat: "Start a new conversation",
  },
  sw: {
    newChat: "Mazungumzo mapya",
    placeholder: "Tuma ujumbe kwa JamboSec...",
    aiGreeting: "Hujambo! Mimi ni JamboSec, msaidizi wako wa AI wa usalama wa mtandao. Naweza kukusaidiaje kukaa salama mtandaoni leo?",
    navChat: "Soga",
    navKnowledge: "Maarifa",
    navPrivacy: "Faragha",
    noChats: "Hakuna historia ya mazungumzo",
    startNewChat: "Anza mazungumzo mapya",
  },
};

// --- Main Chat Component ---
const ChatPageComponent = () => {
  const [language, setLanguage] = useState<"en" | "sw">("en");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  // Sidebar starts open on desktop (md+), closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  // Sidebar collapsed state for desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [sessionMenuOpen, setSessionMenuOpen] = useState<string | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const menuRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { toggleMobileMenu } = useNavbar();

  // Update mobile state on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Update sidebar open state based on screen size
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scrolling on desktop - only allow sidebar and chat content to scroll
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalHtmlStyle = window.getComputedStyle(document.documentElement).overflow;
    
    // Disable scrolling on body and html
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      // Restore original overflow styles on unmount
      document.body.style.overflow = originalStyle;
      document.documentElement.style.overflow = originalHtmlStyle;
    };
  }, []);
  
  // Get current session title
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const currentChatTitle = currentSession?.title || (currentSessionId ? "Chat" : "New Chat");

  // Load chat sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoadingSessions(true);
        const sessionList = await listChatSessions();
        setSessions(sessionList);
        // Load most recent session if available
        if (sessionList.length > 0 && !currentSessionId) {
          setCurrentSessionId(sessionList[0].id);
        }
      } catch (error) {
        console.error("Failed to load sessions:", error);
      } finally {
        setLoadingSessions(false);
      }
    };
    loadSessions();
  }, []);

  // Load messages for current session
  useEffect(() => {
    if (currentSessionId) {
      const loadMessages = async () => {
        try {
          const messageList = await listChatMessages(currentSessionId);
          setMessages(messageList);
          
          // Optionally sync language from session (user can still override with toggle)
          const session = sessions.find(s => s.id === currentSessionId);
          if (session?.language && (session.language === 'en' || session.language === 'sw')) {
            const sessionLang = session.language as 'en' | 'sw';
            setLanguage(prevLang => {
              // Only update if different to avoid unnecessary re-renders
              return prevLang !== sessionLang ? sessionLang : prevLang;
            });
          }
        } catch (error) {
          console.error("Failed to load messages:", error);
          setMessages([]);
        }
      };
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [currentSessionId, sessions]);

  // Auto-scroll to bottom when messages change or streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Language persistence and sync with navbar
  useEffect(() => {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem("lang");
    if (savedLang === "sw" || savedLang === "en") {
      setLanguage(savedLang);
    }
    
    // Listen for language changes from navbar via custom event
    const handleLanguageChange = (e: CustomEvent) => {
      if (e.detail === "sw" || e.detail === "en") {
        console.log('ChatPage: Received language change event:', e.detail);
        setLanguage(e.detail);
      }
    };
    
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener);
  }, []);

  // Sync language changes back to navbar and localStorage
  useEffect(() => {
    localStorage.setItem("lang", language);
    // Dispatch custom event for navbar sync (in same window)
    const event = new CustomEvent('languageChange', { detail: language });
    window.dispatchEvent(event);
    console.log('ChatPage: Language changed to', language, '- event dispatched');
  }, [language]);

  // Typewriter effect for streaming message
  const displayedStreamingContent = useTypewriter(streamingContent, 20);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const messageText = input.trim();
    setInput("");
    setLoading(true);

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      sessionId: currentSessionId || "",
      role: "user",
      content: messageText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Small delay to show user message first
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use the ask endpoint with current language selection from toggle
      const response = await askChat({
        message: messageText,
        lang: language,
        session_id: currentSessionId || undefined,
      });

      // Update session ID if a new one was created
      if (!currentSessionId || currentSessionId !== response.session_id) {
        setCurrentSessionId(response.session_id);
        // Reload sessions to get the new one
        const sessionList = await listChatSessions();
        setSessions(sessionList);
      }

      // Start streaming effect with the response
      const tempMessageId = `temp-ai-${Date.now()}`;
      setStreamingMessageId(tempMessageId);
      setStreamingContent(response.reply);

      // After streaming completes, reload all messages from backend to get proper IDs and sources
      setTimeout(async () => {
        try {
        const allMessages = await listChatMessages(response.session_id);
        setMessages(allMessages);
          setStreamingMessageId(null);
          setStreamingContent("");
        } catch (error) {
          console.error("Failed to reload messages:", error);
          // Fallback: add message manually
          const aiMessage: ChatMessage = {
            id: tempMessageId,
            sessionId: response.session_id,
            role: "assistant",
            content: response.reply,
            sources: response.sources,
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => {
            // Remove temp user message and add both with proper IDs
            const filtered = prev.filter(msg => msg.id !== userMessage.id);
            return [...filtered, aiMessage];
          });
          setStreamingMessageId(null);
          setStreamingContent("");
        }
      }, response.reply.length * 20 + 500); // Wait for streaming to complete

    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove the temp user message on error
      setMessages((prev) => prev.filter(msg => msg.id !== userMessage.id));
      // Show error message to user
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sessionId: currentSessionId || "",
        role: "assistant",
        content: language === 'sw' 
          ? "Samahani, nimekutana na tatizo. Tafadhali jaribu tena."
          : "Sorry, I encountered an error. Please try again.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setInput("");
    setSidebarOpen(false); // Close sidebar on mobile after starting new chat
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setSidebarOpen(false);
    setSessionMenuOpen(null);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm(language === 'sw' 
      ? 'Una uhakika unataka kufuta mazungumzo haya?' 
      : 'Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      await deleteChatSession(sessionId);
      
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
      
      const updatedSessions = await listChatSessions();
      setSessions(updatedSessions);
      setSessionMenuOpen(null);
    } catch (error) {
      console.error("Failed to delete session:", error);
      alert(language === 'sw' 
        ? 'Imeshindwa kufuta mazungumzo. Tafadhali jaribu tena.' 
        : 'Failed to delete chat. Please try again.');
    }
  };

  const handleRenameSession = async (sessionId: string) => {
    if (!renameTitle.trim()) {
      return;
    }

    try {
      await updateChatSessionTitle(sessionId, renameTitle.trim());
      const updatedSessions = await listChatSessions();
      setSessions(updatedSessions);
      setRenameModalOpen(null);
      setRenameTitle("");
      setSessionMenuOpen(null);
    } catch (error) {
      console.error("Failed to rename session:", error);
      alert(language === 'sw' 
        ? 'Imeshindwa kubadilisha jina. Tafadhali jaribu tena.' 
        : 'Failed to rename chat. Please try again.');
    }
  };

  const openRenameModal = (sessionId: string, currentTitle: string) => {
    setRenameTitle(currentTitle || "");
    setRenameModalOpen(sessionId);
    setSessionMenuOpen(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      let clickedInside = false;
      
      menuRefs.current.forEach((menuElement) => {
        if (menuElement && menuElement.contains(target)) {
          clickedInside = true;
        }
      });
      
      if (!clickedInside) {
        setSessionMenuOpen(null);
      }
    };

    if (sessionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sessionMenuOpen]);

  const currentContent = translations[language];

  return (
    <div className="flex h-full bg-gray-100 overflow-hidden w-full" style={{ height: '100%', maxHeight: '100%', minHeight: 0 }}>

      {/* Sidebar Backdrop - Mobile Only */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[80]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Collapsed Sidebar Icon Bar - Desktop Only (when collapsed) */}
      {sidebarCollapsed && (
        <div className="hidden md:flex fixed left-0 top-0 w-16 h-full bg-gray-900 z-[90] flex-col items-center p-2">
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="mb-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            type="button"
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="h-5 w-5" />
          </button>
          <button
            onClick={handleNewChat}
            className="mb-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            type="button"
            aria-label="New chat"
          >
            <Plus className="h-5 w-5" />
          </button>
          <div className="flex-1 overflow-y-auto w-full flex flex-col items-center space-y-2 py-2">
            {sessions.slice(0, 10).map((session) => (
              <div key={session.id} className="relative group">
                <button
                  onClick={() => handleSessionSelect(session.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    currentSessionId === session.id
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                  type="button"
                  title={session.title || "New Chat"}
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-[90] md:z-auto w-[85%] sm:w-[70%] md:w-64 md:transition-all md:duration-300 h-full md:h-full flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 ${
          sidebarCollapsed ? "md:w-0 md:opacity-0 md:pointer-events-none md:overflow-hidden" : ""
        }`}
        style={{
          maxWidth: isMobile ? '320px' : 'none',
          ...(sidebarCollapsed ? {} : {
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            borderRight: "1px solid rgba(255, 255, 255, 0.3)",
          }),
        }}
      >
        {/* Desktop Sidebar Background - Dark Theme */}
        {!sidebarCollapsed && (
          <div className="hidden md:block absolute inset-0 bg-gray-900 -z-10" />
        )}
        {/* Sidebar Header - Mobile Only */}
        <div className="p-4 border-b border-gray-200 bg-white md:hidden flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Chats</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              type="button"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{currentContent.newChat}</span>
          </button>
        </div>

        {/* Sidebar Header - Desktop */}
        {!sidebarCollapsed && (
          <div className="hidden md:block p-4 border-b border-gray-700 bg-gray-900">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center space-x-2 px-4 py-2.5 bg-transparent border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors mb-3"
            >
              <Plus className="h-4 w-4" />
              <span className="whitespace-nowrap">{currentContent.newChat}</span>
            </button>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              type="button"
              aria-label="Collapse sidebar"
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="text-xs">Collapse</span>
            </button>
          </div>
        )}


        {/* Chat History - Desktop Expanded */}
        {!sidebarCollapsed && (
          <>
            <div className="flex-1 overflow-y-auto p-2 md:p-2" style={{ WebkitOverflowScrolling: 'touch' }}>
              {loadingSessions ? (
                <div className="text-gray-500 md:text-gray-400 text-sm text-center py-4">Loading...</div>
              ) : sessions.length === 0 ? (
                <div className="text-gray-500 md:text-gray-400 text-sm text-center py-4 px-2">
                  {currentContent.noChats}
                </div>
              ) : (
                <div className="space-y-1">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group relative flex items-center rounded-lg transition-all ${
                        currentSessionId === session.id
                          ? "bg-blue-600 md:bg-gray-800 text-white"
                          : "bg-gray-100 md:bg-transparent text-gray-700 md:text-gray-300 hover:bg-gray-200 md:hover:bg-gray-800 md:hover:text-white"
                      }`}
                    >
                      <button
                        onClick={() => handleSessionSelect(session.id)}
                        className="flex-1 text-left px-3 py-2.5 flex items-center space-x-2 min-w-0"
                      >
                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm truncate">{session.title || "New Chat"}</span>
                      </button>
                      
                      {/* Three dots menu button - Desktop Only */}
                      <div 
                        className="hidden md:block relative flex-shrink-0"
                        ref={(el) => {
                          if (el) {
                            menuRefs.current.set(session.id, el);
                          } else {
                            menuRefs.current.delete(session.id);
                          }
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSessionMenuOpen(sessionMenuOpen === session.id ? null : session.id);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            sessionMenuOpen === session.id
                              ? "bg-gray-700 text-white opacity-100"
                              : "text-gray-400 hover:bg-gray-700 hover:text-white opacity-0 group-hover:opacity-100"
                          }`}
                          type="button"
                          aria-label="Session options"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        
                        {/* Dropdown menu */}
                        {sessionMenuOpen === session.id && (
                          <div className="absolute right-0 top-10 z-50 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openRenameModal(session.id, session.title || "");
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                              type="button"
                            >
                              <Edit2 className="h-4 w-4" />
                              <span>{language === 'sw' ? 'Badilisha Jina' : 'Rename'}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSession(session.id);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                              type="button"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>{language === 'sw' ? 'Futa' : 'Delete'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>

            {/* Sidebar Footer - Desktop Expanded
            <div className="p-4 border-t border-gray-700 bg-gray-900">
              <LanguageToggle
                currentLang={language}
                onToggle={() => setLanguage(language === 'en' ? 'sw' : 'en')}
              />
            </div>  */}
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div 
        className="flex-1 flex flex-col transition-all duration-300 ease-in-out min-w-0 relative bg-gray-50" 
        style={{ 
          minHeight: 0,
        }}
      >
        {/* Mobile Header - Always Visible on Mobile (Similar to Knowledge Hub) */}
        <div className="md:hidden border-b border-gray-200 bg-white sticky top-0 z-40 flex-shrink-0" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
          <div className="px-4 py-3 sm:py-4" style={{ paddingTop: 0 }}>
            <div className="flex items-center justify-between gap-3">
              {/* Left: Menu Button + Logo + Title */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Sidebar Toggle Button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex-shrink-0"
                  aria-label="Toggle sidebar"
                  type="button"
                >
                  <Menu className="h-6 w-6" />
                </button>

                {/* Logo and Title */}
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="bg-blue-600 p-1.5 rounded-lg flex-shrink-0">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-base font-bold text-gray-900 truncate">JamboSec</h1>
                    <p className="text-xs text-gray-600 truncate">{currentChatTitle}</p>
                  </div>
                </div>
              </div>

              {/* Right: Navigation Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex-shrink-0"
                aria-label="Open navigation menu"
                type="button"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Top Bar */}
        <div className="hidden md:flex bg-white/95 backdrop-blur-sm border-b border-gray-200/50 px-6 lg:px-24 py-3 items-center justify-between flex-shrink-0 relative z-10">
          {/* Left side - Logo and Title */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Logo */}
            <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            {/* Title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">JamboSec</h1>
              <p className="text-sm text-gray-600 truncate">{currentChatTitle}</p>
            </div>
          </div>
        </div>

        {/* Decorative Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-300/15 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/3 w-64 h-64 md:w-96 md:h-96 bg-blue-100/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 relative z-10" style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-48 h-48 sm:w-62 sm:h-64 md:w-78 md:h-80 lg:w-94 lg:h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/3 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="mt-20 text-center">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
                  {currentContent.startNewChat}
                </h2>
                <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">{currentContent.aiGreeting}</p>
              </div>
            ) : (
              <div className="space-y-6 md:space-y-8">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 md:gap-4 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* AI Avatar (Left Side) */}
                    {msg.role === "assistant" && (
                      <div className="hidden md:flex flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 items-center justify-center shadow-md">
                        <Shield className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                    )}
                    
                    {/* Message Content */}
                    <div
                      className={`flex-1 ${
                        msg.role === "user" ? "flex justify-end" : ""
                      }`}
                      style={{ maxWidth: 'calc(100% - 60px)', minWidth: 0 }}
                    >
                      <div
                        className={`rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4 shadow-sm ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                            : "bg-white border border-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                        
                        {/* Sources Section - Only for AI messages with sources */}
                        {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200/50">
                            <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                              {language === 'sw' ? 'Vyanzo' : 'Sources'}
                            </p>
                            <div className="space-y-2">
                              {msg.sources.map((source, idx) => (
                                <a
                                  key={idx}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-2 text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors group"
                                >
                                  <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0 opacity-70 group-hover:opacity-100" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{source.title}</p>
                                    {source.snippet && (
                                      <p className="text-gray-500 text-[10px] mt-0.5 line-clamp-2">{source.snippet}</p>
                                    )}
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Avatar (Right Side) */}
                    {msg.role === "user" && (
                      <div className="hidden md:flex flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 items-center justify-center shadow-md">
                        <User className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Streaming Message - Shows while AI is typing */}
                {streamingMessageId && streamingContent && (
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="hidden md:flex flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 items-center justify-center shadow-md">
                      <Shield className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div className="flex-1" style={{ maxWidth: 'calc(100% - 60px)', minWidth: 0 }}>
                      <div className="bg-white border border-gray-200 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4 shadow-sm">
                        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                          {displayedStreamingContent}
                          <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1">|</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Loading Indicator - Shows while waiting for response */}
                {loading && !streamingMessageId && (
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="hidden md:flex flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 items-center justify-center shadow-md">
                      <Shield className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4 shadow-sm">
                      <p className="text-sm text-gray-600 italic mb-2">
                        {language === 'sw' ? 'JamboSec anafikiria...' : 'JamboSec is thinking...'}
                      </p>
                      <div className="flex space-x-1.5">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-3 py-3 sm:px-4 sm:py-4 md:py-5 flex-shrink-0 relative z-10" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSend} className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentContent.placeholder}
                rows={1}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4 pr-10 sm:pr-12 md:pr-14 border border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none text-sm sm:text-base disabled:opacity-50 bg-white shadow-sm"
                style={{ maxHeight: "200px" }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-1.5 sm:right-2 md:right-3 bottom-1.5 sm:bottom-2 md:bottom-3 p-1.5 sm:p-2 md:p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                <Send className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-1.5 sm:mt-2 text-center hidden sm:block">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* Rename Modal */}
      {renameModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'sw' ? 'Badilisha Jina la Mazungumzo' : 'Rename Chat'}
            </h3>
            <input
              type="text"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRenameSession(renameModalOpen);
                } else if (e.key === 'Escape') {
                  setRenameModalOpen(null);
                  setRenameTitle("");
                }
              }}
              placeholder={language === 'sw' ? 'Jina la mazungumzo...' : 'Chat title...'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setRenameModalOpen(null);
                  setRenameTitle("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                type="button"
              >
                {language === 'sw' ? 'Ghairi' : 'Cancel'}
              </button>
              <button
                onClick={() => handleRenameSession(renameModalOpen)}
                disabled={!renameTitle.trim()}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                type="button"
              >
                {language === 'sw' ? 'Hifadhi' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ChatPage() {
  return <ChatPageComponent />;
}
