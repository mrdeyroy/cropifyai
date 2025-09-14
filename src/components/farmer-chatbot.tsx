'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bot,
  Send,
  Loader2,
  User,
  Mic,
  Square,
  PanelLeft,
  MessageSquarePlus,
  Trash2,
  Edit,
  MoreVertical,
  X,
  Check,
  Volume2,
  Clipboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { farmerChatbot } from '@/ai/flows/farmer-chatbot';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import Textarea from 'react-textarea-autosize';
import { transcribeVoiceInput } from '@/ai/flows/voice-input-farm-data';
import { useLanguage } from '@/hooks/use-language';
import { textToSpeech } from '@/ai/flows/text-to-speech';


type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};

type Conversations = Record<string, Conversation>;

const CHAT_HISTORY_KEY = 'chatHistory';

export function FarmerChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversations>({});
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isThinking, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { language, t } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  
  const [audioStates, setAudioStates] = useState<Record<string, 'idle' | 'loading' | 'playing'>>({});
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        setConversations(parsedHistory);
        const firstConversationId = Object.keys(parsedHistory)[0];
        if (firstConversationId) {
            setActiveConversationId(firstConversationId);
        }
      }
    } catch (error) {
      console.error('Failed to load chat history from localStorage', error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
        try {
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(conversations));
        } catch (error) {
            console.error('Failed to save chat history to localStorage', error);
        }
    }
  }, [conversations, isClient]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [activeConversationId, conversations, (activeConversationId ? conversations[activeConversationId]?.messages : [])]);

  const messages = activeConversationId ? conversations[activeConversationId]?.messages || [] : [];
  
  const startNewChat = () => {
    const newId = `chat_${Date.now()}`;
    const newConversation: Conversation = {
        id: newId,
        title: t('farmerChatbot.newChat'),
        messages: [],
    };
    setConversations(prev => ({ [newId]: newConversation, ...prev }));
    setActiveConversationId(newId);
    setIsHistoryOpen(false);
  }

  const switchConversation = (id: string) => {
    setActiveConversationId(id);
    setIsHistoryOpen(false);
  }
  
  const handleRename = () => {
    if (!editingConversationId || !newTitle.trim()) return;
    setConversations(prev => ({
        ...prev,
        [editingConversationId]: {
            ...prev[editingConversationId],
            title: newTitle.trim(),
        }
    }));
    setEditingConversationId(null);
    setNewTitle('');
  }

  const handleDelete = () => {
    if (!deletingConversationId) return;
    const newConversations = { ...conversations };
    delete newConversations[deletingConversationId];
    setConversations(newConversations);
    if (activeConversationId === deletingConversationId) {
        const nextConversationId = Object.keys(newConversations)[0] || null;
        setActiveConversationId(nextConversationId);
    }
    setDeletingConversationId(null);
  }

  const handleCopy = (messageId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [messageId]: true }));
    setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [messageId]: false }));
    }, 2000);
  }

  const handleTextToSpeech = async (messageId: string, text: string) => {
      // Stop currently playing audio if the same button is clicked again
      if (audioRef.current && audioStates[messageId] === 'playing') {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset audio
        setAudioStates(prev => ({ ...prev, [messageId]: 'idle' }));
        audioRef.current = null;
        return;
      }
      
      // Stop any currently playing audio from other messages
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      // Reset all other audio states to idle
      const resetStates: Record<string, 'idle' | 'loading' | 'playing'> = {};
      Object.keys(audioStates).forEach(key => {
        resetStates[key] = 'idle';
      });


      setAudioStates({ ...resetStates, [messageId]: 'loading' });

      try {
        const result = await textToSpeech(text);
        if (result.audioDataUri) {
          const audio = new Audio(result.audioDataUri);
          audioRef.current = audio;
          
          audio.onplay = () => {
            setAudioStates(prev => ({ ...prev, [messageId]: 'playing' }));
          };
          
          audio.onended = () => {
            setAudioStates(prev => ({ ...prev, [messageId]: 'idle' }));
            audioRef.current = null;
          };
          
          audio.onerror = () => {
            setAudioStates(prev => ({ ...prev, [messageId]: 'idle' }));
            toast({ variant: 'destructive', title: 'Error playing audio.' });
          }

          audio.play();

        } else {
          throw new Error('No audio data received.');
        }
      } catch (error: any) {
        console.error('Text-to-speech error:', error);
        if (error.message && error.message.includes('503 Service Unavailable')) {
             toast({ 
                variant: 'destructive', 
                title: 'Text-to-speech service is busy',
                description: 'The model is currently overloaded. Please try again in a moment.'
            });
        } else {
             toast({ variant: 'destructive', title: 'Text-to-speech failed.' });
        }
        setAudioStates(prev => ({ ...prev, [messageId]: 'idle' }));
      }
  }


  const processAndSubmit = (text: string) => {
    if (!text.trim() || isThinking) return;

    let currentConversationId = activeConversationId;
    let isNewChat = false;
    if (!currentConversationId) {
        isNewChat = true;
        const newId = `chat_${Date.now()}`;
        const newConversation: Conversation = {
            id: newId,
            title: text.substring(0, 30), // Use start of message as title
            messages: [],
        };
        setConversations(prev => ({ [newId]: newConversation, ...prev }));
        setActiveConversationId(newId);
        currentConversationId = newId;
    }


    const userMessage: Message = { id: `msg_${Date.now()}`, role: 'user', content: text };
    
    // Update title for new chats
    if (isNewChat) {
       setConversations(prev => ({
        ...prev,
        [currentConversationId!]: {
            ...prev[currentConversationId!],
            title: text.substring(0, 30),
            messages: [userMessage],
        }
       }));
    } else {
       setConversations(prev => ({
        ...prev,
        [currentConversationId!]: {
            ...prev[currentConversationId!],
            messages: [...(prev[currentConversationId!]?.messages || []), userMessage],
        }
       }));
    }


    setInput('');

    startTransition(async () => {
      try {
        const currentMessages = conversations[currentConversationId!]?.messages || [];
        const historyForApi = [...currentMessages, userMessage].map(({role, content}) => ({role, content}));
        
        const result = await farmerChatbot({
          history: historyForApi,
        });
        const modelMessage: Message = {
          id: `msg_${Date.now()}`,
          role: 'model',
          content: result.response,
        };
        
        setConversations(prev => {
            const finalMessages = [...(prev[currentConversationId!]?.messages || []), modelMessage];
            return {
                ...prev,
                [currentConversationId!]: {
                    ...prev[currentConversationId!],
                    messages: finalMessages
                }
            }
        });
        
      } catch (error) {
        console.error('Chatbot error:', error);
        toast({
          variant: 'destructive',
          title: t('farmerChatbot.errorToastTitle'),
          description: t('farmerChatbot.errorToastDescription'),
        });
        // Remove the user message if the API call fails
        setConversations(prev => ({
            ...prev,
            [currentConversationId!]: {
                ...prev[currentConversationId!],
                messages: prev[currentConversationId!].messages.slice(0, -1),
            }
        }));
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processAndSubmit(input);
  };
  
  const handleVoiceRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        variant: 'destructive',
        title: 'Voice Recording Not Supported',
        description: 'Your browser does not support voice recording.',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          
          startTransition(async () => {
            try {
              toast({ title: t('farmerChatbot.transcribingToast') });
              const { transcription } = await transcribeVoiceInput({
                audioDataUri: base64Audio,
                languageCode: language,
              });
              processAndSubmit(transcription);
            } catch (error) {
              console.error('Transcription error:', error);
              toast({
                variant: 'destructive',
                title: t('farmerChatbot.transcriptionFailedToastTitle'),
                description: t('farmerChatbot.transcriptionFailedToastDescription'),
              });
            }
          });
        };
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();

    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        variant: 'destructive',
        title: 'Microphone Access Denied',
        description: 'Please enable microphone permissions in your browser settings.',
      });
      setIsRecording(false);
    }
  };

  if (!isClient) {
      return null;
  }

  return (
    <>
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="primary"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 text-primary-foreground"
          aria-label={t('farmerChatbot.openChatbotAriaLabel')}
        >
          <Bot className="h-7 w-7" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-[380px] h-[500px] p-0 flex flex-col"
        sideOffset={16}
      >
        <div className="p-4 border-b bg-primary text-primary-foreground rounded-t-md flex justify-between items-center">
            <div>
                <h3 className="font-semibold text-lg">{t('farmerChatbot.title')}</h3>
                <p className="text-sm opacity-90">{t('farmerChatbot.description')}</p>
            </div>
            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
                        <PanelLeft className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[300px]">
                    <SheetHeader className="p-4 border-b">
                        <SheetTitle>{t('farmerChatbot.chatHistory')}</SheetTitle>
                    </SheetHeader>
                    <div className="p-2">
                        <Button onClick={startNewChat} className="w-full">
                            <MessageSquarePlus className="mr-2 h-4 w-4" />
                            {t('farmerChatbot.newChat')}
                        </Button>
                    </div>
                    <ScrollArea className="flex-1 h-[calc(100%-120px)] p-2">
                        <div className="space-y-2">
                            {Object.values(conversations).sort((a, b) => parseInt(b.id.split('_')[1]) - parseInt(a.id.split('_')[1])).map(convo => (
                                <div key={convo.id}>
                                {editingConversationId === convo.id ? (
                                    <div className="flex items-center gap-2 p-2">
                                        <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="h-8" />
                                        <Button size="icon" className="h-8 w-8" onClick={handleRename}><Check className="h-4 w-4" /></Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingConversationId(null)}><X className="h-4 w-4" /></Button>
                                    </div>
                                ) : (
                                <div className="group flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer" onClick={() => switchConversation(convo.id)}>
                                    <p className="truncate text-sm">{convo.title}</p>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingConversationId(convo.id); setNewTitle(convo.title); }}>
                                                <Edit className="mr-2 h-4 w-4" /> {t('farmerChatbot.rename')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeletingConversationId(convo.id); }} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> {t('farmerChatbot.delete')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' ? 'justify-end' : ''
                )}
              >
                {message.role === 'model' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'p-3 rounded-lg max-w-[80%] text-sm group relative',
                    message.role === 'user'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-card border'
                  )}
                >
                  {message.content}
                   {message.role === 'model' && (
                       <div className="absolute -bottom-2 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleTextToSpeech(message.id, message.content)}>
                                {audioStates[message.id] === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                                {audioStates[message.id] === 'playing' && <Volume2 className="h-4 w-4 text-primary animate-pulse" />}
                                {audioStates[message.id] !== 'loading' && audioStates[message.id] !== 'playing' && <Volume2 className="h-4 w-4" />}
                            </Button>
                           <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleCopy(message.id, message.content)}>
                               {copiedStates[message.id] ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                           </Button>
                       </div>
                   )}
                </div>
                 {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isThinking && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot />
                  </AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-card border">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            {messages.length === 0 && !isThinking && (
                <div className="text-center text-muted-foreground p-8">
                    <Bot className="h-10 w-10 mx-auto mb-2"/>
                    <p>{t('farmerChatbot.emptyState')}</p>
                </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t bg-background rounded-b-md">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('farmerChatbot.placeholder')}
              className="flex-1 resize-none bg-background border rounded-md px-3 py-2 text-sm max-h-24"
              minRows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isThinking || isRecording}
            />
            <Button
              type="button"
              size="icon"
              onClick={handleVoiceRecording}
              disabled={isThinking}
              variant={isRecording ? 'destructive' : 'default'}
            >
              {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              type="submit"
              size="icon"
              disabled={isThinking || !input.trim() || isRecording}
            >
              {isThinking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
    
    <AlertDialog open={!!deletingConversationId} onOpenChange={(open) => !open && setDeletingConversationId(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{t('farmerChatbot.deleteConfirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                    {t('farmerChatbot.deleteConfirmDescription')}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletingConversationId(null)}>{t('farmerChatbot.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className={buttonVariants({ variant: "destructive" })}>{t('farmerChatbot.delete')}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
