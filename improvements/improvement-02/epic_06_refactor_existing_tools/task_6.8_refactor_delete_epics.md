# Task 6.8: Refactor `TaskManager.deleteEpics()` and Tool, Ensure Cascading Deletes

**Parent Epic:** Epic 6: Refactor Existing MCP Tools and TaskManager Methods
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to refactor the `TaskManager.deleteEpics()` method and its corresponding MCP tool (likely `delete_epics`). This refactor must ensure that deleting one or more epics also cascades to delete all their associated Tasks and any Documents attached to those epics and their tasks.

**Scope:**

- **`TaskManager.deleteEpics(ids: string[]): Promise<void>` (or `Promise<boolean>` for success status):**
  - Modify the existing `TaskManager.deleteEpics()` method.
  - The method takes an array of `ids` (UUIDs) of the epics to delete.
  - For each epic ID in the input array:
    - Identify all Tasks belonging to that epic (`task.epic_id === epicId`).
    - Identify all Documents attached directly to the epic (`doc.entity_id === epicId && doc.entity_type === 'epic'`).
    - Identify all Documents attached to the tasks of that epic.
    - Remove the identified epics, all their tasks, and all documents associated with those epics and their tasks from their respective arrays in `ProjectData`.
  - Save the data and potentially return a success/failure indicator or summary.
- **`delete_epics` MCP Tool:**
  - The `inputSchema` (array of epic UUIDs) likely remains the same as the existing tool.
  - Ensure its handler calls the refactored `taskManager.deleteEpics()`.
  - Returns a success/failure message.

## 2. Technical Purpose

To provide a robust mechanism for deleting epics and all their dependent data, including tasks and associated documents, maintaining data integrity.

## 3. Contextual Relevance

This is essential for managing the lifecycle of epics. When an epic is no longer needed, all its constituent parts (tasks, documents) should be cleanly removed from the system.

## 4. Semantic Meaning

Refactoring epic deletion with full cascading to documents reinforces that an epic is a container of work and related information. Removing an epic means removing that entire self-contained unit of work and its context.

## 5. Detailed Implementation Guidance

### A. Refactor `TaskManager.deleteEpics()` Method

1.  **Current Method (for reference, from `docs/ai-onboarding.xml -> index.ts`):**

    ```typescript
    // async deleteEpics(ids: string[]): Promise<void> {
    //   const data = await this.loadData();
    //   data.tasks = data.tasks.filter(t => !ids.includes(t.epic_id));
    //   data.epics = data.epics.filter(e => !ids.includes(e.id));
    //   await this.saveData(data);
    // }
    ```

    The current method handles cascading deletes for tasks but does not account for `Document` entities.

2.  **New Method Signature (example, returning boolean for overall success):**
    `async deleteEpics(epicIdsToDelete: string[]): Promise<boolean>`

3.  **Implementation Details:**
    ```typescript
    // In TaskManager class
    // async deleteEpics(epicIdsToDelete: string[]): Promise<boolean> {
    //   if (epicIdsToDelete.length === 0) return true; // Or false if no action taken is not success
    //   const data = await this.loadData();
    //   const initialEpicCount = data.epics.length;
    //
    //   const epicIdsSet = new Set(epicIdsToDelete);
    //
    //   // Identify tasks belonging to the epics being deleted
    //   const tasksToDelete = data.tasks.filter(t => epicIdsSet.has(t.epic_id));
    //   const taskIdsToDeleteSet = new Set(tasksToDelete.map(t => t.id));
    //
    //   // Filter out documents: attached to the epics or their tasks
    //   data.documents = data.documents.filter(doc => {
    //     if (epicIdsSet.has(doc.entity_id) && doc.entity_type === 'epic') return false;
    //     if (taskIdsToDeleteSet.has(doc.entity_id) && doc.entity_type === 'task') return false;
    //     return true;
    //   });
    //
    //   // Filter out tasks of the epics
    //   data.tasks = data.tasks.filter(t => !epicIdsSet.has(t.epic_id));
    //
    //   // Filter out the epics themselves
    //   data.epics = data.epics.filter(e => !epicIdsSet.has(e.id));
    //
    //   if (data.epics.length < initialEpicCount) { // Check if any epics were actually deleted
    //      await this.saveData(data);
    //      return true;
    //   }
    //   return false; // No epics matching the IDs were found and deleted
    // }
    ```
    - Add logic to identify and remove `Document` entities associated with the epics being deleted AND with the tasks belonging to those epics.

### B. Refactor `delete_epics` MCP Tool

1.  **Locate Tool Definition:** In `index.ts`.

2.  **Input Schema (Zod):**
    This likely remains unchanged from the existing tool if it already accepts an array of epic IDs.

    ```typescript
    import { z } from "zod";

    const DeleteEpicsInputSchema = z.object({
      ids: z.array(z.string().uuid()).min(1).describe("Array of Epic UUIDs to delete"),
    });
    ```

3.  **Update Tool Registration (if necessary):**
    The handler logic will call the refactored `taskManager.deleteEpics()`.

    ```typescript
    // Assuming mcpServer and taskManager instances

    mcpServer.registerTool(
      "delete_epics",
      {
        description: "Delete one or more epics and their associated tasks and documents.",
        inputSchema: DeleteEpicsInputSchema,
      },
      async (args) => {
        const success = await taskManager.deleteEpics(args.ids);
        if (success) {
          return {
            content: [
              { type: "text", text: `Epics (and their associated items) deleted successfully.` },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `No epics found matching the provided IDs, or deletion failed.`,
              },
            ],
            isError: true, // Or more specific error
          };
        }
      }
    );
    ```

## 6. Acceptance Criteria

- `TaskManager.deleteEpics()` is refactored:
  - It accepts an array of epic UUIDs.
  - It correctly identifies and removes the specified epics, all tasks belonging to these epics, all documents attached to these epics, and all documents attached to their tasks.
  - Changes are persisted, and a success/failure status is returned.
- The `delete_epics` MCP tool correctly calls the refactored `taskManager.deleteEpics()`.
- The tool returns an appropriate success/failure message.
- The code is clean, type-safe, and handles cases where provided epic IDs might not exist.
- Commit message clearly describes the changes (e.g., `refactor: Update deleteEpics to cascade delete documents`).
