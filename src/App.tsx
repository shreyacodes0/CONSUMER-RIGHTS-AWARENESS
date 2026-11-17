import React, { useState, useEffect } from 'react';
import { PredefinedProblem, LegalResource } from './types';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProblemModal } from './components/ProblemModal';
import { HomePage } from './pages/HomePage';
import { ProblemsPage } from './pages/ProblemsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ChatPage } from './pages/ChatPage';
import { AboutPage } from './pages/AboutPage';

export default function App() {
  // Theme state: default to refined warm paper Light theme unless explicitly set to dark
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('nyayadesk_theme');
    if (saved) return saved === 'dark';
    return false;
  });

  // Navigation state
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Predefined problems and legal resources state
  const [problems, setProblems] = useState<PredefinedProblem[]>([]);
  const [resources, setResources] = useState<LegalResource[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<PredefinedProblem | null>(null);
  const [pendingChatQuery, setPendingChatQuery] = useState<string>('');

  // Sync theme to DOM (both html and body)
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDark) {
      root.classList.add('dark');
      body.classList.add('dark');
      root.style.colorScheme = 'dark';
      localStorage.setItem('nyayadesk_theme', 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.style.colorScheme = 'light';
      localStorage.setItem('nyayadesk_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Fetch initial problems and resources from backend
  useEffect(() => {
    fetch('/api/problems')
      .then((res) => res.json())
      .then((data) => setProblems(data))
      .catch((err) => console.error('Failed to load problems:', err));

    fetch('/api/resources')
      .then((res) => res.json())
      .then((data) => setResources(data))
      .catch((err) => console.error('Failed to load resources:', err));
  }, []);

  const handleAskQuestionFromOutside = (query: string) => {
    setPendingChatQuery(query);
    setCurrentTab('chat');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4EBDD] text-[#352820] dark:bg-[#252421] dark:text-[#E8E0D6] transition-colors duration-200">
      {/* Top Banner Notice */}
      <DisclaimerBanner />

      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      {/* Main Page Content */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6">
        {currentTab === 'home' && (
          <HomePage
            problems={problems}
            resources={resources}
            onSelectProblem={setSelectedProblem}
            onAskQuestion={handleAskQuestionFromOutside}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'problems' && (
          <ProblemsPage
            problems={problems}
            onSelectProblem={setSelectedProblem}
            onAskInChat={handleAskQuestionFromOutside}
          />
        )}

        {currentTab === 'resources' && (
          <ResourcesPage resources={resources} />
        )}

        {currentTab === 'chat' && (
          <div className="py-6">
            <ChatPage
              initialQuery={pendingChatQuery}
              onClearInitialQuery={() => setPendingChatQuery('')}
            />
          </div>
        )}

        {currentTab === 'about' && (
          <AboutPage />
        )}
      </main>

      {/* Interactive Problem Modal */}
      <ProblemModal
        problem={selectedProblem}
        onClose={() => setSelectedProblem(null)}
        onAskInChat={handleAskQuestionFromOutside}
      />

      {/* Footer */}
      <Footer setCurrentTab={setCurrentTab} />
    </div>
  );
}
