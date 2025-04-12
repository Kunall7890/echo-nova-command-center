
import { CommandType, CommandResponse, Reminder, Note, SystemCommand } from "@/types/commands";

// Simulated data storage (would be replaced with localStorage or database in a real implementation)
let reminders: Reminder[] = [];
let notes: Note[] = [];

// Enhanced NLP to detect command intent
const detectIntent = (text: string): CommandType => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('weather') || lowerText.includes('temperature') || lowerText.includes('forecast')) {
    return 'weather';
  }
  
  if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
    return 'greeting';
  }
  
  if (lowerText.includes('time') || lowerText.includes('date') || lowerText.includes('day')) {
    return 'time';
  }
  
  if (lowerText.includes('joke') || lowerText.includes('funny')) {
    return 'joke';
  }
  
  if (lowerText.includes('news') || lowerText.includes('headlines') || lowerText.includes('current events')) {
    return 'news';
  }
  
  if (lowerText.includes('remind') || lowerText.includes('reminder') || 
      lowerText.includes('remember') || lowerText.includes('don\'t forget')) {
    return 'reminder';
  }
  
  if (lowerText.includes('note') || lowerText.includes('write down') || 
      lowerText.includes('save this') || lowerText.includes('record')) {
    return 'note';
  }
  
  if (lowerText.includes('search') || lowerText.includes('find') || 
      lowerText.includes('look up') || lowerText.includes('google')) {
    return 'search';
  }
  
  if (lowerText.includes('open') || lowerText.includes('launch') || 
      lowerText.includes('start') || lowerText.includes('run') ||
      lowerText.includes('volume') || lowerText.includes('brightness') ||
      lowerText.includes('wifi') || lowerText.includes('turn')) {
    return 'systemCommand';
  }
  
  return 'unknown';
};

// Parse system commands
const parseSystemCommand = (text: string): SystemCommand | null => {
  const lowerText = text.toLowerCase();
  
  // Volume control
  if (lowerText.includes('volume')) {
    if (lowerText.includes('up') || lowerText.includes('increase')) {
      return { action: 'volume', value: 10 }; // Increase by 10%
    } else if (lowerText.includes('down') || lowerText.includes('decrease')) {
      return { action: 'volume', value: -10 }; // Decrease by 10%
    } else if (lowerText.includes('mute')) {
      return { action: 'volume', value: 0 }; // Mute
    } else {
      // Try to extract a specific volume level
      const match = lowerText.match(/volume (?:to |at |set to |)(\d+)(?:%| percent|)/);
      if (match && match[1]) {
        return { action: 'volume', value: parseInt(match[1], 10) };
      }
    }
  }
  
  // App control (simplified)
  if (lowerText.includes('open') || lowerText.includes('launch') || lowerText.includes('start')) {
    const appMatches = [
      { keywords: ['browser', 'chrome', 'firefox', 'safari', 'edge'], app: 'browser' },
      { keywords: ['music', 'spotify'], app: 'spotify' },
      { keywords: ['mail', 'email', 'outlook', 'gmail'], app: 'email' },
      { keywords: ['calendar'], app: 'calendar' },
      { keywords: ['calculator'], app: 'calculator' },
      { keywords: ['notepad', 'notes'], app: 'notepad' }
    ];
    
    for (const appMatch of appMatches) {
      if (appMatch.keywords.some(keyword => lowerText.includes(keyword))) {
        return { action: 'app', parameter: appMatch.app };
      }
    }
  }
  
  return null;
};

// Parse reminders
const parseReminder = (text: string): string | null => {
  const lowerText = text.toLowerCase();
  
  // Extract the reminder text
  let reminderText = '';
  
  if (lowerText.includes('remind me to ')) {
    reminderText = text.split('remind me to ')[1];
  } else if (lowerText.includes('reminder to ')) {
    reminderText = text.split('reminder to ')[1];
  } else if (lowerText.includes('remember to ')) {
    reminderText = text.split('remember to ')[1];
  } else {
    reminderText = text.replace(/reminder|remind|remember/gi, '').trim();
  }
  
  return reminderText || null;
};

// Parse notes
const parseNote = (text: string): string | null => {
  const lowerText = text.toLowerCase();
  
  // Extract the note text
  let noteText = '';
  
  if (lowerText.includes('take a note ')) {
    noteText = text.split('take a note ')[1];
  } else if (lowerText.includes('write down ')) {
    noteText = text.split('write down ')[1];
  } else if (lowerText.includes('note that ')) {
    noteText = text.split('note that ')[1];
  } else {
    noteText = text.replace(/note|write down|record/gi, '').trim();
  }
  
  return noteText || null;
};

