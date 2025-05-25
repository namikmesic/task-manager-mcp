# Task 1.1: Define Core Entity Interfaces in `types.ts`

**Parent Epic:** Epic 1: Core Data Model and Type Overhaul
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to define the primary entity interfaces (`Project`, `Epic`, `Task`, `Document`) and the main data container interface (`ProjectData`) in the `types.ts` file. These definitions must strictly follow the specifications outlined in `improvements/improvement-02.md` under the "Step 1: Update Core Types" section.

This task focuses _only_ on defining these TypeScript interfaces. Implementation of CRUD operations or business logic using these types will be handled in subsequent tasks.

## 2. Technical Purpose

To establish the foundational data structures (types) that will be used throughout the refactored application. These types define the shape and nature of the core entities the system will manage.

## 3. Contextual Relevance

These interface definitions are the absolute cornerstone for the "Project-Centric Architecture." All subsequent development, including data storage, `TaskManager` logic, and MCP tool implementation, will depend on these types being accurately defined.

## 4. Semantic Meaning

Defining these interfaces formally codifies the shift towards projects, universal documents, UUIDs, index-based ordering, and simplified status management. It makes the new architectural primitives explicit in the codebase.

## 5. Detailed Implementation Guidance

1.  **Open `types.ts`:** This is the target file for all changes in this task.
2.  **Locate Existing Interfaces (if any):** Identify the current `PRD`, `Epic`, `Task` interfaces, and any main data container type (e.g., one that might hold arrays of PRDs, Epics, Tasks).
3.  **Replace/Define New Core Entity Interfaces:**

    - Refer to `improvements/improvement-02.md`, section "Step 1: Update Core Types", specifically the definitions for:
      - `Project`
      - `Epic`
      - `Task`
      - `Document`
    - Ensure each interface matches the provided structure precisely, including field names, types (e.g., `id: string` for UUIDs, `index: number`), optionality (`?`), and literal types for `status` (e.g., `"todo" | "in_progress" | "done"`).
    - **Important:** The `improvement-02.md` document explicitly states that `Epic` and `Task` interfaces should _not_ have a `description` field, as this functionality is superseded by attached `Document` entities.

    ```typescript
    // From improvements/improvement-02.md:
    export interface Project {
      id: string; // UUID
      title: string;
      owner: string;
      index: number;
    }

    export interface Epic {
      id: string; // UUID
      project_id: string; // UUID
      title: string;
      status: "todo" | "in_progress" | "done";
      index: number;
    }

    export interface Task {
      id: string; // UUID
      epic_id: string; // UUID
      title: string;
      status: "todo" | "in_progress" | "done";
      index: number;
      assignee?: string;
      due_date?: string;
      dependencies?: string[]; // Array of UUIDs
    }

    export interface Document {
      id: string; // UUID
      title: string;
      content: string;
      type: string;
      entity_type: "project" | "epic" | "task";
      entity_id: string; // UUID
      author: string;
    }
    ```

4.  **Define/Update the Main Data Container Interface (`ProjectData`):**

    - This interface should hold arrays of the newly defined core entities.
    - Refer to `improvements/improvement-02.md`, section "Step 1: Update Core Types", for the `ProjectData` interface definition:

    ```typescript
    // From improvements/improvement-02.md:
    export interface ProjectData {
      projects: Project[];
      documents: Document[];
      epics: Epic[];
      tasks: Task[];
    }
    ```

    - This `ProjectData` interface will likely replace any existing top-level data structure that was PRD-centric (e.g., one that might have directly held `prds: PRD[]` and then PRDs held epics, etc.). The new model flattens these into separate arrays at the root of the data store, linked by IDs.

5.  **Remove Obsolete Interfaces:**

    - Carefully remove or comment out the old `PRD` interface and any other types that are made redundant by the new `Project` and `Document` primitives and the refactored `Epic` and `Task` interfaces.
    - Ensure that the old data storage type (if different from a direct PRD array) is also removed or updated to `ProjectData`.

6.  **No Business Logic:** Do not add any functions, classes, or business logic in this task. This task is strictly about type definitions.

## 6. Acceptance Criteria

- The `types.ts` file contains accurate TypeScript interface definitions for `Project`, `Epic`, `Task`, `Document`, and `ProjectData` exactly as specified in `improvements/improvement-02.md` (Step 1).
- All entity IDs are typed as `string`.
- `index` fields are typed as `number`.
- `status` fields use the specified literal string unions (e.g., `"todo" | "in_progress" | "done"`).
- `Epic` and `Task` interfaces do _not_ contain a `description` field.
- The old `PRD` interface is removed or commented out.
- The main data container type is now `ProjectData` as specified.
- The code must be clean, well-formatted, and include JSDoc comments for each interface and its properties, explaining their purpose (especially for fields like `index`, `dependencies`, `entity_type`, `entity_id`).
- The changes should not introduce any TypeScript compilation errors.
- Commit message clearly describes the changes made (e.g., `feat(types): Define core entity interfaces for project-centric architecture`).
