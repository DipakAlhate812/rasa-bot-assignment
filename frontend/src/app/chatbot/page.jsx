"use client"
import React, { useState, useEffect, useRef } from 'react';
import crypto from 'crypto';  // Import crypto for generating unique IDs
import "./assistant.css"
import { FiExternalLink } from 'react-icons/fi';
import { FaMicrophone, FaStop, FaVolumeUp } from 'react-icons/fa';

const quickOptions_Eng = [
  { label: "Take a tour", message: "Start the tour" },
  { label: "Get offer", message: "Do you have any offer?" },
  { label: "Get Contact support", message: "I need support" },
  { label: "Share feedback & Testimonial", message: "I want to share my feedback" }
];

const quickOptions_hindi = [
  { label: "एक टूर लें", message: "टूर शुरू करें" },
  { label: "ऑफर प्राप्त करें", message: "क्या आपके पास कोई ऑफर है?" },
  { label: "संपर्क करें", message: "मुझे सहायता चाहिए" },
  { label: "रेटिंग ", message: "मैं अपनी प्रतिक्रिया साझा करना चाहता हूँ" }
];

export default function AssistantPage() {
  const [speechLang, setSpeechLang] = useState('en-US'); // default is English

  const [messages, setMessages] = useState([getInitialMessage(speechLang)]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [userId, setUserId] = useState(null);
  const [voiceAssistant, setVoiceAssistant] = useState(false);
  const [speechBuffer, setSpeechBuffer] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);
  
  const [botSpeechText, setBotSpeechText] = useState("");

  const recognitionRef = useRef(null);
  useEffect(() => {
    const loadVoices = () => {
      let voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        setAvailableVoices(voices);
      } else {
        // Fallback for browsers that delay voice loading
        setTimeout(loadVoices, 100); 
      }
    };
  
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [speechLang]);

  // Initialize userId if it's not already set
  useEffect(() => {
    if (!userId) {
      const id = crypto.randomBytes(16).toString('hex');  // Generate a unique user ID
      setUserId(id);
    }
  }, [userId]);

  const sendMessageToRasa = async (message, sender = userId) => {
    const selectedLang = speechLang === 'hi-IN' ? 'hi' : 'en';
  
    let port;
    if (selectedLang === 'en') {
      port = 5046; 
    } else {
      port = 5045; 
    }
    const response = await fetch(`http://localhost:${port}/webhooks/rest/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender,
        message,
        metadata: {
          language: selectedLang
        }
      })
    });
  
    const data = await response.json();
    return data;
  };
  

  const handleUserMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = { sender: userId, text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setLoading(true);
    setTypingText('⌛ Typing...');

    try {
      const rasaResponses = await sendMessageToRasa(messageText);
 
      let combinedText = '';
      for (const res of rasaResponses) {
        if (res.text) {
          combinedText += res.text + ' ';
          setBotSpeechText(combinedText)
          const linkRegex = /(https:\/\/www\.victoriesoverdreams\.com\/[^\s\)]+)(?=\s|\)|$)/g;
          const youtubeLinkRegex = /(https:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/)[\w-]+)/g;

          if (youtubeLinkRegex.test(res.text)) {
            const youtubeLinks = res.text.match(youtubeLinkRegex);
            setMessages(prev => [...prev, { sender: 'bot', text: res.text, youtubeLinks, isVideo: true }]);
          } else if (linkRegex.test(res.text)) {
            const links = res.text.match(linkRegex);
            setMessages(prev => [...prev, { sender: 'bot', text: res.text + "\n\nHere's a link for you:", links }]);
          } else {
            setMessages(prev => [...prev, { sender: 'bot', text: res.text }]);
          }
        }
      }
      
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: "⚠️ Oops! Something went wrong talking to the assistant." }]);
    }

    setTypingText('');
    setLoading(false);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const message = voiceAssistant ? speechBuffer : userInput;
    if (!message.trim()) return;
  
    await handleUserMessage(message);
    setSpeechBuffer('');
    setUserInput('');
  };
  

  const getSenderClass = (sender) => {
    return sender === userId ? 'user' : 'bot';
  };

  const startListening = () => {
    if (!voiceAssistant) {
      setVoiceAssistant(true);
      setSpeechBuffer('');

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Speech Recognition not supported in this browser.');
        return;
      }
  
      const recognition = new SpeechRecognition();
      recognition.lang = speechLang;
      recognition.interimResults = false;
  
      recognition.onresult = async (event) => {
        const fullTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ')
          .trim()
          .toLowerCase();
      
      
        if (fullTranscript.endsWith("send")) {
          const confirmedMessage = fullTranscript.replace(/send$/, '').trim();
          
          if (confirmedMessage) {
            await handleUserMessage(confirmedMessage);
          }
      
          setSpeechBuffer('');
          setUserInput('');
      
          recognition.stop(); // safe stop — wait for .onend to restart
      
          recognition.onend = () => {
            recognition.start(); // restart safely
          };
      
        } else if (fullTranscript.endsWith("भेजो")) {
          const confirmedMessage = fullTranscript.replace(/भेजो$/, '').trim();
        
          if (confirmedMessage) {
            await handleUserMessage(confirmedMessage);
          }
        
          setSpeechBuffer('');
          setUserInput('');
        
          recognition.stop(); // safe stop — wait for .onend to restart
        
          recognition.onend = () => {
            recognition.start(); // restart safely
          };
        }
        else if (fullTranscript.endsWith("clear")) {
          setSpeechBuffer('');
          setUserInput('');
      
          recognition.stop();
      
          recognition.onend = () => {
            recognition.start(); // restart safely
          };
      
        } else {
          setSpeechBuffer(fullTranscript);
          setUserInput(fullTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
      
        if (event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'network') {
          // Gracefully recover: restart listening
          recognition.stop();
      
          recognition.onend = () => {
            // Restart only if voice mode is still active
            if (voiceAssistant) {
              recognition.start();
            }
          };
        } else {
          // For other errors, optionally stop
          alert('No Message listened. Turning off mic.');
          recognition.stop();
          setVoiceAssistant(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } else {
      setVoiceAssistant(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    }
  };
  

  // Text-to-speech
  const speakText = () => {
    if (!window.speechSynthesis) {
      alert('Text-to-Speech not supported in this browser.');
      return;
    }
    const lastMessage = messages[messages.length - 1]?.text;
    if (!lastMessage) return;
  
  
    const voices = window.speechSynthesis.getVoices();
      if (voices.length && availableVoices.length !== voices.length) {
        setAvailableVoices(voices);  // Keep it updated just in case
      }

  
    // Determine language and pick appropriate voice
    const lang = speechLang === 'hi-IN' ? 'hi-IN' : 'en-US';
    const selectedVoice = availableVoices.find(voice => 
      voice.lang === lang || 
      (lang === 'hi-IN' && voice.name === 'Google हिन्दी') ||
      (lang === 'en-US' && voice.name === 'Google US English')
    ) || voices[0]; // fallback
  
    const utterance = new SpeechSynthesisUtterance(botSpeechText);
    utterance.lang = lang;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const stopText = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  return (
    <>
      <h1 className='heading-chatbot'>Welcome to Victories Over Dreams</h1>
      
      <main className="assistant-container">
        
        <div className="chat-bubble">
            {messages.map((msg, index) => (
            <span key={index} className={`chat-message ${getSenderClass(msg.sender)}` } >
              {msg.text}
              {/* Render YouTube video embed if it's a video link */}
              {msg.isVideo && msg.youtubeLinks && msg.youtubeLinks.map((videoLink, i) => (
                <div key={i} className="video-container">
                  <iframe
                    width="560"
                    height="315"
                    src={`https://www.youtube.com/embed/${new URL(videoLink).searchParams.get('v')}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ))}
              {/* Render normal links if found */}
              {msg.links && msg.links.map((link, i) => (
                <button 
                  key={i} 
                  className="open-link-btn" 
                  onClick={() => window.open(link, '_blank')}
                >
                  <FiExternalLink size={20} />
                </button>
              ))}
            </span>
          ))}

          {typingText && <p className="chat-message bot">{typingText}</p>}
          <div className="option-container">
            <ul className="option-list">
            {(speechLang === 'hi-IN' ? quickOptions_hindi : quickOptions_Eng).map((option, index) => (
                <li
                  key={index}
                  onClick={() => handleUserMessage(option.message)}
                  className='option-list-item'
                >
                  {option.label}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleUserSubmit} className="chat-input-form">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type a message..."
              className="chat-input"
            />
            
            <button
              className="mic-button"
              style={{ background: 'none', border: 'none', marginLeft: '-2rem', cursor: 'pointer' }}
              onClick={startListening}
            >
              <FaMicrophone size={20} color="#555" />
            </button>

            <button title="Change Language" onClick={() => setSpeechLang(speechLang === 'en-US' ? 'hi-IN' : 'en-US')}>
              {speechLang === 'en-US' ? 'Hindi' : 'English'}
            </button>
            <button className="mic-button" onClick={stopText} style={{ right: '40px' }}>
              <FaStop size={20} />
            </button>
            <button className="mic-button" onClick={speakText} style={{ right: '40px' }}>
              <FaVolumeUp size={20} />
            </button>
            <button type="submit" className="send-btn">Send</button>
          </form>
        </div>
      </main>
    </>
  );
}

const getInitialMessage = (lang) => {
  if (lang === 'hi-IN') {
    return {
      sender: 'bot',
      text: `👋 नमस्ते! मैं विक्टर हूँ — आपकी त्वरित मार्गदर्शिका और वर्चुअल सहायक। Victories Over Dreams में आपका स्वागत है!\nकृपया निम्न विकल्पों में से एक चुनें।`
    };
  } else {
    return {
      sender: 'bot',
      text: `👋 Hi there! I'm Victor. Your quick navigator and virtual assistant! Welcome to Victories Over Dreams.\nChoose from the following options.`
    };
  }
};
