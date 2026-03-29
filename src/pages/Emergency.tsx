import React, { useState } from 'react';
import { Phone, Ambulance, Heart, Activity, Wind, Droplets, Flame, AlertCircle, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { motion, AnimatePresence } from 'motion/react';

const Emergency = () => {
  const { t } = useAppContext();
  const [selectedEmergency, setSelectedEmergency] = useState<any>(null);

  const emergencies = [
    {
      id: 'heart-attack',
      title: t('emergency.heartAttack.title'),
      icon: <Heart className="w-8 h-8 text-red-500" />,
      do: t('emergency.heartAttack.do'),
      dont: t('emergency.heartAttack.dont'),
      color: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      id: 'stroke',
      title: t('emergency.stroke.title'),
      icon: <Activity className="w-8 h-8 text-blue-500" />,
      do: t('emergency.stroke.do'),
      dont: t('emergency.stroke.dont'),
      color: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 'choking',
      title: t('emergency.choking.title'),
      icon: <Wind className="w-8 h-8 text-orange-500" />,
      do: t('emergency.choking.do'),
      dont: t('emergency.choking.dont'),
      color: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      id: 'bleeding',
      title: t('emergency.bleeding.title'),
      icon: <Droplets className="w-8 h-8 text-red-600" />,
      do: t('emergency.bleeding.do'),
      dont: t('emergency.bleeding.dont'),
      color: 'bg-red-50 dark:bg-red-900/10'
    },
    {
      id: 'burns',
      title: t('emergency.burns.title'),
      icon: <Flame className="w-8 h-8 text-yellow-600" />,
      do: t('emergency.burns.do'),
      dont: t('emergency.burns.dont'),
      color: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      id: 'seizures',
      title: t('emergency.seizures.title'),
      icon: <AlertCircle className="w-8 h-8 text-purple-500" />,
      do: t('emergency.seizures.do'),
      dont: t('emergency.seizures.dont'),
      color: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto dark:bg-slate-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-red-500 rounded-[32px] md:rounded-[40px] p-6 md:p-8 lg:p-16 text-white relative overflow-hidden shadow-2xl shadow-red-500/20">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10 -skew-x-12 translate-x-1/2" />
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1 rounded-full text-xs font-bold uppercase mb-6">
              <Ambulance className="w-4 h-4" /> {t('emergency.response')}
            </div>
            <h2 className="text-4xl lg:text-6xl font-display font-bold mb-6 text-white">{t('emergency.urgentTitle')}</h2>
            <p className="text-red-100 text-xl mb-10 max-w-md">
              {t('emergency.urgentSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="tel:907"
                className="bg-white text-red-500 px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-xl shadow-red-900/20 hover:bg-red-50 transition-colors"
              >
                <Phone className="w-6 h-6" /> {t('emergency.call907')}
              </a>
              <button className="bg-red-600 text-white border border-red-400 px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 hover:bg-red-700 transition-colors">
                {t('emergency.findER')}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: t('emergency.redCross'), phone: '907' },
              { name: t('emergency.tebita'), phone: '8035' },
              { name: t('emergency.addisCardiac'), phone: '8222' },
              { name: t('emergency.police'), phone: '991' }
            ].map((item) => (
              <a 
                key={item.name} 
                href={`tel:${item.phone}`}
                className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/20 transition-all group"
              >
                <p className="text-red-100 text-sm font-medium mb-1">{item.name}</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">{item.phone}</p>
                  <Phone className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Ambulance Numbers Section */}
      <div className="mt-20">
        <h3 className="text-3xl font-bold mb-10 text-slate-900 dark:text-white flex items-center gap-3">
          <Ambulance className="text-red-500" /> {t('emergency.ambulanceNumbers', 'Ambulance Numbers')}
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Red Cross Ambulance', phone: '907', location: 'Addis Ababa' },
            { name: 'Tebita Ambulance', phone: '8035', location: 'Addis Ababa' },
            { name: 'Addis Cardiac Center', phone: '8222', location: 'Addis Ababa' },
            { name: 'St. Paul Hospital Ambulance', phone: '8057', location: 'Addis Ababa' },
            { name: 'Black Lion Hospital Ambulance', phone: '939', location: 'Addis Ababa' },
            { name: 'Police Emergency', phone: '991', location: 'National' }
          ].map((ambulance, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{ambulance.name}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{ambulance.location}</p>
                <p className="text-2xl font-display font-bold text-red-500">{ambulance.phone}</p>
              </div>
              <a 
                href={`tel:${ambulance.phone}`}
                className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all"
              >
                <Phone className="w-6 h-6" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* What to do during emergencies Section */}
      <div className="mt-16 md:mt-20">
        <h3 className="text-2xl md:text-3xl font-bold mb-8 text-slate-900 dark:text-white flex items-center gap-3">
          <AlertCircle className="text-red-500" /> {t('emergency.whatToDo')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {emergencies.map((emergency) => (
            <button
              key={emergency.id}
              onClick={() => setSelectedEmergency(emergency)}
              className={`${emergency.color} p-6 rounded-[32px] flex flex-col items-center text-center gap-4 hover:scale-105 transition-transform duration-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-700`}
            >
              {emergency.icon}
              <span className="font-bold text-slate-900 dark:text-white text-sm">{emergency.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Detail Modal */}
      <AnimatePresence>
        {selectedEmergency && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="p-6 md:p-8 lg:p-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`${selectedEmergency.color} p-4 rounded-2xl`}>
                      {selectedEmergency.icon}
                    </div>
                    <h4 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                      {selectedEmergency.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => setSelectedEmergency(null)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-500" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-3xl border border-green-100 dark:border-green-900/30">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold mb-4 uppercase text-sm tracking-wider">
                      <CheckCircle2 className="w-5 h-5" /> {t('emergency.do')}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                      {selectedEmergency.do}
                    </p>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl border border-red-100 dark:border-red-900/30">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold mb-4 uppercase text-sm tracking-wider">
                      <AlertTriangle className="w-5 h-5" /> {t('emergency.dont')}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                      {selectedEmergency.dont}
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex justify-center">
                  <a
                    href="tel:907"
                    className="bg-red-500 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                  >
                    <Phone className="w-5 h-5" /> {t('emergency.call907')}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-20 grid md:grid-cols-3 gap-8">
        {[
          { title: t('emergency.ambulanceService'), desc: t('emergency.ambulanceDesc') },
          { title: t('emergency.hospitalsTitle'), desc: t('emergency.hospitalsDesc') },
          { title: t('emergency.firstAidTitle'), desc: t('emergency.firstAidDesc') }
        ].map((service, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{service.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{service.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Emergency;
