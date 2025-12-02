import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Tree } from 'react-d3-tree';
import { Project, Task } from '../../types';
import { EnhancedTreeNode } from './EnhancedTreeNode';
import './MultiTreeGraph.css';
import './EnhancedTreeNode.css';

interface MultiTreeGraphProps {
  project: Project;
  onTaskClick: (task: Task) => void;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const getAllRootLevelTasks = (project: Project): Task[] => {
  if (!project?.tasks) return [];
  
  const rootTask = project.tasks.find(t => t.parentId === 'root');
  const independentTasks = project.tasks.filter(t => t.parentId === null);
  
  const roots: Task[] = [];
  if (rootTask) roots.push(rootTask);
  roots.push(...independentTasks);
  
  return roots;
};

const buildTreeFromTask = (task: Task, allTasks: Task[]): any => {
  const children = allTasks.filter(t => t.parentId === task.id);
  
  return {
    name: task.title,
    attributes: {
      id: task.id,
      isCompleted: task.isCompleted,
      assignee: task.assignee,
      dueDate: task.dueDate,
      description: task.description,
      childrenCount: children.length,
      originalTask: task,
      isRootLevel: task.parentId === 'root' || task.parentId === null
    },
    children: children.length > 0 ? children.map(child => buildTreeFromTask(child, allTasks)) : []
  };
};



const SingleTree = ({ treeData, onTaskClick, treeIndex, totalTrees }) => {
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (treeContainerRef.current) {
      const { width, height } = treeContainerRef.current.getBoundingClientRect();
      setTranslate({
        x: width / 2,
        y: height / 6
      });
    }
  }, [treeData]);

  const handleNodeClick = useCallback((nodeData) => {
    const task = nodeData.attributes?.originalTask;
    if (task) {
      onTaskClick(task);
    }
  }, [onTaskClick]);

  const renderCustomNodeElement = useCallback(({ nodeDatum, toggleNode }) => {
    const task = nodeDatum.attributes?.originalTask;
    const isCompleted = nodeDatum.attributes?.isCompleted;
    const isRootLevel = nodeDatum.attributes?.isRootLevel;
    const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;

    if (!task) return null;

    return (
      <foreignObject width={300} height={140} x={-150} y={-70}>
          <EnhancedTreeNode
            task={task}
            onTaskClick={onTaskClick}
            onToggle={toggleNode}
            isOpen={!nodeDatum.__rd3t?.collapsed}
            hasChildren={hasChildren}
            isCompleted={isCompleted}
            isRootLevel={isRootLevel}
          />
      </foreignObject>
    );
  }, [onTaskClick]);

  return (
    <div className={`single-tree-container tree-${treeIndex}`}>
      <div className="tree-header">
        <h4>
          {treeData.attributes?.isRootLevel && treeData.attributes.originalTask?.parentId === 'root' 
            ? 'Основное дерево проекта' 
            : 'Независимое дерево задач'
          }
        </h4>
        <div className="tree-stats">
          Задачи: {countTasks(treeData)} • Выполнено: {countCompletedTasks(treeData)}
        </div>
      </div>
      <div ref={treeContainerRef} className="tree-wrapper">
        <Tree
          data={treeData}
          translate={translate}
          scaleExtent={{ min: 0.1, max: 2.5 }}
          orientation="vertical"
          pathFunc="step"
          separation={{ siblings: 2, nonSiblings: 2.5 }}
          renderCustomNodeElement={renderCustomNodeElement}
          onNodeClick={handleNodeClick}
          initialDepth={20}
          zoomable={true}
          draggable={true}
          collapsible={true}
          depthFactor={300}
          nodeSize={{ x: 320, y: 160 }}
          transitionDuration={300}
          enableLegacyTransitions={true}
        />
      </div>
      <div className="tree-controls">
        <button onClick={() => setScale(scale * 1.2)} title="Увеличить">+</button>
        <button onClick={() => setScale(scale / 1.2)} title="Уменьшить">-</button>
        <button onClick={() => {
          if (treeContainerRef.current) {
            const { width, height } = treeContainerRef.current.getBoundingClientRect();
            setTranslate({ x: width / 2, y: height / 6 });
            setScale(1);
          }
        }} title="Сбросить вид">⟲</button>
        <span className="scale-info">{Math.round(scale * 100)}%</span>
      </div>
    </div>
  );
};

const countTasks = (treeData) => {
  let count = 1;
  if (treeData.children) {
    treeData.children.forEach(child => {
      count += countTasks(child);
    });
  }
  return count;
};

const countCompletedTasks = (treeData) => {
  let count = treeData.attributes?.isCompleted ? 1 : 0;
  if (treeData.children) {
    treeData.children.forEach(child => {
      count += countCompletedTasks(child);
    });
  }
  return count;
};

export const MultiTreeGraph = ({ project, onTaskClick }: MultiTreeGraphProps) => {
  const rootTasks = getAllRootLevelTasks(project);

  const treeData = rootTasks.map(task => buildTreeFromTask(task, project.tasks));

  if (rootTasks.length === 0) {
    return (
      <div className="multi-tree-graph-container">
        <h3>Дерево задач проекта</h3>
        <div className="no-tasks-message">
          <p>В проекте пока нет задач</p>
        </div>
      </div>
    );
  }

  return (
    <div className="multi-tree-graph-container">
      <h3>Дерево задач проекта</h3>
      <div className="global-stats">
        Всего деревьев: {treeData.length} • Всего задач: {project.tasks.length} • 
        Выполнено: {project.tasks.filter(t => t.isCompleted).length}
      </div>
      <div className="trees-container">
        {treeData.map((tree, index) => (
          <SingleTree
            key={tree.attributes.id}
            treeData={tree}
            onTaskClick={onTaskClick}
            treeIndex={index}
            totalTrees={treeData.length}
          />
        ))}
      </div>
    </div>
  );
};