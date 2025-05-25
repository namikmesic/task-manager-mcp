# Task 3.4: Implement `TaskManager.getNextIndex()` for Tasks within an Epic

**Parent Epic:** Epic 3: Index-Based Prioritization and Ordering
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to implement the logic within the `TaskManager.getNextIndex()` method to specifically calculate and return the next available `index` for a new `Task` within its parent `Epic`.

**Scope:**

- Modify the `TaskManager.getNextIndex(entityType: "project" | "epic" | "task", parentId?: string): Promise<number>` method.
- Specifically, implement the case for `entityType === "task"`.
- This logic requires the `parentId` argument, which will be the `id` (UUID) of the parent `Epic`.
- It should filter tasks belonging to the given `parentId` (epic ID), find the maximum current `index` among them, and return `maxIndex + 1`. If no tasks exist for that epic, it should return `1`.

## 2. Technical Purpose

To provide a mechanism for automatically assigning a unique, sequential execution order index to new `Task` entities, scoped to their parent epic. This allows for ordered prioritization of tasks within a specific epic.

## 3. Contextual Relevance

This logic is essential for the `TaskManager.createTask(s)` method, which will use this value to assign an `index` to newly created tasks. It completes the hierarchical indexing system (Project -> Epic -> Task).

## 4. Semantic Meaning

Implementing this logic codifies the principle of ordered task prioritization within an epic. Each new task added to an epic will automatically be placed at the end of the current task sequence for that epic, unless explicitly reordered later.

## 5. Detailed Implementation Guidance

1.  **Locate `TaskManager.getNextIndex()`:**

    - This method should already exist from Tasks 3.2 and 3.3 (`private async getNextIndex(entityType: "project" | "epic" | "task", parentId?: string): Promise<number>`).

2.  **Implement the `'task'` Case:**
    - Inside the `switch` statement, for the `case "task":`
    - A `parentId` (the `epic_id`) is required. Add a check: if `!parentId`, throw an error or return a sensible default/error indicator, as a task must belong to an epic.
    - Load the current data using `const data = await this.loadData();`.
    - Filter `data.tasks` to get only those tasks where `task.epic_id === parentId`.
    - If this filtered list is empty, the next index is `1`.
    - Otherwise, find the maximum value of the `index` property among these filtered epic-specific tasks.
      ```typescript
      // Conceptual logic for 'task' case:
      // if (!parentId) {
      //   throw new Error("parentId (epic_id) is required to get the next task index.");
      // }
      // const data = await this.loadData();
      // const epicTasks = data.tasks.filter((t) => t.epic_id === parentId);
      // if (!epicTasks || epicTasks.length === 0) {
      //   return 1;
      // }
      // const maxTaskIndex = Math.max(0, ...epicTasks.map((t) => t.index));
      // return maxTaskIndex + 1;
      ```
    - The `Math.max(0, ...)` pattern is useful here.

## 6. Acceptance Criteria

- The `TaskManager.getNextIndex()` method is updated in `index.ts` (or its containing file).
- The logic for the `case "task":` within `getNextIndex` correctly calculates the next available index for tasks, scoped to the provided `parentId` (epic ID).
- It correctly uses the `parentId` parameter to filter tasks.
- If no tasks exist for the given epic, it returns `1`.
- If tasks exist for the epic, it returns one greater than the highest current task index within that epic.
- The method throws an error or handles the case appropriately if `parentId` is not provided for `entityType === "task"`.
- The method correctly uses `this.loadData()` to access task data.
- The code is clean, well-formatted, type-safe, and includes JSDoc comments for the relevant case block.
- Commit message clearly describes the changes (e.g., `feat(TaskManager): Implement getNextIndex for Tasks within an Epic`).
