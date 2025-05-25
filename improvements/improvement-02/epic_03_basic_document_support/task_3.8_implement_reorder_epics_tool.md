# Task 3.8: Implement `reorder_epics` MCP Tool

**Parent Epic:** Epic 3: Index-Based Prioritization and Ordering
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to define and implement the `reorder_epics` MCP tool. This tool will expose the `TaskManager.reorderEpics()` functionality (implemented in Task 3.6) to MCP clients, allowing them to reorder epics within a project.

**Scope:**

- Define the `reorder_epics` tool in the MCP server setup (likely in `index.ts` where other tools are registered with `McpServer` instance).
- The tool's `inputSchema` must match the structure specified in `improvement-02.md` (Step 5), taking `project_id` and an array `epic_orders` (each element having `id` and `index`).
- The tool's handler function will call `this.taskManager.reorderEpics(args.project_id, args.epic_orders)`.
- The tool should return a simple confirmation message upon successful completion, as the underlying `TaskManager` method returns `Promise<void>`.

## 2. Technical Purpose

To provide an MCP-compliant interface for clients (including LLM agents) to programmatically change the execution order of epics within a project.

## 3. Contextual Relevance

This task makes the server-side reordering logic (Task 3.6) accessible via the MCP protocol. It's a key component for enabling dynamic planning and prioritization by external agents or UIs.

## 4. Semantic Meaning

Exposing `reorder_epics` as an MCP tool empowers clients to directly manipulate the defined execution sequence of epics, reinforcing the system's commitment to clear and adaptable prioritization.

## 5. Detailed Implementation Guidance

1.  **Locate MCP Server Setup:** Open `index.ts` (or the file where the `McpServer` instance is created and tools are registered).

2.  **Define Input Schema (Zod):**

    - Based on `improvement-02.md` (Step 5, `reorder_epics` tool definition), the input schema will look like this using Zod:

      ```typescript
      import { z } from "zod"; // Ensure zod is imported

      const ReorderEpicsInputSchema = z.object({
        project_id: z.string().uuid().describe("UUID of the project containing the epics"),
        epic_orders: z
          .array(
            z.object({
              id: z.string().uuid().describe("UUID of the epic to reorder"),
              index: z
                .number()
                .int()
                .positive()
                .describe("New index position for the epic (1-based)"),
            })
          )
          .min(1)
          .describe("Array of epics with their new order indices"),
      });
      ```

    - Note: Added `.uuid()` for string IDs and `.int().positive()` for index assuming 1-based positive indices for clarity, adjust if UUIDs aren't strictly validated at schema level or if 0-based/non-positive indices are allowed by business logic.

3.  **Register the Tool:**

    - Use `mcpServer.registerTool()` (or `mcpServer.tool()` depending on the preferred style used in the project).

      ```typescript
      // Assuming mcpServer is your McpServer instance
      // Assuming taskManager is your TaskManager instance, accessible in this scope

      mcpServer.registerTool(
        "reorder_epics",
        {
          description: "Reorder epics within a project by updating their index values.",
          inputSchema: ReorderEpicsInputSchema,
          // No outputSchema needed as the underlying method is void and we return a simple text confirmation
        },
        async (args) => {
          await taskManager.reorderEpics(args.project_id, args.epic_orders);
          return {
            content: [
              {
                type: "text",
                text: `Epics within project ${args.project_id} successfully reordered.`,
              },
            ],
          };
        }
      );
      ```

4.  **Handler Logic:**
    - The handler is `async`.
    - It calls `await this.taskManager.reorderEpics(args.project_id, args.epic_orders)`. Ensure `taskManager` instance is accessible.
    - It should return a `CallToolResult` with a simple success message in the `content` array.

## 6. Acceptance Criteria

- The `reorder_epics` MCP tool is defined and registered with the `McpServer` instance.
- The tool's `inputSchema` correctly reflects the structure from `improvement-02.md` ( `project_id: string`, `epic_orders: Array<{ id: string; index: number }>`).
- The tool handler correctly calls `taskManager.reorderEpics()` with the parsed arguments.
- The tool returns a `CallToolResult` with a success message upon completion.
- The implementation uses Zod for schema definition.
- The code is clean, type-safe, and adheres to project conventions.
- Commit message clearly describes the changes (e.g., `feat(MCP): Implement reorder_epics tool`).
