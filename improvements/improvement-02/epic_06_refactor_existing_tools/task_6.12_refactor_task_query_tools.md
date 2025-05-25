# Task 6.12: Refactor Task Query Methods and Tools

**Parent Epic:** Epic 6: Refactor Existing MCP Tools and TaskManager Methods
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to review and refactor the `TaskManager.getTasksByStatus()` and `TaskManager.getTasksByAssignee()` methods, along with their corresponding MCP tools (`get_tasks_by_status`, `get_tasks_by_assignee`). The main change will be to ensure they operate on the new `Task` interface, which has a simplified `status` enum (`"todo" | "in_progress" | "done"`) and no longer includes fields like `description` or `priority` directly on the task object.

**Scope:**

- **`TaskManager.getTasksByStatus(status: Task['status'], epicId?: string, assignee?: string): Promise<Task[]>`:**
  - Review and update this method in `TaskManager`.
  - Ensure the `status` parameter correctly uses the new three-state enum: `"todo" | "in_progress" | "done"`.
  - The filtering logic based on `status`, optional `epicId` (UUID), and optional `assignee` should remain, but operate on the new `Task` objects.
- **`TaskManager.getTasksByAssignee(assignee: string): Promise<Task[]>`:**
  - Review and update this method. It should simply filter `data.tasks` by `assignee`.
- **`get_tasks_by_status` MCP Tool:**
  - Update its `inputSchema` for the `status` field to reflect the new three-state enum.
  - Ensure the handler calls the refactored `taskManager.getTasksByStatus()`.
- **`get_tasks_by_assignee` MCP Tool:**
  - The `inputSchema` (just `assignee: string`) likely remains the same.
  - Ensure its handler calls the refactored `taskManager.getTasksByAssignee()`.
- Both tools should return an array of `Task` objects (ideally in `structuredContent`).

## 2. Technical Purpose

To ensure that basic task querying capabilities (by status and by assignee) remain functional and are aligned with the updated `Task` data model and its simplified status lifecycle.

## 3. Contextual Relevance

These are common utility queries for users and agents to find tasks relevant to their current focus (e.g., all tasks assigned to them, or all tasks currently in progress for an epic).

## 4. Semantic Meaning

This refactoring ensures that task filtering and retrieval are consistent with the new architectural definitions, particularly the simplified status model.

## 5. Detailed Implementation Guidance

### A. Refactor `TaskManager.getTasksByStatus()`

1.  **Current Method (for reference, from `docs/ai-onboarding.xml -> index.ts`):**

    ```typescript
    // async getTasksByStatus(
    //   status: Task['status'], // Old status: 'todo' | 'in_progress' | 'review' | 'done'
    //   epicId?: string,
    //   assignee?: string
    // ): Promise<Task[]> {
    //   // ... filters data.tasks by status, epicId, assignee ...
    // }
    ```

2.  **New Method Signature & Logic:**
    The signature largely remains, but the `Task['status']` type will now refer to the new enum.
    ```typescript
    // In TaskManager class
    // async getTasksByStatus(
    //   status: "todo" | "in_progress" | "done", // New status enum
    //   epicId?: string,
    //   assignee?: string
    // ): Promise<Task[]> {
    //   const data = await this.loadData();
    //   return data.tasks.filter(t => {
    //     if (t.status !== status) return false;
    //     if (epicId && t.epic_id !== epicId) return false;
    //     if (assignee && t.assignee !== assignee) return false;
    //     return true;
    //   });
    // }
    ```

### B. Refactor `TaskManager.getTasksByAssignee()`

1.  **Current Method (for reference):**
    ```typescript
    // async getTasksByAssignee(assignee: string): Promise<Task[]> {
    //   const data = await this.loadData();
    //   return data.tasks.filter(t => t.assignee === assignee);
    // }
    ```
2.  **New Method Logic:** This method's core logic likely remains identical, as it just filters by `assignee` which is still a field on the new `Task` interface.

### C. Refactor `get_tasks_by_status` MCP Tool

1.  **Locate Tool Definition:** In `index.ts`.
2.  **Update Input Schema (Zod):**

    ```typescript
    import { z } from "zod";

    const GetTasksByStatusInputSchema = z.object({
      status: z.enum(["todo", "in_progress", "done"]).describe("Task status to filter by"),
      epic_id: z
        .string()
        .uuid()
        .optional()
        .describe("Optional epic ID to filter tasks within a specific epic"),
      assignee: z
        .string()
        .optional()
        .describe("Optional assignee name to filter tasks for a specific user"),
    });
    ```

3.  **Update Tool Registration:** Ensure handler calls the refactored method and returns an array of `Task` objects.

### D. Refactor `get_tasks_by_assignee` MCP Tool

1.  **Locate Tool Definition:** In `index.ts`.
2.  **Input Schema (Zod):** This is likely unchanged.
    ```typescript
    // const GetTasksByAssigneeInputSchema = z.object({
    //   assignee: z.string().describe("Assignee name"),
    // });
    ```
3.  **Update Tool Registration:** Ensure handler calls the refactored method.

## 6. Acceptance Criteria

- `TaskManager.getTasksByStatus()` correctly filters tasks based on the new three-state `status` enum and optional `epicId`/`assignee`.
- `TaskManager.getTasksByAssignee()` correctly filters tasks by assignee.
- The `get_tasks_by_status` MCP tool's `inputSchema` uses the new three-state status enum.
- Both MCP tools call their respective refactored `TaskManager` methods and return arrays of `Task` objects (conforming to the new `Task` interface).
- The code is clean, type-safe, and adheres to project standards.
- Commit message clearly describes the changes (e.g., `refactor: Align task query methods and tools with new Task model`).
