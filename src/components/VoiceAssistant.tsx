import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Volume2, Clock, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import VoiceVisualizer from "./VoiceVisualizer";
import CommandDisplay from "./CommandDisplay";
import PersonalitySelector from "./PersonalitySelector";
import { processCommand, getReminders, getNotes, getPersonality } from "@/utils/commandProcessor";
import { CommandType, PersonalityType } from "@/types/commands";

type Message = {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  type?: CommandType;
  data?: any;
};

const VoiceAssistant = () => {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm EchoNova, your AI assistant. How can I help you today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [volume, setVolume] = useState(0);
  const [activeCommand, setActiveCommand] = useState<{ type: string; data: any } | null>(null);
  const [currentPersonality, setCurrentPersonality] = useState<PersonalityType>(getPersonality());
  const recognition = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = "en-US";

      recognition.current.onstart = () => {
        setListening(true);
      };

      recognition.current.onend = () => {
        setListening(false);
      };

      recognition.current.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            handleUserMessage(transcript);
          } else {
            interimTranscript += transcript;
          }
        }
        setTranscript(interimTranscript);
        setVolume(Math.random() * 100);
      };

      recognition.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        toast({
          title: "Speech Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive",
        });
        setListening(false);
      };
    } else {
      toast({
        title: "Browser Not Supported",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, [toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleListening = () => {
    if (listening && recognition.current) {
      recognition.current.stop();
    } else if (recognition.current) {
      recognition.current.start();
    }
  };

  const detectCommandType = (text: string): CommandType => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('weather')) return 'weather';
    if (lowerText.includes('hello') || lowerText.includes('hi')) return 'greeting';
    if (lowerText.includes('time') || lowerText.includes('date')) return 'time';
    if (lowerText.includes('joke')) return 'joke';
    if (lowerText.includes('news')) return 'news';
    if (lowerText.includes('remind') || lowerText.includes('reminder')) return 'reminder';
    if (lowerText.includes('note')) return 'note';
    if (lowerText.includes('search') || lowerText.includes('find')) return 'search';
    if (lowerText.includes('open') || lowerText.includes('volume')) return 'systemCommand';
    
    return 'unknown';
  };

  const handlePersonalityChange = (personality: PersonalityType) => {
    setCurrentPersonality(personality);
    toast({
      title: "Personality Changed",
      description: `EchoNova now has a ${personality} personality.`,
    });
  };

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    const commandType = detectCommandType(text);
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
      type: commandType
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setTranscript("");
    setProcessing(true);

    try {
      const response = await processCommand(text.trim());
      
      let data = null;
      if (commandType === 'reminder') {
        data = { reminders: getReminders() };
        setActiveCommand({ type: 'reminder', data });
      } else if (commandType === 'note') {
        data = { notes: getNotes() };
        setActiveCommand({ type: 'note', data });
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: "assistant",
        timestamp: new Date(),
        type: response.type,
        data: response.data || data
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      if (['reminder', 'note', 'systemCommand'].includes(response.type)) {
        toast({
          title: response.type === 'reminder' ? 'Reminder Added' : 
                 response.type === 'note' ? 'Note Saved' : 'System Command',
          description: response.response,
        });
      }
      
      if (response.type === 'aiChat') {
        setCurrentPersonality(getPersonality());
      }
    } catch (error) {
      console.error("Error processing command:", error);
      toast({
        title: "Processing Error",
        description: "Sorry, I had trouble processing that request.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInputRef.current?.value) {
      handleUserMessage(messageInputRef.current.value);
      messageInputRef.current.value = "";
    }
  };

  const showCommandExamples = () => {
    const examples = [
      "What time is it?",
      "Tell me a joke",
      "Remind me to call John tomorrow",
      "Take a note: Buy groceries after work",
      "My name is Alex",
      "How are you doing today?"
    ];
    
    return (
      <div className="text-sm text-gray-500 mt-4">
        <p className="font-medium mb-1">Try saying:</p>
        <ul className="space-y-1">
          {examples.map((example, index) => (
            <li key={index} className="cursor-pointer hover:text-nova-primary transition-colors"
                onClick={() => messageInputRef.current ? (messageInputRef.current.value = example) : null}>
              "{example}"
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderMessageExtra = (message: Message) => {
    if (message.sender === "assistant" && message.data && message.type) {
      return <CommandDisplay type={message.type} data={message.data} />;
    }
    return null;
  };

  return (
    <div className="flex flex-col space-y-4 w-full max-w-2xl mx-auto h-[80vh]">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-nova-primary animate-pulse"></div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-nova-primary to-nova-secondary bg-clip-text text-transparent">
            EchoNova
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <PersonalitySelector onSelect={handlePersonalityChange} />
          <div className="text-sm text-gray-500">
            {listening ? "Listening..." : processing ? "Processing..." : "Ready"}
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs border-nova-light"
          onClick={() => handleUserMessage("What time is it?")}
        >
          <Clock className="h-3 w-3 mr-1" /> Time
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs border-nova-light"
          onClick={() => handleUserMessage("Tell me a joke")}
        >
          😂 Joke
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs border-nova-light"
          onClick={() => handleUserMessage("What are my reminders?")}
        >
          <Clock className="h-3 w-3 mr-1" /> Reminders
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs border-nova-light"
          onClick={() => handleUserMessage("Show my notes")}
        >
          <FileText className="h-3 w-3 mr-1" /> Notes
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 rounded-md bg-gray-50 dark:bg-gray-900">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <Card
                  className={`max-w-[80%] p-3 ${
                    message.sender === "user"
                      ? "bg-nova-primary text-white"
                      : "bg-white border-nova-light"
                  }`}
                >
                  <p>{message.text}</p>
                  <div
                    className={`text-xs mt-1 ${
                      message.sender === "user" ? "text-nova-light" : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </Card>
              </div>
              {renderMessageExtra(message)}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {listening && (
        <div className="relative p-4 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-fadeIn">
          <div className="flex justify-center items-center h-20">
            <VoiceVisualizer active={listening} />
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            {transcript || "Listening..."}
          </div>
          <Progress value={volume} className="mt-2" />
        </div>
      )}
      
      {!listening && messages.length < 3 && showCommandExamples()}
      
      <div className="flex space-x-2">
        <Button
          onClick={toggleListening}
          variant={listening ? "destructive" : "default"}
          size="icon"
          className={`rounded-full ${listening ? "bg-red-500 hover:bg-red-600" : "bg-nova-primary hover:bg-nova-secondary"}`}
        >
          {listening ? <MicOff /> : <Mic />}
        </Button>
        
        <form onSubmit={handleTextSubmit} className="flex-1 flex">
          <input
            ref={messageInputRef}
            type="text"
            placeholder="Type a message..."
            className="flex-1 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-nova-primary px-4 py-2"
          />
          <Button 
            type="submit" 
            className="rounded-l-none bg-nova-primary hover:bg-nova-secondary"
          >
            <Send size={18} />
          </Button>
        </form>
        
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-gray-300 dark:border-gray-700"
        >
          <Volume2 />
        </Button>
      </div>
    </div>
  );
};

export default VoiceAssistant;
