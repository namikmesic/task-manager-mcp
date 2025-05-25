# Task 4.4: Implement `update_document` MCP Tool

**Parent Epic:** Epic 4: Document Primitive Implementation
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to define and implement an MCP tool for updating existing `Document` entities. This could be a specific `update_document` tool or leverage a more generic entity update tool if one is planned for other entity types (e.g., `update_entity`). This task will assume a dedicated `update_document` tool for clarity, as `improvement-02.md` doesn't explicitly show a generic update tool in its tool list for the new architecture, but a generic approach is also acceptable.

**Scope:**

- Define the `update_document` tool in the MCP server setup.
- The input schema should require the `id` (UUID) of the document to update and allow optional fields for `title`, `content`, `type`, and `author`. **Crucially, `entity_id` and `entity_type` should NOT be updatable via this tool** as they define the document's attachment, which should be immutable or handled by a different mechanism (e.g., delete and recreate if attachment needs to change).
- The tool's handler function will call `this.taskManager.updateDocument()` (from Task 4.1).
- The tool should return the updated `Document` object (or a success message) in the `CallToolResult`.

## 2. Technical Purpose

To provide an MCP-compliant interface for clients to modify the content and metadata of existing documents.

## 3. Contextual Relevance

Allows for iterative development of documentation, correction of errors, or updating information as projects evolve. This is a standard part of any content management capability.

## 4. Semantic Meaning

Enables documents to be living entities within the system, reflecting the most current state of information or design, rather than being static, one-time creations.

## 5. Detailed Implementation Guidance

1.  **Locate MCP Server Setup:** Open `index.ts` (or the file where the `McpServer` instance is created and tools are registered).

2.  **Define Input Schema (Zod):**

    - The schema needs the document `id` and optional updatable fields.

      ```typescript
      import { z } from "zod"; // Ensure zod is imported

      const UpdateDocumentInputSchema = z
        .object({
          id: z.string().uuid().describe("UUID of the document to update"),
          title: z.string().min(1).optional().describe("New document title"),
          content: z.string().optional().describe("New document content"),
          type: z.string().min(1).optional().describe("New document type"),
          author: z.string().min(1).optional().describe("New document author"),
        })
        .refine((data) => Object.keys(data).length > 1, {
          // Ensure at least one update field besides id
          message: "At least one field to update must be provided besides the ID.",
        });
      ```

    - The `.refine` ensures that the client provides at least one field to update beyond just the `id`.

3.  **Register the Tool:**

    - Use `mcpServer.registerTool()`.

      ```typescript
      // Assuming mcpServer is your McpServer instance
      // Assuming taskManager is your TaskManager instance

      mcpServer.registerTool(
        "update_document",
        {
          description:
            "Update an existing document. `entity_id` and `entity_type` cannot be changed.",
          inputSchema: UpdateDocumentInputSchema,
          // outputSchema: DocumentSchema, // Optional, for typed structured output
        },
        async (args) => {
          const { id, ...updates } = args;
          const updatedDocument = await taskManager.updateDocument(id, updates);
          if (!updatedDocument) {
            // Consider how to handle not found: error or specific message
            return {
              content: [{ type: "text", text: `Document with ID ${id} not found.` }],
              isError: true, // Or a specific error structure
            };
          }
          return {
            // structuredContent: updatedDocument, // If using outputSchema
            content: [
              {
                type: "text",
                text: JSON.stringify(updatedDocument, null, 2),
              },
            ],
          };
        }
      );
      ```

4.  **Handler Logic:**
    - The handler is `async`.
    - It destructures `id` from `args` and passes the rest (`updates`) to `taskManager.updateDocument(id, updates)`.
    - It should handle the case where `updateDocument` returns `undefined` (document not found), possibly by returning an error or a specific message in the `CallToolResult`.
    - Returns the updated document or a success confirmation.

## 6. Acceptance Criteria

- The `update_document` MCP tool (or equivalent generic tool) is defined and registered.
- The tool's `inputSchema` requires `id` and allows optional `title`, `content`, `type`, `author`.
- The schema prevents or the handler logic disallows updates to `entity_id` and `entity_type`.
- The tool handler correctly calls `taskManager.updateDocument()`.
- The tool returns the updated `Document` object or an appropriate message/error if not found.
- The implementation uses Zod for schema definition.
- The code is clean, type-safe, and adheres to project conventions.
- Commit message clearly describes the changes (e.g., `feat(MCP): Implement update_document tool`).
