document.addEventListener("DOMContentLoaded", function () {
  const noteInput = document.getElementById("note-input");
  const notesList = document.getElementById("notes-list");
  const addNoteBtn = document.getElementById("add-note-btn");

  const taskInput = document.getElementById("task-input");
  const tasksList = document.getElementById("tasks-list");
  const addTaskBtn = document.getElementById("add-task-btn");

  // Function to add a new note
  addNoteBtn.addEventListener("click", function () {
    if (noteInput.value.trim() !== "") {
      const li = document.createElement("li");
      li.textContent = noteInput.value;
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => li.remove());
      li.appendChild(deleteBtn);
      notesList.appendChild(li);
      noteInput.value = "";
    }
  });

  // Function to add a new task
  addTaskBtn.addEventListener("click", function () {
    if (taskInput.value.trim() !== "") {
      const li = document.createElement("li");
      li.textContent = taskInput.value;
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => li.remove());
      li.appendChild(deleteBtn);
      tasksList.appendChild(li);
      taskInput.value = "";
    }
  });
});
