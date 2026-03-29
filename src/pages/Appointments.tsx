import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Appointment } from '../types';
import { Calendar, MapPin, Clock, Trash2, ChevronLeft, Stethoscope, User, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import Countdown from '../components/Countdown';

const Appointments = () => {
  const navigate = useNavigate();
  const { t, language } = useAppContext();
  const [user, setUser] = useState(auth.currentUser);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const q = query(
      collection(db, 'appointments'),
      where('patientUid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      // Sort by date descending
      apps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAppointments(apps);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleCancelAppointment = async (id: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), {
        status: 'cancelled'
      });
      setSelectedApp(null);
      setShowCancelConfirm(false);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
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
    <div className="p-6 lg:p-10 max-w-5xl mx-auto dark:bg-slate-900 transition-colors duration-300">
      <header className="mb-10 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{t('upcomingAppointments')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('manageAppointments') || 'Manage your medical visits'}</p>
        </div>
      </header>

      <div className="space-y-6">
        {appointments.length > 0 ? (
          appointments.map((app, i) => (
            <motion.div 
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedApp(app)}
              className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-6 hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer group shadow-sm"
            >
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-slate-100 dark:border-slate-600">
                <span className="text-xs font-bold text-blue-600 uppercase">{new Date(app.date).toLocaleString(language === 'en' ? 'en-US' : 'am-ET', { month: 'short' })}</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{new Date(app.date).getDate()}</span>
                <span className="text-[10px] text-slate-400 font-bold">{new Date(app.date).getFullYear()}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-all">{app.doctorName || t('common.generalSpecialist')}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    app.type === 'consult' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                  }`}>
                    {app.type || t('common.booking')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    app.status === 'confirmed' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : 
                    app.status === 'pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600' : 
                    app.status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/30 text-red-600' : 'bg-slate-50 dark:bg-slate-700 text-slate-600'
                  }`}>
                    {app.status}
                  </span>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" /> {app.hospitalName}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Clock size={16} className="text-blue-600" /> {app.time || new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {app.status === 'confirmed' && (
                  <div className="mt-4">
                    <Countdown targetDate={app.date} targetTime={app.time} />
                  </div>
                )}
              </div>

              <div className="flex md:flex-col items-center justify-end gap-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedApp(app);
                  }}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all"
                >
                  {t('viewDetails') || 'Details'}
                </button>
                {app.status !== 'cancelled' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedApp(app);
                      setShowCancelConfirm(true);
                    }}
                    className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    title={t('cancelAppointment')}
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-20 text-center">
            <Calendar className="mx-auto text-slate-300 mb-6" size={64} />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('noAppointments')}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">You don't have any medical appointments scheduled at the moment.</p>
            <button 
              onClick={() => navigate('/hospitals')}
              className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
            >
              {t('bookFirstVisit')}
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedApp(null); setShowCancelConfirm(false); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">{t('appointmentDetails')}</h3>
                <button onClick={() => { setSelectedApp(null); setShowCancelConfirm(false); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <div className="p-8 max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">{t('patient')}</p>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedApp.patientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-bold uppercase">{t('age')}</p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {selectedApp.patientAge?.years}y {selectedApp.patientAge?.months}m {selectedApp.patientAge?.days}d
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{t('doctor')}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedApp.doctorName || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600">
                        <Stethoscope size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{t('specialty')}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedApp.specialty}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('hospital')}</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedApp.hospitalName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('dateTime')}</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {new Date(selectedApp.date).toLocaleDateString()} at {selectedApp.time || new Date(selectedApp.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {selectedApp.status === 'confirmed' && (
                        <div className="mt-2">
                          <Countdown targetDate={selectedApp.date} targetTime={selectedApp.time} />
                        </div>
                      )}
                    </div>
                  </div>

                  {(selectedApp.notes || selectedApp.message) && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                      <p className="text-sm text-slate-500 mb-1">{selectedApp.message ? t('message') : t('notes')}</p>
                      <p className="text-slate-700 dark:text-slate-300">{selectedApp.message || selectedApp.notes}</p>
                    </div>
                  )}

                  {selectedApp.status !== 'cancelled' && (
                    <div className="pt-4">
                      {!showCancelConfirm ? (
                        <button 
                          onClick={() => setShowCancelConfirm(true)}
                          className="w-full py-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
                        >
                          <Trash2 size={18} /> {t('cancelAppointment')}
                        </button>
                      ) : (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                          <p className="text-red-600 font-bold text-center mb-4">{t('confirmCancel')}</p>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => setShowCancelConfirm(false)}
                              className="flex-1 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold border border-slate-200 dark:border-slate-700"
                            >
                              {t('no')}
                            </button>
                            <button 
                              onClick={() => handleCancelAppointment(selectedApp.id)}
                              className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 dark:shadow-none"
                            >
                              {t('yes')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-700 flex justify-end">
                <button 
                  onClick={() => { setSelectedApp(null); setShowCancelConfirm(false); }}
                  className="px-6 py-2 bg-slate-900 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-blue-700 transition-all"
                >
                  {t('close')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Appointments;
