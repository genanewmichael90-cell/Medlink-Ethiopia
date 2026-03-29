import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

interface CountdownProps {
  targetDate: string; // ISO date string
  targetTime?: string; // e.g. "10:00 AM"
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, targetTime }) => {
  const { t, language } = useAppContext();
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      let target;
      if (targetTime) {
        // Parse time string like "10:00 AM"
        const [time, modifier] = targetTime.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        
        const dateObj = new Date(targetDate);
        dateObj.setHours(hours, minutes, 0, 0);
        target = dateObj.getTime();
      } else {
        target = new Date(targetDate).getTime();
      }

      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, targetTime]);

  if (!timeLeft) return null;

  return (
    <div className="flex gap-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg mt-2">
      <span className="flex items-center gap-0.5">
        {timeLeft.days}
        <span className="opacity-60">{t('days_short') || 'd'}</span>
      </span>
      <span className="flex items-center gap-0.5">
        {timeLeft.hours}
        <span className="opacity-60">{t('hours_short') || 'h'}</span>
      </span>
      <span className="flex items-center gap-0.5">
        {timeLeft.minutes}
        <span className="opacity-60">{t('minutes_short') || 'm'}</span>
      </span>
      <span className="flex items-center gap-0.5">
        {timeLeft.seconds}
        <span className="opacity-60">{t('seconds_short') || 's'}</span>
      </span>
    </div>
  );
};

export default Countdown;
