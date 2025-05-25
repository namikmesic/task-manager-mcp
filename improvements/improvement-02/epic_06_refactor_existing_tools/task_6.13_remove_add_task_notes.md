# Task 6.13: Evaluate and Remove `add_task_notes` Functionality

**Parent Epic:** Epic 6: Refactor Existing MCP Tools and TaskManager Methods
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to evaluate the existing `add_task_notes` MCP tool and its corresponding `TaskManager.addTaskNotes()` method. Given that the new architecture introduces `Document` entities for all descriptive and contextual information (including implementation notes, as per `improvement-02.md` Document interface `type` examples), the dedicated `notes` array on `Task` objects and its associated update mechanism are likely redundant and should be removed.

**Scope:**

- **Analyze:** Determine if the `Document` primitive fully supersedes the functionality provided by `Task.notes` and `add_task_notes`.
- **If Redundant:**
  - Remove the `notes: string[]` field from the `Task` interface in `types.ts` (if it was carried over or re-added inadvertently after Epic 1).
  - Remove the `TaskManager.addTaskNotes()` method.
  - Remove the `add_task_notes` MCP tool definition from the server setup.
- Ensure that data loading (`loadData`) and saving (`saveData`) in `TaskManager` no longer process a `notes` field for tasks.
- Update any search logic (`searchItems`) to remove searching within task notes.

## 2. Technical Purpose

To streamline the `Task` entity and consolidate all textual/contextual information related to tasks (and other entities) into the new `Document` primitive, avoiding data redundancy and confusion about where to store notes.

## 3. Contextual Relevance

This task ensures adherence to the new architectural principle of using `Document` entities as the universal primitive for descriptive content. It simplifies the `Task` model and promotes a consistent way of managing task-related information.

## 4. Semantic Meaning

Removing dedicated task notes in favor of attachable documents signifies a more flexible and powerful approach to information management. Notes are no longer just simple strings but can be richer `Document` entities with their own metadata (title, type, author, content format implied by type).

## 5. Detailed Implementation Guidance

1.  **Confirmation of Redundancy:**

    - Review the capabilities of the new `Document` entity (Epic 4) and how it can be used to store implementation notes, progress updates, or any information previously stored in `Task.notes`.
    - The `Document` interface supports various `type` values (e.g., `"implementation_notes"`, `"prd"`, `"spec"`). This flexibility should cover the use cases of the old `Task.notes`.
    - Based on `improvement-02.md`, the new `Task` interface does **not** include a `notes` field. This task is largely about ensuring this removal is consistently applied.

2.  **If `notes` field exists on new `Task` interface (from an oversight in Epic 1):**

    - Open `types.ts`.
    - Remove the `notes?: string[];` (or `notes: string[];`) line from the `Task` interface definition.

3.  **Remove `TaskManager.addTaskNotes()`:**

    - Open `index.ts` (or the file containing `TaskManager`).
    - Delete the entire `async addTaskNotes(taskId: string, notes: string[]): Promise<Task>` method.
    - The current method (from `docs/ai-onboarding.xml -> index.ts`):
      ```typescript
      // async addTaskNotes(taskId: string, notes: string[]): Promise<Task> {
      //   const data = await this.loadData();
      //   const taskIndex = data.tasks.findIndex(t => t.id === taskId);
      //   if (taskIndex === -1) {
      //     throw new Error(`Task with id ${taskId} not found`);
      //   }
      //   data.tasks[taskIndex].notes.push(...notes);
      //   data.tasks[taskIndex].updated_at = new Date().toISOString(); // updated_at also removed from new Task
      //   await this.saveData(data);
      //   return data.tasks[taskIndex];
      // }
      ```

4.  **Remove `add_task_notes` MCP Tool:**

    - Open `index.ts` (or the MCP server setup file).
    - Delete the entire tool registration block for `add_task_notes`.
    - The current tool definition (from `docs/ai-onboarding.xml -> index.ts`):
      ```json
      // {
      //   name: "add_task_notes",
      //   description: "Add progress notes to a task",
      //   inputSchema: {
      //     type: "object",
      //     properties: {
      //       task_id: { type: "string", description: "ID of the task" },
      //       notes: {
      //         type: "array",
      //         items: { type: "string" },
      //         description: "Notes to add"
      //       },
      //     },
      //     required: ["task_id", "notes"],
      //   },
      // },
      ```
    - Also remove its handler from the `CallToolRequestSchema` switch case.

5.  **Update `loadData()` and `saveData()`:**

    - In `TaskManager.loadData()`: Ensure that when parsing task lines, a `notes` field (if present in old data) is ignored and not added to the new `Task` objects.
    - In `TaskManager.saveData()`: Ensure that `Task` objects being serialized do not attempt to write a `notes` field.
    - (This should be implicitly handled if `notes` is removed from the `Task` interface and `loadData`/`saveData` are strictly typed against it as per Epic 1).

6.  **Update `searchItems()`:**
    - In `TaskManager.searchItems()` (Task 6.11), remove any logic that searches within `task.notes`.

## 6. Acceptance Criteria

- The `notes: string[]` field is confirmed to be absent from the `Task` interface in `types.ts`.
- The `TaskManager.addTaskNotes()` method is removed from the `TaskManager` class.
- The `add_task_notes` MCP tool definition and its handler are removed from the server.
- `TaskManager.loadData()` no longer attempts to load, and `TaskManager.saveData()` no longer attempts to save, a `notes` field for tasks.
- `TaskManager.searchItems()` no longer searches task notes.
- The system relies on `Document` entities (created via `create_document` tool) for storing all task-related notes and descriptive content.
- Commit message clearly describes the changes (e.g., `refactor: Remove legacy task notes functionality in favor of Documents`).
