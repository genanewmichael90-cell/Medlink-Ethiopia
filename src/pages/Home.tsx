import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { HOSPITALS } from '../constants';
import { ChevronRight, Search, MapPin, Phone, X, AlertCircle, Stethoscope, ShieldCheck, Heart, Building2, Code, Calendar, Activity, Award, Clock, User, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

const Home = () => {
  const navigate = useNavigate();
  const { t, language, partnerFormToOpen, setPartnerFormToOpen } = useAppContext();
  const [user, setUser] = useState(auth.currentUser);
  const [selectedItem, setSelectedItem] = useState<{ type: 'notification' | 'partnerForm' | 'healthTips', data?: any } | null>(null);
  const [partnerFormStatus, setPartnerFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const dailyTipIndex = (new Date().getDate() % 7) + 1;
  const healthTips = [1, 2, 3, 4, 5, 6, 7];

  useEffect(() => {
    if (partnerFormToOpen) {
      setSelectedItem({ type: 'partnerForm', data: { partnerType: partnerFormToOpen } });
      setPartnerFormToOpen(null);
    }
  }, [partnerFormToOpen, setPartnerFormToOpen]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="dark:bg-slate-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-start pt-32 lg:pt-48">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="https://image2url.com/r2/default/videos/1774774092971-de5b6aff-0991-4ccc-b48f-cca5b3541ba1.mp4" type="video/mp4" />
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
            >
              <span className="inline-block px-5 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-bold tracking-[0.3em] uppercase mb-8 backdrop-blur-md">
                {t('leadingMedicalService', 'Leading Online Medical Service in Ethiopia')}
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[0.95] mb-8 tracking-tighter">
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

      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-24">
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
              <div className="space-y-2">
                <h4 className="text-2xl font-bold text-emerald-100">{t(`tips.${dailyTipIndex}.title`)}</h4>
                <p className="text-xl text-emerald-50 leading-relaxed">
                  {t(`tips.${dailyTipIndex}.body`)}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedItem({ type: 'healthTips' })}
              className="px-10 py-4 bg-white text-emerald-600 font-bold rounded-2xl hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-900/20 whitespace-nowrap"
            >
              {t('viewAllTips', 'More Tips')}
            </button>
          </div>
        </section>

        {/* Featured Services */}
        <section id="services" className="py-24">
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
        <section id="hospitals" className="bg-slate-50 dark:bg-slate-800/50 -mx-6 lg:-mx-10 px-6 lg:px-10 py-24">
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
        <section id="emergency" className="bg-red-600 p-12 lg:p-24 rounded-[80px] text-white flex flex-col lg:flex-row items-center justify-between gap-16 shadow-2xl shadow-red-200 dark:shadow-none">
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

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
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
              className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                  {selectedItem.type === 'notification' ? selectedItem.data.title : 'Partner Form'}
                </h3>
                <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all">
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
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Application Received</h4>
                        <p className="text-slate-600 dark:text-slate-300">Our team will contact you within 24 hours.</p>
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
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name / Organization</label>
                          <input required type="text" className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                          <input required type="email" className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                          <input required type="tel" className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <button 
                          disabled={partnerFormStatus === 'submitting'}
                          type="submit"
                          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {partnerFormStatus === 'submitting' ? 'Processing...' : 'Submit Application'}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {selectedItem.type === 'healthTips' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{t('healthTipTitle')}</h3>
                    <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                      <X size={24} className="text-slate-500" />
                    </button>
                  </div>
                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {healthTips.map((tipIdx) => (
                      <div key={tipIdx} className={`p-6 rounded-2xl border transition-all ${tipIdx === dailyTipIndex ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${tipIdx === dailyTipIndex ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                            {tipIdx}
                          </div>
                          <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                            {t(`tips.${tipIdx}.title`)}
                            {tipIdx === dailyTipIndex && <span className="ml-3 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 rounded-full">{t('today', 'Today')}</span>}
                          </h4>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          {t(`tips.${tipIdx}.body`)}
                        </p>
                      </div>
                    ))}
                  </div>
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
                  onClick={() => setSelectedItem(null)}
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

export default Home;
