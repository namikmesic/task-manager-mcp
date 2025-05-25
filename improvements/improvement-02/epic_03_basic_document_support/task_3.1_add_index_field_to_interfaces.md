# Task 3.1: Add `index` field to Project, Epic, Task interfaces in `types.ts`

**Parent Epic:** Epic 3: Index-Based Prioritization and Ordering
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to add the `index: number` field to the `Project`, `Epic`, and `Task` interfaces within the `types.ts` file, if they were not already included during the initial definition in Epic 1 (Task 1.1).

**Scope:**

- Verify or add the `index: number;` field to the `Project` interface.
- Verify or add the `index: number;` field to the `Epic` interface.
- Verify or add the `index: number;` field to the `Task` interface.
- This task is purely about updating the type definitions.

## 2. Technical Purpose

To formally include the `index` field in the type definitions of entities that require ordered prioritization. This field will store the numerical execution order for projects globally, epics within a project, and tasks within an epic.

## 3. Contextual Relevance

This task is a prerequisite for implementing the logic that assigns and manages these indices (Tasks 3.2-3.5) and for the reordering functionalities (Tasks 3.6-3.9). The type definitions must reflect this new field before it can be used.

## 4. Semantic Meaning

Adding the `index` field to the core types explicitly codifies the shift from vague priority labels to a clear, numerical ordering system, which is a key principle of the new architecture.

## 5. Detailed Implementation Guidance

1.  **Open `types.ts`:** This is the target file for all changes.
2.  **Reference `improvement-02.md`:** The definitions in "Step 1: Update Core Types" in `improvement-02.md` already include the `index` field for `Project`, `Epic`, and `Task`. This task is primarily to ensure these were correctly transcribed in Task 1.1 or to add them if missed.

    ```typescript
    // From improvements/improvement-02.md (relevant parts):
    export interface Project {
      id: string; // UUID
      title: string;
      owner: string;
      index: number; // <--- Ensure this is present
    }

    export interface Epic {
      id: string; // UUID
      project_id: string; // UUID
      title: string;
      status: "todo" | "in_progress" | "done";
      index: number; // <--- Ensure this is present
    }

    export interface Task {
      id: string; // UUID
      epic_id: string; // UUID
      title: string;
      status: "todo" | "in_progress" | "done";
      index: number; // <--- Ensure this is present
      assignee?: string;
      due_date?: string;
      dependencies?: string[]; // Array of UUIDs
    }
    ```

3.  **Update Interfaces:**
    - For each of the `Project`, `Epic`, and `Task` interfaces, ensure the line `index: number;` is present.
    - Add JSDoc comments explaining the purpose of the `index` field for each interface (e.g., for `Project`: "Execution priority across all projects (1 = highest)"; for `Epic`: "Execution order within project (1 = first)"; for `Task`: "Execution order within epic (1 = first)").

## 6. Acceptance Criteria

- The `types.ts` file correctly includes the `index: number;` field in the `Project` interface definition.
- The `types.ts` file correctly includes the `index: number;` field in the `Epic` interface definition.
- The `types.ts` file correctly includes the `index: number;` field in the `Task` interface definition.
- JSDoc comments clarify the purpose of the `index` field for each affected interface.
- The changes do not introduce any TypeScript compilation errors.
- Commit message clearly describes the changes (e.g., `feat(types): Add index field to Project, Epic, and Task interfaces`).
