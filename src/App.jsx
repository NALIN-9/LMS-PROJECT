import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ROLES } from './utils/constants';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/CoursesPage';
import UsersPage from './pages/UsersPage';
import AssignmentsPage from './pages/AssignmentsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ContentPage from './pages/ContentPage';
import GamesPage from './pages/GamesPage';
import CalendarPage from './pages/CalendarPage';
import QuizPage from './pages/QuizPage';
import MessagesPage from './pages/MessagesPage';
import './index.css';

function AppShell() {
  const { currentUser, logout } = useApp();
  const canAccessQuiz = [ROLES.ADMIN, ROLES.STUDENT].includes(currentUser?.role);
  const [activePage, setActivePage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentUser) {
    return <AuthPage onLogin={() => { }} onSignup={() => { }} />;
  }

  const handleLogout = () => {
    logout();
    setActivePage('dashboard');
  };

  const pageMap = {
    dashboard: <Dashboard />,
    courses: <CoursesPage activePage={activePage} searchQuery={searchQuery} />,
    'my-courses': <CoursesPage activePage={activePage} searchQuery={searchQuery} />,
    users: <UsersPage searchQuery={searchQuery} />,
    assignments: <AssignmentsPage />,
    announcements: <AnnouncementsPage />,
    analytics: <AnalyticsPage />,
    settings: <SettingsPage />,
    about: <AboutPage />,
    contact: <ContactPage />,
    content: <ContentPage />,
    games: <GamesPage />,
    calendar: <CalendarPage />,
    quiz: canAccessQuiz ? <QuizPage /> : <Dashboard />,
    messages: <MessagesPage />,
  };


  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} />
      <main className="main-content">
        <TopHeader activePage={activePage} setActivePage={setActivePage} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="page-content">
          {pageMap[activePage] ?? <Dashboard />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
