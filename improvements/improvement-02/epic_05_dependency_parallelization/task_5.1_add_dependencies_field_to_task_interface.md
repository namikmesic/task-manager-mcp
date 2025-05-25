# Task 5.1: Add `dependencies` field to Task interface in `types.ts`

**Parent Epic:** Epic 5: Enhanced Dependency Management and Parallelization Logic
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to ensure the `Task` interface in `types.ts` includes the `dependencies?: string[];` field, representing an array of Task UUIDs that the task depends on. This field might have been added during Epic 1 (Task 1.1); this task serves as a verification or addition if missed.

**Scope:**

- Verify or add the `dependencies?: string[];` field to the `Task` interface in `types.ts`.
- The field should be optional (`?`) and an array of strings (`string[]`).
- This task is purely about updating the type definition.

## 2. Technical Purpose

To formally include the `dependencies` field in the `Task` type definition. This field is crucial for capturing blocking relationships between tasks, which is the foundation for parallelization analysis.

## 3. Contextual Relevance

This type definition change is a prerequisite for implementing the logic in `TaskManager` to handle task dependencies during creation/update (Task 5.2) and for all parallelization analysis functions (Tasks 5.3-5.8).

## 4. Semantic Meaning

Adding the `dependencies` field to the `Task` interface explicitly enables the modeling of complex workflows where tasks can have multiple prerequisites. This moves beyond simple linear ordering to a graph-based representation of work.

## 5. Detailed Implementation Guidance

1.  **Open `types.ts`:** This is the target file for all changes.
2.  **Reference `improvement-02.md`:** The `Task` interface definition in "Step 1: Update Core Types" of `improvement-02.md` already includes `dependencies?: string[];`.

    ```typescript
    // From improvements/improvement-02.md (Task interface):
    export interface Task {
      id: string; // UUID
      epic_id: string; // UUID
      title: string;
      status: "todo" | "in_progress" | "done";
      index: number; // Execution order within epic (1 = first)
      assignee?: string; // Optional task assignee
      due_date?: string; // Optional due date (ISO string)
      dependencies?: string[]; // <--- Array of UUIDs for ANY blocking relationship
    }
    ```

3.  **Update `Task` Interface:**
    - Verify that the `Task` interface contains the line: `dependencies?: string[];`
    - If not present, add it.
    - Add or ensure a JSDoc comment explains its purpose: "Optional. Array of Task UUIDs that this task depends on (must complete before this task can start)."

## 6. Acceptance Criteria

- The `types.ts` file correctly includes the `dependencies?: string[];` field in the `Task` interface definition.
- The field is correctly typed as an optional array of strings.
- A JSDoc comment clarifies that `dependencies` holds an array of Task UUIDs.
- The changes do not introduce any TypeScript compilation errors.
- Commit message clearly describes the changes (e.g., `feat(types): Add dependencies field to Task interface`).
