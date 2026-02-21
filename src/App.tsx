import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import LoadingScreen from './components/LoadingScreen';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import BooksPage from './pages/BooksPage';
import LibraryPage from './pages/LibraryPage';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import PostEditorPage from './pages/PostEditorPage';
import BookEditorPage from './pages/BookEditorPage';
import LibraryUploadPage from './pages/LibraryUploadPage';
import ProfilePage from './pages/ProfilePage';
import AuthorPage from './pages/AuthorPage';
import BookReaderPage from './pages/BookReaderPage';
import TestEmailPage from './pages/TestEmailPage';
import EmailVerifyPage from './pages/EmailVerifyPage';

type Page = 'home' | 'post' | 'books' | 'library' | 'auth' | 'profile' | 'admin' | 'post-editor' | 'book-editor' | 'library-upload' | 'author' | 'book-reader' | 'test-email' | 'verify-email';

function AppContent() {
  const { loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageParams, setPageParams] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    if (hasSeenIntro) {
      setIsLoading(false);
      setShowContent(true);
    }

    const path = window.location.pathname;
    if (path === '/verify-email') {
      setCurrentPage('verify-email');
      setIsLoading(false);
      setShowContent(true);
      sessionStorage.setItem('hasSeenIntro', 'true');
    }
  }, []);

  const handleLoadingComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setIsLoading(false);
    setTimeout(() => setShowContent(true), 100);
  };

  const handleNavigate = (page: string, params?: string) => {
    setCurrentPage(page as Page);
    setPageParams(params || '');
    window.scrollTo(0, 0);
  };

  if (authLoading && !showContent) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <>
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}

      <div className={`min-h-screen bg-black transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        {currentPage !== 'auth' && currentPage !== 'verify-email' && (
          <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        )}

        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'post' && <PostPage postId={pageParams} onNavigate={handleNavigate} />}
        {currentPage === 'books' && <BooksPage selectedBookId={pageParams} onNavigate={handleNavigate} />}
        {currentPage === 'library' && <LibraryPage onNavigate={handleNavigate} />}
        {currentPage === 'auth' && <AuthPage onNavigate={handleNavigate} />}
        {currentPage === 'profile' && <ProfilePage onNavigate={handleNavigate} />}
        {currentPage === 'admin' && <AdminPage onNavigate={handleNavigate} />}
        {currentPage === 'author' && <AuthorPage authorId={pageParams} onNavigate={handleNavigate} />}
        {currentPage === 'post-editor' && <PostEditorPage postId={pageParams} onNavigate={handleNavigate} />}
        {currentPage === 'book-editor' && <BookEditorPage bookId={pageParams} onNavigate={handleNavigate} />}
        {currentPage === 'library-upload' && <LibraryUploadPage onNavigate={handleNavigate} />}
        {currentPage === 'book-reader' && <BookReaderPage bookId={pageParams} onNavigate={handleNavigate} />}
        {currentPage === 'test-email' && <TestEmailPage />}
        {currentPage === 'verify-email' && <EmailVerifyPage onNavigate={handleNavigate} />}
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
