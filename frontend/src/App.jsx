import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Info from './pages/Info';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage or default to true
    const saved = localStorage.getItem('isDarkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <div className={`${isDarkMode ? 'dark' : ''} h-screen w-screen overflow-hidden bg-background text-foreground relative`}>
        {/* Modern Ambient Background Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-primary/8 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-chart-2/8 blur-[150px] rounded-full pointer-events-none" />

        {/* Main layout: sidebar + right column, all within fixed h-screen */}
        <div className="relative z-10 flex h-full w-full">
          {/* Sidebar: fixed width, never scrolls */}
          <Sidebar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

          {/* Right column: page content */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            {/* Page area: this is the ONLY element that scrolls */}
            <main className="flex-1 min-h-0 overflow-y-auto p-8">
              <div className="max-w-6xl mx-auto w-full h-full">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/Info" element={<Info />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

