class Todo {
    constructor(taskListElement, searchInputElement) {
        this.taskListElement = taskListElement;
        this.searchInputElement = searchInputElement;
        this.tasks = [];
        this.term = '';

        this.loadTasks();

        this.searchInputElement.addEventListener('input', () => {
            this.term = this.searchInputElement.value.trim().toLowerCase();
            console.log("Wyszukiwarka zmieniona:", this.term);
            this.draw();
        });

        console.log("Todo class initialized");
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        console.log("Zapisano tasks:", this.tasks);
    }

    loadTasks() {
        const stored = localStorage.getItem('tasks');
        if (stored) {
            this.tasks = JSON.parse(stored);
            console.log("Załadowano tasks:", this.tasks);
        } else {
            console.log("Brak zapisanych tasks w Local Storage");
        }
    }

    validateTask(text, date) {
        console.log("Walidacja zadania:", text, date);
        if (text.length < 3 || text.length > 255) {
            alert("Zadanie musi mieć od 3 do 255 znaków");
            return false;
        }
        if (date) {
            const d = new Date(date);
            if (d <= new Date()) {
                alert("Data musi być w przyszłości");
                return false;
            }
        }
        return true;
    }

    get filteredTasks() {
        if (this.term.length < 2) return this.tasks;
        return this.tasks.filter(task => task.text.toLowerCase().includes(this.term));
    }

    addTask(text, date) {
        if (!this.validateTask(text, date)) return;
        const newTask = { text, date };
        this.tasks.push(newTask);
        console.log("Dodano zadanie:", newTask, "Aktualne tasks:", this.tasks);
        this.saveTasks();
        this.draw();
    }

    removeTask(index) {
        console.log("Usuwanie zadania o indeksie:", index, "Zadanie:", this.tasks[index]);
        this.tasks.splice(index, 1);
        console.log("Aktualne tasks po usunięciu:", this.tasks);
        this.saveTasks();
        this.draw();
    }

    editTask(index, newText) {
        console.log("Edycja zadania o indeksie:", index, "Nowy tekst:", newText);
        if (newText.length < 3 || newText.length > 255) {
            alert("Zadanie musi mieć od 3 do 255 znaków");
            return;
        }
        this.tasks[index].text = newText;
        console.log("Aktualne tasks po edycji:", this.tasks);
        this.saveTasks();
        this.draw();
    }

    draw() {
        this.taskListElement.innerHTML = '';
    
        this.filteredTasks.forEach((task, idx) => {
            const li = document.createElement('li');
    
            // --- Редагування тексту ---
            const textSpan = document.createElement('span');
            textSpan.className = 'task-text';
            let displayText = task.text;
            if (this.term.length >= 2) {
                const regex = new RegExp(`(${this.term})`, 'gi');
                displayText = task.text.replace(regex, '<mark>$1</mark>');
            }
            textSpan.innerHTML = displayText;
    
            textSpan.addEventListener('click', () => {
                li.classList.add('editing');
                const input = document.createElement('input');
                input.type = 'text';
                input.value = task.text;
                li.replaceChild(input, textSpan);
                input.focus();
    
                const saveEdit = (e) => {
                    if (e.target !== input) {
                        const newText = input.value.trim();
                        this.editTask(idx, newText);
                        document.removeEventListener('click', saveEdit);
                    }
                };
                setTimeout(() => document.addEventListener('click', saveEdit));
            });
    
            // --- Редагування дати ---
            const dateSpan = document.createElement('span');
            dateSpan.textContent = task.date ? new Date(task.date).toLocaleString() : '';
    
            dateSpan.addEventListener('click', () => {
                li.classList.add('editing');
                const input = document.createElement('input');
                input.type = 'datetime-local';
                input.value = task.date ? task.date : '';
                li.replaceChild(input, dateSpan);
                input.focus();
    
                const saveDateEdit = (e) => {
                    if (e.target !== input) {
                        const newDate = input.value;
                        task.date = newDate; // зберігаємо в tasks
                        this.saveTasks();
                        this.draw();
                        document.removeEventListener('click', saveDateEdit);
                    }
                };
                setTimeout(() => document.addEventListener('click', saveDateEdit));
            });
    
            // --- Кнопка видалення ---
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'DELETE';
            deleteBtn.addEventListener('click', () => this.removeTask(idx));
    
            li.appendChild(textSpan);
            li.appendChild(dateSpan);
            li.appendChild(deleteBtn);
    
            this.taskListElement.appendChild(li);
        });
    }
    
    
}

// Inicjalizacja Todo
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('search');
const newTaskInput = document.getElementById('newTask');
const newDateInput = document.getElementById('newDate');
const addBtn = document.getElementById('addBtn');

const todoApp = new Todo(taskList, searchInput);
todoApp.loadTasks();
todoApp.draw();

addBtn.addEventListener('click', () => {
    const text = newTaskInput.value.trim();
    const date = newDateInput.value;
    todoApp.addTask(text, date);
    newTaskInput.value = '';
    newDateInput.value = '';
});
