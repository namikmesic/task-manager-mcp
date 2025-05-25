# Task 3.7: Implement `TaskManager.reorderTasks()`

**Parent Epic:** Epic 3: Index-Based Prioritization and Ordering
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to implement the `TaskManager.reorderTasks()` method. This method will allow a client to change the `index` (and thus the order) of one or more tasks within a specified epic.

**Scope:**

- Define and implement `async reorderTasks(epicId: string, taskOrders: Array<{ id: string; index: number }>): Promise<void>` in the `TaskManager` class.
- The `taskOrders` array will contain objects, each with a task `id` (UUID) and its new desired `index`.
- The method should load data, find the specified tasks by their IDs (ensuring they belong to `epicId`), update their `index` properties, and then save the data.
- Similar to `reorderEpics`, considerations for index collisions apply if not all tasks in an epic are reordered.

## 2. Technical Purpose

To provide a mechanism for users or planning agents to explicitly change the execution order of tasks within an epic after they have been created.

## 3. Contextual Relevance

This method complements `reorderEpics` by allowing fine-grained control over task sequencing within each epic. It is crucial for dynamic planning and adjustment at the task level.

## 4. Semantic Meaning

This functionality reinforces the principle of clear, mutable execution order down to the task level. It empowers users/agents to refine epic plans by explicitly setting the sequence of individual work items.

## 5. Detailed Implementation Guidance

1.  **Method Signature:**

    - Implement the method in `TaskManager` as `async reorderTasks(epicId: string, taskOrders: Array<{ id: string; index: number }>): Promise<void>`. The `epicId` parameter is important for context and potentially for validation, though the example in `improvement-02.md` (Step 2) focuses on finding tasks by their unique IDs from `taskOrders`.
    - Similar to `reorderEpics`, the `improvement-02.md` example for `reorderTasks` iterates `taskOrders` and finds tasks by `id` in the global `data.tasks` list. This guidance will follow that, but acknowledge the `epicId` parameter could be used for scoping/validation.

2.  **Implementation Steps:**

    - Load the data: `const data = await this.loadData();`
    - Iterate through the `taskOrders` array.
    - For each `{ id, index }` pair:
      - Find the task in `data.tasks` where `task.id === id`.
      - If found, update its `index` property to the new `index` from `taskOrders`.
      - (Optional: one could add a check: `if (data.tasks[taskIndexToUpdate].epic_id === epicId)` before updating, if strict scoping to the provided `epicId` is desired beyond just client assertion).
      - If not found, handle appropriately (e.g., ignore, log, or error).
    - Save the modified data: `await this.saveData(data);`

    ```typescript
    // Conceptual structure from improvement-02.md, Step 2:
    // async reorderTasks(
    //   epicId: string, // Good for context, example logic doesn't strictly use it for filtering before update
    //   taskOrders: Array<{ id: string; index: number }>
    // ): Promise<void> {
    //   const data = await this.loadData();

    //   taskOrders.forEach(({ id, index }) => {
    //     const taskIndexToUpdate = data.tasks.findIndex((t) => t.id === id);
    //     if (taskIndexToUpdate !== -1) {
    //       // Optional: Check if data.tasks[taskIndexToUpdate].epic_id === epicId
    //       data.tasks[taskIndexToUpdate].index = index;
    //     }
    //   });

    //   await this.saveData(data);
    // }
    ```

3.  **Index Uniqueness and Density:**
    - As with `reorderEpics`, the example implies direct assignment of provided indices. The client sending `taskOrders` is responsible for the validity and density of the sequence within the epic.

## 6. Acceptance Criteria

- The `TaskManager.reorderTasks()` method is implemented in `index.ts` (or its containing file) as specified.
- The method correctly updates the `index` property of tasks based on the provided `taskOrders` array.
- Changes are persisted by calling `this.saveData()`.
- The method handles cases where a task ID in `taskOrders` might not be found.
- (Optional consideration) The method could validate that tasks being reordered belong to the specified `epicId` if stricter scoping is implemented.
- The code is clean, type-safe, and includes JSDoc comments for the method.
- Commit message clearly describes the changes (e.g., `feat(TaskManager): Implement reorderTasks method`).
