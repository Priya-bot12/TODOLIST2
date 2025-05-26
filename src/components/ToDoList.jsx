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
  const [isInputFocused, setIsInputFocused] = useState(false);

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
      <div className="header">
        <h1>To-Do List</h1>
        <p>Get things done, one task at a time</p>
      </div>
      
      {isStorageError && (
        <div className="storage-error">
          ⚠️ Warning: Could not save tasks to browser storage. Your changes may not persist.
        </div>
      )}
      
      <div className={`input-container ${isInputFocused ? 'focused' : ''}`}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          placeholder="What needs to be done?"
          aria-label="Add a new task"
        />
        <button onClick={addTask} aria-label="Add task">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
      
      <div className="controls">
        <div className="filter-controls">
          <span>Show: </span>
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
            aria-label="Show all tasks"
          >
            All
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''} 
            onClick={() => setFilter('active')}
            aria-label="Show active tasks"
          >
            Active
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''} 
            onClick={() => setFilter('completed')}
            aria-label="Show completed tasks"
          >
            Completed
          </button>
        </div>
        
        <div className="sort-controls">
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select"
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
      
      <div className="task-count">
        <span className="remaining">{remainingTasks} {remainingTasks === 1 ? 'task' : 'tasks'} left</span>
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
      
      <ul className="task-list" aria-live="polite">
        {sortedTasks.length === 0 ? (
          <li className="empty-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>No tasks found</p>
            <small>Add a task above to get started</small>
          </li>
        ) : (
          sortedTasks.map(task => (
            <li 
              key={task.id} 
              className={task.completed ? 'completed' : ''}
              aria-label={`Task: ${task.text}`}
            >
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTaskCompletion(task.id)}
                  aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                />
                <span className="checkmark"></span>
              </label>
              <span className="task-text">{task.text}</span>
              <button 
                className="delete-btn"
                onClick={() => removeTask(task.id)}
                aria-label="Delete task"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ToDoList;
