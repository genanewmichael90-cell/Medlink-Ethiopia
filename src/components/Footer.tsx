import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, MessageSquare, MapPin, Activity } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const Footer = () => {
  const { t, openPartnerForm } = useAppContext();
  const navigate = useNavigate();

  const handleQuickLinkClick = (id: string) => {
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handlePartnerClick = (type: 'doctor' | 'hospital' | 'clinic' | 'api') => {
    navigate('/');
    setTimeout(() => {
      openPartnerForm(type);
    }, 100);
  };
  
  return (
    <footer className="bg-white dark:bg-slate-800 pt-20 pb-10 border-t border-slate-100 dark:border-slate-700 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <img 
                src="https://image2url.com/r2/default/images/1774462310469-6e7ce67c-7659-461e-94f9-857cd54cc288.png" 
                alt="MedLink Ethiopia Logo" 
                className="w-8 h-8 object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="text-xl font-display font-bold text-slate-900 dark:text-white">MedLink Ethiopia</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
              {t('footer.description')}
            </p>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                  <Activity className="w-5 h-5" />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-slate-900 dark:text-white">{t('footer.quickLinks')}</h4>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <button 
                  onClick={() => handleQuickLinkClick('services')}
                  className="hover:text-blue-600 transition-colors text-left w-full"
                >
                  {t('footer.findDoctor')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickLinkClick('hospitals')}
                  className="hover:text-blue-600 transition-colors text-left w-full"
                >
                  {t('footer.hospitalsList')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickLinkClick('services')}
                  className="hover:text-blue-600 transition-colors text-left w-full"
                >
                  {t('footer.labServices')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickLinkClick('emergency')}
                  className="hover:text-blue-600 transition-colors text-left w-full"
                >
                  {t('footer.emergencyHelp')}
                </button>
              </li>
              <li>
                <Link 
                  to="/pharmacy"
                  className="hover:text-blue-600 transition-colors text-left w-full block"
                >
                  {t('nav.pharmacy')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-slate-900 dark:text-white">{t('footer.forProviders')}</h4>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <button 
                  onClick={() => handlePartnerClick('doctor')}
                  className="hover:text-blue-600 transition-colors text-left w-full"
                >
                  {t('footer.joinDoctor')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handlePartnerClick('hospital')}
                  className="hover:text-blue-600 transition-colors text-left w-full"
                >
                  {t('footer.registerHospital')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handlePartnerClick('clinic')}
                  className="hover:text-blue-600 transition-colors text-left w-full"
                >
                  {t('footer.partnerClinics')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handlePartnerClick('api')}
                  className="hover:text-blue-600 transition-colors text-left w-full"
                >
                  {t('footer.healthcareApis')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-slate-900 dark:text-white">{t('footer.contactUs')}</h4>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-blue-600" /> +251 11 6XX XXXX</li>
              <li className="flex items-center gap-3"><MessageSquare className="w-4 h-4 text-blue-600" /> support@medlink.et</li>
              <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-blue-600" /> Bole, Addis Ababa, Ethiopia</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-10 border-t border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-slate-400 dark:text-slate-500">© 2026 MedLink Ethiopia. {t('footer.rights')}</p>
          <div className="flex gap-8 text-xs text-slate-400 dark:text-slate-500">
            <a href="#" className="hover:text-blue-600">{t('footer.privacyPolicy')}</a>
            <a href="#" className="hover:text-blue-600">{t('footer.termsOfService')}</a>
            <a href="#" className="hover:text-blue-600">{t('footer.cookiePolicy')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
