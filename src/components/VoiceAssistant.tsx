
import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Volume2, Clock, FileText, Settings, Youtube, CloudSun, AppWindow, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import VoiceVisualizer from "./VoiceVisualizer";
import CommandDisplay from "./CommandDisplay";
import PersonalitySelector from "./PersonalitySelector";
import { processCommand, getReminders, getNotes, getPersonality } from "@/utils/commandProcessor";
import { CommandType, PersonalityType, VoiceSettings } from "@/types/commands";

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
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: true,
    volume: 1,
    rate: 1,
    pitch: 1,
    voice: null
  });
  const recognition = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const speechSynthesis = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const { toast } = useToast();

  // Initialize available voices
  useEffect(() => {
    if (speechSynthesis.current) {
      const updateVoices = () => {
        const voices = speechSynthesis.current?.getVoices() || [];
        if (voices.length > 0 && !voiceSettings.voice) {
          // Try to find an English voice
          const englishVoice = voices.find(voice => 
            voice.lang.includes('en') || voice.lang.includes('US')
          );
          setVoiceSettings(prev => ({
            ...prev,
            voice: englishVoice || voices[0]
          }));
        }
      };

      // Chrome requires this event listener
      speechSynthesis.current.onvoiceschanged = updateVoices;
      updateVoices();
    }
  }, []);

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
      
      // Clean up any ongoing speech
      if (speechSynthesis.current) {
        speechSynthesis.current.cancel();
      }
    };
  }, [toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakText = (text: string) => {
    if (!voiceSettings.enabled || !speechSynthesis.current) return;
    
    // Cancel any ongoing speech
    speechSynthesis.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply voice settings
    if (voiceSettings.voice) {
      utterance.voice = voiceSettings.voice;
    }
    
    utterance.volume = voiceSettings.volume;
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    
    speechSynthesis.current.speak(utterance);
  };

  const toggleVoice = () => {
    setVoiceSettings(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
    
    toast({
      title: voiceSettings.enabled ? "Voice Output Disabled" : "Voice Output Enabled",
      description: voiceSettings.enabled ? "Assistant will no longer speak responses." : "Assistant will now speak responses.",
    });
    
    // If disabling, stop any ongoing speech
    if (voiceSettings.enabled && speechSynthesis.current) {
      speechSynthesis.current.cancel();
    }
  };

  const toggleListening = () => {
    if (listening && recognition.current) {
      recognition.current.stop();
    } else if (recognition.current) {
      recognition.current.start();
    }
  };

  const detectCommandType = (text: string): CommandType => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('youtube') || lowerText.includes('play')) return 'youtube';
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
      
      // Speak the response if voice is enabled
      if (voiceSettings.enabled) {
        speakText(response.response);
      }
      
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

  const openYouTubeUrl = (url: string) => {
    window.open(url, '_blank');
  };

  const showCommandExamples = () => {
    const examples = [
      "What time is it?",
      "Tell me a joke",
      "What's the weather like today?",
      "Open Spotify",
      "Play a song on YouTube",
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
      if (message.type === 'youtube' && message.data.url) {
        return (
          <div className="mt-2 ml-2">
            <Button 
              size="sm" 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => openYouTubeUrl(message.data.url)}
            >
              <Youtube className="h-4 w-4 mr-1" /> Open YouTube
            </Button>
          </div>
        );
      }
      
      if (message.type === 'weather' && message.data.weather) {
        const { weather, location } = message.data;
        return (
          <Card className="mt-2 ml-2 p-3 max-w-xs bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 border-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{location === 'current' ? 'Current Location' : location}</p>
                <p className="text-2xl font-bold">{weather.temp}°C</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{weather.condition}</p>
              </div>
              <div className="bg-blue-400 dark:bg-blue-600 rounded-full p-2">
                <CloudSun className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <p>Humidity: {weather.humidity}%</p>
            </div>
          </Card>
        );
      }
      
      if (message.type === 'systemCommand' && message.data.command && message.data.command.action === 'app') {
        return (
          <div className="mt-2 ml-2 flex items-center text-sm text-gray-600">
            <AppWindow className="h-4 w-4 mr-1" /> 
            <span>App: {message.data.command.parameter}</span>
          </div>
        );
      }
      
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
          onClick={() => handleUserMessage("What's the weather like today?")}
        >
          <CloudSun className="h-3 w-3 mr-1" /> Weather
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs border-nova-light"
          onClick={() => handleUserMessage("Open Spotify")}
        >
          <AppWindow className="h-3 w-3 mr-1" /> Apps
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs border-nova-light"
          onClick={() => handleUserMessage("Play a song on YouTube")}
        >
          <Youtube className="h-3 w-3 mr-1" /> YouTube
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
          onClick={toggleVoice}
          variant="outline"
          size="icon"
          className={`rounded-full border-gray-300 dark:border-gray-700 ${!voiceSettings.enabled ? 'bg-gray-100' : ''}`}
          title={voiceSettings.enabled ? "Disable voice responses" : "Enable voice responses"}
        >
          {voiceSettings.enabled ? <Volume2 /> : <VolumeX />}
        </Button>
      </div>
    </div>
  );
};

export default VoiceAssistant;
