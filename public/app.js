const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");
const formEl = document.getElementById("add-form");
const titleInput = document.getElementById("new-title");

const api = {
  list: () => fetch("/api/todos").then((r) => r.json()),
  create: (title) =>
    fetch("/api/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title }),
    }).then((r) => r.json()),
  update: (id, changes) =>
    fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(changes),
    }).then((r) => r.json()),
  remove: (id) => fetch(`/api/todos/${id}`, { method: "DELETE" }),
};

function render(todos) {
  listEl.innerHTML = "";
  emptyEl.hidden = todos.length > 0;

  for (const todo of todos) {
    const li = document.createElement("li");
    if (todo.done) li.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", async () => {
      await api.update(todo.id, { done: checkbox.checked });
      refresh();
    });

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = todo.title;
    title.title = "Double-click to edit";
    title.addEventListener("dblclick", () => beginEdit(li, todo, title));

    const del = document.createElement("button");
    del.className = "icon-btn delete";
    del.textContent = "Delete";
    del.addEventListener("click", async () => {
      await api.remove(todo.id);
      refresh();
    });

    li.append(checkbox, title, del);
    listEl.appendChild(li);
  }
}

function beginEdit(li, todo, titleEl) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "title-edit";
  input.value = todo.title;
  li.replaceChild(input, titleEl);
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  let settled = false;
  const commit = async () => {
    if (settled) return;
    settled = true;
    const next = input.value.trim();
    if (next && next !== todo.title) {
      await api.update(todo.id, { title: next });
    }
    refresh();
  };

  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") {
      settled = true;
      refresh();
    }
  });
}

async function refresh() {
  render(await api.list());
}

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  await api.create(title);
  titleInput.value = "";
  titleInput.focus();
  refresh();
});

refresh();
