import { useState } from 'react';
import { AddUserToProjectModal } from './AddUserToProjectModal';
import './AddUserButton.css';

interface AddUserButtonProps {
    projectId: string;
    teamId: string;
    onUserAdded?: () => void;
    buttonText?: string;
    buttonClassName?: string;
}

/**
 * Standalone button component that opens the AddUserToProjectModal
 * Can be used anywhere in the application where you need to add users to a project
 */
export const AddUserButton = ({
    projectId,
    teamId,
    onUserAdded,
    buttonText = 'Добавить участника',
    buttonClassName = 'add-user-btn'
}: AddUserButtonProps) => {
    const [showModal, setShowModal] = useState(false);

    const handleUserAdded = () => {
        setShowModal(false);
        if (onUserAdded) {
            onUserAdded();
        }
    };

    return (
        <>
            <button
                className={buttonClassName}
                onClick={() => setShowModal(true)}
            >
                {buttonText}
            </button>

            {showModal && (
                <AddUserToProjectModal
                    projectId={projectId}
                    teamId={teamId}
                    onClose={() => setShowModal(false)}
                    onUserAdded={handleUserAdded}
                />
            )}
        </>
    );
};
