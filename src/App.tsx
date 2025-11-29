import { useState, useMemo, useEffect } from 'react';
import DayRow from './components/DayRow';
import Summary from './components/Summary';
import ProgressChart from './components/ProgressChart';
import Auth from './components/Auth';
import Header from './components/Header';
import { DAYS_OF_WEEK, calculateDailyHours, DayData } from './utils/timeCalculations';
import { apiService } from './services/api';
import styles from './App.module.css';

interface LocalUser {
  id: string;
  username: string;
  email: string;
}

function App() {
  const [currentUser, setCurrentUserState] = useState<LocalUser | null>(() => {
    // Load user from localStorage on initial render
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [weekData, setWeekData] = useState<DayData[]>(
    DAYS_OF_WEEK.map(day => ({
      day,
      sessions: [{ checkIn: '', checkOut: '' }],
    }))
  );
  const [saveMessage, setSaveMessage] = useState('');

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      apiService.setUserId(Number(currentUser.id));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Load user's saved data when they log in
  useEffect(() => {
    if (currentUser) {
      loadWeekFromBackend();
    }
  }, [currentUser]);

  const loadWeekFromBackend = async () => {
    if (!currentUser) return;
    
    try {
      const weekRecord = await apiService.getCurrentWeek();
      if (weekRecord.week_data && weekRecord.week_data.length > 0) {
        setWeekData(weekRecord.week_data);
      }
    } catch (error) {
      console.error('Failed to load week data:', error);
    }
  };

  const totalHours = useMemo(() => {
    return weekData.reduce((total, dayData) => {
      // Exclude Saturday and Sunday from total hours calculation
      if (dayData.day === 'Saturday' || dayData.day === 'Sunday') {
        return total;
      }
      
      const dayTotal = dayData.sessions.reduce((sum, session) => {
        return sum + calculateDailyHours(session.checkIn, session.checkOut);
      }, 0);
      return total + dayTotal;
    }, 0);
  }, [weekData]);

  const updateSession = (
    dayIndex: number, 
    sessionIndex: number, 
    field: 'checkIn' | 'checkOut', 
    value: string
  ) => {
    setWeekData(prev => {
      const newData = [...prev];
      const newSessions = [...newData[dayIndex].sessions];
      newSessions[sessionIndex] = { ...newSessions[sessionIndex], [field]: value };
      newData[dayIndex] = { ...newData[dayIndex], sessions: newSessions };
      return newData;
    });
  };

  const addSession = (dayIndex: number) => {
    setWeekData(prev => {
      const newData = [...prev];
      newData[dayIndex] = {
        ...newData[dayIndex],
        sessions: [...newData[dayIndex].sessions, { checkIn: '', checkOut: '' }]
      };
      return newData;
    });
  };

  const removeSession = (dayIndex: number, sessionIndex: number) => {
    setWeekData(prev => {
      const newData = [...prev];
      const newSessions = newData[dayIndex].sessions.filter((_, i) => i !== sessionIndex);
      newData[dayIndex] = { ...newData[dayIndex], sessions: newSessions };
      return newData;
    });
  };

  const handleLogin = async (username: string, _email: string, password: string) => {
    try {
      const apiUser = await apiService.login(username, password);
      const localUser: LocalUser = {
        id: apiUser.id.toString(),
        username: apiUser.username,
        email: apiUser.email,
      };
      setCurrentUserState(localUser);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your username and password.');
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    try {
      const apiUser = await apiService.register(username, email, password);
      const localUser: LocalUser = {
        id: apiUser.id.toString(),
        username: apiUser.username,
        email: apiUser.email,
      };
      setCurrentUserState(localUser);
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Username might already be taken.');
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setCurrentUserState(null);
      setWeekData(DAYS_OF_WEEK.map(day => ({
        day,
        sessions: [{ checkIn: '', checkOut: '' }],
      })));
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSave = async () => {
    if (currentUser) {
      try {
        setSaveMessage('Saving...');
        await apiService.saveCurrentWeek(weekData);
        
        // Reload from backend to confirm
        await loadWeekFromBackend();
        
        // Show confirmation message
        setSaveMessage('Saved successfully!');
        setTimeout(() => setSaveMessage(''), 2000);
      } catch (error) {
        console.error('Save failed:', error);
        setSaveMessage('Save failed!');
        setTimeout(() => setSaveMessage(''), 2000);
      }
    }
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <Header username={currentUser.username} onLogout={handleLogout} />

        <div className={styles.content}>
          <div className={styles.leftColumn}>
            <div className={styles.daysSection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className={styles.sectionTitle}>Daily Check-ins</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {saveMessage && (
                    <span style={{ 
                      color: '#4CAF50', 
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      animation: 'fadeIn 0.3s ease'
                    }}>
                      {saveMessage}
                    </span>
                  )}
                  <button 
                    onClick={handleSave}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#4299e1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#3182ce';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#4299e1';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
              <div className={styles.daysList}>
                {weekData.map((dayData, index) => (
                  <DayRow
                    key={dayData.day}
                    day={dayData.day}
                    sessions={dayData.sessions}
                    onSessionChange={(sessionIndex, field, value) => 
                      updateSession(index, sessionIndex, field, value)
                    }
                    onAddSession={() => addSession(index)}
                    onRemoveSession={(sessionIndex) => removeSession(index, sessionIndex)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <Summary totalHours={totalHours} />
            <ProgressChart totalHours={totalHours} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
