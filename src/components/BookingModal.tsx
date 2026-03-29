import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X, User, Clock, Stethoscope, MapPin, Calendar, MessageSquare } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAppContext } from '../contexts/AppContext';
import { Appointment } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    doctorId?: string;
    doctorName?: string;
    hospitalId?: string;
    hospitalName?: string;
    specialty?: string;
    type: 'consult' | 'booking';
  };
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, initialData }) => {
  const { t } = useAppContext();
  const [formData, setFormData] = useState({
    fullName: auth.currentUser?.displayName || '',
    ageYears: '',
    ageMonths: '',
    ageDays: '',
    specialty: initialData?.specialty || '',
    date: '',
    time: '',
    hospital: initialData?.hospitalName || '',
    doctor: initialData?.doctorName || '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setIsSubmitting(true);
    try {
      const appointmentData = {
        patientUid: auth.currentUser.uid,
        patientName: formData.fullName,
        patientAge: {
          years: parseInt(formData.ageYears) || 0,
          months: parseInt(formData.ageMonths) || 0,
          days: parseInt(formData.ageDays) || 0,
        },
        specialty: formData.specialty,
        doctorId: initialData?.doctorId || null,
        doctorName: formData.doctor,
        hospitalId: initialData?.hospitalId || null,
        hospitalName: formData.hospital,
        date: formData.date,
        time: formData.time,
        status: 'pending',
        message: formData.message,
        type: initialData?.type || 'booking',
        createdAt: new Date().toISOString(),
      };

      // Save to Firestore
      await addDoc(collection(db, 'appointments'), appointmentData);

      // Simulate sending email to genanewmichael90@gmail.com
      // In a real app, we'd call a backend API here
      console.log('Sending email to genanewmichael90@gmail.com with data:', appointmentData);
      
      // We'll call a mock backend endpoint if it exists, or just log it
      try {
        await fetch('/api/send-booking-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'genanewmichael90@gmail.com',
            subject: `New ${initialData?.type === 'consult' ? 'Consultation' : 'Booking'} Request`,
            data: appointmentData
          })
        });
      } catch (err) {
        console.warn('Backend email route not available yet, but data saved to Firestore.');
      }

      setIsSuccess(true);
    } catch (error) {
      console.error('Error saving booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 sticky top-0 z-10">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
            {initialData?.type === 'consult' ? t('booking.consultNow') : t('booking.bookAppointment')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all">
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {isSuccess ? (
            <div className="text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                {initialData?.type === 'consult' ? t('booking.requestReceived') : t('booking.bookingConfirmed')}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">
                {initialData?.type === 'consult' 
                  ? t('booking.reachOutSoon') 
                  : t('booking.yourBookingConfirmed')}
              </p>
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
              >
                {t('booking.close')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <User size={16} className="text-blue-600" /> {t('booking.fullName')}
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder={t('booking.fullNamePlaceholder')}
                  />
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Clock size={16} className="text-blue-600" /> {t('booking.age')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      required
                      type="number"
                      placeholder={t('booking.years')}
                      value={formData.ageYears}
                      onChange={(e) => setFormData({ ...formData, ageYears: e.target.value })}
                      className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <input
                      required
                      type="number"
                      placeholder={t('booking.months')}
                      value={formData.ageMonths}
                      onChange={(e) => setFormData({ ...formData, ageMonths: e.target.value })}
                      className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <input
                      required
                      type="number"
                      placeholder={t('booking.days')}
                      value={formData.ageDays}
                      onChange={(e) => setFormData({ ...formData, ageDays: e.target.value })}
                      className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Specialty */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Stethoscope size={16} className="text-blue-600" /> {t('booking.specialtyNeeded')}
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder={t('booking.specialtyPlaceholder')}
                  />
                </div>

                {/* Hospital */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" /> {t('booking.hospital')}
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder={t('booking.hospitalPlaceholder')}
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600" /> {t('booking.preferredDate')}
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Clock size={16} className="text-blue-600" /> {t('booking.preferredTime')}
                  </label>
                  <input
                    required
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Specific Doctor (Optional) */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <User size={16} className="text-blue-600" /> {t('booking.specificDoctor')}
                </label>
                <input
                  type="text"
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder={t('booking.doctorPlaceholder')}
                />
              </div>

              {/* Message (Optional) */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-600" /> {t('booking.message')}
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
                  placeholder={t('booking.messagePlaceholder')}
                />
              </div>

              <div className="pt-4">
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('booking.processing')}
                    </>
                  ) : (
                    initialData?.type === 'consult' ? t('booking.requestConsultation') : t('booking.confirmBooking')
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BookingModal;
