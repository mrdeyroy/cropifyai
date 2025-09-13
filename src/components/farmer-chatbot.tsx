
'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bot, Send, Loader2, User, Mic, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { farmerChatbot } from '@/ai/flows/farmer-chatbot';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import Textarea from 'react-textarea-autosize';
import { transcribeVoiceInput } from '@/ai/flows/voice-input-farm-data';
import { useLanguage } from '@/hooks/use-language';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export function FarmerChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const processAndSubmit = (text: string) => {
    if (!text.trim() || isThinking) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    startTransition(async () => {
      try {
        const result = await farmerChatbot({
          history: [...messages, userMessage],
        });
        const modelMessage: Message = {
          role: 'model',
          content: result.response,
        };
        setMessages((prev) => [...prev, modelMessage]);
      } catch (error) {
        console.error('Chatbot error:', error);
        toast({
          variant: 'destructive',
          title: 'Chatbot Error',
          description:
            'Could not get a response from the AI. Please try again.',
        });
        setMessages((prev) => prev.slice(0, -1));
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
              toast({ title: 'Transcribing your voice...' });
              const { transcription } = await transcribeVoiceInput({
                audioDataUri: base64Audio,
                languageCode: language,
              });
              processAndSubmit(transcription);
            } catch (error) {
              console.error('Transcription error:', error);
              toast({
                variant: 'destructive',
                title: 'Transcription Failed',
                description: 'Could not convert your voice to text. Please try again.',
              });
            }
          });
        };
        
        // Stop all tracks to release the microphone
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


  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="primary"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 text-primary-foreground"
          aria-label="Open Farmer Chatbot"
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
        <div className="p-4 border-b bg-primary text-primary-foreground rounded-t-md">
          <h3 className="font-semibold text-lg">AgriBot Assistant</h3>
          <p className="text-sm opacity-90">Your AI farming expert</p>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
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
                    'p-3 rounded-lg max-w-[80%] text-sm',
                    message.role === 'user'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-card border'
                  )}
                >
                  {message.content}
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
                    <p>Ask me anything about farming!</p>
                </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t bg-background rounded-b-md">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crops, soil, pests..."
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
  );
}
