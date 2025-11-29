const API_BASE_URL = 'http://localhost:8000/api';

export interface DayData {
  day: string;
  sessions: Array<{ checkIn: string; checkOut: string }>;
}

export interface WeekData {
  id: number;
  week_start_date: string;
  week_data: DayData[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

class ApiService {
  private userId: number | null = null;
  private csrfToken: string | null = null;

  setUserId(id: number) {
    this.userId = id;
  }

  getUserId(): number | null {
    return this.userId;
  }

  getCsrfToken(): string {
    if (this.csrfToken) return this.csrfToken;
    
    const name = 'csrftoken';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === name) {
        this.csrfToken = value;
        return value;
      }
    }
    return '';
  }

  async register(username: string, email: string, password: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': this.getCsrfToken(),
      },
      credentials: 'include',
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const user = await response.json();
    this.setUserId(user.id);
    return user;
  }

  async login(username: string, password: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': this.getCsrfToken(),
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const user = await response.json();
    this.setUserId(user.id);
    return user;
  }

  async logout(): Promise<void> {
    await fetch(`${API_BASE_URL}/logout/`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': this.getCsrfToken(),
      },
      credentials: 'include',
    });
    this.userId = null;
  }

  async getCurrentWeek(): Promise<WeekData> {
    if (!this.userId) {
      throw new Error('User not logged in');
    }

    const response = await fetch(`${API_BASE_URL}/week/current/?user_id=${this.userId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch week data');
    }

    return await response.json();
  }

  async saveCurrentWeek(weekData: DayData[]): Promise<WeekData> {
    if (!this.userId) {
      throw new Error('User not logged in');
    }

    const response = await fetch(`${API_BASE_URL}/week/save/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': this.getCsrfToken(),
      },
      credentials: 'include',
      body: JSON.stringify({
        user_id: this.userId,
        week_data: weekData,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to save week data: ${error}`);
    }

    return await response.json();
  }

  async getWeekHistory(): Promise<WeekData[]> {
    if (!this.userId) {
      throw new Error('User not logged in');
    }

    const response = await fetch(`${API_BASE_URL}/week/history/?user_id=${this.userId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch week history');
    }

    return await response.json();
  }
}

export const apiService = new ApiService();
