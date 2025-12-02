import { Tree } from 'react-arborist';
import { Task, Project } from '../../types';
import './TreeView.css';

interface TreeViewProps {
  project: Project;
  onTaskClick: (task: Task) => void;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
const projectToTreeData = (project: Project) => {
  if (!project || !project.tasks) return [];
  
  const rootTask = project.tasks.find(t => t.parentId === 'root');
  
  const buildTree = (task: Task) => {
    const children = project.tasks.filter(t => t.parentId === task.id);
    return {
      id: task.id.toString(),
      name: task.title,
      isCompleted: task.isCompleted,
      assignee: task.assignee,
      dueDate: task.dueDate,
      originalTask: task,
      children: children.length > 0 ? children.map(buildTree) : undefined
    };
  };
  
  const treeFromRoot = rootTask ? [buildTree(rootTask)] : [];
  
  const independentTasks = project.tasks
    .filter(t => t.parentId === null)
    .map(task => ({
      id: task.id.toString(),
      name: task.title,
      isCompleted: task.isCompleted,
      assignee: task.assignee,
      dueDate: task.dueDate,
      originalTask: task
    }));
  
  return [...treeFromRoot, ...independentTasks];
};

function NodeComponent({ node, style, dragHandle }: any) {
    const task = node.data.originalTask;

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
                className={`task-title ${task.isCompleted ? 'completed' : ''}`}
                onClick={() => node.data.onTaskClick?.(task)}
            >
        {node.data.name}
      </span>
            {task.assignee && (
                <span className="task-assignee"> ({task.assignee})</span>
            )}
            {task.dueDate && (
                <span className="task-due-date"> 📅 {task.dueDate}</span>
            )}
            <span className="task-status">
        {task.isCompleted ? ' ✅' : ' ⏳'}
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