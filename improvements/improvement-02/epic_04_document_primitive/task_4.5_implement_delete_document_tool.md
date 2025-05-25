# Task 4.5: Implement `delete_document` MCP Tool

**Parent Epic:** Epic 4: Document Primitive Implementation
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to define and implement an MCP tool for deleting existing `Document` entities. This could be a specific `delete_document` tool or leverage a more generic entity deletion tool.

**Scope:**

- Define the `delete_document` tool in the MCP server setup.
- The input schema should require the `id` (UUID) of the document to delete.
- The tool's handler function will call `this.taskManager.deleteDocument(args.id)` (from Task 4.1).
- The tool should return a success or failure message in the `CallToolResult`.

## 2. Technical Purpose

To provide an MCP-compliant interface for clients to remove documents from the system.

## 3. Contextual Relevance

Allows for an evolving knowledge base by removing outdated or irrelevant documents. It completes the basic set of lifecycle management tools for documents.

## 4. Semantic Meaning

Provides a mechanism to explicitly remove documented information, ensuring the project's knowledge base can be curated and kept relevant.

## 5. Detailed Implementation Guidance

1.  **Locate MCP Server Setup:** Open `index.ts` (or the file where the `McpServer` instance is created and tools are registered).

2.  **Define Input Schema (Zod):**

    ```typescript
    import { z } from "zod"; // Ensure zod is imported

    const DeleteDocumentInputSchema = z.object({
      id: z.string().uuid().describe("UUID of the document to delete"),
    });
    ```

3.  **Register the Tool:**

    - Use `mcpServer.registerTool()`.

      ```typescript
      // Assuming mcpServer is your McpServer instance
      // Assuming taskManager is your TaskManager instance

      mcpServer.registerTool(
        "delete_document",
        {
          description: "Delete an existing document by its ID.",
          inputSchema: DeleteDocumentInputSchema,
        },
        async (args) => {
          const success = await taskManager.deleteDocument(args.id);
          if (success) {
            return {
              content: [
                { type: "text", text: `Document with ID ${args.id} deleted successfully.` },
              ],
            };
          } else {
            return {
              content: [
                {
                  type: "text",
                  text: `Document with ID ${args.id} not found or could not be deleted.`,
                },
              ],
              isError: true, // Or a specific error structure
            };
          }
        }
      );
      ```

4.  **Handler Logic:**
    - The handler is `async`.
    - It calls `await taskManager.deleteDocument(args.id)`.
    - It returns a `CallToolResult` indicating success or failure (e.g., if the document was not found).

## 6. Acceptance Criteria

- The `delete_document` MCP tool (or equivalent generic tool) is defined and registered.
- The tool's `inputSchema` requires `id` (UUID string).
- The tool handler correctly calls `taskManager.deleteDocument()`.
- The tool returns an appropriate success or failure message/status in the `CallToolResult`.
- The implementation uses Zod for schema definition.
- The code is clean, type-safe, and adheres to project conventions.
- Commit message clearly describes the changes (e.g., `feat(MCP): Implement delete_document tool`).
