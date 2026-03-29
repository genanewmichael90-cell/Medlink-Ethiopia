import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, LogOut, User, Sun, Moon, Globe } from 'lucide-react';
import { auth } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useAppContext } from '../contexts/AppContext';

const Navbar = () => {
  const { language, setLanguage, theme, toggleTheme, t } = useAppContext();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navLinks = [
    { name: t('nav.dashboard'), path: '/dashboard' },
    { name: t('nav.hospitals'), path: '/hospitals' },
    { name: t('nav.doctors'), path: '/doctors' },
    { name: t('nav.labs'), path: '/labs' },
    { name: t('nav.pharmacy'), path: '/pharmacy' },
    { name: t('nav.emergency'), path: '/emergency' },
  ];

  const isTransparent = !isScrolled && location.pathname === '/';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${!isTransparent ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="https://image2url.com/r2/default/images/1774462310469-6e7ce67c-7659-461e-94f9-857cd54cc288.png" 
            alt="MedLink Ethiopia Logo" 
            className="w-10 h-10 object-contain"
            referrerPolicy="no-referrer"
          />
          <span className={`text-lg sm:text-xl font-display font-bold tracking-tight whitespace-nowrap ${isTransparent ? 'text-white' : 'text-slate-900 dark:text-white'}`}>MedLink <span className="text-blue-600">Ethiopia</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-blue-600' : isTransparent ? 'text-white/90 hover:text-white' : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'}`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className={`flex items-center gap-2 ml-4 pl-4 border-l ${isTransparent ? 'border-white/20' : 'border-slate-200 dark:border-slate-700'}`}>
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all ${isTransparent ? 'text-white/70 hover:bg-white/10' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button 
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              className={`p-2 rounded-full transition-all flex items-center gap-1 text-xs font-bold ${isTransparent ? 'text-white/70 hover:bg-white/10' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              title="Change Language"
            >
              <Globe size={18} />
              {language === 'en' ? 'AM' : 'EN'}
            </button>
          </div>
          
          {user ? (
            <div className={`flex items-center gap-4 ml-2 pl-4 border-l ${isTransparent ? 'border-white/20' : 'border-slate-200 dark:border-slate-700'}`}>
              <Link to="/profile" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isTransparent ? 'text-white/90 hover:text-white' : 'text-slate-700 dark:text-slate-200 hover:text-blue-600'}`}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-white/20" />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isTransparent ? 'bg-white/10 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    <User size={16} />
                  </div>
                )}
                <span className="hidden lg:inline">{user.displayName || user.email?.split('@')[0]}</span>
              </Link>
              <button 
                onClick={handleSignOut}
                className={`transition-colors ${isTransparent ? 'text-white/50 hover:text-white' : 'text-slate-400 hover:text-red-500'}`}
                title={t('auth.logout')}
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              state={{ from: location }}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              {t('auth.login')}
            </Link>
          )}
        </div>

        <button className={`md:hidden ${isTransparent ? 'text-white' : 'text-slate-900 dark:text-white'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 shadow-xl p-6 flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`text-lg font-medium ${location.pathname === link.path ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <button 
                onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <LogOut size={20} /> {t('auth.logout')}
              </button>
            ) : (
              <Link 
                to="/login" 
                state={{ from: location }}
                className="bg-blue-600 text-white w-full py-3 rounded-xl font-semibold text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('auth.login')}
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
