# Task 3.6: Implement `TaskManager.reorderEpics()`

**Parent Epic:** Epic 3: Index-Based Prioritization and Ordering
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to implement the `TaskManager.reorderEpics()` method. This method will allow a client to change the `index` (and thus the order) of one or more epics within a specified project.

**Scope:**

- Define and implement `async reorderEpics(projectId: string, epicOrders: Array<{ id: string; index: number }>): Promise<void>` in the `TaskManager` class.
- The `epicOrders` array will contain objects, each with an epic `id` (UUID) and its new desired `index`.
- The method should load data, find the specified epics by their IDs (ensuring they belong to `projectId`), update their `index` properties, and then save the data.
- Consideration should be given to how index collisions are handled if not all epics in a project are reordered (though the primary design from `improvement-02.md` suggests clients will provide a complete new ordering for affected items, implying a dense re-indexing).

## 2. Technical Purpose

To provide a mechanism for users or planning agents to explicitly change the execution order of epics within a project after they have been created.

## 3. Contextual Relevance

This method, along with `reorderTasks`, is crucial for enabling dynamic prioritization. While `getNextIndex` handles initial ordering, `reorderEpics` allows for adjustments as project priorities shift or new information becomes available.

## 4. Semantic Meaning

This functionality directly supports the principle of clear, mutable execution order. It empowers users/agents to refine project plans by explicitly setting the sequence of major workstreams (epics).

## 5. Detailed Implementation Guidance

1.  **Method Signature:**

    - Implement the method in `TaskManager` as `async reorderEpics(projectId: string, epicOrders: Array<{ id: string; index: number }>): Promise<void>`. The `projectId` is used to ensure epics are reordered within the correct project context, although the provided `improvement-02.md` example only uses `epicOrders` to find and update epics directly. For robustness, it's good practice to ensure the epics being reordered actually belong to the `projectId` if this method is intended to be scoped, or clarify if reordering is purely based on the `epicOrders` input affecting global epic data.
    - The `improvement-02.md` example for `reorderEpics` does not explicitly use `projectId` to filter epics before updating. It iterates `epicOrders` and finds epics by `id` in the global `data.epics` list. This guidance will follow that example for simplicity, but acknowledge this potential scoping nuance.

2.  **Implementation Steps:**

    - Load the data: `const data = await this.loadData();`
    - Iterate through the `epicOrders` array.
    - For each `{ id, index }` pair:
      - Find the epic in `data.epics` where `epic.id === id`.
      - If found, update its `index` property to the new `index` from `epicOrders`.
      - If not found, either log a warning, throw an error, or ignore, based on desired error handling strategy (the example in `improvement-02.md` implies ignoring if not found by `findIndex` returning -1).
    - Save the modified data: `await this.saveData(data);`

    ```typescript
    // Conceptual structure from improvement-02.md, Step 2:
    // async reorderEpics(
    //   projectId: string, // Not directly used in example logic but good for context
    //   epicOrders: Array<{ id: string; index: number }>
    // ): Promise<void> {
    //   const data = await this.loadData();

    //   epicOrders.forEach(({ id, index }) => {
    //     const epicIndexToUpdate = data.epics.findIndex((e) => e.id === id);
    //     if (epicIndexToUpdate !== -1) {
    //       // Optional: Could add a check here: data.epics[epicIndexToUpdate].project_id === projectId
    //       data.epics[epicIndexToUpdate].index = index;
    //     }
    //   });

    //   await this.saveData(data);
    // }
    ```

3.  **Index Uniqueness and Density:**
    - The provided example simply assigns the given indices. It does not automatically re-normalize other epic indices within the project if the new `epicOrders` create gaps or conflicts (e.g., two epics assigned index 1).
    - It's assumed the client providing `epicOrders` is responsible for ensuring the new indices form a valid, dense sequence if that's required (e.g., 1, 2, 3...). The `improvement-02.md` example implies the `epicOrders` array might not contain all epics of a project, but only those whose orders are changing.
    - For a robust implementation, one might consider if this method should enforce uniqueness or re-shuffle other items, but the task is to implement as per `improvement-02.md` guidance which is simpler.

## 6. Acceptance Criteria

- The `TaskManager.reorderEpics()` method is implemented in `index.ts` (or its containing file) as specified.
- The method correctly updates the `index` property of epics based on the provided `epicOrders` array.
- Changes are persisted by calling `this.saveData()`.
- The method handles cases where an epic ID in `epicOrders` might not be found (e.g., by ignoring it as per the example).
- The code is clean, type-safe, and includes JSDoc comments for the method.
- Commit message clearly describes the changes (e.g., `feat(TaskManager): Implement reorderEpics method`).
