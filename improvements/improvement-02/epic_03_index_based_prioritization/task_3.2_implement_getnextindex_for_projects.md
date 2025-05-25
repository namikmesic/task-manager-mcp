# Task 3.2: Implement `TaskManager.getNextIndex()` for Projects

**Parent Epic:** Epic 3: Index-Based Prioritization and Ordering
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to implement the logic within the `TaskManager.getNextIndex()` method (or a part of it, if it's a single method with a switch case) to specifically calculate and return the next available `index` for a new `Project`.

**Scope:**

- Modify or add to the `TaskManager.getNextIndex(entityType: "project" | "epic" | "task", parentId?: string): Promise<number>` method, as outlined in `improvement-02.md` (Step 2).
- Specifically, implement the case for `entityType === "project"`.
- This logic should find the maximum current `index` among all existing projects and return `maxIndex + 1`. If no projects exist, it should return `1`.

## 2. Technical Purpose

To provide a mechanism for automatically assigning a unique, sequential execution order index to new `Project` entities. This ensures that projects can be prioritized globally.

## 3. Contextual Relevance

This is a foundational part of the index-based prioritization system. The ability to determine the next project index is essential for the `TaskManager.createProject()` method, which will use this value when creating new projects.

## 4. Semantic Meaning

Implementing this logic codifies the principle of global project ordering. Each new project will automatically receive the next highest priority number unless explicitly reordered later.

## 5. Detailed Implementation Guidance

1.  **Locate or Create `TaskManager.getNextIndex()`:**

    - As per `improvement-02.md` (Step 2), there should be a method like `private async getNextIndex(entityType: "project" | "epic" | "task", parentId?: string): Promise<number>`. If it doesn't exist, create it.
    - This method will likely involve a `switch` statement based on `entityType`.

2.  **Implement the `'project'` Case:**

    - Inside the `switch` statement, for the `case "project":`
    - Load the current data using `const data = await this.loadData();`.
    - Access the `data.projects` array.
    - If `data.projects` is empty or has no items, the next index is `1`.
    - Otherwise, find the maximum value of the `index` property among all projects in `data.projects`.
      ```typescript
      // Conceptual logic for 'project' case:
      // const data = await this.loadData();
      // if (!data.projects || data.projects.length === 0) {
      //   return 1;
      // }
      // const maxProjectIndex = Math.max(0, ...data.projects.map((p) => p.index));
      // return maxProjectIndex + 1;
      ```
    - The `Math.max(0, ...)` pattern is useful here: `Math.max()` with no arguments returns `-Infinity`, so `Math.max(0, ...[])` would effectively return `0`, leading to `0 + 1 = 1` for the first project, which is correct.

3.  **No `parentId` Needed:** For `entityType === "project"`, the `parentId` parameter of `getNextIndex` is not used, as project indices are global.

## 6. Acceptance Criteria

- The `TaskManager.getNextIndex()` method is implemented or updated in `index.ts` (or its containing file).
- The logic for the `case "project":` within `getNextIndex` correctly calculates the next available index for projects.
- If no projects exist, it returns `1`.
- If projects exist, it returns one greater than the highest current project index.
- The method correctly uses `this.loadData()` to access project data.
- The code is clean, well-formatted, type-safe, and includes JSDoc comments for the method (or the specific case block if it's a large switch).
- Commit message clearly describes the changes (e.g., `feat(TaskManager): Implement getNextIndex for Projects`).
