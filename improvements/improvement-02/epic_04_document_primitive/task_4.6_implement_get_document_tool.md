# Task 4.6: Implement `get_document` (by ID) MCP Tool

**Parent Epic:** Epic 4: Document Primitive Implementation
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to define and implement an MCP tool, `get_document`, that allows clients to retrieve a specific `Document` entity by its ID.

**Scope:**

- Define the `get_document` tool in the MCP server setup.
- The input schema should require the `id` (UUID) of the document to retrieve.
- The tool's handler function will call `this.taskManager.getDocument(args.id)` (from Task 4.1).
- The tool should return the found `Document` object (or a not found message/error) in the `CallToolResult`.

## 2. Technical Purpose

To provide an MCP-compliant interface for clients to fetch the details of a specific document using its unique identifier.

## 3. Contextual Relevance

This tool is essential for allowing clients to view or process individual documents, for instance, after listing documents attached to an entity or when a document ID is referenced elsewhere.

## 4. Semantic Meaning

Enables direct access to specific pieces of documented information, supporting targeted information retrieval and usage by agents or UIs.

## 5. Detailed Implementation Guidance

1.  **Locate MCP Server Setup:** Open `index.ts` (or the file where the `McpServer` instance is created and tools are registered).

2.  **Define Input Schema (Zod):**

    ```typescript
    import { z } from "zod"; // Ensure zod is imported

    const GetDocumentInputSchema = z.object({
      id: z.string().uuid().describe("UUID of the document to retrieve"),
    });
    ```

3.  **Register the Tool:**

    - Use `mcpServer.registerTool()`.

      ```typescript
      // Assuming mcpServer is your McpServer instance
      // Assuming taskManager is your TaskManager instance
      // Optional: Define DocumentSchema if not already done for typed output
      // const DocumentZodSchema = z.object({ /* ... fields of Document interface ... */ });

      mcpServer.registerTool(
        "get_document",
        {
          description: "Retrieve a specific document by its ID.",
          inputSchema: GetDocumentInputSchema,
          // outputSchema: DocumentZodSchema, // Optional: For strictly typed structured output
        },
        async (args) => {
          const document = await taskManager.getDocument(args.id);
          if (document) {
            return {
              // structuredContent: document, // If using outputSchema
              content: [{ type: "text", text: JSON.stringify(document, null, 2) }],
            };
          } else {
            return {
              content: [{ type: "text", text: `Document with ID ${args.id} not found.` }],
              isError: true,
            };
          }
        }
      );
      ```

    - **Output Schema (Optional but Recommended):** As with `create_document`, consider defining a Zod schema for the `Document` interface (`DocumentZodSchema`) and using it in `outputSchema` for `structuredContent`.

4.  **Handler Logic:**
    - The handler is `async`.
    - It calls `await taskManager.getDocument(args.id)`.
    - If the document is found, it returns it (stringified in `content` or as an object in `structuredContent`).
    - If not found, it returns an appropriate message/error in `CallToolResult`.

## 6. Acceptance Criteria

- The `get_document` MCP tool is defined and registered.
- The tool's `inputSchema` requires `id` (UUID string).
- The tool handler correctly calls `taskManager.getDocument()`.
- The tool returns the `Document` object in the `CallToolResult` if found.
- The tool returns an appropriate error or "not found" message if the document ID does not exist.
- The implementation uses Zod for schema definition.
- The code is clean, type-safe, and adheres to project conventions.
- Commit message clearly describes the changes (e.g., `feat(MCP): Implement get_document tool`).
