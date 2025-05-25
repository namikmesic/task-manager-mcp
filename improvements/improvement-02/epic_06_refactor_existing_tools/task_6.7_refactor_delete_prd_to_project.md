# Task 6.7: Refactor `TaskManager.deletePrd()` to `deleteProject()` and Tool, Ensure Cascading Deletes

**Parent Epic:** Epic 6: Refactor Existing MCP Tools and TaskManager Methods
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to refactor the `TaskManager.deletePRD()` method to `TaskManager.deleteProject()` and update its corresponding MCP tool (likely `delete_prd` to `delete_project`). A crucial part of this refactor is to ensure that deleting a project correctly cascades to delete all its associated Epics, Tasks, and Documents.

**Scope:**

- **`TaskManager.deleteProject(id: string): Promise<boolean>` (or similar return type indicating success/failure):**
  - Rename/refactor `TaskManager.deletePRD()` to `deleteProject()`.
  - The method takes the `id` (UUID) of the project to delete.
  - It must find the project.
  - Then, it must identify all Epics belonging to this project (`epic.project_id === id`).
  - For each of these epics, it must identify all their Tasks (`task.epic_id === epic.id`).
  - It must identify all Documents attached directly to the project (`doc.entity_id === id && doc.entity_type === 'project'`).
  - It must identify all Documents attached to the project's epics.
  - It must identify all Documents attached to the tasks of those epics.
  - Remove the identified project, all its epics, all their tasks, and all associated documents from their respective arrays in `ProjectData`.
  - Save the data and return a success/failure indicator.
- **`delete_project` MCP Tool:**
  - Rename or replace the existing `delete_prd` tool with `delete_project`.
  - The `inputSchema` should require `id` (project UUID).
  - The handler calls the refactored `taskManager.deleteProject()`.
  - Returns a success/failure message.

## 2. Technical Purpose

To provide a clean and comprehensive way to remove a project and all its dependent data from the system, maintaining data integrity by preventing orphaned entities.

## 3. Contextual Relevance

Deletion is a standard lifecycle operation. For top-level entities like Projects, ensuring a complete cascade delete is essential to keep the data store clean and avoid broken references or orphaned data that could cause issues later.

## 4. Semantic Meaning

This refactoring ensures that the concept of a "Project" as an encapsulating unit is respected even during deletion. Removing a project implies removing everything that constituted that project.

## 5. Detailed Implementation Guidance

### A. Refactor `TaskManager.deletePRD()` to `deleteProject()`

1.  **Current Method (for reference, from `docs/ai-onboarding.xml -> index.ts`):**

    ```typescript
    // async deletePRD(id: string): Promise<void> {
    //   const data = await this.loadData();
    //   const epicIds = data.epics.filter(e => e.prd_id === id).map(e => e.id);
    //   data.tasks = data.tasks.filter(t => !epicIds.includes(t.epic_id));
    //   data.epics = data.epics.filter(e => e.prd_id !== id);
    //   data.prds = data.prds.filter(p => p.id !== id);
    //   await this.saveData(data);
    // }
    ```

    The current method handles cascading deletes for epics and tasks but does not account for `Document` entities.

2.  **New Method Signature:**
    `async deleteProject(id: string): Promise<boolean>` (Returning boolean for success is more informative than void).

3.  **Implementation Details:**
    ```typescript
    // In TaskManager class
    // async deleteProject(projectId: string): Promise<boolean> {
    //   const data = await this.loadData();
    //
    //   const projectExists = data.projects.some(p => p.id === projectId);
    //   if (!projectExists) {
    //     return false; // Project not found
    //   }
    //
    //   // Identify epics belonging to the project and their IDs
    //   const projectEpics = data.epics.filter(e => e.project_id === projectId);
    //   const projectEpicIds = new Set(projectEpics.map(e => e.id));
    //
    //   // Identify tasks belonging to these epics and their IDs
    //   const projectTasks = data.tasks.filter(t => projectEpicIds.has(t.epic_id));
    //   const projectTaskIds = new Set(projectTasks.map(t => t.id));
    //
    //   // Filter out documents: attached to project, its epics, or its tasks
    //   data.documents = data.documents.filter(doc => {
    //     if (doc.entity_id === projectId && doc.entity_type === 'project') return false;
    //     if (projectEpicIds.has(doc.entity_id) && doc.entity_type === 'epic') return false;
    //     if (projectTaskIds.has(doc.entity_id) && doc.entity_type === 'task') return false;
    //     return true;
    //   });
    //
    //   // Filter out tasks of the project
    //   data.tasks = data.tasks.filter(t => !projectEpicIds.has(t.epic_id));
    //
    //   // Filter out epics of the project
    //   data.epics = data.epics.filter(e => e.project_id !== projectId);
    //
    //   // Filter out the project itself
    //   data.projects = data.projects.filter(p => p.id !== projectId);
    //
    //   await this.saveData(data);
    //   return true;
    // }
    ```
    - Crucially, add logic to identify and remove all `Document` entities associated with the project itself, its epics, and its tasks.
    - The order of filtering/deletion matters to correctly identify all dependents before removing parents.

### B. Refactor `delete_prd` MCP Tool to `delete_project`

1.  **Locate Tool Definition:** In `index.ts`.

2.  **Update/Replace Tool Name and Input Schema (Zod):**

    ```typescript
    import { z } from "zod";

    const DeleteProjectInputSchema = z.object({
      id: z.string().uuid().describe("UUID of the project to delete"),
    });
    ```

3.  **Update/Replace Tool Registration:**

    ```typescript
    // Assuming mcpServer and taskManager instances

    mcpServer.registerTool(
      "delete_project", // New or renamed tool
      {
        description: "Delete a project and all its associated epics, tasks, and documents.",
        inputSchema: DeleteProjectInputSchema,
      },
      async (args) => {
        const success = await taskManager.deleteProject(args.id);
        if (success) {
          return {
            content: [
              {
                type: "text",
                text: `Project with ID ${args.id} and all associated items deleted successfully.`,
              },
            ],
          };
        } else {
          return {
            content: [{ type: "text", text: `Project with ID ${args.id} not found.` }],
            isError: true,
          };
        }
      }
    );
    // Ensure the old 'delete_prd' tool is removed or its registration is updated.
    ```

## 6. Acceptance Criteria

- `TaskManager.deletePRD()` is refactored into `TaskManager.deleteProject()`.
  - The method accepts a `projectId` (UUID).
  - It correctly identifies and removes the project, all its child epics, all tasks of those epics, all documents attached directly to the project, all documents attached to its epics, and all documents attached to its tasks.
  - Changes are persisted, and a boolean success status is returned.
- The `delete_prd` MCP tool is refactored/renamed to `delete_project`.
  - Its `inputSchema` requires the project `id`.
  - Its handler calls the refactored `taskManager.deleteProject()`.
  - It returns an appropriate success/failure message.
- The code is clean, type-safe, and handles cases where the project might not exist.
- Commit message clearly describes the changes (e.g., `refactor: Implement deleteProject with full cascading deletes`).
