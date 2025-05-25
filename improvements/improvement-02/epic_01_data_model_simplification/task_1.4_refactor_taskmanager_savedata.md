# Task 1.4: Refactor `TaskManager.saveData()` for New Data Model

**Parent Epic:** Epic 1: Core Data Model and Type Overhaul
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to refactor the `TaskManager.saveData()` method in `index.ts` (or the relevant file containing the `TaskManager` class). This method needs to correctly serialize the new `ProjectData` object, which now contains separate arrays for `projects`, `epics`, `tasks`, and `documents`, into the JSON Lines string format for persistence.

**Scope:**

- The `saveData` method will take an argument of type `ProjectData` (the new interface).
- It must iterate through each of the four arrays within the `ProjectData` object (`projects`, `documents`, `epics`, `tasks`).
- For each item in these arrays, it must:
  1.  Add a `type` field (e.g., `{ type: 'project', ...projectItem }`).
  2.  Serialize the augmented item into a JSON string.
- All resulting JSON strings should be concatenated, separated by newline characters (`\n`), to form the final string written to the data file (e.g., `tasks.json`).

## 2. Technical Purpose

To ensure that the application can correctly persist the in-memory state, which is now structured according to the new `ProjectData` model, back to the JSON Lines file. This is crucial for data integrity between application sessions.

## 3. Contextual Relevance

This task is the counterpart to Task 1.3 (`loadData` refactor). Once both `loadData` and `saveData` are updated to handle the new `ProjectData` structure, the application will have a consistent I/O mechanism for its primary data store, based on the new core entity types.

## 4. Semantic Meaning

Refactoring `saveData` completes the basic persistence cycle for the new project-centric model. It ensures that the structured, more flexible data representation (including projects and standalone documents) can be reliably stored and retrieved.

## 5. Detailed Implementation Guidance

1.  **Locate `TaskManager.saveData()`:** Open `index.ts` (or the file where `TaskManager` is defined) and find the `saveData` method.

2.  **Understand Current Logic:** The current `saveData` method in `index.ts` takes the old `ProjectData` (which had `prds`, `epics`, `tasks`), maps over each array, adds the `type` field, stringifies each item, and then joins them into a single string for `fs.writeFile`.

    ```typescript
    // Current TaskManager.saveData() for reference (from docs/ai-onboarding.xml -> index.ts)
    // private async saveData(data: ProjectData): Promise<void> { // Old ProjectData type
    //   const lines = [
    //     ...data.prds.map(p => JSON.stringify({ type: "prd", ...p })),
    //     ...data.epics.map(e => JSON.stringify({ type: "epic", ...e })),
    //     ...data.tasks.map(t => JSON.stringify({ type: "task", ...t })),
    //   ];
    //   await fs.writeFile(TASK_FILE_PATH, lines.join("\n"));
    // }
    ```

3.  **Update Parameter Type:** Ensure the `data` parameter of the method is typed as `ProjectData` (the new interface from `types.ts`).

4.  **Serialize All Four Entity Arrays:**

    - The `lines` array should now be constructed by mapping over `data.projects`, `data.documents`, `data.epics`, and `data.tasks`.
    - For each item from these arrays, prepend the appropriate `type` string (`'project'`, `'document'`, `'epic'`, `'task'`) before serializing with `JSON.stringify`.

5.  **Example Refactored Structure (Conceptual):**

    ```typescript
    // private async saveData(data: ProjectData): Promise<void> { // New ProjectData type
    //   const lines = [
    //     ...data.projects.map(p => JSON.stringify({ type: "project", ...p })),
    //     ...data.documents.map(d => JSON.stringify({ type: "document", ...d })),
    //     ...data.epics.map(e => JSON.stringify({ type: "epic", ...e })),
    //     ...data.tasks.map(t => JSON.stringify({ type: "task", ...t })),
    //   ];
    //   await fs.writeFile(TASK_FILE_PATH, lines.join("\n"));
    // }
    ```

6.  **File Writing:** The `fs.writeFile` call should remain largely the same, writing the `lines.join("\n")` to `TASK_FILE_PATH`.

## 6. Acceptance Criteria

- The `TaskManager.saveData()` method is successfully refactored in `index.ts` (or its containing file).
- The method accepts an argument of the new `ProjectData` type.
- It correctly serializes all items from `projects`, `documents`, `epics`, and `tasks` arrays into JSON strings.
- Each serialized JSON string includes the correct `type` field (`'project'`, `'document'`, `'epic'`, or `'task'`).
- All serialized item strings are joined by newline characters before being written to the file.
- The refactored code is type-safe and uses the new interfaces from `types.ts`.
- The code adheres to existing coding standards and includes JSDoc comments for the method.
- Data saved by this method should be loadable by the refactored `loadData()` method (from Task 1.3) without loss or corruption, assuming the data file itself only contains items adhering to the new model.
- Commit message clearly describes the changes (e.g., `refactor(TaskManager): Update saveData for new project-centric data model`).
