import { useState, useEffect } from 'react';
import { User } from '../types';

const MOCK_USERS: User[] = [
  { id: 1, name: 'Алексей Иванов', email: 'alex@mail.com' },
  { id: 2, name: 'Мария Петрова', email: 'maria@mail.com' },
  { id: 3, name: 'Дмитрий Сидоров', email: 'dmitry@mail.com' },
  { id: 4, name: 'Елена Козлова', email: 'elena@mail.com' },
  { id: 5, name: 'Сергей Васильев', email: 'sergey@mail.com' },
  { id: 6, name: 'Ольга Новикова', email: 'olga@mail.com' },
  { id: 7, name: 'Иван Кузнецов', email: 'ivan@mail.com' },
  { id: 8, name: 'Анна Смирнова', email: 'anna@mail.com' }
];

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser) as User;
                requestAnimationFrame(() => {
                    setCurrentUser(parsedUser);
                });
            } catch (error) {
                console.error('Failed to parse saved user:', error);
            }
        }
    }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return {
    currentUser,
    allUsers: MOCK_USERS,
    login,
    logout
  };
};