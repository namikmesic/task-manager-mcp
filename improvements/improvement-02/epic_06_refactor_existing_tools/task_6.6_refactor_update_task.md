# Task 6.6: Refactor `TaskManager.updateTask()` and its MCP Tool

**Parent Epic:** Epic 6: Refactor Existing MCP Tools and TaskManager Methods
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to refactor the `TaskManager.updateTask()` method and its corresponding MCP tool (likely `update_task`) to align with the new `Task` interface. This involves removing updates to `description` and `priority`, and ensuring fields like `title`, `status`, `assignee`, `due_date`, and `dependencies` can be modified.

**Scope:**

- **`TaskManager.updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'epic_id' | 'index'>>): Promise<Task | undefined>`:**
  - Refactor the existing `TaskManager.updateTask()` method.
  - The `updates` should allow changes to fields present in the new `Task` interface: `title`, `status`, `assignee` (optional), `due_date` (optional), `dependencies` (optional array of UUIDs). Fields `id`, `epic_id`, and `index` should be immutable through this method.
  - The method should load data, find the task by `id`, apply valid updates, save data, and return the updated task or `undefined` if not found.
  - Remove logic for updating `description`, `priority`, and `notes` (as `notes` are superseded by Documents).
- **`update_task` MCP Tool:**
  - Update the `inputSchema` to require `id` (task UUID) and allow optional `title`, `status`, `assignee`, `due_date`, `dependencies`.
  - The handler calls the refactored `taskManager.updateTask()`.
  - Returns the updated `Task` object or a "not found" message.

## 2. Technical Purpose

To align task modification functionality with the new, streamlined `Task` data model, focusing on essential execution-related attributes and dependency management.

## 3. Contextual Relevance

This refactoring is crucial for managing the lifecycle and details of individual tasks within the new architecture. It ensures that task updates are consistent with the new data structure and capabilities (like modifiable dependencies).

## 4. Semantic Meaning

This change emphasizes that updating a task now revolves around its core operational details and its relationships within the project graph (dependencies), with descriptive content and ad-hoc notes handled by the `Document` primitive.

## 5. Detailed Implementation Guidance

### A. Refactor `TaskManager.updateTask()` Method

1.  **Current Method (for reference, from `docs/ai-onboarding.xml -> index.ts`):**

    ```typescript
    // async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'epic_id' | 'created_at'>>): Promise<Task> {
    //   // ... finds Task by id, merges updates, sets updated_at ...
    //   // Current updates can include: title, description, status, priority, assignee, due_date, dependencies
    // }
    ```

    Note: The current `dependencies` in the old `updateTask` might be just for notes/linking, not the broader task-blocking dependencies of the new model.

2.  **New Method Signature:**

    ```typescript
    // In TaskManager class
    // async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'epic_id' | 'index'>>): Promise<Task | undefined> {
    ```

    - `Omit` ensures `id`, `epic_id` (immutable link), and `index` (managed by reorder tools) are not part of the `updates` type passed to this method.

