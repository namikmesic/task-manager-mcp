# Task 5.3: Implement `TaskManager.getParallelizableTasks()`

**Parent Epic:** Epic 5: Enhanced Dependency Management and Parallelization Logic
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to implement the `getParallelizableTasks(tasks: Task[]): Task[]` method within the `TaskManager` class. This method, as defined in `improvement-02.md` (both in the "Automatic Parallelization Algorithm" section and later in "Step 3: Parallelization API Methods"), identifies tasks that can be executed in parallel based on their dependencies and status.

**Scope:**

- Implement a private method `private getParallelizableTasks(tasks: Task[]): Task[]` in `TaskManager`.
- The input is an array of `Task` objects (presumably all tasks from a specific context, e.g., an epic or project, or all tasks globally if used by a broader analysis tool).
- The method should:
  1.  Filter for tasks with `status === "todo"`.
  2.  Identify tasks whose `status === "done"` to create a set of completed task IDs.
  3.  From the "todo" tasks, filter those whose `dependencies` array is either empty/undefined OR where every dependency ID in the array is present in the set of completed task IDs.
  4.  The resulting array of parallelizable tasks should be sorted by their `index` field in ascending order.

## 2. Technical Purpose

To provide the core logic for identifying which tasks are currently unblocked and can be started. This is a fundamental component of the automatic parallelization feature.

## 3. Contextual Relevance

This method will be a key helper function used by `TaskManager.analyzeParallelization()` (Task 5.7) and potentially other parts of the system that need to determine the next actionable tasks.

## 4. Semantic Meaning

This function translates the dependency graph and task statuses into a concrete list of tasks that are ready for execution, enabling efficient work allocation and progress.

## 5. Detailed Implementation Guidance

1.  **Method Signature:**

    - Define as `private getParallelizableTasks(tasks: Task[]): Task[]` within `TaskManager`.
    - The `tasks` parameter represents the pool of tasks to analyze (e.g., all tasks in an epic, or all tasks in a project).

2.  **Implementation Steps (following `improvement-02.md`):**

    ```typescript
    // Conceptual logic from improvement-02.md:
    // private getParallelizableTasks(tasks: Task[]): Task[] {
    //   const todoTasks = tasks.filter((t) => t.status === "todo");
    //   const completedTaskIds = new Set(
    //     tasks.filter((t) => t.status === "done").map((t) => t.id)
    //   );
    //
    //   // Tasks with all dependencies satisfied can run in parallel
    //   return todoTasks
    //     .filter((task) =>
    //       task.dependencies?.every((depId) => completedTaskIds.has(depId)) ?? true
    //     )
    //     .sort((a, b) => a.index - b.index); // Respect index ordering within parallelizable set
    // }
    ```

3.  **Detailed Breakdown of Logic:**
    - **Filter `todoTasks`:** Create an array containing only tasks from the input `tasks` array that have `status: "todo"`.
    - **Create `completedTaskIds` Set:** Create a `Set<string>` containing the `id`s of all tasks from the input `tasks` array that have `status: "done"`. Using a `Set` provides efficient lookups (`.has(depId)`).
    - **Filter Parallelizable Tasks:**
      - Iterate through `todoTasks`.
      - For each `task`, check its `dependencies` array:
        - If `task.dependencies` is `undefined` or an empty array, the task is parallelizable (has no dependencies).
        - Otherwise (if `task.dependencies` is a non-empty array), use `every()` to check if _all_ `depId` in `task.dependencies` are present in the `completedTaskIds` set.
      - The `?? true` (nullish coalescing operator) after the `every()` call handles the case where `task.dependencies` is `undefined` or `null`, correctly identifying such tasks as parallelizable.
    - **Sort Result:** Sort the final array of parallelizable tasks by their `index` property in ascending order (`a.index - b.index`).

## 6. Acceptance Criteria

- The `TaskManager.getParallelizableTasks(tasks: Task[]): Task[]` method is implemented correctly as a private method.
- It accurately identifies tasks that are in "todo" status and have all their dependencies (if any) met (i.e., dependent tasks are in "done" status).
- It correctly handles tasks with no dependencies.
- The returned array of parallelizable tasks is sorted by `task.index` in ascending order.
- The method efficiently uses data structures like `Set` for checking completed task IDs.
- The code is clean, type-safe, adheres to project standards, and includes JSDoc comments.
- Commit message clearly describes the changes (e.g., `feat(TaskManager): Implement getParallelizableTasks method`).
