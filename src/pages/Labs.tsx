import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Activity, FlaskConical, ShieldCheck, Pill, CheckCircle2, Search } from 'lucide-react';
import { DIAGNOSTIC_CENTERS } from '../constants';
import BookingModal from '../components/BookingModal';
import { useAppContext } from '../contexts/AppContext';
import { auth } from '../firebase';

const Labs = () => {
  const { t } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'Imaging' | 'Laboratory' | 'Radiology' | 'General'>('Imaging');
  const tabs = [
    { id: 'Imaging', label: t('labs.imaging') },
    { id: 'Laboratory', label: t('labs.laboratory') },
    { id: 'Radiology', label: t('labs.radiology') },
    { id: 'General', label: t('labs.general') }
  ];
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingModal, setBookingModal] = useState<{ isOpen: boolean; initialData?: any }>({ isOpen: false });

  const handleBooking = (center: any) => {
    if (!auth.currentUser) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setBookingModal({
      isOpen: true,
      initialData: {
        hospitalName: center.name,
        specialty: center.category,
        type: 'booking'
      }
    });
  };

  const filteredCenters = DIAGNOSTIC_CENTERS.filter(c => 
    c.category === activeTab &&
    (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
     c.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-20 dark:bg-slate-900 transition-colors duration-300">
      <section>
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            {t('nav.labs')}
          </div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold mb-4 text-slate-900 dark:text-white">{t('labs.title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg mb-8">{t('labs.subtitle')}</p>
          
          <div className="max-w-xl mx-auto relative mb-12">
            <input 
              type="text"
              placeholder={t('labs.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          </div>
        </div>
        
        <div className="flex justify-center mb-12">
          <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-x-auto">
            {tabs.map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCenters.map((center) => (
              <motion.div 
                key={center.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -10 }}
                className="bg-white dark:bg-slate-800 p-8 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center">
                    {center.category === 'Imaging' ? <Activity /> : center.category === 'Laboratory' ? <FlaskConical /> : <ShieldCheck />}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{center.rating}</span>
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{center.name}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-grow">{center.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {center.services.map(s => (
                    <span key={s} className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded text-[10px] font-bold uppercase">{s}</span>
                  ))}
                </div>
                <button 
                  onClick={() => handleBooking(center)}
                  className="w-full py-3 bg-slate-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all"
                >
                  {t('labs.bookTest')}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section className="py-20">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-[40px] p-12 flex flex-col lg:flex-row items-center gap-12 border border-blue-100 dark:border-blue-900/30">
          <div className="lg:w-1/2">
            <div className="text-left mb-10">
              <div className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                {t('labs.pharmacy')}
              </div>
              <h2 className="text-4xl lg:text-5xl font-display font-bold mb-4 text-slate-900 dark:text-white">{t('labs.medStoreTitle')}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg">{t('labs.medStoreSubtitle')}</p>
            </div>
            <div className="space-y-4 mb-8">
              {[t('labs.medStoreFeature1'), t('labs.medStoreFeature2'), t('labs.medStoreFeature3'), t('labs.medStoreFeature4')].map((text) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{text}</span>
                </div>
              ))}
            </div>
            <button 
              className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 dark:shadow-none"
            >
              {t('labs.openMedStore')}
            </button>
          </div>
          <div className="lg:w-1/2 grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-slate-50 dark:border-slate-700">
                <Pill className="text-blue-600 w-8 h-8 mb-4" />
                <p className="font-bold text-slate-900 dark:text-white">Kenema Pharmacy</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('common.open247')} • Bole</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-slate-50 dark:border-slate-700">
                <Pill className="text-blue-600 w-8 h-8 mb-4" />
                <p className="font-bold text-slate-900 dark:text-white">Lion Pharmacy</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('common.open')} • Piazza</p>
              </div>
            </div>
            <div className="space-y-6 pt-12">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-slate-50 dark:border-slate-700">
                <Pill className="text-blue-600 w-8 h-8 mb-4" />
                <p className="font-bold text-slate-900 dark:text-white">Ethio Pharmacy</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('common.open')} • Kazanchis</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-slate-50 dark:border-slate-700">
                <Pill className="text-blue-600 w-8 h-8 mb-4" />
                <p className="font-bold text-slate-900 dark:text-white">Bole Pharmacy</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('common.open')} • Bole Medhanialem</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BookingModal 
        isOpen={bookingModal.isOpen} 
        onClose={() => setBookingModal({ isOpen: false })} 
        initialData={bookingModal.initialData}
      />
    </div>
  );
};

export default Labs;
