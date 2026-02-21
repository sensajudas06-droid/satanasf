import { useState } from 'react';
import { Menu, X, BookOpen, Library, FileText, User, LogOut, Settings, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import InvertedPentagram from './InvertedPentagram';
import NotificationCenter from './NotificationCenter';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, signOut } = useAuth();

  const menuItems = [
    { id: 'home', label: 'Ana Sayfa', icon: FileText },
    { id: 'books', label: 'Üç Kitap', icon: BookOpen },
    { id: 'library', label: 'Kütüphane', icon: Library },
    { id: 'secure-comms', label: 'Güvenli İletişim', icon: ShieldCheck },
  ];

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const canAccessAdmin = profile && ['super_admin', 'admin', 'moderator', 'writer'].includes(profile.role);

  return (
    <nav className="bg-zinc-950 border-b-2 border-red-900/50 sticky top-0 z-50 backdrop-blur-md bg-opacity-90 shadow-lg shadow-red-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => handleNavigation('home')}
              className="flex items-center space-x-3 text-white hover:text-red-500 transition-all duration-300 group py-3"
            >
              <img
                src="/Satanas_Fidelis_Logo.png"
                alt="Satanas Fidelis"
                className="w-12 h-12 object-contain group-hover:brightness-110 transition-all duration-300"
              />
              <span className="font-bold text-xl hidden sm:block tracking-wider occult-glow gothic-title">SATANAS FIDELIS</span>
            </button>

            <div className="hidden md:flex space-x-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 ${
                    currentPage === item.id
                      ? 'text-red-500 bg-red-950/50 border border-red-900/50'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="tracking-wide">{item.label}</span>
                  {currentPage === item.id && (
                    <svg className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 22L15.09 15.74L22 14.73L17 9.86L18.18 2.98L12 6.23L5.82 2.98L7 9.86L2 14.73L8.91 15.74L12 22Z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {profile ? (
              <>
                <NotificationCenter onNavigate={onNavigate} />
                {canAccessAdmin && (
                  <button
                    onClick={() => handleNavigation('admin')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                      currentPage === 'admin'
                        ? 'text-red-500 bg-zinc-800'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Yönetim</span>
                  </button>
                )}
                <button
                  onClick={() => handleNavigation('profile')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{profile.display_name}</span>
                </button>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 px-4 py-2 rounded-md bg-red-700 border border-red-600 text-white hover:bg-red-800 hover:shadow-lg hover:shadow-red-900/50 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Çıkış</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavigation('auth')}
                className="px-4 py-2 rounded-md bg-red-700 border border-red-600 text-white hover:bg-red-800 hover:shadow-lg hover:shadow-red-900/50 transition-all duration-300 tracking-wide"
              >
                Giriş / Kayıt
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-800">
          <div className="px-4 py-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md transition-colors ${
                  currentPage === item.id
                    ? 'text-red-500 bg-zinc-800'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}

            {profile ? (
              <>
                {canAccessAdmin && (
                  <button
                    onClick={() => handleNavigation('admin')}
                    className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Yönetim</span>
                  </button>
                )}
                <button
                  onClick={() => handleNavigation('profile')}
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{profile.display_name}</span>
                </button>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Çıkış</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavigation('auth')}
                className="w-full px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Giriş / Kayıt
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
