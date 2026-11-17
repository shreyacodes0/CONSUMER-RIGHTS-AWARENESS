import React from 'react';
import { Scale, Sun, Moon, MessageSquare, BookOpen, Layers, Info, Menu, X, CheckSquare } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isDark,
  toggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'problems', label: 'Common Problems' },
    { id: 'resources', label: 'Legal Resources' },
    { id: 'chat', label: 'Ask NyayaDesk' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#D6C8B5] bg-[#F4EBDD]/95 backdrop-blur-sm dark:border-[#171614] dark:bg-[#252421]/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Wordmark */}
        <button
          onClick={() => {
            setCurrentTab('home');
            setMobileMenuOpen(false);
          }}
          className="group flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center border border-[#D6C8B5] bg-[#FFFCF7] text-[#5B3A29] dark:border-[#171614] dark:bg-[#382D25] dark:text-[#DC957D]">
            <Scale className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <span className="font-editorial text-xl font-bold tracking-tight text-[#352820] dark:text-[#E8E0D6]">
              NyayaDesk
            </span>
            <span className="hidden text-xs text-[#75685E] sm:block dark:text-[#B9ADA0]">
              Legal Information & Consumer Awareness · India
            </span>
          </div>
        </button>

        {/* Desktop Navigation & Actions */}
        <div className="flex items-center">
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`relative py-1 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#5B3A29] dark:text-[#DC957D]'
                      : 'text-[#75685E] hover:text-[#352820] dark:text-[#B9ADA0] dark:hover:text-[#E8E0D6]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#5B3A29] dark:bg-[#DC957D]"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Theme Toggle & Mobile Button with distinct separation from About */}
          <div className="flex items-center gap-2 md:ml-8 md:pl-6 md:border-l md:border-[#D6C8B5] dark:md:border-[#171614]">
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              title={isDark ? 'Switch to light theme (warm paper)' : 'Switch to dark theme'}
              className="flex h-9 w-9 items-center justify-center border border-[#D6C8B5] bg-[#FFFCF7] text-[#352820] transition-colors hover:border-[#5B3A29] dark:border-[#171614] dark:bg-[#382D25] dark:text-[#E8E0D6] dark:hover:border-[#DC957D]"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-[#DC957D]" />
              ) : (
                <Moon className="h-4 w-4 text-[#5B3A29]" />
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="flex h-9 w-9 items-center justify-center border border-[#D6C8B5] bg-[#FFFCF7] text-[#352820] md:hidden dark:border-[#171614] dark:bg-[#382D25] dark:text-[#E8E0D6]"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-[#D6C8B5] bg-[#FFFCF7] px-4 py-3 md:hidden dark:border-[#171614] dark:bg-[#382D25]">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`py-2 text-left text-sm font-medium ${
                  currentTab === item.id
                    ? 'text-[#5B3A29] font-bold dark:text-[#DC957D]'
                    : 'text-[#75685E] dark:text-[#B9ADA0]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-[#D6C8B5] pt-2 dark:border-[#171614]">
              <span className="text-xs text-[#75685E] dark:text-[#B9ADA0]">Appearance</span>
              <button
                onClick={toggleTheme}
                className="inline-flex items-center gap-1.5 border border-[#D6C8B5] bg-[#F4EBDD] px-2.5 py-1 text-xs font-semibold text-[#352820] dark:border-[#171614] dark:bg-[#252421] dark:text-[#E8E0D6]"
              >
                {isDark ? <Sun className="h-3.5 w-3.5 text-[#DC957D]" /> : <Moon className="h-3.5 w-3.5 text-[#5B3A29]" />}
                <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
