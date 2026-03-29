import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { User, Mail, Calendar, Shield, Save, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

const Profile = () => {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const { t } = useAppContext();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          setDisplayName(data.displayName || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName
      });
      setMessage({ type: 'success', text: t('profile.updateSuccess') });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: t('profile.updateError') });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto dark:bg-slate-900 transition-colors duration-300">
      <header className="mb-10">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{t('profile.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{t('profile.subtitle')}</p>
      </header>

      <div className="space-y-8">
        <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <User size={40} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile?.displayName || 'Patient'}</h2>
              <p className="text-slate-500 dark:text-slate-400">{profile?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider">
                {profile?.role || 'Patient'}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="p-8 space-y-6">
            {message.text && (
              <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800'}`}>
                {message.text}
              </div>
            )}

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('profile.displayName')}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder={t('profile.placeholderName')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('profile.email')}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={profile?.email}
                    disabled
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{t('profile.emailNote')}</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save size={20} />
                )}
                {t('profile.saveChanges')}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-8 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('profile.accountDetails')}</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('profile.memberSince')}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {profile?.createdAt ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('profile.accountStatus')}</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{t('profile.verified')}</p>
              </div>
            </div>
          </div>
        </section>

        <button
          onClick={handleLogout}
          className="w-full bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold py-4 rounded-3xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          {t('profile.signOut')}
        </button>
      </div>
    </div>
  );
};

export default Profile;
