
import { ChatMemory, PersonalityType } from "@/types/commands";

// Initialize default chat memory
const defaultChatMemory: ChatMemory = {
  recentInteractions: [],
  preferences: {},
  personality: 'default'
};

// In-memory storage (would be localStorage in a real implementation)
let chatMemory: ChatMemory = { ...defaultChatMemory };

// Get the current chat memory
export const getChatMemory = (): ChatMemory => {
  return { ...chatMemory };
};

// Add a new interaction to the memory
export const addInteraction = (userMessage: string, aiResponse: string): void => {
  chatMemory.recentInteractions.push({
    userMessage,
    aiResponse,
    timestamp: new Date()
  });
  
  // Limit memory to last 10 interactions
  if (chatMemory.recentInteractions.length > 10) {
    chatMemory.recentInteractions.shift();
  }
};

// Set user name
export const setUserName = (name: string): void => {
  chatMemory.userName = name;
};

// Get user name
export const getUserName = (): string | undefined => {
  return chatMemory.userName;
};

// Set a user preference
export const setPreference = (key: string, value: any): void => {
  chatMemory.preferences[key] = value;
};

// Get a user preference
export const getPreference = (key: string): any => {
  return chatMemory.preferences[key];
};

// Set the AI personality
export const setPersonality = (personality: PersonalityType): void => {
  chatMemory.personality = personality;
};

// Get the current AI personality
export const getPersonality = (): PersonalityType => {
  return chatMemory.personality;
};

// Reset the chat memory
export const resetChatMemory = (): void => {
  chatMemory = { ...defaultChatMemory };
};

// Get personality-specific response patterns
export const getPersonalityResponses = (personality: PersonalityType): Record<string, string[]> => {
  const personalities: Record<PersonalityType, Record<string, string[]>> = {
    'default': {
      greeting: [
        "Hello! How can I help you today?",
        "Hi there! What can I do for you?",
        "Hey! I'm here to assist you."
      ],
      farewell: [
        "Goodbye! Have a great day!",
        "See you later!",
        "Bye for now! Let me know if you need anything else."
      ],
      thinking: [
        "I'm thinking about that...",
        "Let me process that for a moment...",
        "Working on it..."
      ],
      error: [
        "I'm sorry, I couldn't process that request.",
        "Something went wrong. Could you try again?",
        "I encountered an error with that request."
      ]
    },
    'formal': {
      greeting: [
        "Good day. How may I be of assistance?",
        "Greetings. How may I help you today?",
        "Welcome. What services can I provide for you?"
      ],
      farewell: [
        "Farewell. It has been a pleasure serving you.",
        "Goodbye. Please do not hesitate to request assistance in the future.",
        "I bid you goodbye. Have an excellent day."
      ],
      thinking: [
        "I am processing your request...",
        "Please allow me a moment to analyze...",
        "Computing appropriate response..."
      ],
      error: [
        "I regret to inform you that I am unable to process your request.",
        "An error has occurred. Would you kindly try again?",
        "I apologize for the inconvenience, but I cannot complete that task."
      ]
    },
    'funny': {
      greeting: [
        "Hey there! Ready to have some fun with your digital buddy?",
        "What's cookin', good lookin'? Need some AI assistance?",
        "Helloooo! Your favorite assistant is here to save the day!"
      ],
      farewell: [
        "See ya later, alligator! Don't forget to tip your virtual assistant!",
        "Bye bye! I'll be here all week... and forever, actually.",
        "That's all folks! I'm going back to my digital hammock."
      ],
      thinking: [
        "Hold your horses while my brain cells do the electric slide...",
        "Hmm, let me think... *insert dial-up modem noises*",
        "Brain.exe is processing... please standby for brilliance!"
      ],
      error: [
        "Whoopsie daisy! I tripped over some code. Mind trying again?",
        "Well, this is awkward... I seem to have forgotten how to assistant. Can we start over?",
        "Error 404: Good response not found. Let's reboot this conversation!"
      ]
    },
    'tony_stark': {
      greeting: [
        "Well, look who decided to show up. What can I do for you today?",
        "Welcome back. What genius-level assistance do you need?",
        "Hey there. Ready to change the world, or just checking in?"
      ],
      farewell: [
        "I'm out. Try not to miss me too much.",
        "Catch you on the flip side. I've got other groundbreaking things to do.",
        "And that's how it's done. Stark out."
      ],
      thinking: [
        "Give me a second, even genius takes time occasionally...",
        "Processing... and yes, I can do this all day.",
        "Running the numbers... this should be interesting."
      ],
      error: [
        "Uh, that didn't work. Not that I make mistakes, but maybe try something else?",
        "Even I can't make that happen. Let's try something within the realm of possibility.",
        "Look, I'm good, but not that good. Try again with something I can actually work with."
      ]
    }
  };
  
  return personalities[personality];
};

// Generate a personality-specific response
export const generatePersonalityResponse = (
  personality: PersonalityType, 
  responseType: 'greeting' | 'farewell' | 'thinking' | 'error'
): string => {
  const responses = getPersonalityResponses(personality)[responseType];
  return responses[Math.floor(Math.random() * responses.length)];
};
