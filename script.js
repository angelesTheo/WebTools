const todayDate = document.getElementById("todayDate");
const todayMeta = document.getElementById("todayMeta");
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const filterTodayButton = document.getElementById("filterToday");
const clearFilterButton = document.getElementById("clearFilter");

const tasks = [];
let filter = "all";

const priorityClass = {
  Haute: "high",
  Moyenne: "medium",
  Basse: "low",
};

const formatters = {
  date: new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }),
  time: new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }),
};

const updateToday = () => {
  const now = new Date();
  todayDate.textContent = formatters.date.format(now);
  todayMeta.textContent = `Dernière mise à jour : ${formatters.time.format(now)}`;
};

const toggleEmptyState = () => {
  emptyState.style.display = tasks.length ? "none" : "block";
};

const resetForm = () => {
  taskForm.reset();
  const dateInput = document.getElementById("taskDate");
  const timeInput = document.getElementById("taskTime");
  const now = new Date();
  dateInput.valueAsDate = now;
  timeInput.value = now.toTimeString().slice(0, 5);
};

const createTaskItem = (task, index) => {
  const li = document.createElement("li");
  li.className = "task-item";
  li.draggable = true;
  li.dataset.index = index;

  const header = document.createElement("div");
  header.className = "task-item__header";

  const titleWrapper = document.createElement("div");
  const title = document.createElement("h3");
  title.className = "task-item__title";
  title.textContent = task.title;
  titleWrapper.appendChild(title);

  const badge = document.createElement("span");
  badge.className = `badge ${priorityClass[task.priority]}`;
  badge.textContent = task.priority;

  header.appendChild(titleWrapper);
  header.appendChild(badge);

  const description = document.createElement("p");
  description.textContent = task.description || "Aucune description ajoutée.";

  const meta = document.createElement("div");
  meta.className = "task-item__meta";
  meta.innerHTML = `
    <span>📅 ${task.date}</span>
    <span>⏰ ${task.time}</span>
  `;

  const actions = document.createElement("div");
  actions.className = "task-item__actions";

  const completeButton = document.createElement("button");
  completeButton.type = "button";
  completeButton.textContent = task.completed ? "Terminée" : "Marquer terminée";
  completeButton.className = "complete";
  completeButton.addEventListener("click", () => toggleComplete(index));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Supprimer";
  deleteButton.className = "delete";
  deleteButton.addEventListener("click", () => removeTask(index));

  actions.appendChild(completeButton);
  actions.appendChild(deleteButton);

  if (task.completed) {
    li.style.opacity = "0.7";
    title.style.textDecoration = "line-through";
  }

  li.appendChild(header);
  li.appendChild(description);
  li.appendChild(meta);
  li.appendChild(actions);

  li.addEventListener("dragstart", onDragStart);
  li.addEventListener("dragover", onDragOver);
  li.addEventListener("drop", onDrop);
  li.addEventListener("dragend", onDragEnd);

  return li;
};

const renderTasks = () => {
  taskList.innerHTML = "";
  const visibleTasks = tasks.filter((task) => {
    if (filter === "today") {
      const today = new Date().toISOString().split("T")[0];
      return task.rawDate === today;
    }
    return true;
  });

  visibleTasks.forEach((task) => {
    const index = tasks.indexOf(task);
    taskList.appendChild(createTaskItem(task, index));
  });

  toggleEmptyState();
};

const addTask = (event) => {
  event.preventDefault();
  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const rawDate = document.getElementById("taskDate").value;
  const time = document.getElementById("taskTime").value;
  const priority = document.getElementById("taskPriority").value;

  if (!title || !rawDate || !time) {
    return;
  }

  const date = new Date(`${rawDate}T${time}`);
  tasks.unshift({
    title,
    description,
    rawDate,
    date: formatters.date.format(date),
    time,
    priority,
    completed: false,
  });

  renderTasks();
  resetForm();
  updateToday();
};

const removeTask = (index) => {
  tasks.splice(index, 1);
  renderTasks();
};

const toggleComplete = (index) => {
  tasks[index].completed = !tasks[index].completed;
  renderTasks();
};

let draggedIndex = null;

const onDragStart = (event) => {
  draggedIndex = Number(event.currentTarget.dataset.index);
  event.currentTarget.classList.add("dragging");
};

const onDragOver = (event) => {
  event.preventDefault();
};

const onDrop = (event) => {
  event.preventDefault();
  const targetIndex = Number(event.currentTarget.dataset.index);
  if (draggedIndex === targetIndex) {
    return;
  }
  const [dragged] = tasks.splice(draggedIndex, 1);
  tasks.splice(targetIndex, 0, dragged);
  renderTasks();
};

const onDragEnd = (event) => {
  event.currentTarget.classList.remove("dragging");
  draggedIndex = null;
};

filterTodayButton.addEventListener("click", () => {
  filter = "today";
  renderTasks();
});

clearFilterButton.addEventListener("click", () => {
  filter = "all";
  renderTasks();
});

taskForm.addEventListener("submit", addTask);

resetForm();
updateToday();
renderTasks();
