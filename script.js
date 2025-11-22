// ---------------- SELECTORS ----------------
const form = document.querySelector("#taskForm");
const titleInput = document.querySelector("#title");
const descInput = document.querySelector("#description");

const todoCol = document.querySelector('[data-column="todo"] .tasks');
const doingCol = document.querySelector('[data-column="doing"] .tasks');
const doneCol = document.querySelector('[data-column="done"] .tasks');

// ---------------- TASK DATA ----------------

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ---------------- RENDER FUNCTION ----------------
function render() {
    todoCol.innerHTML = "";
    doingCol.innerHTML = "";
    doneCol.innerHTML = "";

    tasks.forEach(task => {
        const card = document.createElement("div");
        card.classList.add("task");
        card.setAttribute("draggable", true);

        card.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <button class="edit-btn" data-id="${task.id}">Edit</button>
            <button class="delete-btn" data-id="${task.id}">Delete</button>
        `;

        // ----- DRAG START -----
        card.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", task.id);
        });

        // Insert into correct column 
        if (task.status === "todo") todoCol.appendChild(card);
        else if (task.status === "doing") doingCol.appendChild(card);
        else if (task.status === "done") doneCol.appendChild(card);
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
}

render();


// ---------------- Delete + Edit ----------------
document.body.addEventListener("click", (e) => {

    // DELETE
    if (e.target.classList.contains("delete-btn")) {
        const id = Number(e.target.dataset.id);
        tasks = tasks.filter(t => t.id !== id);
        render();
    }

    // EDIT
    if (e.target.classList.contains("edit-btn")) {
        const id = Number(e.target.dataset.id);
        const task = tasks.find(t => t.id === id);

        titleInput.value = task.title;
        descInput.value = task.description;

        form.dataset.editId = id;
    }
});


// ---------------- ADD / UPDATE ----------------
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const editId = form.dataset.editId;

    if (editId) {
        // UPDATE MODE
        const task = tasks.find(t => t.id == editId);
        task.title = title;
        task.description = description;

        delete form.dataset.editId;

    } else {
        // CREATE MODE
        tasks.push({
            id: Date.now(),
            title,
            description,
            status: "todo",
            createdAt: Date.now(),
        });
    }

    render();
    form.reset();
});


// ---------------- DRAG & DROP LOGIC ----------------

// Allow dropping
document.querySelectorAll(".tasks").forEach(col => {
    col.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    col.addEventListener("drop", (e) => {
        const id = Number(e.dataTransfer.getData("text/plain"));

        const task = tasks.find(t => t.id === id);

        // set new status depending on where it's dropped
        const parentColumn = col.parentElement.dataset.column;
        task.status = parentColumn;

        render();
    });
});
