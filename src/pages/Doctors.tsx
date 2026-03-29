import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Clock, Heart, Brain, Stethoscope, Baby, User, Activity, Sun, Plus, CheckCircle2, X, Info, MapPin, Calendar, ChevronRight, Search } from 'lucide-react';
import { DOCTORS, SPECIALTIES } from '../constants';
import { Doctor, Specialty } from '../types';
import BookingModal from '../components/BookingModal';
import { auth } from '../firebase';

import { useAppContext } from '../contexts/AppContext';

const SpecialtyIcon = ({ name }: { name: string }) => {
  switch (name) {
    case 'Cardiology': return <Heart className="w-8 h-8" />;
    case 'Neurology': return <Brain className="w-8 h-8" />;
    case 'Surgery': return <Stethoscope className="w-8 h-8" />;
    case 'Pediatrics': return <Baby className="w-8 h-8" />;
    case 'Gynecology': return <User className="w-8 h-8" />;
    case 'Orthopedics': return <Activity className="w-8 h-8" />;
    case 'Dermatology': return <Sun className="w-8 h-8" />;
    default: return <Plus className="w-8 h-8" />;
  }
};

const SpecialtyCard: React.FC<{ specialty: Specialty; isActive: boolean; onClick: () => void }> = ({ specialty, isActive, onClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className={`p-8 rounded-[32px] border text-center transition-all cursor-pointer group ${
        isActive ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white hover:border-blue-600'
      }`}
    >
      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
        isActive ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
      }`}>
        <SpecialtyIcon name={specialty.name} />
      </div>
      <h4 className="font-bold mb-2">{specialty.name}</h4>
      <p className={`text-xs leading-relaxed ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>{specialty.description}</p>
    </motion.div>
  );
};

const DoctorCard: React.FC<{ doctor: Doctor; onConsult: () => void; onViewProfile: () => void }> = ({ doctor, onConsult, onViewProfile }) => {
  const { t } = useAppContext();
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-slate-800 p-6 rounded-[32px] flex flex-col items-center text-center border border-slate-100 dark:border-slate-700 shadow-sm"
    >
      <div className="relative mb-4 cursor-pointer" onClick={onViewProfile}>
        <img src={doctor.image} alt={doctor.name} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg" />
        <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
      </div>
      <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 transition-colors" onClick={onViewProfile}>{doctor.name}</h3>
      <p className="text-blue-600 text-sm font-semibold mb-3">{doctor.specialty}</p>
      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-6">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-400 fill-current" /> {doctor.rating}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {doctor.experience} {t('common.years')}
        </div>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 italic">{doctor.hospital}</p>
      <div className="w-full space-y-2">
        <button 
          onClick={onConsult}
          className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
        >
          {t('common.consultNow')}
        </button>
        <button 
          onClick={onViewProfile}
          className="w-full py-3 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
        >
          <Info size={16} /> {t('common.viewProfile')}
        </button>
      </div>
    </motion.div>
  );
};

