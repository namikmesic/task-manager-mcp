# Task 1.2: Define Helper/View Interfaces in `types.ts`

**Parent Epic:** Epic 1: Core Data Model and Type Overhaul
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to define the helper and view-specific interfaces, `ProjectWithDetails` and `ParallelizationAnalysis`, in the `types.ts` file. These definitions must strictly follow the specifications outlined in `improvements/improvement-02.md` under the "Step 1: Update Core Types" section.

This task focuses _only_ on defining these TypeScript interfaces. Their assembly or usage in business logic will be handled in later tasks.

## 2. Technical Purpose

To establish structured types for composite views of data (like a Project with all its nested details) and for the results of specific analyses (like parallelization). This promotes type safety and clarity when these complex data objects are constructed and consumed.

## 3. Contextual Relevance

- `ProjectWithDetails` will be essential for any functionality that needs to display or work with a complete project hierarchy (e.g., the `read_project` tool or the enhanced `onboard` tool).
- `ParallelizationAnalysis` is the dedicated return type for the `analyze_parallelization` tool and its underlying `TaskManager` method, providing a clear contract for its output.

## 4. Semantic Meaning

These interfaces represent more complex, derived views or analytical outputs based on the core entities. They enable the system to provide richer, aggregated information in a well-defined format.

## 5. Detailed Implementation Guidance

1.  **Open `types.ts`:** This is the target file for all changes in this task.
2.  **Ensure Core Entities are Defined:** This task assumes Task 1.1 (Define Core Entity Interfaces) is complete, so `Project`, `Epic`, `Task`, and `Document` interfaces should already be present.
3.  **Define `ProjectWithDetails` Interface:**

    - Refer to `improvements/improvement-02.md`, section "Step 1: Update Core Types", for the `ProjectWithDetails` interface definition.
    - This interface extends `Project` and includes arrays of associated documents and epics. Nested epics, in turn, include their tasks and documents.

    ```typescript
    // From improvements/improvement-02.md:
    export interface ProjectWithDetails extends Project {
      documents: Document[];
      epics: Array<
        Epic & {
          tasks: Task[];
          documents: Document[];
        }
      >;
    }
    ```

4.  **Define `ParallelizationAnalysis` Interface:**

    - Refer to `improvements/improvement-02.md`, section "Step 1: Update Core Types", for the `ParallelizationAnalysis` interface definition.
    - This interface structures the output of the parallelization analysis, including parallelizable tasks, blocked tasks, resource conflicts, and next tasks by assignee.

    ```typescript
    // From improvements/improvement-02.md:
    export interface ParallelizationAnalysis {
      parallelizable_tasks: Task[];
      blocked_tasks: Array<{
        task: Task;
        blocking_dependencies: string[]; // Array of Task UUIDs
      }>;
      resource_conflicts: string[];
      next_tasks_by_assignee: Record<string, Task | null>;
    }
    ```

5.  **No Business Logic:** Do not add any functions, classes, or business logic in this task. This task is strictly about type definitions.

## 6. Acceptance Criteria

- The `types.ts` file contains accurate TypeScript interface definitions for `ProjectWithDetails` and `ParallelizationAnalysis` exactly as specified in `improvements/improvement-02.md` (Step 1).
- `ProjectWithDetails` correctly extends `Project` and nests `Document`, `Epic`, and `Task` arrays as specified.
- `ParallelizationAnalysis` correctly defines fields for `parallelizable_tasks`, `blocked_tasks`, `resource_conflicts`, and `next_tasks_by_assignee`, using the `Task` interface and string arrays where appropriate.
- The code must be clean, well-formatted, and include JSDoc comments for each interface and its properties, explaining their purpose.
- The changes should not introduce any TypeScript compilation errors when added to the existing types from Task 1.1.
- Commit message clearly describes the changes made (e.g., `feat(types): Define helper and view interfaces`).
