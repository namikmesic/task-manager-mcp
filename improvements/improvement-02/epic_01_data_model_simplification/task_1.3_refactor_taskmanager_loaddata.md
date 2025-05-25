# Task 1.3: Refactor `TaskManager.loadData()` for New Data Model

**Parent Epic:** Epic 1: Core Data Model and Type Overhaul
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to refactor the `TaskManager.loadData()` method in `index.ts` (or the relevant file containing the `TaskManager` class) to correctly read and parse data from the JSON Lines file (e.g., `tasks.json`) according to the new `ProjectData` interface and its constituent entity types (`Project`, `Epic`, `Task`, `Document`).

**Scope:**

- Modify `loadData()` to initialize an empty `ProjectData` object (with empty arrays for `projects`, `epics`, `tasks`, `documents`).
- Update the parsing logic to correctly identify the `type` of each JSON line (`project`, `epic`, `task`, `document`).
- Ensure that each parsed item is cast to its corresponding new interface type and pushed into the correct array within the `ProjectData` object.
- Handle cases where the data file might not exist (return an empty `ProjectData` object) or is malformed (throw an appropriate error or log and skip).
- The method should return `Promise<ProjectData>`.

## 2. Technical Purpose

To ensure that the application can correctly load and represent persisted data in memory using the new, refactored data model. This is a critical step for data integrity and for all subsequent operations that rely on in-memory data.

## 3. Contextual Relevance

This task directly follows the definition of the new types (Tasks 1.1 and 1.2). A correctly functioning `loadData()` is essential before any other `TaskManager` methods that read or manipulate data can be refactored or implemented, as they will expect data to be in the new `ProjectData` format.

## 4. Semantic Meaning

This refactor aligns the data persistence layer's loading mechanism with the new project-centric architectural view. It means the application will now hydrate its in-memory state to reflect the new, more flexible structure, moving away from the old PRD-centric loading if it was different.

## 5. Detailed Implementation Guidance

1.  **Locate `TaskManager.loadData()`:** Open `index.ts` (or the file where `TaskManager` is defined) and find the `loadData` method.

2.  **Understand Current Logic:** The current `loadData` method in `index.ts` reads a JSON Lines file, splits it into lines, and then parses each line. It uses a `type` field on each JSON object to distinguish between `prd`, `epic`, and `task`.

    ```typescript
    // Current TaskManager.loadData() for reference (from docs/ai-onboarding.xml -> index.ts)
    // private async loadData(): Promise<ProjectData> { // Note: Current ProjectData is different
    //   try {
    //     const data = await fs.readFile(TASK_FILE_PATH, "utf-8");
    //     const lines = data.split("\n").filter(line => line.trim() !== "");
    //     return lines.reduce((acc: ProjectData, line) => {
    //       const item = JSON.parse(line) as DataItem; // DataItem is also the old version
    //       if (item.type === "prd") {
    //         const { type, ...prd } = item;
    //         acc.prds.push(prd);
    //       } else if (item.type === "epic") {
    //         const { type, ...epic } = item;
    //         acc.epics.push(epic);
    //       } else if (item.type === "task") {
    //         const { type, ...task } = item;
    //         acc.tasks.push(task);
    //       }
    //       return acc;
    //     }, { prds: [], epics: [], tasks: [] }); // Initial accumulator is old structure
    //   } catch (error) {
    //     if (error instanceof Error && 'code' in error && (error as any).code === "ENOENT") {
    //       return { prds: [], epics: [], tasks: [] }; // Return old empty structure
    //     }
    //     throw error;
    //   }
    // }
    ```

3.  **Update Return Type:** Ensure the method signature returns `Promise<ProjectData>`, where `ProjectData` is the new interface defined in `types.ts` (Task 1.1).

4.  **Initialize New `ProjectData` Accumulator:**

    - The `reduce` function's initial accumulator should be an instance of the new `ProjectData` interface:
      ```typescript
      { projects: [], documents: [], epics: [], tasks: [] }
      ```

5.  **Update Parsing Logic:**

    - The `DataItem` type used for casting `JSON.parse(line)` will need to be updated or a new union type created that includes the new `Project` and `Document` types along with the refactored `Epic` and `Task` types, each distinguished by a `type` field (e.g., `type: 'project'`, `type: 'document'`, etc.).
      ```typescript
      // Example DataItem for the new structure (ensure this or similar is in types.ts or defined locally)
      type NewDataItem =
        | ({ type: "project" } & Project)
        | ({ type: "epic" } & Epic)
        | ({ type: "task" } & Task)
        | ({ type: "document" } & Document);
      ```
    - Inside the `reduce` callback, add conditions for `item.type === 'project'` and `item.type === 'document'`.
    - When an item is parsed:
      - Destructure the `type` field.
      - Push the remaining object (casted to the correct new interface: `Project`, `Epic`, `Task`, or `Document`) into the corresponding array in the accumulator (`acc.projects`, `acc.documents`, `acc.epics`, `acc.tasks`).

6.  **Handle File Not Found:**

    - The `catch` block for `ENOENT` errors should return an empty instance of the new `ProjectData` interface:
      ```typescript
      return { projects: [], documents: [], epics: [], tasks: [] };
      ```

7.  **Type Safety:** Ensure all type assertions and manipulations are type-safe. Use the interfaces defined in Tasks 1.1 and 1.2.

8.  **Example Refactored Structure (Conceptual):**

    ```typescript
    // private async loadData(): Promise<ProjectData> { // New ProjectData type
    //   try {
    //     const data = await fs.readFile(TASK_FILE_PATH, "utf-8");
    //     const lines = data.split("\n").filter(line => line.trim() !== "");
    //     return lines.reduce((acc: ProjectData, line) => {
    //       const item = JSON.parse(line) as NewDataItem; // Using the new DataItem union
    //       switch (item.type) {
    //         case "project":
    //           const { type, ...project } = item;
    //           acc.projects.push(project as Project);
    //           break;
    //         case "epic":
    //           const { type, ...epic } = item;
    //           acc.epics.push(epic as Epic);
    //           break;
    //         case "task":
    //           const { type, ...task } = item;
    //           acc.tasks.push(task as Task);
    //           break;
    //         case "document":
    //           const { type, ...document } = item;
    //           acc.documents.push(document as Document);
    //           break;
    //       }
    //       return acc;
    //     }, { projects: [], documents: [], epics: [], tasks: [] }); // New initial accumulator
    //   } catch (error) {
    //     // ... (ENOENT handling as described above)
    //     throw error;
    //   }
    // }
    ```

## 6. Acceptance Criteria

- The `TaskManager.loadData()` method is successfully refactored in `index.ts` (or its containing file).
- The method correctly initializes and returns a `ProjectData` object conforming to the new interface definitions.
- It correctly parses lines from the JSONL data file, distinguishing between `project`, `epic`, `task`, and `document` types based on the `type` field.
- Parsed items are correctly added to their respective arrays (`projects`, `epics`, `tasks`, `documents`) within the returned `ProjectData` object.
- The method handles the absence of the data file by returning a new, empty `ProjectData` object.
- The refactored code is type-safe and uses the new interfaces from `types.ts`.
- The code adheres to existing coding standards and includes JSDoc comments for the method.
- No existing tests (if any specifically target `loadData`'s old structure) should break due to this change without corresponding test updates (though test updates might be a separate task).
- Commit message clearly describes the changes (e.g., `refactor(TaskManager): Update loadData to support new project-centric data model`).
