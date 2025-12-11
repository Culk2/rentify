import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Send } from 'lucide-react';
import { getConversations, getMessages, sendMessage as sendMessageApi, getUserById } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { ChatConversation, Message, User } from '../utils/mockData';

export function ChatPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userId || null);
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserData, setSelectedUserData] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const conversationPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadConversations();
    
    // Start polling for new conversations every 3 seconds
    conversationPollingIntervalRef.current = setInterval(() => {
      loadConversations();
    }, 3000);
    
    // Cleanup: stop polling when component unmounts
    return () => {
      if (conversationPollingIntervalRef.current) {
        clearInterval(conversationPollingIntervalRef.current);
        conversationPollingIntervalRef.current = null;
      }
    };
  }, [user, navigate]);

  useEffect(() => {
    if (userId) {
      setSelectedUserId(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
      loadSelectedUser(selectedUserId);
      
      // Start polling for new messages every 2 seconds
      pollingIntervalRef.current = setInterval(() => {
        loadMessages(selectedUserId);
      }, 2000);
    }
    
    // Cleanup: stop polling when user changes or component unmounts
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversations() {
    try {
      // Only show loading state on the very first load
      if (isInitialLoadRef.current) {
        setLoading(true);
      }
      
      const { conversations: convs } = await getConversations();
      // Filter out any null or undefined conversations
      const newConversations = convs?.filter((conv: ChatConversation | null) => conv != null) || [];
      
      // Only update state if conversations have changed (compare length and timestamps)
      setConversations((prevConversations) => {
        if (prevConversations.length !== newConversations.length) {
          return newConversations;
        }
        // Check if any conversation has updated
        for (let i = 0; i < prevConversations.length; i++) {
          const prev = prevConversations[i];
          const current = newConversations.find(c => c.userId === prev.userId);
          if (!current || current.lastMessage !== prev.lastMessage) {
            return newConversations;
          }
        }
        return prevConversations;
      });
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]);
    } finally {
      if (isInitialLoadRef.current) {
        setLoading(false);
        isInitialLoadRef.current = false;
      }
    }
  }

  async function loadMessages(otherUserId: string) {
    try {
      const { messages: msgs } = await getMessages(otherUserId);
      // Filter out any null or undefined messages
      const newMessages = msgs?.filter((msg: Message | null) => msg != null) || [];
      
      // Only update state if messages have changed (compare length and last message ID)
      setMessages((prevMessages) => {
        if (prevMessages.length !== newMessages.length) {
          return newMessages;
        }
        if (prevMessages.length > 0 && newMessages.length > 0) {
          const lastPrevId = prevMessages[prevMessages.length - 1].id;
          const lastNewId = newMessages[newMessages.length - 1].id;
          if (lastPrevId !== lastNewId) {
            return newMessages;
          }
        }
        return prevMessages;
      });
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  }

  async function loadSelectedUser(userId: string) {
    try {
      const { user: userData } = await getUserById(userId);
      setSelectedUserData(userData);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setSelectedUserData(null);
    }
  }

  const selectedConversation = conversations.find((c) => c.userId === selectedUserId);
  
  // If there's no conversation but we have selected user data, create a virtual conversation
  const displayConversation = selectedConversation || (selectedUserData ? {
    userId: selectedUserData.id,
    userName: selectedUserData.name,
    userAvatar: selectedUserData.avatar,
    lastMessage: 'Start a conversation',
    lastMessageTime: new Date(),
    unread: 0
  } : null);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedUserId || !user) return;

    try {
      const { message } = await sendMessageApi(selectedUserId, messageInput);
      // Optimistically update UI - polling will sync any differences
      setMessages((prev) => [...prev, message]);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatLastMessageTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-slate-900">Messages</h1>
        <Badge variant="outline" className="gap-1.5">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          Real-time
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
        <Card className="lg:col-span-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              <h2 className="text-slate-900 mb-4">Conversations</h2>
              {loading ? (
                <p className="text-slate-600">Loading conversations...</p>
              ) : conversations.length === 0 ? (
                <p className="text-slate-600">No conversations yet</p>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.userId}
                      onClick={() => setSelectedUserId(conversation.userId)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedUserId === conversation.userId
                          ? 'bg-blue-50 border-2 border-blue-600'
                          : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={conversation.userAvatar} alt={conversation.userName} />
                            <AvatarFallback>{conversation.userName[0]}</AvatarFallback>
                          </Avatar>
                          {conversation.unread > 0 && (
                            <Badge
                              variant="destructive"
                              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            >
                              {conversation.unread}
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-slate-900 truncate">{conversation.userName}</p>
                            <span className="text-xs text-slate-500 shrink-0">
                              {formatLastMessageTime(conversation.lastMessageTime)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 truncate">{conversation.lastMessage}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {displayConversation ? (
            <>
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={displayConversation.userAvatar}
                        alt={displayConversation.userName}
                      />
                      <AvatarFallback>{displayConversation.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-slate-900">{displayConversation.userName}</p>
                      <p className="text-sm text-slate-600">Active</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-slate-500">Live</span>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isCurrentUser = message.senderId === user.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-2 max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                            <Avatar className="size-8 shrink-0">
                              <AvatarImage
                                src={
                                  isCurrentUser
                                    ? user.avatar
                                    : displayConversation.userAvatar
                                }
                                alt={isCurrentUser ? user.name : displayConversation.userName}
                              />
                              <AvatarFallback>
                                {isCurrentUser
                                  ? user.name[0]
                                  : displayConversation.userName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div
                                className={`rounded-lg p-3 ${
                                  isCurrentUser
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-900'
                                }`}
                              >
                                <p>{message.content}</p>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 px-1">
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <Button type="submit">
                    <Send className="size-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-600">Select a conversation to start messaging</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}