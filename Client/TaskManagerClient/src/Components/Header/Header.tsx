import type {User} from '../../types';
import './Header.css';

interface HeaderProps {
    currentUser: User;
    onLogout: () => void;
}

export const Header = ({currentUser, onLogout}: HeaderProps) => (
    <header className="main-header">
        <h1>Project Manager</h1>
        <div className="header-user">
            <>
                <span className="user-greeting">Привет, {currentUser.username}</span>
                <button className="logout-btn" onClick={onLogout}>
                    Выйти
                </button>
            </>
        </div>
    </header>
);