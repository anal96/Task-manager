const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Selectors
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const loadingState = document.getElementById('loading');
const emptyState = document.getElementById('empty-state');
const errorMessage = document.getElementById('error-message');
const filterBtns = document.querySelectorAll('.filter-btn');

let tasks = [];
let currentFilter = 'all';

// State Management
const showLoading = (show) => {
    loadingState.classList.toggle('hidden', !show);
};

const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
};

const updateEmptyState = () => {
    const visibleTasks = getFilteredTasks();
    emptyState.classList.toggle('hidden', visibleTasks.length > 0 || loadingState.classList.contains('hidden') === false);
};

// API Functions
async function fetchTasks() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/`, {
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch tasks');
        tasks = await response.json();
        renderTasks();
    } catch (err) {
        showError(err.message);
    } finally {
        showLoading(false);
        updateEmptyState();
    }
}

async function addTask(title) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to add task');
        }
        
        tasks.unshift(data);
        renderTasks();
        taskInput.value = '';
    } catch (err) {
        showError(err.message);
    }
}

async function toggleTask(id, completed) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !completed })
        });
        
        if (!response.ok) throw new Error('Failed to update task');
        
        const updatedTask = await response.json();
        tasks = tasks.map(t => t.id === id ? updatedTask : t);
        renderTasks();
    } catch (err) {
        showError(err.message);
    }
}

async function deleteTask(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}/`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete task');
        
        tasks = tasks.filter(t => t.id !== id);
        renderTasks();
    } catch (err) {
        showError(err.message);
    } finally {
        updateEmptyState();
    }
}

// Rendering
function getFilteredTasks() {
    if (currentFilter === 'pending') return tasks.filter(t => !t.completed);
    if (currentFilter === 'completed') return tasks.filter(t => t.completed);
    return tasks;
}

function renderTasks() {
    const filteredTasks = getFilteredTasks();
    taskList.innerHTML = '';
    
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="task-checkbox" onclick="toggleTask(${task.id}, ${task.completed})"></div>
            <span class="task-text">${task.title}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </button>
        `;
        taskList.appendChild(li);
    });
    
    updateEmptyState();
}

// Event Listeners
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (title) addTask(title);
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Initial Fetch
fetchTasks();
