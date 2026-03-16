'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import "./bot-floating-button.css"

const FloatingChatButton = () => {
  const router = useRouter();
  const [showGreeting, setShowGreeting] = useState(false);
  const [animate, setAnimate] = useState(false);

  const handleClick = () => {
    router.push('/chatbot');
  };

  useEffect(() => {
    // Animate on load
    setAnimate(true);

    // Show greeting for 3 seconds
    setShowGreeting(true);
    const timer = setTimeout(() => setShowGreeting(false), 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>

      {/* Greeting Bubble */}
      {showGreeting && (
        <div
          className="greeting-message-home-screen" >
          👋 Hi there! I'm victor😉 Would like to take quick tour?
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={handleClick}
        className={`bot-btn-home-screen ${animate ? 'animate' : ''}`}
        style={{
            width: animate ? '60px' : '0px',
            height: animate ? '60px' : '0px',
            opacity: animate ? 1 : 0,
        }}
        aria-label="Open Assistant"
        title="Open Assistant"
        >
        💬
        </button>

    </>
  );
};

export default FloatingChatButton;
