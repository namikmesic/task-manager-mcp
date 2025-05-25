# Task 3.3: Implement `TaskManager.getNextIndex()` for Epics within a Project

**Parent Epic:** Epic 3: Index-Based Prioritization and Ordering
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to implement the logic within the `TaskManager.getNextIndex()` method to specifically calculate and return the next available `index` for a new `Epic` within its parent `Project`.

**Scope:**

- Modify the `TaskManager.getNextIndex(entityType: "project" | "epic" | "task", parentId?: string): Promise<number>` method.
- Specifically, implement the case for `entityType === "epic"`.
- This logic requires the `parentId` argument, which will be the `id` (UUID) of the parent `Project`.
- It should filter epics belonging to the given `parentId`, find the maximum current `index` among them, and return `maxIndex + 1`. If no epics exist for that project, it should return `1`.

## 2. Technical Purpose

To provide a mechanism for automatically assigning a unique, sequential execution order index to new `Epic` entities, scoped to their parent project. This allows for ordered prioritization of epics within a specific project.

## 3. Contextual Relevance

This logic is essential for the `TaskManager.createEpic(s)` method, which will use this value to assign an `index` to newly created epics. It builds upon the global project indexing by enabling ordered workstreams within each project.

## 4. Semantic Meaning

Implementing this logic codifies the principle of ordered epic prioritization within a project. Each new epic added to a project will automatically be placed at the end of the current epic sequence for that project, unless explicitly reordered later.

## 5. Detailed Implementation Guidance

1.  **Locate `TaskManager.getNextIndex()`:**

    - This method should already exist from Task 3.2 (`private async getNextIndex(entityType: "project" | "epic" | "task", parentId?: string): Promise<number>`).

2.  **Implement the `'epic'` Case:**
    - Inside the `switch` statement, for the `case "epic":`
    - A `parentId` (the `project_id`) is required. Add a check: if `!parentId`, throw an error or return a sensible default/error indicator, as an epic must belong to a project.
    - Load the current data using `const data = await this.loadData();`.
    - Filter `data.epics` to get only those epics where `epic.project_id === parentId`.
    - If this filtered list is empty, the next index is `1`.
    - Otherwise, find the maximum value of the `index` property among these filtered project-specific epics.
      ```typescript
      // Conceptual logic for 'epic' case:
      // if (!parentId) {
      //   throw new Error("parentId (project_id) is required to get the next epic index.");
      // }
      // const data = await this.loadData();
      // const projectEpics = data.epics.filter((e) => e.project_id === parentId);
      // if (!projectEpics || projectEpics.length === 0) {
      //   return 1;
      // }
      // const maxEpicIndex = Math.max(0, ...projectEpics.map((e) => e.index));
      // return maxEpicIndex + 1;
      ```
    - The `Math.max(0, ...)` pattern is again useful here.

## 6. Acceptance Criteria

- The `TaskManager.getNextIndex()` method is updated in `index.ts` (or its containing file).
- The logic for the `case "epic":` within `getNextIndex` correctly calculates the next available index for epics, scoped to the provided `parentId` (project ID).
- It correctly uses the `parentId` parameter to filter epics.
- If no epics exist for the given project, it returns `1`.
- If epics exist for the project, it returns one greater than the highest current epic index within that project.
- The method throws an error or handles the case appropriately if `parentId` is not provided for `entityType === "epic"`.
- The method correctly uses `this.loadData()` to access epic data.
- The code is clean, well-formatted, type-safe, and includes JSDoc comments for the relevant case block.
- Commit message clearly describes the changes (e.g., `feat(TaskManager): Implement getNextIndex for Epics within a Project`).
