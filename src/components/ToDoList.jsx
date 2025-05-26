import { useState, useEffect } from 'react';
import './ToDoList.css';

const ToDoList = () => {
  // Initialize state with localStorage data
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem('todo-tasks');
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        // Validate the stored data structure
        if (Array.isArray(parsedTasks) && parsedTasks.every(task => 
          task.id && task.text && typeof task.completed === 'boolean'
        )) {
          return parsedTasks;
        }
      }
      return [];
    } catch (error) {
      console.error("Failed to load tasks from localStorage", error);
      return [];
    }
  });

  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');
  const [isStorageError, setIsStorageError] = useState(false);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('todo-tasks', JSON.stringify(tasks));
      setIsStorageError(false);
    } catch (error) {
      console.error("Failed to save tasks", error);
      setIsStorageError(true);
    }
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim() === '') {
      alert('Task cannot be empty!');
      return;
    }

    const newTaskObj = {
      id: Date.now(),
      text: newTask.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTasks(prevTasks => [...prevTasks, newTaskObj]);
    setNewTask('');
  };

  const removeTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const clearCompleted = () => {
    setTasks(prevTasks => prevTasks.filter(task => !task.completed));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortOrder === 'date-asc') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortOrder === 'date-desc') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortOrder === 'name-asc') return a.text.localeCompare(b.text);
    if (sortOrder === 'name-desc') return b.text.localeCompare(a.text);
    return 0;
  });

  const remainingTasks = tasks.filter(task => !task.completed).length;
  const completedTasks = tasks.length - remainingTasks;

  return (
    <div className="todo-container">
      <h1>To-Do List</h1>
      
      {isStorageError && (
        <div className="storage-error">
          Warning: Could not save tasks to browser storage. Your changes may not persist.
        </div>
      )}
      
      <div className="input-container">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new task..."
          aria-label="Add a new task"
        />
        <button onClick={addTask} aria-label="Add task">Add</button>
      </div>
      
      <div className="controls">
        <div className="filter-controls">
          <span>Filter: </span>
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
            aria-label="Show all tasks"
          >
            All ({tasks.length})
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''} 
            onClick={() => setFilter('active')}
            aria-label="Show active tasks"
          >
            Active ({remainingTasks})
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''} 
            onClick={() => setFilter('completed')}
            aria-label="Show completed tasks"
          >
            Completed ({completedTasks})
          </button>
        </div>
        
        <div className="sort-controls">
          <span>Sort by: </span>
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            aria-label="Sort tasks"
          >
            <option value="default">Default</option>
            <option value="date-asc">Oldest First</option>
            <option value="date-desc">Newest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>
      </div>
      
      <ul className="task-list" aria-live="polite">
        {sortedTasks.length === 0 ? (
          <li className="empty-message">No tasks found</li>
        ) : (
          sortedTasks.map(task => (
            <li 
              key={task.id} 
              className={task.completed ? 'completed' : ''}
              aria-label={`Task: ${task.text}`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id)}
                aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
              />
              <span className="task-text">{task.text}</span>
              <button 
                className="delete-btn"
                onClick={() => removeTask(task.id)}
                aria-label="Delete task"
              >
                ×
              </button>
            </li>
          ))
        )}
      </ul>
      
      <div className="stats">
        <span>{remainingTasks} {remainingTasks === 1 ? 'task' : 'tasks'} remaining</span>
        {completedTasks > 0 && (
          <button 
            className="clear-completed" 
            onClick={clearCompleted}
            aria-label="Clear completed tasks"
          >
            Clear completed ({completedTasks})
          </button>
        )}
      </div>
    </div>
  );
};

export default ToDoList;