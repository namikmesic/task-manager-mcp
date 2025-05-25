# Task 3.9: Implement `reorder_tasks` MCP Tool

**Parent Epic:** Epic 3: Index-Based Prioritization and Ordering
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to define and implement the `reorder_tasks` MCP tool. This tool will expose the `TaskManager.reorderTasks()` functionality (implemented in Task 3.7) to MCP clients, allowing them to reorder tasks within a specific epic.

**Scope:**

- Define the `reorder_tasks` tool in the MCP server setup (likely in `index.ts`).
- The tool's `inputSchema` must match the structure specified in `improvement-02.md` (Step 5), taking `epic_id` and an array `task_orders` (each element having `id` and `index`).
- The tool's handler function will call `this.taskManager.reorderTasks(args.epic_id, args.task_orders)`.
- The tool should return a simple confirmation message upon successful completion.

## 2. Technical Purpose

To provide an MCP-compliant interface for clients (including LLM agents) to programmatically change the execution order of tasks within a specific epic.

## 3. Contextual Relevance

This task makes the server-side task reordering logic (Task 3.7) accessible via the MCP protocol. It completes the set of tools for dynamic, index-based reordering of work items.

## 4. Semantic Meaning

Exposing `reorder_tasks` as an MCP tool empowers clients to directly manipulate the defined execution sequence of tasks within an epic, providing fine-grained control over plan adjustments.

## 5. Detailed Implementation Guidance

1.  **Locate MCP Server Setup:** Open `index.ts` (or the file where the `McpServer` instance is created and tools are registered).

2.  **Define Input Schema (Zod):**

    - Based on `improvement-02.md` (Step 5, `reorder_tasks` tool definition), the input schema will look like this using Zod:

      ```typescript
      import { z } from "zod"; // Ensure zod is imported

      const ReorderTasksInputSchema = z.object({
        epic_id: z.string().uuid().describe("UUID of the epic containing the tasks"),
        task_orders: z
          .array(
            z.object({
              id: z.string().uuid().describe("UUID of the task to reorder"),
              index: z
                .number()
                .int()
                .positive()
                .describe("New index position for the task (1-based)"),
            })
          )
          .min(1)
          .describe("Array of tasks with their new order indices"),
      });
      ```

    - Adjust Zod validators (e.g., `.uuid()`, `.positive()`) as appropriate for the project's validation strictness.

3.  **Register the Tool:**

    - Use `mcpServer.registerTool()` (or `mcpServer.tool()`).

      ```typescript
      // Assuming mcpServer is your McpServer instance
      // Assuming taskManager is your TaskManager instance, accessible in this scope

      mcpServer.registerTool(
        "reorder_tasks",
        {
          description: "Reorder tasks within an epic by updating their index values.",
          inputSchema: ReorderTasksInputSchema,
        },
        async (args) => {
          await taskManager.reorderTasks(args.epic_id, args.task_orders);
          return {
            content: [
              {
                type: "text",
                text: `Tasks within epic ${args.epic_id} successfully reordered.`,
              },
            ],
          };
        }
      );
      ```

4.  **Handler Logic:**
    - The handler is `async`.
    - It calls `await this.taskManager.reorderTasks(args.epic_id, args.task_orders)`.
    - It should return a `CallToolResult` with a simple success message.

## 6. Acceptance Criteria

- The `reorder_tasks` MCP tool is defined and registered with the `McpServer` instance.
- The tool's `inputSchema` correctly reflects the structure from `improvement-02.md` (`epic_id: string`, `task_orders: Array<{ id: string; index: number }>`).
- The tool handler correctly calls `taskManager.reorderTasks()` with the parsed arguments.
- The tool returns a `CallToolResult` with a success message upon completion.
- The implementation uses Zod for schema definition.
- The code is clean, type-safe, and adheres to project conventions.
- Commit message clearly describes the changes (e.g., `feat(MCP): Implement reorder_tasks tool`).
