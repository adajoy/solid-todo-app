import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  onMount,
  Show,
} from "solid-js";
// @ts-ignore
import * as R from "ramda";

import styles from "./App.module.css";

interface Todo {
  id: string;
  title: string;
  done: boolean;
}

const App: Component = () => {
  const [input, setInput] = createSignal("");
  const [todos, setTodos] = createSignal<Todo[]>([]);
  const [showAll, setShowAll] = createSignal(true);
  const [editId, setEditId] = createSignal<string | null>(null);

  onMount(() => {
    const storage = localStorage.getItem("todos");
    if (storage) {
      setTodos(JSON.parse(storage));
    }
  });
  const handleInput = (e: any) => {
    setInput(e.currentTarget.value);
  };
  const addTodo = () => {
    if (input().trim() === "") return;
    setTodos(
      R.append({
        id: `${new Date().getTime()}`,
        title: input().trim(),
        done: false,
      })
    );
    setInput("");
  };

  createEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos()));
  });
  const handleKeyup = (e: any) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const toggleItem = (id: string) => {
    setTodos(R.map(R.when(R.propEq(id, "id"), R.modify("done", R.not))));
  };

  const toggleFinished = () => {
    setShowAll(R.not);
  };

  const renderTodos = createMemo(() => {
    if (showAll()) return R.sortBy(R.prop("done"))(todos());
    return R.filter(R.propEq(false, "done"))(todos());
  });

  const removeItem = (id: string) => {
    setTodos(R.filter(R.pipe(R.propEq(id, "id"), R.not)));
  };

  const updateTitle = (id: string, title: string) => {
    setTodos(
      R.map(R.when(R.propEq(id, "id"), R.modify("title", R.always(title))))
    );
    setEditId(null);
  };
  return (
    <div class={styles.App}>
      <div class="flex p-2 justify-between">
        <input
          class="basis-3/4 border-solid border-2 border-sky-500 rounded p-1 pl-3"
          placeholder="What needs to be done?"
          onInput={handleInput}
          value={input()}
          onKeyUp={handleKeyup}
        ></input>
        <button
          class="basis-1/5 bg-sky-500 text-white rounded"
          onClick={addTodo}
        >
          Add
        </button>
      </div>

      <div class="divide-y divide-sky-200">
        <For each={renderTodos()}>
          {(item) => (
            <div
              class={`leading-loose p-2 flex justify-between px-5 ${
                item.done ? "bg-green-100" : "bg-sky-100"
              } ${item.done ? "text-green-500" : "text-sky-500"}`}
              onDblClick={() => setEditId(item.id)}
            >
              <Show when={editId() !== item.id}>
                <span class={`${item.done ? "line-through" : ""}`}>
                  {item.title}
                </span>
              </Show>
              <Show when={editId() === item.id}>
                <input
                  type="text"
                  value={item.title}
                  autofocus
                  class="px-2"
                  onChange={(e) => updateTitle(item.id, e.currentTarget.value)}
                />
              </Show>
              <div>
                <span
                  class="mr-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItem(item.id);
                  }}
                >
                  {item.done ? "undo" : "done"}
                </span>
                <span
                  class="text-red-400 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                  }}
                >
                  delete
                </span>
              </div>
            </div>
          )}
        </For>
        <Show when={renderTodos().length === 0}>
          <p class="text-gray-400 text-xl pt-4">Nothing left!</p>
        </Show>
      </div>

      <div class="flex justify-between pl-10 pr-10 p-3 center">
        <Show when={renderTodos().length}>
          <button
            class="outline outline-3 outline-red-200 p-1 rounded bg-red-100 text-red-400 px-2"
            onClick={() => setTodos([])}
          >
            clear All
          </button>
          <button
            class="outline outline-3 outline-sky-200 p-1 rounded bg-sky-100 text-sky-400 px-2"
            onClick={toggleFinished}
          >
            {showAll() ? "show undo" : "show All"}
          </button>
        </Show>
      </div>
    </div>
  );
};

export default App;
