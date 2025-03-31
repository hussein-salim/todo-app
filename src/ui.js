import { format } from 'date-fns';
import * as logic from './logic';
import './styles.css';
import {
    createTodo,
    addTodo,
    getTodo,
    getTodosInCurrentProject,
    saveData,
    loadData,
    getCurrentProject, // Import the new function
    updateTodo, // Import the new function
} from './logic';

const formattedDate = format(new Date(), 'yyyy-MM-dd');

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element Selectors ---
    const inboxListElement = document.getElementById('inbox-list');
    // const todoListElement = document.getElementById('todo-list'); // No longer directly used for rendering
    const addTaskBtn = document.getElementById('add-task-btn');
    const newTodoFormContainer = document.getElementById('new-todo-form-container');
    const todoDetailsModal = document.getElementById('todo-details-modal');
    const addProjectBtn = document.getElementById('add-project-btn');

    let currentExpandedTodoId = null; // To track the currently expanded todo

    // --- Rendering Functions ---

    function renderInboxTodos() {
        const todos = logic.getTodosInCurrentProject();
        inboxListElement.innerHTML = todos.map(todo => `
            <li class="priority-${todo.priority}">
                <span>${todo.title} - ${todo.dueDate}</span>
            </li>
        `).join('');
    }

    const renderNewTodoForm = () => {
        const formHTML = `
            <h3>Add New Todo</h3>
            <label for="new-todo-title">Title:</label>
            <input type="text" id="new-todo-title" required><br><br>
            <label for="new-todo-description">Description:</label>
            <textarea id="new-todo-description"></textarea><br><br>
            <label for="new-todo-due-date">Due Date:</label>
            <input type="date" id="new-todo-due-date"><br><br>
            <label for="new-todo-priority">Priority:</label>
            <select id="new-todo-priority">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            </select><br><br>
            <label for="new-todo-notes">Notes:</label>
            <textarea id="new-todo-notes"></textarea><br><br>
            <label for="new-todo-checklist">Checklist (separate by comma):</label>
            <input type="text" id="new-todo-checklist"><br><br>
            <button id="save-new-todo-btn">Add Todo</button>
            <button id="cancel-new-todo-btn">Cancel</button>
        `;
        newTodoFormContainer.innerHTML = formHTML;

        const saveNewTodoBtn = document.getElementById('save-new-todo-btn');
        const cancelNewTodoBtn = document.getElementById('cancel-new-todo-btn');

        saveNewTodoBtn.addEventListener('click', () => {
            const title = document.getElementById('new-todo-title').value;
            const description = document.getElementById('new-todo-description').value;
            const dueDate = document.getElementById('new-todo-due-date').value;
            const priority = document.getElementById('new-todo-priority').value;
            const notes = document.getElementById('new-todo-notes').value;
            const checklistString = document.getElementById('new-todo-checklist').value;
            const checklist = checklistString.split(',').map(item => item.trim()).filter(item => item !== '');

            if (title) {
                const newTodo = logic.createTodo(title, description, dueDate, priority, notes, checklist);
                const currentProject = logic.getCurrentProject();
                if (currentProject) {
                    logic.addTodo(currentProject.id, newTodo);
                    renderInboxTodos(); // Changed to renderInboxTodos
                    closeNewTodoForm();
                } else {
                    alert('No project selected.');
                }
            } else {
                alert('Title is required.');
            }
        });

        cancelNewTodoBtn.addEventListener('click', closeNewTodoForm);
    };

    const openNewTodoForm = () => {
        renderNewTodoForm();
        newTodoFormContainer.style.display = 'block';
    };

    const closeNewTodoForm = () => {
        newTodoFormContainer.style.display = 'none';
        newTodoFormContainer.innerHTML = ''; // Clear the form
    };

    const renderTodoDetailsModal = (todoId) => {
        const todo = logic.getTodo(todoId);
        if (!todo) return;

        const modalHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <h3>Edit Todo</h3>
                <label for="edit-todo-title">Title:</label>
                <input type="text" id="edit-todo-title" value="${todo.title}" required><br><br>
                <label for="edit-todo-description">Description:</label>
                <textarea id="edit-todo-description">${todo.description}</textarea><br><br>
                <label for="edit-todo-due-date">Due Date:</label>
                <input type="date" id="edit-todo-due-date" value="${todo.dueDate || ''}"><br><br>
                <label for="edit-todo-priority">Priority:</label>
                <select id="edit-todo-priority">
                    <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>High</option>
                </select><br><br>
                <label for="edit-todo-notes">Notes:</label>
                <textarea id="edit-todo-notes">${todo.notes}</textarea><br><br>
                <h4>Checklist:</h4>
                <ul id="edit-todo-checklist-list">
                    ${todo.checklist.map((item, index) => `
                        <li>
                            <input type="checkbox" data-index="${index}">
                            <span>${item}</span>
                        </li>
                    `).join('')}
                </ul>
                <label for="add-checklist-item">Add Item:</label>
                <input type="text" id="add-checklist-item">
                <button id="add-checklist-btn">Add</button><br><br>
                <button id="save-todo-details-btn" data-todo-id="${todo.id}">Save Changes</button>
                <button id="cancel-todo-details-btn">Cancel</button>
            </div>
        `;
        todoDetailsModal.innerHTML = modalHTML;
        todoDetailsModal.style.display = 'block';

        const closeButton = todoDetailsModal.querySelector('.close-button');
        closeButton.addEventListener('click', closeTodoDetailsModal);

        const saveTodoDetailsBtn = document.getElementById('save-todo-details-btn');
        saveTodoDetailsBtn.addEventListener('click', () => {
            const todoIdToUpdate = saveTodoDetailsBtn.dataset.todoId;
            const updatedTitle = document.getElementById('edit-todo-title').value;
            const updatedDescription = document.getElementById('edit-todo-description').value;
            const updatedDueDate = document.getElementById('edit-todo-due-date').value;
            const updatedPriority = document.getElementById('edit-todo-priority').value;
            const updatedNotes = document.getElementById('edit-todo-notes').value;

            const updatedTodoData = {
                title: updatedTitle,
                description: updatedDescription,
                dueDate: updatedDueDate,
                priority: updatedPriority,
                notes: updatedNotes,
            };

            logic.updateTodo(todoIdToUpdate, updatedTodoData);
            renderInboxTodos(); // Changed to renderInboxTodos
            closeTodoDetailsModal();
        });

        const cancelTodoDetailsBtn = document.getElementById('cancel-todo-details-btn');
        cancelTodoDetailsBtn.addEventListener('click', closeTodoDetailsModal);

        const addChecklistBtn = document.getElementById('add-checklist-btn');
        const addChecklistItemInput = document.getElementById('add-checklist-item');
        const checklistList = document.getElementById('edit-todo-checklist-list');

        addChecklistBtn.addEventListener('click', () => {
            const newItemText = addChecklistItemInput.value.trim();
            if (newItemText) {
                todo.checklist.push(newItemText);
                logic.updateTodo(todoId, { checklist: todo.checklist });
                renderTodoDetailsModal(todoId); // Re-render the modal to show the new item
                addChecklistItemInput.value = '';
            }
        });
    };

    const openTodoDetailsModal = (todoId) => {
        currentExpandedTodoId = todoId;
        renderTodoDetailsModal(todoId);
    };

    const closeTodoDetailsModal = () => {
        todoDetailsModal.style.display = 'none';
        todoDetailsModal.innerHTML = ''; // Clear modal content
        currentExpandedTodoId = null;
    };

    // --- Event Listeners ---

    // newTodoBtn.addEventListener('click', openNewTodoForm); // Replaced by addTaskBtn
    console.log('DOMContentLoaded event fired.');
    console.log('Trying to get addTaskBtn...');
    const addTaskButtonElement = document.getElementById('add-task-btn');
    console.log('addTaskButtonElement:', addTaskButtonElement);

    if (addTaskButtonElement) {
        addTaskButtonElement.addEventListener('click', openNewTodoForm);
    } else {
        console.error('add-task-btn element not found in the DOM.');
    }

    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', () => {
            const projectName = prompt('Enter project name:');
            if (projectName) {
                const newProject = logic.createProject(projectName);
                logic.saveData(appData);
                renderProjects(); // Function to re-render the sidebar
            }
        });
    } else {
        console.error('add-project-btn element not found in the DOM.');
    }

    // --- Initialization ---

    renderInboxTodos(); // Render initial inbox todos
});