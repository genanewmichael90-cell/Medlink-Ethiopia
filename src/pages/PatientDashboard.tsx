import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Appointment, Prescription, LabResult } from '../types';
import { Calendar, FileText, Activity, Clock, ChevronRight, User, Bell, Search, MapPin, Phone, X, AlertCircle, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import Countdown from '../components/Countdown';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  console.error(`Firestore Error [${operationType}] at ${path}:`, error);
};

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { t, language } = useAppContext();
  const [user, setUser] = useState(auth.currentUser);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ type: 'appointment' | 'prescription' | 'labResult' | 'notification' | 'appointmentList', data: any } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) navigate('/login');
    });
    return unsubscribe;
  }, [navigate]);

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Patient';

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const qAppointments = query(
      collection(db, 'appointments'),
      where('patientUid', '==', user.uid)
    );

    const qPrescriptions = query(
      collection(db, 'prescriptions'),
      where('patientUid', '==', user.uid)
    );

    const qLabResults = query(
      collection(db, 'labResults'),
      where('patientUid', '==', user.uid)
    );

    const unsubAppointments = onSnapshot(qAppointments, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    });

    const unsubPrescriptions = onSnapshot(qPrescriptions, (snapshot) => {
      setPrescriptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'prescriptions');
    });

    const unsubLabResults = onSnapshot(qLabResults, (snapshot) => {
      setLabResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LabResult)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'labResults');
      setLoading(false);
    });

    return () => {
      unsubAppointments();
      unsubPrescriptions();
      unsubLabResults();
    };
  }, [user]);

  const handleCancelAppointment = async (id: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), {
        status: 'cancelled'
      });
      setSelectedItem(null);
      setShowCancelConfirm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 pt-20">
      <div className="p-6 lg:p-10 max-w-7xl mx-auto">
        <div className="space-y-10">
          {/* Welcome message */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                {t('hello')}, <span className="text-blue-600">{userName}</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {t('welcome')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/profile')}
                className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm"
              >
                <User size={20} />
              </button>
              <button 
                onClick={() => setSelectedItem({ type: 'notification', data: { title: t('notifications'), message: t('notificationBody') } })}
                className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm relative"
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                label: t('upcoming'), 
                value: appointments.filter(a => a.status === 'confirmed').length, 
                icon: <Calendar className="text-blue-600" />, 
                color: 'bg-blue-50 dark:bg-blue-900/20',
                onClick: () => navigate('/appointments')
              },
              { 
                label: t('prescriptions'), 
                value: prescriptions.length, 
                icon: <FileText className="text-emerald-600" />, 
                color: 'bg-emerald-50 dark:bg-emerald-900/20',
                onClick: () => {
                  if (prescriptions.length > 0) {
                    setSelectedItem({ type: 'prescription', data: prescriptions[0] });
                  } else {
                    setSelectedItem({ type: 'notification', data: { title: t('prescriptions'), message: t('noPrescriptions') } });
                  }
                }
              },
              { 
                label: t('labResults'), 
                value: labResults.length, 
                icon: <Activity className="text-purple-600" />, 
                color: 'bg-purple-50 dark:bg-purple-900/20',
                onClick: () => {
                  if (labResults.length > 0) {
                    setSelectedItem({ type: 'labResult', data: labResults[0] });
                  } else {
                    setSelectedItem({ type: 'notification', data: { title: t('labResults'), message: t('noLabResults') } });
                  }
                }
              },
              { 
                label: t('notifications'), 
                value: 3, 
                icon: <Bell className="text-amber-600" />, 
                color: 'bg-amber-50 dark:bg-amber-900/20',
                onClick: () => setSelectedItem({ type: 'notification', data: { title: t('notifications'), message: t('notificationBody') } })
              }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={stat.onClick}
                className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                  </div>
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              {/* Upcoming Appointments */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('upcomingAppointments')}</h2>
                  <button onClick={() => navigate('/appointments')} className="text-blue-600 text-sm font-bold hover:underline">{t('viewAll')}</button>
                </div>
                <div className="space-y-4">
                  {appointments.length > 0 ? (
                    appointments.slice(0, 3).map((app, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedItem({ type: 'appointment', data: app })}
                        className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center gap-5 hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer group"
                      >
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex flex-col items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-blue-600 uppercase">{new Date(app.date).toLocaleString(language === 'en' ? 'en-US' : 'am-ET', { month: 'short' })}</span>
                          <span className="text-xl font-bold text-slate-900 dark:text-white">{new Date(app.date).getDate()}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-all">{app.doctorName || t('common.generalSpecialist')}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              app.type === 'consult' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                            }`}>
                              {app.type || t('common.booking')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <MapPin size={14} /> {app.hospitalName}
                          </p>
                          {app.status === 'confirmed' && (
                            <Countdown targetDate={app.date} targetTime={app.time} />
                          )}
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            app.status === 'confirmed' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : 
                            app.status === 'pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600' : 
                            app.status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/30 text-red-600' : 'bg-slate-50 dark:bg-slate-700 text-slate-600'
                          }`}>
                            {app.status}
                          </span>
                          <p className="text-xs text-slate-400 flex items-center justify-end gap-1">
                            <Clock size={12} /> {app.time || new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-10 text-center">
                      <Calendar className="mx-auto text-slate-300 mb-4" size={40} />
                      <p className="text-slate-500 dark:text-slate-400">{t('noAppointments')}</p>
                      <button 
                        onClick={() => navigate('/hospitals')}
                        className="mt-4 text-blue-600 font-bold hover:underline"
                      >
                        {t('bookFirstVisit')}
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Recent Lab Results */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('recentLabResults')}</h2>
                  <button onClick={() => navigate('/labs')} className="text-blue-600 text-sm font-bold hover:underline">{t('viewAll')}</button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {labResults.length > 0 ? (
                    labResults.slice(0, 4).map((res, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedItem({ type: 'labResult', data: res })}
                        className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-900 transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                            <Activity size={20} />
                          </div>
                          <span className="text-xs text-slate-400">{new Date(res.date).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">{res.testName}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{res.centerName}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-purple-600">{res.result}</span>
                          <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-10 text-center">
                      <Activity className="mx-auto text-slate-300 mb-4" size={40} />
                      <p className="text-slate-500 dark:text-slate-400">{t('noLabResults')}</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-10">
              {/* Quick Actions */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('quickActions')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: t('findDoctor'), icon: <Search size={20} />, color: 'bg-blue-600', path: '/doctors' },
                    { label: t('emergency'), icon: <Phone size={20} />, color: 'bg-red-600', path: '/emergency' },
                    { label: t('hospitals'), icon: <MapPin size={20} />, color: 'bg-emerald-600', path: '/hospitals' },
                    { label: t('profile'), icon: <User size={20} />, color: 'bg-slate-800 dark:bg-slate-700', path: '/profile' }
                  ].map((action, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(action.path)}
                      className={`${action.color} text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-slate-200 dark:shadow-none`}
                    >
                      {action.icon}
                      <span className="text-xs font-bold">{action.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Active Prescriptions */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('activePrescriptions')}</h2>
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
                  {prescriptions.length > 0 ? (
                    prescriptions.map((pre, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedItem({ type: 'prescription', data: pre })}
                        className={`p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-all ${i !== prescriptions.length - 1 ? 'border-b border-slate-50 dark:border-slate-700' : ''}`}
                      >
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                            <FileText size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{pre.medication}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{pre.dosage}</p>
                            <p className="text-xs text-slate-400 mt-2 italic">"{pre.instructions}"</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-slate-400 text-sm">{t('noPrescriptions')}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Health Tip */}
              <section className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[40px] text-white shadow-xl shadow-blue-200 dark:shadow-none relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                    <Sun size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t('healthTipTitle', 'Daily Health Tip')}</h3>
                  <p className="text-blue-100 text-sm leading-relaxed mb-6">
                    {t('healthTipBody', 'Stay hydrated! Drinking at least 8 glasses of water a day helps maintain your energy levels and supports overall organ function.')}
                  </p>
                  <button className="text-white text-sm font-bold flex items-center gap-1 hover:underline">
                    {t('learnMore')} <ChevronRight size={16} />
                  </button>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      selectedItem.type === 'appointment' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' :
                      selectedItem.type === 'prescription' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' :
                      selectedItem.type === 'labResult' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600' :
                      'bg-amber-50 dark:bg-amber-900/30 text-amber-600'
                    }`}>
                      {selectedItem.type === 'appointment' ? <Calendar size={28} /> :
                       selectedItem.type === 'prescription' ? <FileText size={28} /> :
                       selectedItem.type === 'labResult' ? <Activity size={28} /> :
                       <Bell size={28} />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {selectedItem.type === 'appointment' ? t('appointmentDetails') :
                         selectedItem.type === 'prescription' ? t('prescriptionDetails') :
                         selectedItem.type === 'labResult' ? t('labResultDetails') :
                         selectedItem.data.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        {selectedItem.type === 'notification' ? '' : new Date(selectedItem.data.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  {selectedItem.type === 'appointment' && (
                    <>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                          <p className="text-xs text-slate-400 uppercase font-bold mb-1">{t('doctor')}</p>
                          <p className="font-bold text-slate-900 dark:text-white">{selectedItem.data.doctorName}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                          <p className="text-xs text-slate-400 uppercase font-bold mb-1">{t('time')}</p>
                          <p className="font-bold text-slate-900 dark:text-white">{selectedItem.data.time}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">{t('hospital')}</p>
                        <p className="font-bold text-slate-900 dark:text-white">{selectedItem.data.hospitalName}</p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">{t('reason')}</p>
                        <p className="text-slate-700 dark:text-slate-300">{selectedItem.data.reason || t('common.generalConsultation')}</p>
                      </div>
                      
                      {selectedItem.data.status !== 'cancelled' && (
                        <div className="pt-4">
                          {!showCancelConfirm ? (
                            <button 
                              onClick={() => setShowCancelConfirm(true)}
                              className="w-full py-4 bg-red-50 dark:bg-red-900/20 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all"
                            >
                              {t('cancelAppointment')}
                            </button>
                          ) : (
                            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
                              <p className="text-red-700 dark:text-red-400 font-bold mb-4 text-center">{t('confirmCancel')}</p>
                              <div className="flex gap-4">
                                <button 
                                  onClick={() => setShowCancelConfirm(false)}
                                  className="flex-1 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-700"
                                >
                                  {t('no')}
                                </button>
                                <button 
                                  onClick={() => handleCancelAppointment(selectedItem.data.id)}
                                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 dark:shadow-none"
                                >
                                  {t('yesCancel')}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {selectedItem.type === 'prescription' && (
                    <>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">{t('medication')}</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{selectedItem.data.medication}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                          <p className="text-xs text-slate-400 uppercase font-bold mb-1">{t('dosage')}</p>
                          <p className="font-bold text-slate-900 dark:text-white">{selectedItem.data.dosage}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                          <p className="text-xs text-slate-400 uppercase font-bold mb-1">{t('duration')}</p>
                          <p className="font-bold text-slate-900 dark:text-white">{selectedItem.data.duration}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">{t('instructions')}</p>
                        <p className="text-slate-700 dark:text-slate-300 italic">"{selectedItem.data.instructions}"</p>
                      </div>
                    </>
                  )}

                  {selectedItem.type === 'labResult' && (
                    <>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">{t('testName')}</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{selectedItem.data.testName}</p>
                      </div>
                      <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-3xl border border-purple-100 dark:border-purple-900/30 text-center">
                        <p className="text-xs text-purple-400 uppercase font-bold mb-2">{t('result')}</p>
                        <p className="text-4xl font-bold text-purple-600">{selectedItem.data.result}</p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">{t('center')}</p>
                        <p className="font-bold text-slate-900 dark:text-white">{selectedItem.data.centerName}</p>
                      </div>
                    </>
                  )}

                  {selectedItem.type === 'notification' && (
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl">
                      <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                        {selectedItem.data.message}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-10">
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:opacity-90 transition-all"
                  >
                    {t('common.close')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientDashboard;
