# Task 5.2: Update `TaskManager.createTasks()` and `TaskManager.updateTask()` to handle `dependencies`

**Parent Epic:** Epic 5: Enhanced Dependency Management and Parallelization Logic
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to update the `TaskManager.createTasks()` (or `createTask`) and `TaskManager.updateTask()` methods to correctly handle the `dependencies` field for `Task` entities. This means ensuring that when tasks are created or updated, their `dependencies` array (of Task UUIDs) is properly stored.

**Scope:**

- Modify `TaskManager.createTasks()` (or `createTask`): When a new task is created, if the input data includes a `dependencies` array, this array should be assigned to the new task object. If not provided, it can default to an empty array or `undefined` based on the `Task` interface (which specifies `dependencies?: string[]`).
- Modify `TaskManager.updateTask()`: When a task is updated, if the `updates` object includes a `dependencies` field, this new array should replace the existing `dependencies` for that task.

## 2. Technical Purpose

To enable the system to store and manage the explicit dependency relationships between tasks, as defined by arrays of predecessor task UUIDs.

## 3. Contextual Relevance

This is a crucial step in implementing the broad dependency model. Without the ability to store these dependencies, the parallelization analysis logic (Tasks 5.3 onwards) cannot function.

## 4. Semantic Meaning

This change allows the system to capture the true relational structure of a project's workflow, where task execution is governed by a network of dependencies rather than just a linear sequence.

## 5. Detailed Implementation Guidance

1.  **Prerequisites:**

    - The `Task` interface in `types.ts` must include `dependencies?: string[];` (Task 5.1).
    - `loadData()` and `saveData()` must be able to handle the `dependencies` field in task objects (covered by Epic 1 if `Task` interface was updated there).

2.  \*\*Modify `TaskManager.createTasks()` (or `createTask`):

    - Locate the method (to be refactored in Epic 6, Task 6.3).
    - When constructing a new `Task` object from input data, ensure the `dependencies` field is correctly assigned:
      ```typescript
      // Conceptual change within createTasks method, for each taskInput:
      // const newTask: Task = {
      //   // ... other fields (id, epic_id, title, status, index, etc.)
      //   dependencies: taskInput.dependencies || [], // Assign if provided, else default to empty array
      //   // or dependencies: taskInput.dependencies, if undefined is acceptable and handled by schema
      // };
      ```
    - The `improvement-02.md` tool definition for `create_tasks` shows `dependencies` as an optional array of strings. If the input `taskInput.dependencies` is `undefined`, ensure `newTask.dependencies` is also `undefined` or an empty array, consistent with the `Task` interface.

3.  **Modify `TaskManager.updateTask()`:**

    - Locate the method (to be refactored in Epic 6, Task 6.6).
    - When applying `updates` to an existing task, if `updates.dependencies` is present, it should overwrite the task's current `dependencies` array.
      ```typescript
      // Conceptual change within updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>
      // const taskIndex = data.tasks.findIndex(t => t.id === id);
      // if (taskIndex === -1) { return undefined; }
      //
      // // Create the updated task object
      // const updatedTask = { ...data.tasks[taskIndex], ...updates };
      //
      // // If dependencies are explicitly provided in updates (even if an empty array),
      // // they should overwrite the existing ones. If updates.dependencies is undefined,
      // // the existing dependencies remain untouched due to spread operator.
      // data.tasks[taskIndex] = updatedTask;
      // await this.saveData(data);
      // return data.tasks[taskIndex];
      ```
    - If `updates.dependencies` is `undefined`, the spread operator `...updates` will not change the existing `dependencies`. If `updates.dependencies` is an empty array `[]`, it will correctly set the task's dependencies to be empty.

4.  **Type Safety:** Ensure that the `dependencies` array is always treated as `string[]` (array of UUIDs).

## 6. Acceptance Criteria

- `TaskManager.createTasks()` (or `createTask`) correctly assigns the provided `dependencies` array (or a default empty array/undefined) to new `Task` objects.
- `TaskManager.updateTask()` correctly updates the `dependencies` array of an existing task if `dependencies` are provided in the update payload. If `dependencies` are not in the payload, existing dependencies are preserved.
- The changes are persisted correctly via `saveData()`.
- The code is type-safe and handles the optional nature of the `dependencies` field appropriately.
- Commit message clearly describes the changes (e.g., `feat(TaskManager): Handle dependencies in task creation and updates`).
