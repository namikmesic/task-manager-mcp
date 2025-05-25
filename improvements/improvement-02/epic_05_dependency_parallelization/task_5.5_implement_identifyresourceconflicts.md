# Task 5.5: Implement `TaskManager.identifyResourceConflicts()`

**Parent Epic:** Epic 5: Enhanced Dependency Management and Parallelization Logic
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to implement the `identifyResourceConflicts(tasks: Task[]): string[]` method within the `TaskManager` class. This method, as defined in `improvement-02.md` (both in the "Automatic Parallelization Algorithm" section and later in "Step 3: Parallelization API Methods"), identifies assignees who have more than one parallelizable task assigned to them from the input list.

**Scope:**

- Implement a private method `private identifyResourceConflicts(tasks: Task[]): string[]` in `TaskManager`.
- The input `tasks` array is assumed to be a list of _parallelizable_ tasks (likely the output of `getParallelizableTasks()`).
- The method should:
  1.  Count how many tasks are assigned to each unique assignee within the input `tasks` array.
  2.  Identify assignees who have a count greater than 1.
  3.  Return an array of strings, where each string describes a conflict (e.g., `"<assigneeName> has <count> parallelizable tasks"`).

## 2. Technical Purpose

To detect potential resource bottlenecks where a single assignee is expected to work on multiple tasks simultaneously. This helps in resource allocation and planning.

## 3. Contextual Relevance

This method is a key helper for `TaskManager.analyzeParallelization()` (Task 5.7), contributing to the `resource_conflicts` field in the `ParallelizationAnalysis` result. It highlights situations where true parallelism might be hindered by assignee limitations.

## 4. Semantic Meaning

This function adds a layer of resource awareness to the parallelization analysis. While tasks might be technically independent, this identifies if human resource constraints might prevent them from being executed concurrently as initially suggested by dependencies alone.

## 5. Detailed Implementation Guidance

1.  **Method Signature:**

    - Define as `private identifyResourceConflicts(tasks: Task[]): string[]` within `TaskManager`.
    - The input `tasks` array should ideally be the already filtered list of _parallelizable_ tasks to avoid unnecessary processing on tasks that aren't candidates for parallel work anyway. The example in `improvement-02.md` passes the output of `getParallelizableTasks` to `identifyResourceConflicts` when used in `analyzeParallelization`.

2.  **Implementation Steps (following `improvement-02.md`):**

    ```typescript
    // Conceptual logic from improvement-02.md:
    // private identifyResourceConflicts(tasks: Task[]): string[] { // tasks here are parallelizable tasks
    //   const assigneeCount = new Map<string, number>();
    //
    //   tasks.forEach((task) => {
    //     if (task.assignee) { // Only consider tasks with an assignee
    //       assigneeCount.set(task.assignee, (assigneeCount.get(task.assignee) || 0) + 1);
    //     }
    //   });
    //
    //   return Array.from(assigneeCount.entries())
    //     .filter(([assignee, count]) => count > 1)
    //     .map(([assignee, count]) => `${assignee} has ${count} parallelizable tasks`);
    // }
    ```

3.  **Detailed Breakdown of Logic:**
    - **Initialize `assigneeCount` Map:** Create a `Map<string, number>` to store the count of tasks per assignee.
    - **Iterate and Count:**
      - Loop through the input `tasks` array.
      - For each `task`, if `task.assignee` is defined (not null or empty string):
        - Increment the count for `task.assignee` in the `assigneeCount` map. If the assignee is not yet in the map, initialize their count to 1.
    - **Filter and Format Conflicts:**
      - Convert the `assigneeCount` map entries into an array (e.g., using `Array.from(assigneeCount.entries())`).
      - Filter this array to keep only entries where the `count` is greater than 1.
      - Map the filtered entries into an array of descriptive strings, for example: `"${assignee} has ${count} parallelizable tasks"`.

## 6. Acceptance Criteria

- The `TaskManager.identifyResourceConflicts(tasks: Task[]): string[]` method is implemented correctly as a private method.
- It correctly counts the number of parallelizable tasks assigned to each unique assignee from the input `tasks` array.
- It identifies assignees with more than one such task.
- It returns an array of strings, each describing a conflict in the format `"<assigneeName> has <count> parallelizable tasks"`.
- If there are no resource conflicts (no assignee has more than one parallelizable task), it returns an empty array.
- It correctly handles tasks with no assignee (they are ignored for conflict detection).
- The code is clean, type-safe, and includes JSDoc comments.
- Commit message clearly describes the changes (e.g., `feat(TaskManager): Implement identifyResourceConflicts method`).
