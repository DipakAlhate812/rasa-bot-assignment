// src/app/page.jsx
'use client';

import { useRouter } from 'next/navigation';
import FloatingChatButton from './components/bot-floating-button/bot-floating-button';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className='home-page'>
      <h1 className='heading-home'>Welcome to Victories Over Dreams</h1>
      <p className='note-home'>Note: This will be shifted and deployed on actual website for assignment 2.</p>
      <FloatingChatButton/>
    </main>
  );
}
