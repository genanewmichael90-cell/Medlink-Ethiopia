import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { HOSPITALS } from '../constants';
import { collection, query, where, onSnapshot, orderBy, getDoc, doc, updateDoc } from 'firebase/firestore';
import { Appointment, Prescription, LabResult } from '../types';
import { Calendar, FileText, Activity, Clock, ChevronRight, User, Bell, Search, MapPin, Phone, X, AlertCircle, Stethoscope, Trash2, Sun, Moon, Globe, Award, ShieldCheck, Heart, Building2, Users, Code } from 'lucide-react';
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

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo, null, 2));
  // We don't want to crash the whole app, but we want it visible in logs
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, theme, toggleTheme, language, setLanguage } = useAppContext();
  const [user, setUser] = useState(auth.currentUser);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ type: 'appointment' | 'prescription' | 'labResult' | 'notification' | 'appointmentList' | 'partnerForm', data: any } | null>(null);
  const [partnerFormStatus, setPartnerFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [partnerFormData, setPartnerFormData] = useState<any>({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [notificationPrompt, setNotificationPrompt] = useState(false);

  useEffect(() => {
    // Check for notification permission once a day
    const lastPrompt = localStorage.getItem('lastNotificationPrompt');
    const today = new Date().toDateString();
    
    if (lastPrompt !== today && Notification.permission === 'default') {
      setNotificationPrompt(true);
    }

    // Daily notification logic
    const lastNotification = localStorage.getItem('lastDailyNotification');
    if (lastNotification !== today && Notification.permission === 'granted') {
      new Notification(t('notificationTitle'), {
        body: t('notificationBody'),
        icon: '/favicon.ico'
      });
      localStorage.setItem('lastDailyNotification', today);
    }
  }, [t]);

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    localStorage.setItem('lastNotificationPrompt', new Date().toDateString());
    setNotificationPrompt(false);
    
    if (permission === 'granted') {
      new Notification(t('notificationTitle'), {
        body: t('notificationBody')
      });
    }
  };

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Patient';

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Use getDocFromServer to bypass cache and test real connection
        const { getDocFromServer } = await import('firebase/firestore');
        await getDocFromServer(doc(db, 'users', 'connection-test'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    };
    testConnection();
  }, []);

  useEffect(() => {
    if (!user) return;
    const checkProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          console.warn('User profile missing in Firestore for:', user.uid);
        } else {
          console.log('User profile loaded:', userDoc.data());
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      }
    };
    checkProfile();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
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

  return (
    <div className="dark:bg-slate-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-medical-team-walking-in-a-hospital-corridor-40145-large.mp4" type="video/mp4" />
          </video>
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[1px]"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mt-40"
            >
              <span className="inline-block px-5 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-bold tracking-[0.3em] uppercase mb-8 backdrop-blur-md">
                {t('leadingMedicalService', 'Leading Online Medical Service in Ethiopia')}
              </span>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold text-white leading-[0.95] mb-8 tracking-tighter">
                {t('hero.headline', 'Connecting Ethiopia to Modern Healthcare')}
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed max-w-3xl font-light">
                {t('hero.subheadline', 'Advanced Diagnostics • Trusted Specialists • Compassionate Patient Care')}
              </p>

              <div className="flex flex-wrap gap-6 mb-16">
                <button 
                  onClick={() => navigate('/hospitals')}
                  className="px-10 py-5 bg-brand-blue hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-2xl shadow-brand-blue/40 flex items-center gap-3 group text-lg"
                >
                  {t('common.bookAppointment')}
                  <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/doctors')}
                  className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-md border border-white/20 transition-all text-lg"
                >
                  {t('exploreServices')}
                </button>
              </div>

              {/* Trust Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 pt-12 border-t border-white/10 max-w-2xl">
                <div>
                  <p className="text-4xl font-bold text-white mb-2">15+</p>
                  <p className="text-xs text-slate-400 uppercase tracking-[0.2em] font-bold">{t('stats.years')}</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-white mb-2">500+</p>
                  <p className="text-xs text-slate-400 uppercase tracking-[0.2em] font-bold">{t('stats.specialists')}</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-white mb-2">24/7</p>
                  <p className="text-xs text-slate-400 uppercase tracking-[0.2em] font-bold">{t('stats.emergency')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Access Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-800 rounded-[40px] p-10 lg:p-16 shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row items-center justify-between gap-10"
          >
            <div className="max-w-2xl text-center lg:text-left">
              <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                {t('dashboard.portal', 'Dashboard / Patient Portal')}
              </h2>
              <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('dashboard.guestPrompt', 'Welcome to MedLink Ethiopia Dashboard – Access your appointments, test results, and care plans. Please log in to continue.')}
              </p>
            </div>
            <div className="flex flex-col items-center lg:items-end gap-4">
              <button 
                onClick={() => {
                  if (user) {
                    const dashboardContent = document.getElementById('dashboard-content');
                    if (dashboardContent) {
                      dashboardContent.scrollIntoView({ behavior: 'smooth' });
                    }
                  } else {
                    setSelectedItem({ 
                      type: 'notification', 
                      data: { 
                        title: t('dashboard.portal'), 
                        message: t('dashboard.guestPrompt') 
                      } 
                    });
                  }
                }}
                className="px-12 py-6 bg-brand-dark dark:bg-brand-blue text-white font-bold rounded-2xl hover:opacity-90 transition-all text-xl shadow-xl shadow-brand-dark/20 whitespace-nowrap flex items-center gap-3 group"
              >
                <Activity size={24} className="group-hover:animate-pulse" />
                {t('nav.dashboard')}
              </button>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                <ShieldCheck size={16} className="text-emerald-500" />
                {t('common.secureAccess', 'Secure & Easy Access')}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partners & Integrations Section */}
      <section className="py-32 bg-slate-50 dark:bg-slate-900/80 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-20">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-6 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-xs font-bold uppercase tracking-[0.3em] mb-6"
            >
              MedLink Ecosystem
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight"
            >
              {t('partners.title', 'Partners & Integrations')}
            </motion.h2>
            <div className="w-32 h-2 bg-blue-600 mx-auto rounded-full mb-10"></div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-2xl text-slate-500 dark:text-slate-400 max-w-4xl mx-auto leading-relaxed font-light"
            >
              {t('partners.subtitle', 'Join our network of healthcare professionals and institutions to revolutionize healthcare in Ethiopia.')}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                id: 'doctor',
                title: t('partners.joinDoctor', 'Join as a Doctor'), 
                desc: t('partners.doctorTooltip', 'Connect with patients and manage your practice digitally.'),
                icon: <Stethoscope size={32} />,
                color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
              },
              { 
                id: 'hospital',
                title: t('partners.registerHospital', 'Register Hospitals'), 
                desc: t('partners.hospitalTooltip', 'Increase patient reach, access digital appointment system, integrate with MedLink dashboard.'),
                icon: <Building2 size={32} />,
                color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'
              },
              { 
                id: 'clinic',
                title: t('partners.partnerClinics', 'Partner Clinics'), 
                desc: t('partners.clinicTooltip', 'Grow your patient base, integrate with MedLink Ethiopia, manage appointments online.'),
                icon: <Activity size={32} />,
                color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600'
              },
              { 
                id: 'api',
                title: t('partners.healthcareApis', 'Healthcare APIs'), 
                desc: t('partners.apiTooltip', 'Integrate MedLink services into your own healthcare applications.'),
                icon: <Code size={32} />,
                color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600'
              }
            ].map((partner, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                onClick={() => setSelectedItem({ type: 'partnerForm', data: { partnerType: partner.id } })}
                className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all cursor-pointer group"
              >
                <div className={`w-16 h-16 ${partner.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  {partner.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-blue-600 transition-colors">{partner.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{partner.desc}</p>
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  {t('learnMore')} <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div id="dashboard-content" className="p-6 lg:p-10 max-w-7xl mx-auto">
        {user ? (
          /* Logged In User View */
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
        ) : (
          /* Guest View */
          <div className="space-y-24">
            {/* Welcome message for guest */}
            <div className="mb-16 text-center lg:text-left">
              <span className="inline-block px-4 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">
                {t('leadingMedicalService')}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                {t('welcomeToMedLink', 'Welcome to MedLink Ethiopia')}
              </h2>
              <p className="text-xl text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
                {t('loginToAccessRecords', 'Sign in to access your medical records, book appointments, and track your health journey.')}
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-10">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-12 py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none text-lg"
                >
                  {t('auth.login')}
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="px-12 py-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-sm text-lg"
                >
                  {t('auth.signup')}
                </button>
              </div>
            </div>

            {/* Why Choose Us Section */}
            <section className="py-24">
              <div className="text-center mb-20">
                <motion.span 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="text-blue-600 font-bold tracking-[0.3em] uppercase text-xs mb-4 block"
                >
                  {t('common.trustedHealthcare')}
                </motion.span>
                <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">{t('whyChooseUs')}</h2>
                <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mb-8"></div>
                <p className="text-slate-500 dark:text-slate-400 max-w-3xl mx-auto text-xl leading-relaxed">
                  {t('whyChooseUsSubtitle')}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-10">
                {[
                  { icon: Award, title: t('reason1Title'), desc: t('reason1Desc'), color: 'text-blue-600' },
                  { icon: Clock, title: t('reason2Title'), desc: t('reason2Desc'), color: 'text-emerald-600' },
                  { icon: ShieldCheck, title: t('reason3Title'), desc: t('reason3Desc'), color: 'text-purple-600' }
                ].map((reason, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white dark:bg-slate-800 p-10 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all text-center"
                  >
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                      <reason.icon size={40} className={reason.color} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{reason.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{reason.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Our Mission Section */}
            <section className="relative py-32 rounded-[80px] overflow-hidden shadow-2xl">
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=2000" 
                  alt="Medical Mission" 
                  className="w-full h-full object-cover scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-brand-dark/85 backdrop-blur-md"></div>
              </div>
              <div className="relative z-10 container mx-auto px-10 text-center text-white">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="text-blue-400 font-bold tracking-[0.4em] uppercase text-sm mb-8 block">{t('ourMission')}</span>
                  <h2 className="text-5xl md:text-7xl font-bold mb-10 tracking-tight">{t('ourMissionTitle', 'Healing with Purpose')}</h2>
                  <p className="text-2xl md:text-4xl text-blue-100 max-w-5xl mx-auto leading-tight font-light italic">
                    "{t('ourMissionDesc')}"
                  </p>
                </motion.div>
              </div>
            </section>

            {/* News & Updates Section */}
            <section className="py-12">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-16">
                <div className="text-center md:text-left">
                  <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('newsUpdates')}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">{t('newsUpdatesSubtitle')}</p>
                </div>
                <button className="text-blue-600 font-bold flex items-center gap-2 hover:underline text-lg">
                  {t('viewAll')} <ChevronRight size={20} />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-10">
                {[
                  { title: t('news1Title'), date: t('news1Date'), desc: t('news1Desc'), image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=1000' },
                  { title: t('news2Title'), date: t('news2Date'), desc: t('news2Desc'), image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1000' }
                ].map((news, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -10 }}
                    className="bg-white dark:bg-slate-800 rounded-[40px] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row"
                  >
                    <div className="md:w-1/3 h-48 md:h-auto">
                      <img src={news.image} alt={news.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="p-8 md:w-2/3">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 block">{news.date}</span>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{news.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">{news.desc}</p>
                      <button className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-1 hover:text-blue-600 transition-colors">
                        {t('learnMore')} <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Daily Health Tip Banner */}
            <section className="py-12">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[40px] p-10 lg:p-16 text-white flex flex-col lg:flex-row items-center gap-10 shadow-2xl shadow-emerald-200 dark:shadow-none">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[32px] flex items-center justify-center shrink-0">
                  <Heart size={48} className="text-white" />
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-3xl font-bold mb-4">{t('healthTipTitle')}</h3>
                  <p className="text-xl text-emerald-50 leading-relaxed">
                    {t('healthTipBody')}
                  </p>
                </div>
                <button className="px-10 py-4 bg-white text-emerald-600 font-bold rounded-2xl hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-900/20 whitespace-nowrap">
                  {t('viewAllTips', 'More Tips')}
                </button>
              </div>
            </section>

            {/* Featured Services */}
            <section className="py-24">
              <div className="text-center mb-20">
                <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">{t('ourServices', 'Our Healthcare Services')}</h2>
                <div className="w-24 h-1.5 bg-emerald-500 mx-auto rounded-full mb-8"></div>
                <p className="text-slate-500 dark:text-slate-400 max-w-3xl mx-auto text-xl leading-relaxed">
                  {t('servicesSubtitle', 'MedLink provides a comprehensive suite of digital healthcare tools to make your medical journey seamless and efficient.')}
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                {[
                  { icon: Search, title: t('findDoctor'), desc: t('findDoctorDesc', 'Search for top specialists across Ethiopia by specialty, hospital, or rating.'), color: 'text-blue-600' },
                  { icon: Calendar, title: t('bookAppointment'), desc: t('bookAppointmentDesc', 'Schedule your visits instantly with real-time availability from leading hospitals.'), color: 'text-emerald-600' },
                  { icon: Phone, title: t('emergencyCare'), desc: t('emergencyDesc', 'Find the nearest emergency room and get immediate assistance when every second counts.'), color: 'text-red-600' },
                  { icon: Activity, title: t('labResults'), desc: t('labResultsDesc', 'Access and track your diagnostic reports securely from anywhere, anytime.'), color: 'text-purple-600' }
                ].map((service, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -10 }}
                    className="bg-white dark:bg-slate-800 p-10 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all"
                  >
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-8">
                      <service.icon size={32} className={service.color} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{service.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{service.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Featured Hospitals */}
            <section className="bg-slate-50 dark:bg-slate-800/50 -mx-6 lg:-mx-10 px-6 lg:px-10 py-24">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-16">
                  <div className="text-center md:text-left">
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('featuredHospitals', 'Featured Hospitals')}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">{t('hospitalsSubtitle', 'Partnering with the most prestigious medical institutions in the country.')}</p>
                  </div>
                  <button onClick={() => navigate('/hospitals')} className="px-8 py-4 bg-white dark:bg-slate-800 text-blue-600 font-bold rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm text-lg">
                    {t('viewAllHospitals', 'View All Hospitals')} <ChevronRight size={22} />
                  </button>
                </div>
                <div className="grid md:grid-cols-3 gap-10">
                  {HOSPITALS.slice(0, 3).map((hospital, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -10 }}
                      className="bg-white dark:bg-slate-800 rounded-[40px] overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700 group cursor-pointer"
                      onClick={() => navigate('/hospitals')}
                    >
                      <div className="h-64 overflow-hidden relative">
                        <img src={hospital.image} alt={hospital.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                        <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-sm font-bold text-blue-600 flex items-center gap-1 shadow-lg">
                          <Activity size={14} /> {hospital.rating}
                        </div>
                      </div>
                      <div className="p-10">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-blue-600 transition-colors">{hospital.name}</h3>
                        <p className="text-base text-slate-500 dark:text-slate-400 mb-8 line-clamp-2 leading-relaxed">{hospital.description}</p>
                        <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                          <MapPin size={18} className="text-blue-500" /> {hospital.location}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* How it works */}
            <section className="py-12">
              <div className="bg-blue-600 rounded-[80px] p-10 lg:p-24 text-white overflow-hidden relative shadow-2xl shadow-blue-200 dark:shadow-none">
                <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
                  <div>
                    <h2 className="text-5xl lg:text-6xl font-bold mb-12 leading-tight tracking-tight">{t('howMedLinkWorks', 'How MedLink Works')}</h2>
                    <div className="space-y-12">
                      {[
                        { step: '01', title: t('step1Title', 'Create Your Profile'), desc: t('step1Desc', 'Sign up and securely store your medical history and preferences.') },
                        { step: '02', title: t('step2Title', 'Find & Book'), desc: t('step2Desc', 'Search for specialists and book appointments at your convenience.') },
                        { step: '03', title: t('step3Title', 'Get Care'), desc: t('step3Desc', 'Visit the hospital and receive world-class medical attention.') },
                        { step: '04', title: t('step4Title', 'Track Results'), desc: t('step4Desc', 'Access your prescriptions and lab results directly on your dashboard.') }
                      ].map((step, i) => (
                        <div key={i} className="flex gap-10">
                          <span className="text-6xl font-display font-black text-blue-400/30 shrink-0 leading-none">{step.step}</span>
                          <div>
                            <h4 className="text-2xl font-bold mb-3">{step.title}</h4>
                            <p className="text-blue-100 text-lg leading-relaxed opacity-90">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="hidden lg:block relative">
                    <div className="absolute -inset-8 bg-white/10 rounded-[60px] blur-3xl"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000" 
                      alt="Medical Professional" 
                      className="relative rounded-[60px] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-1000 w-full object-cover aspect-[4/5]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[120px]"></div>
              </div>
            </section>

            {/* Emergency Prominent Section */}
            <section className="bg-red-600 p-12 lg:p-24 rounded-[80px] text-white flex flex-col lg:flex-row items-center justify-between gap-16 shadow-2xl shadow-red-200 dark:shadow-none">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/20 rounded-full text-sm font-bold uppercase tracking-widest mb-8">
                  <AlertCircle size={18} /> {t('emergency.available247', 'Available 24/7')}
                </div>
                <h2 className="text-5xl lg:text-6xl font-bold mb-6 tracking-tight">{t('needEmergencyCare', 'Need Emergency Care?')}.</h2>
                <p className="text-red-100 text-2xl max-w-2xl font-light leading-relaxed">{t('emergencySubtitle', 'Find the nearest emergency room and get immediate assistance when every second counts.')}</p>
              </div>
              <button 
                onClick={() => navigate('/emergency')}
                className="px-16 py-6 bg-white text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-all text-2xl shadow-2xl shadow-red-900/20 whitespace-nowrap"
              >
                {t('emergency.findER')}
              </button>
            </section>
          </div>
        )}
      </div>

    {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedItem(null); setShowCancelConfirm(false); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                  {selectedItem.type === 'notification' ? selectedItem.data.title : t(selectedItem.type === 'appointment' ? 'appointmentDetails' : selectedItem.type === 'appointmentList' ? 'upcomingAppointments' : selectedItem.type === 'prescription' ? 'prescriptions' : 'labResults')}
                </h3>
                <button onClick={() => { setSelectedItem(null); setShowCancelConfirm(false); setPartnerFormStatus('idle'); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <div className="p-8 max-h-[70vh] overflow-y-auto">
                {selectedItem.type === 'partnerForm' && (
                  <div className="space-y-6">
                    {partnerFormStatus === 'success' ? (
                      <div className="text-center py-10">
                        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-8">
                          <ShieldCheck size={40} />
                        </div>
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                          {t('common.verified', 'Application Received')}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                          {selectedItem.data.partnerType === 'doctor' ? t('form.successDoctor') :
                           selectedItem.data.partnerType === 'hospital' ? t('form.successHospital') :
                           selectedItem.data.partnerType === 'clinic' ? t('form.successClinic') :
                           t('form.successApi')}
                        </p>
                        <p className="mt-6 text-sm text-slate-400">
                          {t('form.successContact', 'Our team will contact you within 24 hours.')}
                        </p>
                      </div>
                    ) : (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          setPartnerFormStatus('submitting');
                          setTimeout(() => setPartnerFormStatus('success'), 1500);
                        }}
                        className="space-y-5"
                      >
                        <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                            {selectedItem.data.partnerType === 'doctor' ? <Stethoscope size={24} /> :
                             selectedItem.data.partnerType === 'hospital' ? <Building2 size={24} /> :
                             selectedItem.data.partnerType === 'clinic' ? <Activity size={24} /> :
                             <Code size={24} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">
                              {selectedItem.data.partnerType === 'doctor' ? t('partners.joinDoctor') :
                               selectedItem.data.partnerType === 'hospital' ? t('partners.registerHospital') :
                               selectedItem.data.partnerType === 'clinic' ? t('partners.partnerClinics') :
                               t('partners.healthcareApis')}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('partners.subtitle')}</p>
                          </div>
                        </div>

                        {selectedItem.data.partnerType === 'doctor' && (
                          <>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('form.fullName')}</label>
                              <input required type="text" className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Dr. Abebe Kebede" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('form.specialty')}</label>
                              <input required type="text" className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Cardiology" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('form.licenseNumber')}</label>
                                <input required type="text" className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="ML-12345" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('form.phone')}</label>
                                <input required type="tel" className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="+251 9..." />
                              </div>
                            </div>
                          </>
                        )}

                        {selectedItem.data.partnerType === 'hospital' && (
                          <>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('form.hospitalName')}</label>
                              <input required type="text" className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Black Lion Hospital" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('form.location')}</label>
                              <input required type="text" className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Addis Ababa, Ethiopia" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('form.contactPerson')}</label>
                                <input required type="text" className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Admin Name" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('form.phone')}</label>
                                <input required type="tel" className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="+251 11..." />
                              </div>
                            </div>
                          </>
                        )}

                        {selectedItem.data.partnerType === 'clinic' && (
                          <>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('form.clinicName')}</label>
                              <input required type="text" className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Family Care Clinic" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('form.servicesOffered')}</label>
                              <textarea required className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none" placeholder="General checkups, Pediatrics, etc." />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('form.email')}</label>
                              <input required type="email" className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="contact@clinic.com" />
                            </div>
                          </>
                        )}

                        {selectedItem.data.partnerType === 'api' && (
                          <>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Organization Name</label>
                              <input required type="text" className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="HealthTech Solutions" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Purpose of Integration</label>
                              <textarea required className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none" placeholder="How will you use our APIs?" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Developer Email</label>
                              <input required type="email" className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="dev@org.com" />
                            </div>
                          </>
                        )}

                        <button 
                          disabled={partnerFormStatus === 'submitting'}
                          type="submit"
                          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {partnerFormStatus === 'submitting' ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              {t('booking.processing')}
                            </>
                          ) : (
                            t('form.submit')
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}


                {selectedItem.type === 'appointment' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">{t('patient')}</p>
                        <p className="font-bold text-slate-900 dark:text-white">{selectedItem.data.patientName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase">{t('age')}</p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {selectedItem.data.patientAge?.years}y {selectedItem.data.patientAge?.months}m {selectedItem.data.patientAge?.days}d
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
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedItem.data.doctorName || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600">
                          <Stethoscope size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{t('specialty')}</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedItem.data.specialty}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('hospital')}</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedItem.data.hospitalName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600">
                        <Clock size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('dateTime')}</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {new Date(selectedItem.data.date).toLocaleDateString()} at {selectedItem.data.time || new Date(selectedItem.data.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {selectedItem.data.status === 'confirmed' && (
                          <Countdown targetDate={selectedItem.data.date} targetTime={selectedItem.data.time} />
                        )}
                      </div>
                    </div>

                    {(selectedItem.data.notes || selectedItem.data.message) && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                        <p className="text-sm text-slate-500 mb-1">{selectedItem.data.message ? t('message') : t('notes')}</p>
                        <p className="text-slate-700 dark:text-slate-300">{selectedItem.data.message || selectedItem.data.notes}</p>
                      </div>
                    )}

                    {selectedItem.data.status !== 'cancelled' && (
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
                                onClick={() => handleCancelAppointment(selectedItem.data.id)}
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
                )}

                {selectedItem.type === 'prescription' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                        <FileText size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('medication')}</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedItem.data.medication}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('dosage')}</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedItem.data.dosage}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                      <p className="text-sm text-slate-500 mb-1">{t('instructions')}</p>
                      <p className="text-slate-700 dark:text-slate-300 italic">"{selectedItem.data.instructions}"</p>
                    </div>
                    <p className="text-xs text-slate-400">{t('prescribedOn')} {new Date(selectedItem.data.date).toLocaleDateString()}</p>
                  </div>
                )}

                {selectedItem.type === 'labResult' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600">
                        <Activity size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('testName')}</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedItem.data.testName}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-6 bg-purple-50 dark:bg-purple-900/30 rounded-3xl">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">{t('result')}</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-white">{selectedItem.data.result}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-purple-600 font-medium">{t('status')}</p>
                        <p className="text-lg font-bold text-purple-900 dark:text-white capitalize">{selectedItem.data.status}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('performedAt')} <span className="font-bold">{selectedItem.data.centerName}</span> {t('on')} {new Date(selectedItem.data.date).toLocaleDateString()}</p>
                  </div>
                )}

                {selectedItem.type === 'notification' && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-8">
                      <AlertCircle size={40} />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xl leading-relaxed mb-10">
                      {selectedItem.data.message}
                    </p>
                    {!user && (
                      <button 
                        onClick={() => { setSelectedItem(null); navigate('/login'); }}
                        className="w-full py-4 bg-brand-blue text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-brand-blue/20 text-lg"
                      >
                        {t('auth.login')}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-700 flex justify-end">
                <button 
                  onClick={() => { setSelectedItem(null); setShowCancelConfirm(false); setPartnerFormStatus('idle'); }}
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

export default Dashboard;
