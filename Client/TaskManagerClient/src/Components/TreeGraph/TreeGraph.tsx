import React, { useState, useRef, useCallback } from 'react';
import { Tree } from 'react-d3-tree';
import { Project, Task } from '../../types';
import './TreeGraph.css';

interface TreeGraphProps {
  project: Project;
  onTaskClick: (task: Task) => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const projectToTreeData = (project: Project) => {
  if (!project || !project.tasks) return { name: 'Нет задач' };

  const rootTask = project.tasks.find(t => t.parentId === 'root');
  
  const buildTree = (task: Task): any => {
    const children = project.tasks.filter(t => t.parentId === task.id);
    
    return {
      name: task.title,
      attributes: {
        id: task.id,
        isCompleted: task.isCompleted,
        assignee: task.assignee,
        dueDate: task.dueDate,
        childrenCount: children.length,
        originalTask: task
      },
      children: children.length > 0 ? children.map(buildTree) : []
    };
  };

  const independentTasks = project.tasks.filter(t => t.parentId === null);

  if (rootTask) {
    const rootTree = buildTree(rootTask);
    
    if (independentTasks.length > 0) {
      rootTree.children = [
        ...(rootTree.children || []),
        ...independentTasks.map(task => buildTree(task))
      ];
    }
    
    return rootTree;
  } else if (independentTasks.length > 0) {
    return {
      name: project.name,
      attributes: { isRoot: true },
      children: independentTasks.map(task => buildTree(task))
    };
  }
  
  return { name: 'Нет задач' };
};

const getAllRootLevelTasks = (project: Project): Task[] => {
  if (!project?.tasks) return [];
  
  const rootTask = project.tasks.find(t => t.parentId === 'root');
  const independentTasks = project.tasks.filter(t => t.parentId === null);
  
  const roots: Task[] = [];
  if (rootTask) roots.push(rootTask);
  roots.push(...independentTasks);
  
  return roots;
};

const projectToMultipleTrees = (project: Project) => {
  if (!project || !project.tasks || project.tasks.length === 0) {
    return [{ name: 'Нет задач', attributes: { isEmpty: true } }];
  }

  const rootTasks = getAllRootLevelTasks(project);
  
  if (rootTasks.length === 0) {
    return [{ name: 'Нет корневых задач', attributes: { isEmpty: true } }];
  }

  const buildTree = (task: Task): any => {
    const children = project.tasks.filter(t => t.parentId === task.id);
    
    return {
      name: task.title,
      attributes: {
        id: task.id,
        isCompleted: task.isCompleted,
        assignee: task.assignee,
        dueDate: task.dueDate,
        childrenCount: children.length,
        originalTask: task,
        isRootLevel: task.parentId === 'root' || task.parentId === null
      },
      children: children.length > 0 ? children.map(buildTree) : []
    };
  };

  return rootTasks.map(task => buildTree(task));
};

export const TreeGraph = ({ project, onTaskClick }: TreeGraphProps) => {
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (treeContainerRef.current) {
      const { width, height } = treeContainerRef.current.getBoundingClientRect();
      setTranslate({
        x: width / 2,
        y: height / 8
      });
    }
  }, [project]);

  const treeData = projectToMultipleTrees(project);

  const renderCustomNodeElement = useCallback(({ nodeDatum, toggleNode }) => {
    const task = nodeDatum.attributes?.originalTask;
    const isCompleted = nodeDatum.attributes?.isCompleted;
    const assignee = nodeDatum.attributes?.assignee;
    const dueDate = nodeDatum.attributes?.dueDate;
    const isRootLevel = nodeDatum.attributes?.isRootLevel;
    const childrenCount = nodeDatum.attributes?.childrenCount || 0;
    const isEmpty = nodeDatum.attributes?.isEmpty;

    if (isEmpty) {
      return (
        <g>
          <rect
            width={120}
            height={40}
            x={-60}
            y={-20}
            rx={10}
            ry={10}
            className="node-rect empty"
          />
          <text className="node-title" dy={5}>
            {nodeDatum.name}
          </text>
        </g>
      );
    }

    return (
      <g>
        {/* Прямоугольник ноды */}
        <rect
          width={160}
          height={80}
          x={-80}
          y={-40}
          rx={10}
          ry={10}
          className={`node-rect ${isCompleted ? 'completed' : ''} ${isRootLevel ? 'root-level' : ''}`}
          onClick={() => task && onTaskClick(task)}
        />
        
        {/* Заголовок задачи */}
        <text
          dy={-15}
          className="node-title"
          onClick={() => task && onTaskClick(task)}
        >
          {nodeDatum.name.length > 20 
            ? nodeDatum.name.substring(0, 20) + '...' 
            : nodeDatum.name
          }
        </text>
        
        {/* Информация о задаче */}
        <text dy={5} className="node-info">
          {assignee && `👤 ${assignee}`}
        </text>
        
        <text dy={25} className="node-info">
          {dueDate && `📅 ${dueDate}`}
        </text>
        
        {/* Статус */}
        <text dy={45} className="node-status">
          {isCompleted ? '✅ Выполнено' : '⏳ В работе'}
        </text>
        
        {/* Количество подзадач */}
        {childrenCount > 0 && (
          <text dy={-25} dx={70} className="children-count">
            {childrenCount} подзадач
          </text>
        )}
        
        {/* Кнопка раскрытия/скрытия для нод с детьми */}
        {nodeDatum.children && nodeDatum.children.length > 0 && (
          <circle
            r={10}
            onClick={toggleNode}
            className="node-toggle"
          >
            <title>{nodeDatum.__rd3t.collapsed ? 'Развернуть' : 'Свернуть'}</title>
          </circle>
        )}
      </g>
    );
  }, [onTaskClick]);

  const treeDataToRender = treeData.length === 1 ? treeData[0] : treeData;

  return (
    <div className="tree-graph-container">
      <h3>Дерево задач проекта</h3>
      <div className="tree-controls">
        <button onClick={() => setScale(scale * 1.2)}>Увеличить</button>
        <button onClick={() => setScale(scale / 1.2)}>Уменьшить</button>
        <button onClick={() => {
          if (treeContainerRef.current) {
            const { width, height } = treeContainerRef.current.getBoundingClientRect();
            setTranslate({ x: width / 2, y: height / 8 });
            setScale(1);
          }
        }}>Сбросить</button>
        <span className="scale-info">Масштаб: {Math.round(scale * 100)}%</span>
      </div>
      <div className="tree-info">
        {getAllRootLevelTasks(project).length > 1 && (
          <p>Проект содержит несколько независимых деревьев задач</p>
        )}
      </div>
      <div ref={treeContainerRef} className="tree-wrapper">
        <Tree
          data={treeDataToRender}
          translate={translate}
          orientation="vertical"
          pathFunc="step"
          separation={{ siblings: 1.5, nonSiblings: 2 }}
          renderCustomNodeElement={renderCustomNodeElement}
          initialDepth={15}
          zoomable={true}
          draggable={true}
          collapsible={true}
          depthFactor={200}
          nodeSize={{ x: 200, y: 120 }}
          transitionDuration={300}
          enableLegacyTransitions={true}
          scaleExtent={{ min: 0.1, max: 3 }}
        />
      </div>
    </div>
  );
};