// Generate responses based on intent
const generateResponse = (intent: CommandType, text: string): CommandResponse => {
  switch (intent) {
    case 'weather':
      return {
        type: 'weather',
        response: "I'm sorry, I don't have access to weather data yet. In a full implementation, I would connect to a weather API to provide current conditions and forecasts."
      };
    
    case 'greeting':
      const greetings = [
        "Hello! How can I assist you today?",
        "Hi there! What can I do for you?",
        "Hey! I'm here to help. What do you need?",
        "Greetings! How may I be of service?",
      ];
      return {
        type: 'greeting',
        response: greetings[Math.floor(Math.random() * greetings.length)]
      };
    
    case 'time':
      const now = new Date();
      return {
        type: 'time',
        response: `The current time is ${now.toLocaleTimeString()} and today is ${now.toLocaleDateString()}.`,
        data: { time: now.toLocaleTimeString(), date: now.toLocaleDateString() }
      };
    
    case 'joke':
      const jokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "Why did the scarecrow win an award? Because he was outstanding in his field!",
        "What do you call a fake noodle? An impasta!",
        "How does a penguin build its house? Igloos it together!",
        "Why don't eggs tell jokes? They'd crack each other up!",
        "Why did the bicycle fall over? Because it was two-tired!",
        "What's orange and sounds like a parrot? A carrot!",
        "How do you organize a space party? You planet!",
      ];
      return {
        type: 'joke',
        response: jokes[Math.floor(Math.random() * jokes.length)]
      };
    
    case 'news':
      return {
        type: 'news',
        response: "I'm sorry, I don't have access to news data yet. In a full implementation, I would connect to a news API to provide the latest headlines."
      };
    
    case 'reminder':
      const reminderText = parseReminder(text);
      if (reminderText) {
        const newReminder: Reminder = {
          id: Date.now().toString(),
          text: reminderText,
          timestamp: new Date(),
          completed: false
        };
        reminders.push(newReminder);
        return {
          type: 'reminder',
          response: `I've added a reminder: "${reminderText}"`,
          data: { reminders }
        };
      } else {
        if (reminders.length === 0) {
          return {
            type: 'reminder',
            response: "You don't have any reminders yet.",
            data: { reminders }
          };
        } else {
          return {
            type: 'reminder',
            response: `You have ${reminders.length} reminder${reminders.length > 1 ? 's' : ''}.`,
            data: { reminders }
          };
        }
      }
    
    case 'note':
      const noteText = parseNote(text);
      if (noteText) {
        const newNote: Note = {
          id: Date.now().toString(),
          text: noteText,
          timestamp: new Date()
        };
        notes.push(newNote);
        return {
          type: 'note',
          response: `I've saved your note: "${noteText}"`,
          data: { notes }
        };
      } else {
        if (notes.length === 0) {
          return {
            type: 'note',
            response: "You don't have any notes yet.",
            data: { notes }
          };
        } else {
          return {
            type: 'note',
            response: `You have ${notes.length} note${notes.length > 1 ? 's' : ''}.`,
            data: { notes }
          };
        }
      }
    
    case 'search':
      const searchQuery = text.replace(/search|find|look up|google/gi, '').trim();
      return {
        type: 'search',
        response: `I would search for "${searchQuery}" in a full implementation.`,
        data: { query: searchQuery }
      };
    
    case 'systemCommand':
      const systemCommand = parseSystemCommand(text);
      if (systemCommand) {
        if (systemCommand.action === 'volume') {
          if (systemCommand.value !== undefined) {
            if (systemCommand.value === 0) {
              return {
                type: 'systemCommand',
                response: "I've muted the volume.",
                data: { command: systemCommand }
              };
            } else if (systemCommand.value > 0 && systemCommand.value <= 100) {
              return {
                type: 'systemCommand',
                response: `I've set the volume to ${systemCommand.value}%.`,
                data: { command: systemCommand }
              };
            } else if (systemCommand.value > 0) {
              return {
                type: 'systemCommand',
                response: "I've increased the volume.",
                data: { command: systemCommand }
              };
            } else {
              return {
                type: 'systemCommand',
                response: "I've decreased the volume.",
                data: { command: systemCommand }
              };
            }
          }
        } else if (systemCommand.action === 'app' && systemCommand.parameter) {
          return {
            type: 'systemCommand',
            response: `I would open ${systemCommand.parameter} in a full implementation.`,
            data: { command: systemCommand }
          };
        }
      }
      
      return {
        type: 'systemCommand',
        response: "I understand you want to perform a system action. In a full implementation, I would be able to open applications or perform system commands."
      };
    
    case 'unknown':
    default:
      return {
        type: 'unknown',
        response: "I'm not sure how to respond to that. In a full implementation, I would connect to an AI model like GPT to provide more intelligent responses."
      };
  }
};

// Main function to process commands
export const processCommand = async (text: string): Promise<string> => {
  // Add a small delay to simulate processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const intent = detectIntent(text);
  const responseObj = generateResponse(intent, text);
  
  return responseObj.response;
};

// Get all reminders
export const getReminders = (): Reminder[] => {
  return [...reminders];
};

// Add a reminder
export const addReminder = (text: string): Reminder => {
  const newReminder: Reminder = {
    id: Date.now().toString(),
    text,
    timestamp: new Date(),
    completed: false
  };
  reminders.push(newReminder);
  return newReminder;
};

// Get all notes
export const getNotes = (): Note[] => {
  return [...notes];
};

// Add a note
export const addNote = (text: string): Note => {
  const newNote: Note = {
    id: Date.now().toString(),
    text,
    timestamp: new Date()
  };
  notes.push(newNote);
  return newNote;
};

// In a real implementation, additional functions would be added for:
// - API connections (OpenAI, weather, news, etc.)
// - System command execution
// - User preferences and context storage
// - Chaining commands and maintaining conversation context
