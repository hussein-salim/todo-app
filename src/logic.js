// --- Data Management ---

const STORAGE_KEY = 'todoAppData';

const loadData = () => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        const data = JSON.parse(storedData);
        // Ensure todos object exists even if no todos are stored yet
        data.todos = data.todos || {};
        return data;
    }
    return {
        projects: [{ id: 'default', name: 'Default Project', todos: [] }],
        currentProjectId: 'default',
        todos: {} // Initialize todos here as well for a fresh start
    };
};

const saveData = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

let appData = loadData();

// --- Todo Object Creation ---

const createTodo = (title, description, dueDate, priority, notes = '', checklist = []) => {
    return {
        id: Date.now().toString(), // Simple unique ID
        title,
        description,
        dueDate,
        priority,
        notes,
        checklist,
        completed: false,
    };
};

// --- Project Object Creation ---

const createProject = (name) => {
    return {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 15), // More robust unique ID
        name,
        todos: [],
    };
};

// --- Todo Operations ---

const addTodo = (projectId, todo) => {
    const project = appData.projects.find(p => p.id === projectId);
    if (project) {
        project.todos.push(todo.id);
        appData.todos = appData.todos || {}; // Initialize if it doesn't exist
        appData.todos[todo.id] = todo;
        saveData(appData);
        return true;
    }
    return false;
};

const getTodo = (todoId) => {
    return appData.todos ? appData.todos[todoId] : null;
};

const getTodosInCurrentProject = () => {
    const currentProject = appData.projects.find(p => p.id === appData.currentProjectId);
    return currentProject ? currentProject.todos.map(todoId => appData.todos[todoId]) : [];
};

const getCurrentProject = () => {
    return appData.projects.find(p => p.id === appData.currentProjectId) || null;
};

const updateTodo = (todoId, updatedData) => {
    if (appData.todos && appData.todos[todoId]) {
        appData.todos[todoId] = { ...appData.todos[todoId], ...updatedData };
        saveData(appData); // Save the updated data to localStorage
        return true;
    }
    return false;
};

const deleteTodo = (todoId) => {
    for (const project of appData.projects) {
        const index = project.todos.indexOf(todoId);
        if (index !== -1) {
            project.todos.splice(index, 1);
            break;
        }
    }
    delete appData.todos[todoId];
    saveData(appData);
};

const openTodoDetailsModal = (todoId) => {
    currentExpandedTodoId = todoId;
    renderTodoDetailsModal(todoId);
    todoDetailsModal.classList.add('show');
};

const closeTodoDetailsModal = () => {
    todoDetailsModal.classList.remove('show');
    setTimeout(() => {
        todoDetailsModal.style.display = 'none';
        todoDetailsModal.innerHTML = ''; // Clear modal content
        currentExpandedTodoId = null;
    }, 300); // Match the CSS transition duration
};

function renderInboxTodos() {
    const todos = logic.getTodosInCurrentProject();
    inboxListElement.innerHTML = todos.map((todo, index) => `
        <li class="priority-${todo.priority}" draggable="true" data-index="${index}">
            <span>${todo.title} - ${todo.dueDate}</span>
        </li>
    `).join('');

    const todoItems = inboxListElement.querySelectorAll('li');
    todoItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
    });
}

let draggedIndex = null;

function handleDragStart(e) {
    draggedIndex = e.target.dataset.index;
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    const droppedIndex = e.target.dataset.index;
    const todos = logic.getTodosInCurrentProject();
    const draggedTodo = todos.splice(draggedIndex, 1)[0];
    todos.splice(droppedIndex, 0, draggedTodo);
    logic.saveData(appData);
    renderInboxTodos();
}

const searchInput = document.getElementById('search-todos');
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const todos = logic.getTodosInCurrentProject();
    const filteredTodos = todos.filter(todo => todo.title.toLowerCase().includes(query));
    inboxListElement.innerHTML = filteredTodos.map(todo => `
        <li class="priority-${todo.priority}">
            <span>${todo.title} - ${todo.dueDate}</span>
        </li>
    `).join('');
});

const sortPriorityBtn = document.getElementById('sort-priority-btn');
sortPriorityBtn.addEventListener('click', () => {
    const todos = logic.getTodosInCurrentProject();
    todos.sort((a, b) => {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    renderInboxTodos();
});

function showNotification(message) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Example usage:
showNotification('Todo added successfully!');

document.addEventListener('DOMContentLoaded', () => {
    const addTaskBtn = document.getElementById('add-task-btn');
    const addProjectBtn = document.getElementById('add-project-btn');
    const themeToggle = document.getElementById('theme-toggle');

    // Check if the "Add Task" button exists
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            console.log('Add Task button clicked!');
            // Your logic for adding a task
        });
    } else {
        console.error('add-task-btn element not found in the DOM.');
    }

    // Check if the "Add Project" button exists
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', () => {
            console.log('Add Project button clicked!');
            // Your logic for adding a project
        });
    } else {
        console.error('add-project-btn element not found in the DOM.');
    }

    // Check if the "Theme Toggle" button exists
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
        });
    } else {
        console.error('theme-toggle element not found in the DOM.');
    }

    // Load theme preference on page load
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
});

// Export all functions as named exports
export {
    createTodo,
    createProject,
    addTodo,
    getTodo,
    getTodosInCurrentProject,
    saveData,
    loadData,
    getCurrentProject,
    updateTodo,
    deleteTodo,
};