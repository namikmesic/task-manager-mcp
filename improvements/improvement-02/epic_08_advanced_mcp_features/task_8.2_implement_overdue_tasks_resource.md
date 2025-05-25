# Task 8.2: Implement Dynamic Resource for Overdue Tasks

**Parent Epic:** Epic 8: Advanced MCP Protocol Features (Optional Stretch)
**Status:** To Do
**Type:** Optional Enhancement

---

## 1. Objective & Scope

The objective of this task is to implement a dynamic, contextual resource using `mcpServer.resource()` that lists all tasks currently considered "overdue". This serves as a practical example of leveraging advanced MCP features for real-time project insights.

**Scope:**

- **Define "Overdue":** First, establish a clear definition for what constitutes an overdue task (e.g., `task.due_date` is in the past AND `task.status` is not `"done"`).
- **Implement `TaskManager` Helper (Optional):** Create a helper method in `TaskManager`, like `getOverdueTasks(): Promise<Task[]>`, that encapsulates the logic to find all overdue tasks.
- **Register MCP Resource:**
  - Use `mcpServer.resource()` to define a new resource, e.g., with a name `"overdue_tasks"` and URI `project-manager://tasks/overdue`.
  - The resource's read handler will call the `TaskManager` helper (or implement the logic directly) to get the list of overdue tasks.
  - The handler should return these tasks in the `ReadResourceResult` (e.g., as a JSON stringified array in `contents[0].text`).
- **Notifications (Advanced):** Consider how this resource might be kept up-to-date. While this task focuses on the read handler, a more advanced implementation might trigger `sendResourceUpdated({ uri: "project-manager://tasks/overdue" })` when a task becomes overdue or is completed (though this requires more intricate event handling within `TaskManager`).

## 2. Technical Purpose

To demonstrate the creation of a dynamic resource that provides real-time, computed information based on the current state of project data. This showcases the power of contextual resources in MCP.

## 3. Contextual Relevance

An "overdue tasks" resource provides immediately valuable information for project monitoring, reporting, and for agents that might need to prioritize or escalate overdue items.

## 4. Semantic Meaning

This contextual resource makes a specific, derived insight (overdue tasks) directly addressable and retrievable via the MCP, rather than requiring clients to fetch all tasks and compute this themselves.

## 5. Detailed Implementation Guidance

1.  **Define "Overdue" Logic:**

    - A task is overdue if its `due_date` is defined, is in the past, and its `status` is not `"done"`.
    - Example check for a single task:
      ```typescript
      // function isTaskOverdue(task: Task): boolean {
      //   if (!task.due_date || task.status === "done") {
      //     return false;
      //   }
      //   try {
      //     return new Date(task.due_date) < new Date();
      //   } catch (e) {
      //     return false; // Invalid date format
      //   }
      // }
      ```

2.  **`TaskManager.getOverdueTasks()` (Helper Method - Recommended):**

    ```typescript
    // In TaskManager class
    // async getOverdueTasks(): Promise<Task[]> {
    //   const data = await this.loadData();
    //   const now = new Date();
    //   return data.tasks.filter(task => {
    //     if (!task.due_date || task.status === "done") {
    //       return false;
    //     }
    //     try {
    //       return new Date(task.due_date) < now;
    //     } catch (e) {
    //       // Log error for invalid date format if desired
    //       return false;
    //     }
    //   });
    // }
    ```

3.  **Register `overdue_tasks` MCP Resource:**

    - In `index.ts` (or MCP server setup file).
    - Choose a URI, e.g., `project-manager://tasks/overdue` (or simply `/tasks/overdue` if using relative paths with a base URL).

      ```typescript
      // Assuming mcpServer and taskManager instances
      // Assuming TaskZodSchema is defined for potential structured output

      mcpServer.resource(
        "overdue_tasks_resource", // Name of the resource registration
        "project-manager://tasks/overdue", // The URI clients will use
        {
          description: "Provides a list of all tasks that are currently overdue.",
          mimeType: "application/json", // As we'll return a JSON array string
        },
        async (uri, params, extra) => {
          // `uri`, `params`, `extra` are from ReadResourceCallback signature
          const overdueTasks = await taskManager.getOverdueTasks();
          return {
            contents: [
              {
                uri: "project-manager://tasks/overdue", // The URI of this resource itself
                text: JSON.stringify(overdueTasks, null, 2),
                // mimeType: "application/json", // Can also be set here
              },
            ],
          };
        }
      );
      ```

4.  **Real-time Updates (Advanced Consideration - Beyond This Task's Core Scope):**
    - To make this resource truly real-time, `TaskManager` methods that change task status or due dates (e.g., `updateTask`, or a daily check) would need to evaluate if the list of overdue tasks has changed.
    - If it has, they would call: `mcpServer.server.sendResourceUpdated({ uri: "project-manager://tasks/overdue" });`
    - This requires `mcpServer` to be accessible within `TaskManager`.

## 6. Acceptance Criteria

- (If helper method implemented) `TaskManager.getOverdueTasks()` correctly identifies and returns all tasks that meet the definition of "overdue".
- An MCP resource (e.g., named `"overdue_tasks_resource"` with URI `project-manager://tasks/overdue`) is registered using `mcpServer.resource()`.
- The resource's read handler correctly calls `taskManager.getOverdueTasks()` (or implements the logic) and returns the list of overdue tasks as a JSON string within the `ReadResourceResult`.
- Clients can request this resource URI (e.g., via a `resources/read` MCP call) and receive the current list of overdue tasks.
- The code is clean, type-safe, and includes JSDoc comments.
- Commit message clearly describes the new resource (e.g., `feat(Resource): Add dynamic resource for overdue tasks`).
