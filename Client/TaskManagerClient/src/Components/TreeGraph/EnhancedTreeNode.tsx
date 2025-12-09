import React, { useState } from 'react';
import { TaskResponse, TaskProgress } from '../../types';
import { formatDeadline } from '../../utils/taskTreeUtils';

interface EnhancedTreeNodeProps {
    task: TaskResponse;
    onTaskClick: (task: TaskResponse) => void;
    onToggle?: () => void;
    isOpen?: boolean;
    hasChildren?: boolean;
    isCompleted?: boolean;
    isRootLevel?: boolean;
}

export const EnhancedTreeNode: React.FC<EnhancedTreeNodeProps> = ({
                                                                      task,
                                                                      onTaskClick,
                                                                      onToggle,
                                                                      isOpen = false,
                                                                      hasChildren = false,
                                                                      isCompleted = false,
                                                                      isRootLevel = false
                                                                  }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onTaskClick(task);
    };

    const handleToggleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onToggle) onToggle();
    };

    const isDone = task.progress === TaskProgress.Done;

    // Inline стили для ноды
    const nodeStyles: React.CSSProperties = {
        position: 'relative',
        width: '280px',
        minHeight: '120px',
        padding: '12px',
        border: '1px solid',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        background: '#1b2733',
        borderColor: '#3742fa',
        color: 'white',
        margin: '8px',
        ...(isHovered && {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            background: '#1b2733'
        }),
        ...(isRootLevel && {
            background: '#1b2733',
            borderWidth: '3px'
        }),
        ...(isDone && {
            opacity: 0.8
        })
    };

    // Остальной код остается таким же, как у вас сейчас
    const getStatusStyles = () => {
        if (isDone) {
            return { background: '#2ed573', color: 'white' };
        }
        if (task.progress === TaskProgress.Taken) {
            return { background: '#3742fa', color: 'white' };
        }
        if (task.progress === TaskProgress.Canceled) {
            return { background: '#ff4757', color: 'white' };
        }
        return { background: '#ffa502', color: 'white' };
    };

    const getPriorityStyles = () => {
        if (!task.deadline) return { background: '#95a5a6', color: 'white' };

        const dueDate = new Date(task.deadline);
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { background: '#ff4757', color: 'white' };
        if (diffDays <= 3) return { background: '#ffa502', color: 'white' };
        if (diffDays <= 7) return { background: '#3742fa', color: 'white' };

        return { background: '#2ed573', color: 'white' };
    };

    const statusStyles = getStatusStyles();
    const priorityStyles = getPriorityStyles();

    // Inline стили для внутренних элементов
    const headerStyles: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '8px',
        gap: '8px'
    };

    const titleStyles: React.CSSProperties = {
        flex: 1,
        minWidth: 0
    };

    const toggleBtnStyles: React.CSSProperties = {
        width: '20px',
        height: '20px',
        border: 'none',
        borderRadius: '50%',
        background: '#3742fa',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 0.2s ease'
    };

    const statusBadgeStyles: React.CSSProperties = {
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        flexShrink: 0
    };

    const detailsStyles: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        marginBottom: '8px'
    };

    const detailItemStyles: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11px',
        color: '#666'
    };

    const footerStyles: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '8px',
        color: 'white'
    };

    const priorityIndicatorStyles: React.CSSProperties = {
        padding: '3px 8px',
        borderRadius: '8px',
        fontSize: '9px',
        fontWeight: 600,
        textTransform: 'uppercase'
    };

    const rootIndicatorStyles: React.CSSProperties = {
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        background: '#ffa502',
        color: 'white',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
    };

    return (
        <div
            style={nodeStyles}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
        >
            {/* Заголовок и статус */}
            <div style={headerStyles}>
                <div style={titleStyles}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, lineHeight: 1.3, color: 'inherit' }}>
                        {task.title.length > 30 ? task.title.substring(0, 30) + '...' : task.title}
                    </h4>
                    {hasChildren && (
                        <button
                            style={toggleBtnStyles}
                            onClick={handleToggleClick}
                            title={isOpen ? 'Свернуть подзадачи' : 'Развернуть подзадачи'}
                        >
                            {isOpen ? '−' : '+'}
                        </button>
                    )}
                </div>
                <div style={{ ...statusBadgeStyles, ...statusStyles }}>
                    {isDone ? '✅ Выполнено' :
                        task.progress === TaskProgress.Taken ? '⏳ В работе' :
                            task.progress === TaskProgress.Canceled ? '❌ Отменено' :
                                '📝 Создано'}
                </div>
            </div>

            {/* Детали задачи */}
            <div style={detailsStyles}>
                {task.assigneeName && (
                    <div style={detailItemStyles}>
                        <span style={{ fontSize: '10px', flexShrink: 0 }}>👤</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {task.assigneeName.length > 15 ? task.assigneeName.substring(0, 15) + '...' : task.assigneeName}
            </span>
                    </div>
                )}

                {task.deadline && (
                    <div style={detailItemStyles}>
                        <span style={{ fontSize: '10px', flexShrink: 0 }}>📅</span>
                        <span>
              {new Date(task.deadline).toLocaleDateString('ru-RU')}
            </span>
                    </div>
                )}

                {task.children && task.children.length > 0 && (
                    <div style={detailItemStyles}>
                        <span style={{ fontSize: '10px', flexShrink: 0 }}>📂</span>
                        <span>
              {task.children.length} подзадач
            </span>
                    </div>
                )}
            </div>

            {/* Приоритет и дополнительные индикаторы */}
            <div style={footerStyles}>
                <div style={{ ...priorityIndicatorStyles, ...priorityStyles }}>
                    {!task.deadline ? 'Без срока' :
                        new Date(task.deadline) < new Date() ? 'Просрочено' :
                            'В сроке'}
                </div>

                {task.description && task.description !== 'Описание задачи' && (
                    <div style={{ fontSize: '12px', opacity: 0.7, cursor: 'help' }} title={task.description}>
                        📝
                    </div>
                )}
            </div>

            {/* Индикатор корневой задачи */}
            {isRootLevel && (
                <div style={rootIndicatorStyles} title="Корневая задача">
                    ⭐
                </div>
            )}
        </div>
    );
};