const Doctors = () => {
  const { t } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingModal, setBookingModal] = useState<{ isOpen: boolean; initialData?: any }>({ isOpen: false });

  const handleBooking = (doctor: Doctor, type: 'consult' | 'booking' = 'consult') => {
    if (!auth.currentUser) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setBookingModal({ 
      isOpen: true, 
      initialData: { 
        doctorId: doctor.id, 
        doctorName: doctor.name, 
        hospitalName: doctor.hospital, 
        specialty: doctor.specialty,
        type
      } 
    });
  };

  const getDoctorsBySpecialty = (specialtyName: string) => {
    return DOCTORS.filter(doc => 
      doc.specialty.toLowerCase().includes(specialtyName.toLowerCase()) &&
      (doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       doc.hospital.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const getAllMatchingDoctors = () => {
    return DOCTORS.filter(doc => 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const activeSpecialtyData = SPECIALTIES.find(s => s.name === selectedSpecialty);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-20 dark:bg-slate-900 transition-colors duration-300">
      <section>
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            {t('common.specialties')}
          </div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold mb-4 text-slate-900 dark:text-white">{t('common.comprehensiveCare')}</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg mb-8">{t('common.connectWithSpecialists')}</p>
          
          <div className="max-w-xl mx-auto relative mb-12">
            <input 
              type="text"
              placeholder={t('common.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          </div>

          {(selectedSpecialty || searchQuery) && (
            <button 
              onClick={() => {
                setSelectedSpecialty(null);
                setSearchQuery('');
              }}
              className="text-blue-600 font-bold hover:underline flex items-center gap-2 mx-auto"
            >
              <X size={16} /> {t('common.clearFilters')}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {SPECIALTIES.map((specialty) => (
            <SpecialtyCard 
              key={specialty.id} 
              specialty={specialty} 
              isActive={selectedSpecialty === specialty.name}
              onClick={() => {
                setSelectedSpecialty(selectedSpecialty === specialty.name ? null : specialty.name);
                if (selectedSpecialty !== specialty.name) setSearchQuery('');
              }}
            />
          ))}
        </div>
      </section>

      <section className="space-y-16">
        <AnimatePresence mode="wait">
          {selectedSpecialty ? (
            <motion.div
              key={selectedSpecialty}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="text-center">
                <div className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                  {selectedSpecialty} {t('common.specialists')}
                </div>
                <h2 className="text-4xl font-display font-bold mb-4 text-slate-900 dark:text-white">
                  {t('common.topDoctors')} {selectedSpecialty} {t('common.doctors')}
                </h2>
                {activeSpecialtyData && (
                  <p className="text-blue-600 font-medium mb-4 max-w-2xl mx-auto">{activeSpecialtyData.description}</p>
                )}
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {getDoctorsBySpecialty(selectedSpecialty).map((doctor) => (
                  <DoctorCard 
                    key={doctor.id} 
                    doctor={doctor} 
                    onConsult={() => handleBooking(doctor)} 
                    onViewProfile={() => setSelectedDoctor(doctor)}
                  />
                ))}
              </div>
              {getDoctorsBySpecialty(selectedSpecialty).length === 0 && (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-slate-400 dark:text-slate-500">{t('common.noDoctorsSpecialty')}</p>
                </div>
              )}
            </motion.div>
          ) : searchQuery ? (
            <motion.div
              key="search-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-10"
            >
              <div className="text-center">
                <h2 className="text-3xl font-display font-bold mb-2 text-slate-900 dark:text-white">
                  {t('common.searchResults')}
                </h2>
                <p className="text-slate-500 dark:text-slate-400">{t('common.found')} {getAllMatchingDoctors().length} {t('common.doctorsMatching')} "{searchQuery}"</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {getAllMatchingDoctors().map((doctor) => (
                  <DoctorCard 
                    key={doctor.id} 
                    doctor={doctor} 
                    onConsult={() => handleBooking(doctor)} 
                    onViewProfile={() => setSelectedDoctor(doctor)}
                  />
                ))}
              </div>
              {getAllMatchingDoctors().length === 0 && (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-slate-400 dark:text-slate-500">{t('common.noDoctorsFound')}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="all-specialties"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-20"
            >
              {SPECIALTIES.map((specialty) => {
                const doctors = getDoctorsBySpecialty(specialty.name);
                if (doctors.length === 0) return null;

                return (
                  <div key={specialty.id} className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                          <span className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center">
                            <SpecialtyIcon name={specialty.name} />
                          </span>
                          {specialty.name}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">{specialty.description}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedSpecialty(specialty.name)}
                        className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"
                      >
                        {t('common.viewAll')} {doctors.length} {t('common.doctors')} <ChevronRight size={16} />
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {doctors.slice(0, 4).map((doctor) => (
                        <DoctorCard 
                          key={doctor.id} 
                          doctor={doctor} 
                          onConsult={() => handleBooking(doctor)} 
                          onViewProfile={() => setSelectedDoctor(doctor)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Doctor Profile Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDoctor(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-6 right-6 z-10">
                <button onClick={() => setSelectedDoctor(null)} className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all shadow-sm">
                  <X size={20} className="text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 bg-blue-50 dark:bg-blue-900/20 p-8 flex flex-col items-center text-center">
                  <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-32 h-32 rounded-3xl object-cover shadow-xl mb-6" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{selectedDoctor.name}</h3>
                  <p className="text-blue-600 font-semibold text-sm mb-4">{selectedDoctor.specialty}</p>
                  
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{t('common.rating')}</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" /> {selectedDoctor.rating}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{t('common.experience')}</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedDoctor.experience} {t('common.years')}</p>
                    </div>
                  </div>
                </div>

                <div className="md:w-2/3 p-10 space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{t('common.professionalSummary')}</h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedDoctor.description}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                      <MapPin size={18} className="text-blue-600" />
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">{t('common.affiliatedHospitals')}</p>
                        <p className="font-medium">{selectedDoctor.hospital}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                      <Calendar size={18} className="text-blue-600" />
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">{t('common.availableTimes')}</p>
                        <p className="font-medium">{selectedDoctor.availableTimes.join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={() => {
                        if (selectedDoctor) {
                          setSelectedDoctor(null);
                          handleBooking(selectedDoctor, 'booking');
                        }
                      }}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
                    >
                      {t('common.bookConsultation')}
                    </button>
                  </div>
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

export default Doctors;

