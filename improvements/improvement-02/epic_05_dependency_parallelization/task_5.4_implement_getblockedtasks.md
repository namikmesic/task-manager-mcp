# Task 5.4: Implement `TaskManager.getBlockedTasks()`

**Parent Epic:** Epic 5: Enhanced Dependency Management and Parallelization Logic
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to implement the `getBlockedTasks(tasks: Task[]): Array<{ task: Task; blocking_dependencies: string[] }>` method within the `TaskManager` class. This method, as defined in `improvement-02.md` (Step 3: Parallelization API Methods), identifies tasks that are in "todo" status but cannot yet be started because one or more of their dependencies are not yet "done".

**Scope:**

- Implement a private method `private getBlockedTasks(tasks: Task[]): Array<{ task: Task; blocking_dependencies: string[] }>` in `TaskManager`.
- The input is an array of `Task` objects.
- The method should:
  1.  Filter for tasks with `status === "todo"`.
  2.  Identify tasks whose `status === "done"` to create a set of completed task IDs.
  3.  From the "todo" tasks, filter those that have at least one dependency (`task.dependencies` is not empty/undefined) AND at least one of those `depId`s is NOT present in the set of completed task IDs.
  4.  For each such blocked task, the method should return an object containing the `task` itself and an array `blocking_dependencies` which lists the UUIDs of the dependency tasks that are not yet completed.

## 2. Technical Purpose

To provide a clear list of tasks that are currently blocked and the specific dependencies preventing them from starting. This is important for understanding bottlenecks and for agents to know why certain tasks cannot be worked on.

## 3. Contextual Relevance

This method is a key helper for `TaskManager.analyzeParallelization()` (Task 5.7), providing one of the core components of the `ParallelizationAnalysis` result.

## 4. Semantic Meaning

This function explicitly identifies impediments in the workflow, making it transparent which tasks are waiting and what they are waiting for. This aids in diagnostics and potential re-prioritization or expediting of blocking tasks.

## 5. Detailed Implementation Guidance

1.  **Method Signature:**

    - Define as `private getBlockedTasks(tasks: Task[]): Array<{ task: Task; blocking_dependencies: string[] }>` within `TaskManager`.

2.  **Implementation Steps (following `improvement-02.md`):**

    ```typescript
    // Conceptual logic from improvement-02.md:
    // private getBlockedTasks(tasks: Task[]): Array<{ task: Task; blocking_dependencies: string[] }> {
    //   const todoTasks = tasks.filter((t) => t.status === "todo");
    //   const completedTaskIds = new Set(
    //     tasks.filter((t) => t.status === "done").map((t) => t.id)
    //   );
    //
    //   return todoTasks
    //     .filter((task) =>
    //       task.dependencies?.some((depId) => !completedTaskIds.has(depId)) ?? false
    //     )
    //     .map((task) => ({
    //       task,
    //       blocking_dependencies:
    //         task.dependencies?.filter((depId) => !completedTaskIds.has(depId)) || [],
    //     }));
    // }
    ```

3.  **Detailed Breakdown of Logic:**
    - **Filter `todoTasks`:** Create an array of tasks from the input `tasks` array that have `status: "todo"`.
    - **Create `completedTaskIds` Set:** Create a `Set<string>` of `id`s for tasks from the input `tasks` array with `status: "done"`.
    - **Filter Blocked Tasks:**
      - Iterate through `todoTasks`.
      - A task is considered blocked if it has dependencies (`task.dependencies` is not null/empty) AND _at least one_ of its `depId`s in `task.dependencies` is _not_ found in the `completedTaskIds` set. The `some()` method is appropriate here.
      - The `?? false` after the `some()` call handles the case where `task.dependencies` is `undefined` or `null`, correctly identifying such tasks as _not_ blocked by dependencies (as they have none).
    - **Map to Result Structure:**
      - For each blocked task identified in the previous step, transform it into an object: `{ task: blockedTaskObject, blocking_dependencies: string[] }`.
      - The `blocking_dependencies` array should be populated by filtering `blockedTaskObject.dependencies` to include only those `depId`s that are _not_ in `completedTaskIds`.
      - If `blockedTaskObject.dependencies` was undefined or null (though the filter step should ensure it's not for blocked tasks), default `blocking_dependencies` to an empty array `[]`.

## 6. Acceptance Criteria

- The `TaskManager.getBlockedTasks(...)` method is implemented correctly as a private method.
- It accurately identifies "todo" tasks that have one or more unmet dependencies.
- For each blocked task, it correctly identifies the list of specific dependency task IDs that are not yet "done".
- The method returns an array of objects, each containing the blocked `task` and its `blocking_dependencies` (UUIDs).
- It correctly handles tasks with no dependencies (they are not considered blocked by this logic).
- The code is clean, type-safe, and includes JSDoc comments.
- Commit message clearly describes the changes (e.g., `feat(TaskManager): Implement getBlockedTasks method`).
