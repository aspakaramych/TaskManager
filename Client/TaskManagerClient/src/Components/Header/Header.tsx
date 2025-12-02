import type { User } from '../../types';
import './Header.css';

interface HeaderProps {
  currentUser: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const Header = ({ currentUser, onLogin, onLogout }: HeaderProps) => (
  <header className="main-header">
    <h1>Project Manager</h1>
    <div className="header-user">
      {currentUser ? (
        <>
          <span className="user-greeting">Привет, {currentUser.name}</span>
          <button className="logout-btn" onClick={onLogout}>
            Выйти
          </button>
        </>
      ) : (
        <button className="login-btn" onClick={onLogin}>
          Войти
        </button>
      )}
    </div>
  </header>
);