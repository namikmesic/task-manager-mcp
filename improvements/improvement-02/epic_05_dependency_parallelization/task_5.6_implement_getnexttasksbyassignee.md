# Task 5.6: Implement `TaskManager.getNextTasksByAssignee()`

**Parent Epic:** Epic 5: Enhanced Dependency Management and Parallelization Logic
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to implement the `getNextTasksByAssignee(tasks: Task[]): Record<string, Task | null>` method within the `TaskManager` class. This method, as defined in `improvement-02.md` (Step 3: Parallelization API Methods, referred to as `getNextTaskForAssignee` in an earlier section but `getNextTasksByAssignee` in Step 3 API methods), takes a list of parallelizable tasks and determines the single next recommended task for each assignee based on task index.

**Scope:**

- Implement a private method `private getNextTasksByAssignee(tasks: Task[]): Record<string, Task | null>` in `TaskManager`.
- The input `tasks` array is assumed to be a list of _parallelizable_ tasks, already sorted by `index` (as `getParallelizableTasks` would produce).
- The method should:
  1.  Identify all unique assignees present in the input `tasks` array.
  2.  For each unique assignee, find the task assigned to them that has the lowest `index`.
  3.  Return a `Record<string, Task | null>` where keys are assignee names and values are the next recommended `Task` object for that assignee, or `null` if the assignee has no tasks in the input list (or if tasks have no assignees relevant to this processing).

## 2. Technical Purpose

To provide a clear recommendation for what task each assignee should work on next from the set of currently parallelizable tasks, respecting their individual ordered priorities (task indices).

## 3. Contextual Relevance

This method is a key helper for `TaskManager.analyzeParallelization()` (Task 5.7), contributing to the `next_tasks_by_assignee` field in the `ParallelizationAnalysis` result. It helps agents or users quickly identify their immediate next step.

## 4. Semantic Meaning

This function provides actionable, prioritized guidance for individual assignees by sifting through parallelizable options and picking the highest-priority (lowest index) one for each person.

## 5. Detailed Implementation Guidance

1.  **Method Signature:**

    - Define as `private getNextTasksByAssignee(tasks: Task[]): Record<string, Task | null>` within `TaskManager`.
    - The input `tasks` array is expected to be parallelizable tasks, ideally already sorted by `index` (as the output of `getParallelizableTasks()` is sorted).

2.  **Implementation Steps (following `improvement-02.md` Step 3):**

    ```typescript
    // Conceptual logic from improvement-02.md, Step 3:
    // private getNextTasksByAssignee(tasks: Task[]): Record<string, Task | null> {
    //   const result: Record<string, Task | null> = {};
    //   const assignees = new Set(tasks.map((t) => t.assignee).filter(Boolean)); // Get unique, defined assignees
    //
    //   assignees.forEach((assignee) => {
    //     // Filter tasks for the current assignee.
    //     // Since the input 'tasks' array is already sorted by index (from getParallelizableTasks),
    //     // the first task found for an assignee will be their lowest index task.
    //     const assigneeTasks = tasks.filter((t) => t.assignee === assignee);
    //     result[assignee!] = assigneeTasks.length > 0 ? assigneeTasks[0] : null;
    //   });
    //
    //   return result;
    // }
    ```

3.  **Detailed Breakdown of Logic:**

    - **Initialize `result` Object:** Create an empty object `result: Record<string, Task | null> = {}` to store the output.
    - **Get Unique Assignees:**
      - Extract all `assignee` values from the input `tasks` array.
      - Filter out any `undefined` or `null` assignee values (using `filter(Boolean)` or similar).
      - Create a `Set` from these assignees to get a list of unique assignee names.
    - **Iterate Unique Assignees:**
      - For each unique `assignee`:
        - Filter the input `tasks` array to get all tasks where `task.assignee === assignee`.
        - Since the input `tasks` (parallelizable tasks) should already be sorted by `index` (as per `getParallelizableTasks` output), the first task in this filtered `assigneeTasks` array will be the one with the lowest index for that assignee.
        - Set `result[assignee]` to `assigneeTasks[0]` if `assigneeTasks` is not empty; otherwise, set it to `null` (though this case might not occur if an assignee is in the `assignees` set, they must have at least one task).

4.  **Alternative for Finding Lowest Index Task (if input not pre-sorted or to be more robust):**
    If there's no guarantee that the input `tasks` array is pre-sorted by index for each assignee group, a more robust (but slightly less efficient if pre-sorting is already done) way for each assignee would be:
    ```typescript
    // Inside assignees.forEach loop:
    // let nextTaskForAssignee: Task | null = null;
    // tasks.forEach(task => {
    //   if (task.assignee === assignee) {
    //     if (!nextTaskForAssignee || task.index < nextTaskForAssignee.index) {
    //       nextTaskForAssignee = task;
    //     }
    //   }
    // });
    // result[assignee!] = nextTaskForAssignee;
    ```
    However, the `improvement-02.md` example implies the simpler filter-and-take-first approach, relying on the pre-sorted nature of parallelizable tasks.

## 6. Acceptance Criteria

- The `TaskManager.getNextTasksByAssignee(...)` method is implemented correctly as a private method.
- It correctly identifies all unique assignees from the input (parallelizable) task list.
- For each assignee, it selects the task with the lowest `index` assigned to them from the input list.
- It returns a `Record<string, Task | null>` where keys are assignee names and values are the corresponding next `Task` objects (or `null` if no task is found for an assignee, though typically an assignee in the set should have at least one task).
- The method handles tasks with no assignee (they are not included as keys in the result).
- The code is clean, type-safe, and includes JSDoc comments.
- Commit message clearly describes the changes (e.g., `feat(TaskManager): Implement getNextTasksByAssignee method`).
