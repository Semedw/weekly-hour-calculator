import React, { useState, useEffect } from 'react';
import styles from './WheelTimePicker.module.css';

interface WheelTimePickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const WheelTimePicker: React.FC<WheelTimePickerProps> = ({ id, value, onChange, label }) => {
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      const hourNum = parseInt(h, 10);
      setMinute(m);
      
      if (hourNum === 0) {
        setHour('12');
        setPeriod('AM');
      } else if (hourNum < 12) {
        setHour(hourNum.toString().padStart(2, '0'));
        setPeriod('AM');
      } else if (hourNum === 12) {
        setHour('12');
        setPeriod('PM');
      } else {
        setHour((hourNum - 12).toString().padStart(2, '0'));
        setPeriod('PM');
      }
    } else {
      setHour('');
      setMinute('');
    }
  }, [value]);

  const handleTimeChange = (newHour: string, newMinute: string, newPeriod: 'AM' | 'PM') => {
    if (!newHour || !newMinute) return;
    
    let hour24 = parseInt(newHour, 10);
    
    if (newPeriod === 'AM') {
      if (hour24 === 12) hour24 = 0;
    } else {
      if (hour24 !== 12) hour24 += 12;
    }
    
    const time24 = `${hour24.toString().padStart(2, '0')}:${newMinute}`;
    onChange(time24);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = e.target.value;
    setHour(newHour);
    handleTimeChange(newHour, minute, period);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinute = e.target.value;
    setMinute(newMinute);
    handleTimeChange(hour, newMinute, period);
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPeriod = e.target.value as 'AM' | 'PM';
    setPeriod(newPeriod);
    handleTimeChange(hour, minute, newPeriod);
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className={styles.inputGroup}>
      <label htmlFor={id}>{label}</label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <select 
          value={hour} 
          onChange={handleHourChange}
          className={styles.timeInput}
          style={{ flex: 1 }}
        >
          <option value="">--</option>
          {hours.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <select 
          value={minute} 
          onChange={handleMinuteChange}
          className={styles.timeInput}
          style={{ flex: 1 }}
        >
          <option value="">--</option>
          {minutes.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select 
          value={period} 
          onChange={handlePeriodChange}
          className={styles.timeInput}
          style={{ flex: '0 0 70px' }}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
};

export default WheelTimePicker;