3.  **Implementation Details:**
    ```typescript
    // async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'epic_id' | 'index'>>): Promise<Task | undefined> {
    //   const data = await this.loadData();
    //   const taskIndex = data.tasks.findIndex(t => t.id === id);
    //   if (taskIndex === -1) {
    //     return undefined;
    //   }
    //
    //   // Ensure only allowed fields are updated and correctly typed
    //   const validUpdates: Partial<Task> = {};
    //   if (updates.title !== undefined) validUpdates.title = updates.title;
    //   if (updates.status !== undefined) validUpdates.status = updates.status;
    //   if (updates.assignee !== undefined) validUpdates.assignee = updates.assignee; // Handles setting to undefined if passed
    //   if (updates.due_date !== undefined) validUpdates.due_date = updates.due_date; // Handles setting to undefined
    //   if (updates.dependencies !== undefined) validUpdates.dependencies = updates.dependencies; // Handles setting to new array or undefined
    //   // Explicitly ignore description, priority, notes, old timestamps
    //
    //   data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...validUpdates };
    //   // The new Task interface does not have updated_at, so no need to set it here.
    //   await this.saveData(data);
    //   return data.tasks[taskIndex];
    // }
    ```
    - Updatable fields: `title`, `status`, `assignee`, `due_date`, `dependencies`.
    - Remove logic for updating `description`, `priority`, `notes`, and `updated_at` (as it's not in the new `Task` interface).

### B. Refactor `update_task` MCP Tool

1.  **Locate Tool Definition:** In `index.ts` (or MCP server setup file).

2.  **Update Input Schema (Zod):**
    Based on `improvement-02.md` (Step 5, `update_task` tool, though the tool in the markdown also had description/priority which are now removed from the updatable fields of the `Task` interface).

    ```typescript
    import { z } from "zod";

    const UpdateTaskInputSchema = z
      .object({
        id: z.string().uuid().describe("UUID of the task to update"),
        title: z.string().min(1).optional().describe("New task title"),
        status: z.enum(["todo", "in_progress", "done"]).optional().describe("New task status"),
        assignee: z
          .string()
          .optional()
          .nullable()
          .describe("New assignee (string or null to unassign)"),
        due_date: z
          .string()
          .datetime({ message: "Invalid ISO date format for due_date" })
          .optional()
          .nullable()
          .describe("New due date (ISO format or null to clear)"),
        dependencies: z
          .array(z.string().uuid())
          .optional()
          .nullable()
          .describe("New array of dependency task UUIDs (or null/empty to clear)"),
      })
      .refine((data) => Object.keys(data).length > 1, {
        message: "At least one field to update must be provided besides the ID.",
      });
    ```

    - Using `.nullable()` for optional fields like `assignee`, `due_date`, `dependencies` allows clients to explicitly clear them by passing `null`.

3.  **Update Tool Registration:**

    ```typescript
    // Assuming mcpServer and taskManager instances
    // Optional: Define TaskZodSchema for typed output

    mcpServer.registerTool(
      "update_task",
      {
        description:
          "Update an existing task's details (title, status, assignee, due_date, dependencies).",
        inputSchema: UpdateTaskInputSchema,
        // outputSchema: TaskZodSchema, // Optional
      },
      async (args) => {
        const { id, ...taskUpdates } = args;

        // Prepare updates for the TaskManager method, ensuring nullable fields are handled
        const updatesForTm: Partial<Omit<Task, "id" | "epic_id" | "index">> = {};
        if (taskUpdates.title !== undefined) updatesForTm.title = taskUpdates.title;
        if (taskUpdates.status !== undefined) updatesForTm.status = taskUpdates.status;
        if (taskUpdates.assignee !== undefined)
          updatesForTm.assignee = taskUpdates.assignee === null ? undefined : taskUpdates.assignee;
        if (taskUpdates.due_date !== undefined)
          updatesForTm.due_date = taskUpdates.due_date === null ? undefined : taskUpdates.due_date;
        if (taskUpdates.dependencies !== undefined)
          updatesForTm.dependencies =
            taskUpdates.dependencies === null ? [] : taskUpdates.dependencies;

        const updatedTask = await taskManager.updateTask(id, updatesForTm);
        if (!updatedTask) {
          return {
            content: [{ type: "text", text: `Task with ID ${id} not found.` }],
            isError: true,
          };
        }
        return {
          // structuredContent: updatedTask, // If using outputSchema
          content: [{ type: "text", text: JSON.stringify(updatedTask, null, 2) }],
        };
      }
    );
    // Remove or update old add_task_notes tool if its functionality is now covered or obsolete
    ```

## 6. Acceptance Criteria

- `TaskManager.updateTask()` is refactored:
  - The method accepts updates for `title`, `status`, `assignee`, `due_date`, `dependencies`.
  - It correctly finds, updates, saves, and returns the task.
  - Logic for updating old Task fields (description, priority, notes, timestamps) is removed.
- The `update_task` MCP tool is refactored:
  - Its `inputSchema` reflects the new `Task` updatable fields.
  - Its handler correctly calls the refactored `taskManager.updateTask()`.
  - It returns the updated `Task` object or a not-found message.
- The `add_task_notes` tool and its `TaskManager` method are considered for removal, as notes are handled by Documents.
- The code is clean, type-safe, and adheres to project standards.
- Commit message clearly describes the changes (e.g., `refactor: Align updateTask method and tool with new Task model`).
