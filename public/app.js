const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");
const errorEl = document.getElementById("error");
const formEl = document.getElementById("add-form");
const titleInput = document.getElementById("new-title");

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function clearError() {
  errorEl.hidden = true;
}

// Wraps fetch: throws on a non-OK response, using the server's { error }
// message when present, and parses JSON only when there's a body to parse.
async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* non-JSON error body — keep the status message */
    }
    throw new Error(message);
  }
  return res.status === 204 ? null : res.json();
}

const api = {
  list: () => request("/api/todos"),
  create: (title) =>
    request("/api/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title }),
    }),
  update: (id, changes) =>
    request(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(changes),
    }),
  remove: (id) => request(`/api/todos/${id}`, { method: "DELETE" }),
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
      try {
        await api.update(todo.id, { done: checkbox.checked });
        refresh();
      } catch (err) {
        checkbox.checked = todo.done;
        showError(err.message);
      }
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
      try {
        await api.remove(todo.id);
        refresh();
      } catch (err) {
        showError(err.message);
      }
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
    try {
      if (next && next !== todo.title) {
        await api.update(todo.id, { title: next });
      }
      refresh();
    } catch (err) {
      showError(err.message);
      refresh();
    }
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
  try {
    render(await api.list());
    clearError();
  } catch (err) {
    showError(err.message);
  }
}

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  try {
    await api.create(title);
    titleInput.value = "";
    titleInput.focus();
    refresh();
  } catch (err) {
    showError(err.message);
  }
});

refresh();
