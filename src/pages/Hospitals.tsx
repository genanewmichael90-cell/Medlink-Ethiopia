import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Clock, MapPin, Phone, Ambulance, ArrowRight, X, Info, Globe, ShieldCheck, Search } from 'lucide-react';
import { HOSPITALS } from '../constants';
import { Hospital } from '../types';
import BookingModal from '../components/BookingModal';
import { auth } from '../firebase';

import { useAppContext } from '../contexts/AppContext';

const HospitalCard: React.FC<{ hospital: Hospital; onBook: () => void; onViewDetails: () => void }> = ({ hospital, onBook, onViewDetails }) => {
  const { t } = useAppContext();
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -10 }}
      className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group"
    >
      <div className="h-48 relative overflow-hidden cursor-pointer" onClick={onViewDetails}>
        <img src={hospital.image} alt={hospital.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-blue-600">
          {hospital.type}
        </div>
        {hospital.emergency && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Ambulance className="w-3 h-3" /> {t('hospitals.emergency')}
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-yellow-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{hospital.rating}</span>
          </div>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {hospital.workingHours}
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2 line-clamp-1 cursor-pointer text-slate-900 dark:text-white hover:text-blue-600 transition-colors" onClick={onViewDetails}>{hospital.name}</h3>
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm mb-4">
          <MapPin className="w-4 h-4" />
          {hospital.location}
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {hospital.services.slice(0, 3).map((s) => (
            <span key={s} className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg text-xs font-medium">
              {s}
            </span>
          ))}
          {hospital.services.length > 3 && <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">+{hospital.services.length - 3} {t('common.more')}</span>}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onBook}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
          >
            {t('common.bookAppointment')}
          </button>
          <button 
            onClick={onViewDetails}
            className="w-12 h-12 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:border-blue-600 transition-all"
            title={t('hospitals.viewDetails')}
          >
            <Info className="w-5 h-5" />
          </button>
          <a 
            href={`tel:${hospital.phone}`}
            className="w-12 h-12 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:border-blue-600 transition-all"
            title={`${t('hospitals.contact')} ${hospital.name}`}
          >
            <Phone className="w-5 h-5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const Hospitals = () => {
  const { t } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState<'All' | 'Public' | 'Private'>('All');
  const [showAll, setShowAll] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingModal, setBookingModal] = useState<{ isOpen: boolean; initialData?: any }>({ isOpen: false });
  
  const handleBooking = (hospital: Hospital) => {
    if (!auth.currentUser) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setBookingModal({
      isOpen: true,
      initialData: {
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        type: 'booking'
      }
    });
  };

  const filteredHospitals = HOSPITALS.filter(h => {
    const matchesCategory = activeCategory === 'All' || h.type === activeCategory;
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         h.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         h.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const displayedHospitals = showAll ? filteredHospitals : filteredHospitals.slice(0, 8);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto dark:bg-slate-900 transition-colors duration-300">
      <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
        <div className="text-left flex-grow">
          <div className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            {t('hospitals.services')}
          </div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold mb-4 text-slate-900 dark:text-white">{t('hospitals.title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl text-lg mb-8">{t('hospitals.subtitle')}</p>
          
          <div className="max-w-xl relative">
            <input 
              type="text"
              placeholder={t('hospitals.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          </div>
        </div>
        <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm self-start md:self-end">
          {['All', 'Public', 'Private'].map((cat) => (
            <button 
              key={cat}
              onClick={() => {
                setActiveCategory(cat as any);
                setShowAll(false);
              }}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600'}`}
            >
              {cat === 'All' ? t('hospitals.allCategories') : t(`hospitals.${cat.toLowerCase()}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence mode="popLayout">
          {displayedHospitals.map((hospital) => (
            <HospitalCard 
              key={hospital.id} 
              hospital={hospital} 
              onBook={() => handleBooking(hospital)} 
              onViewDetails={() => setSelectedHospital(hospital)}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {!showAll && filteredHospitals.length > 8 && (
        <div className="mt-16 text-center">
          <button 
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-4 transition-all"
          >
            {t('common.viewAll')} {HOSPITALS.length} {t('nav.hospitals')} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Hospital Details Modal */}
      <AnimatePresence>
        {selectedHospital && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHospital(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-slate-800 w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedHospital(null)} 
                className="absolute top-6 right-6 z-10 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all shadow-sm"
              >
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>

              <div className="md:w-2/5 relative h-64 md:h-auto">
                <img src={selectedHospital.image} alt={selectedHospital.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent md:hidden" />
                <div className="absolute bottom-6 left-6 md:hidden">
                  <h3 className="text-2xl font-bold text-white mb-1">{selectedHospital.name}</h3>
                  <p className="text-blue-200 text-sm font-medium">{t(`hospitals.${selectedHospital.type.toLowerCase()}`)} {t('common.facility')}</p>
                </div>
              </div>

              <div className="md:w-3/5 p-8 md:p-12 overflow-y-auto max-h-[80vh] md:max-h-[600px]">
                <div className="hidden md:block mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {selectedHospital.type}
                    </span>
                    {selectedHospital.emergency && (
                      <span className="bg-red-50 dark:bg-red-900/30 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Ambulance size={10} /> {t('hospitals.emergency')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{selectedHospital.name}</h3>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">{t('common.rating')}</p>
                    <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" /> {selectedHospital.rating}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">{t('common.availableTimes')}</p>
                    <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-sm">
                      <Clock className="w-4 h-4 text-blue-600" /> {selectedHospital.workingHours}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">{t('common.status')}</p>
                    <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                      <ShieldCheck className="w-4 h-4" /> {t('common.verified')}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Info size={16} className="text-blue-600" /> {t('hospitals.about')}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedHospital.description}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-3">{t('hospitals.services')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedHospital.services.map((service) => (
                        <span key={service} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl text-xs font-semibold">
                          {t(`hospitals.${service.toLowerCase().replace(/\s+/g, '')}`) || service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{t('hospitals.location')}</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <MapPin size={14} className="text-blue-600" /> {selectedHospital.location}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{t('hospitals.contact')}</p>
                      <a href={`tel:${selectedHospital.phone}`} className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-2">
                        <Phone size={14} /> {selectedHospital.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button 
                    onClick={() => {
                      if (selectedHospital) {
                        setSelectedHospital(null);
                        handleBooking(selectedHospital);
                      }
                    }}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
                  >
                    {t('common.bookAppointment')}
                  </button>
                  <button className="px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
                    <Globe size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BookingModal 
        isOpen={bookingModal.isOpen} 
        onClose={() => setBookingModal({ isOpen: false })} 
        initialData={bookingModal.initialData}
      />
    </div>
  );
};

export default Hospitals;

