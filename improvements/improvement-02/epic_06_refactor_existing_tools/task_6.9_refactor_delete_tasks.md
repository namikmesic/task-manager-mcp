# Task 6.9: Refactor `TaskManager.deleteTasks()` and Tool, Ensure Cascading Deletes

**Parent Epic:** Epic 6: Refactor Existing MCP Tools and TaskManager Methods
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to refactor the `TaskManager.deleteTasks()` method and its corresponding MCP tool (likely `delete_tasks`). This refactor must ensure that deleting one or more tasks also cascades to delete any Documents attached directly to those tasks.

**Scope:**

- **`TaskManager.deleteTasks(ids: string[]): Promise<void>` (or `Promise<boolean>` for success status):**
  - Modify the existing `TaskManager.deleteTasks()` method.
  - The method takes an array of `ids` (UUIDs) of the tasks to delete.
  - For each task ID in the input array:
    - Identify all Documents attached directly to the task (`doc.entity_id === taskId && doc.entity_type === 'task'`).
    - Remove the identified tasks and their associated documents from their respective arrays in `ProjectData`.
  - Save the data and potentially return a success/failure indicator.
- **`delete_tasks` MCP Tool:**
  - The `inputSchema` (array of task UUIDs) likely remains the same.
  - Ensure its handler calls the refactored `taskManager.deleteTasks()`.
  - Returns a success/failure message.

## 2. Technical Purpose

To provide a robust mechanism for deleting tasks and their directly associated documents, maintaining data integrity and preventing orphaned documents.

## 3. Contextual Relevance

This is essential for managing the lifecycle of individual tasks. When tasks are removed, their specific documentation should also be cleanly removed.

## 4. Semantic Meaning

Refactoring task deletion with cascading to documents ensures that removing a task also removes its immediate documentary context, keeping the project data clean.

## 5. Detailed Implementation Guidance

### A. Refactor `TaskManager.deleteTasks()` Method

1.  **Current Method (for reference, from `docs/ai-onboarding.xml -> index.ts`):**

    ```typescript
    // async deleteTasks(ids: string[]): Promise<void> {
    //   const data = await this.loadData();
    //   data.tasks = data.tasks.filter(t => !ids.includes(t.id));
    //   await this.saveData(data);
    // }
    ```

    The current method only deletes tasks and does not account for `Document` entities.

2.  **New Method Signature (example, returning boolean for overall success):**
    `async deleteTasks(taskIdsToDelete: string[]): Promise<boolean>`

3.  **Implementation Details:**
    ```typescript
    // In TaskManager class
    // async deleteTasks(taskIdsToDelete: string[]): Promise<boolean> {
    //   if (taskIdsToDelete.length === 0) return true;
    //   const data = await this.loadData();
    //   const initialTaskCount = data.tasks.length;
    //
    //   const taskIdsSet = new Set(taskIdsToDelete);
    //
    //   // Filter out documents attached to the tasks being deleted
    //   data.documents = data.documents.filter(doc => {
    //     if (taskIdsSet.has(doc.entity_id) && doc.entity_type === 'task') return false;
    //     return true;
    //   });
    //
    //   // Filter out the tasks themselves
    //   data.tasks = data.tasks.filter(t => !taskIdsSet.has(t.id));
    //
    //   if (data.tasks.length < initialTaskCount) { // Check if any tasks were actually deleted
    //     await this.saveData(data);
    //     return true;
    //   }
    //   return false; // No tasks matching the IDs were found and deleted
    // }
    ```
    - Add logic to identify and remove `Document` entities associated with the tasks being deleted.

### B. Refactor `delete_tasks` MCP Tool

1.  **Locate Tool Definition:** In `index.ts`.

2.  **Input Schema (Zod):**
    This likely remains unchanged if it already accepts an array of task IDs.

    ```typescript
    import { z } from "zod";

    const DeleteTasksInputSchema = z.object({
      ids: z.array(z.string().uuid()).min(1).describe("Array of Task UUIDs to delete"),
    });
    ```

3.  **Update Tool Registration (if necessary):**
    The handler logic will call the refactored `taskManager.deleteTasks()`.

    ```typescript
    // Assuming mcpServer and taskManager instances

    mcpServer.registerTool(
      "delete_tasks",
      {
        description: "Delete one or more tasks and their associated documents.",
        inputSchema: DeleteTasksInputSchema,
      },
      async (args) => {
        const success = await taskManager.deleteTasks(args.ids);
        if (success) {
          return {
            content: [
              {
                type: "text",
                text: `Tasks (and their associated documents) deleted successfully.`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `No tasks found matching the provided IDs, or deletion failed.`,
              },
            ],
            isError: true,
          };
        }
      }
    );
    ```

## 6. Acceptance Criteria

- `TaskManager.deleteTasks()` is refactored:
  - It accepts an array of task UUIDs.
  - It correctly identifies and removes the specified tasks and all documents attached directly to these tasks.
  - Changes are persisted, and a success/failure status is returned.
- The `delete_tasks` MCP tool correctly calls the refactored `taskManager.deleteTasks()`.
- The tool returns an appropriate success/failure message.
- The code is clean, type-safe, and handles cases where provided task IDs might not exist.
- Commit message clearly describes the changes (e.g., `refactor: Update deleteTasks to cascade delete attached documents`).
