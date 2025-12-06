import { Tree } from 'react-arborist';
import { TaskResponse, ProjectInfoDto, TaskProgress } from '../../types';
import './TreeView.css';

interface TreeViewProps {
  project: ProjectInfoDto;
  onTaskClick: (task: TaskResponse) => void;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
const projectToTreeData = (project: ProjectInfoDto) => {
  if (!project || !project.tasks) return [];

  const buildTree = (task: TaskResponse) => {
    const children = task.children || [];
    return {
      id: task.id,
      name: task.title,
      isCompleted: task.progress === TaskProgress.Done,
      assignee: task.assigneeName,
      deadline: task.deadline,
      originalTask: task,
      children: children.length > 0 ? children.map(buildTree) : undefined
    };
  };

  return project.tasks.map(buildTree);
};

function NodeComponent({ node, style, dragHandle }: any) {
  const task = node.data.originalTask;
  const isDone = task.progress === TaskProgress.Done;

  return (
    <div style={style} ref={dragHandle} className="tree-node">
      <span
        className="toggle-icon"
        onClick={() => node.toggle()}
        style={{ marginRight: '8px' }}
      >
        {node.isInternal ? (node.isOpen ? '▼' : '►') : '•'}
      </span>
      <span
        className={`task-title ${isDone ? 'completed' : ''}`}
        onClick={() => node.data.onTaskClick?.(task)}
      >
        {node.data.name}
      </span>
      {task.assigneeName && (
        <span className="task-assignee"> ({task.assigneeName})</span>
      )}
      {task.deadline && (
        <span className="task-due-date"> 📅 {new Date(task.deadline).toLocaleDateString('ru-RU')}</span>
      )}
      <span className="task-status">
        {isDone ? ' ✅' :
          task.progress === TaskProgress.Taken ? ' ⏳' :
            task.progress === TaskProgress.Canceled ? ' ❌' :
              ' 📝'}
      </span>
    </div>
  );
}

export const TreeView = ({ project, onTaskClick }: TreeViewProps) => {
  const treeData = projectToTreeData(project).map(item => ({
    ...item,
    onTaskClick
  }));

  return (
    <div className="tree-view-container">
      <h3>Дерево задач проекта</h3>
      <div className="tree-wrapper">
        <Tree
          data={treeData}
          width={800}
          height={600}
          indent={24}
          rowHeight={36}
          openByDefault={true}
        >
          {NodeComponent}
        </Tree>
      </div>
    </div>
  );
};