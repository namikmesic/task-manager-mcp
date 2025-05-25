# Task 4.3: Implement `create_document` MCP Tool

**Parent Epic:** Epic 4: Document Primitive Implementation
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to define and implement the `create_document` MCP tool. This tool will expose the `TaskManager.createDocument()` functionality (implemented in Task 4.1) to MCP clients, allowing them to create new documents and attach them to a Project, Epic, or Task.

**Scope:**

- Define the `create_document` tool in the MCP server setup (likely in `index.ts`).
- The tool's `inputSchema` must match the structure specified in `improvement-02.md` (Step 5), which includes `title`, `content`, `type` (document type string), `entity_type` (`"project" | "epic" | "task"`), `entity_id` (UUID of the parent), and `author`.
- The tool's handler function will call `this.taskManager.createDocument()` with the provided arguments.
- The tool should return the newly created `Document` object, serialized as JSON, in the `content` (or `structuredContent`) of the `CallToolResult`.

## 2. Technical Purpose

To provide an MCP-compliant interface for clients (including LLM agents) to programmatically create and attach documents to various entities within the project management system.

## 3. Contextual Relevance

This tool is the primary way clients will add new documentary information (specs, notes, designs, reports) to the system. It's essential for making the `Document` primitive usable and for enriching project context.

## 4. Semantic Meaning

Exposing `create_document` as an MCP tool directly enables the flexible, universal documentation strategy envisioned by the new architecture. It allows information to be captured and associated where it's most relevant.

## 5. Detailed Implementation Guidance

1.  **Locate MCP Server Setup:** Open `index.ts` (or the file where the `McpServer` instance is created and tools are registered).

2.  **Define Input Schema (Zod):**

    - Based on `improvement-02.md` (Step 5, `create_document` tool definition), the input schema using Zod:

      ```typescript
      import { z } from "zod"; // Ensure zod is imported

      const CreateDocumentInputSchema = z.object({
        title: z.string().min(1).describe("Document title"),
        content: z.string().describe("Document content (markdown, code, JSON, etc.)"),
        type: z
          .string()
          .min(1)
          .describe(
            "Flexible document type (e.g., 'prd', 'spec', 'design', 'implementation_notes')"
          ),
        entity_type: z.enum(["project", "epic", "task"]).describe("Type of entity to attach to"),
        entity_id: z.string().uuid().describe("UUID of the entity to attach the document to"),
        author: z.string().min(1).describe("Document author"),
      });
      ```

3.  **Register the Tool:**

    - Use `mcpServer.registerTool()`.

      ```typescript
      // Assuming mcpServer is your McpServer instance
      // Assuming taskManager is your TaskManager instance, accessible in this scope

      mcpServer.registerTool(
        "create_document",
        {
          description: "Create a document and attach it to a project, epic, or task.",
          inputSchema: CreateDocumentInputSchema,
          // Consider adding an outputSchema if you want to strictly define the Document structure returned
          // outputSchema: DocumentSchema, // (Requires DocumentSchema to be defined if used)
        },
        async (args) => {
          const newDocument = await taskManager.createDocument(args);
          return {
            // If outputSchema for Document is defined, use structuredContent:
            // structuredContent: newDocument,
            content: [
              {
                type: "text",
                text: JSON.stringify(newDocument, null, 2),
              },
            ],
          };
        }
      );
      ```

    - **Output Schema (Optional but Recommended):** While `improvement-02.md` doesn't explicitly show an `outputSchema` for `create_document`, it's good practice to define one using Zod based on the `Document` interface if you want clients to receive strongly-typed structured output. If so, the result should be placed in `structuredContent`.

4.  **Handler Logic:**
    - The handler is `async`.
    - It calls `await taskManager.createDocument(args)`, passing the validated arguments directly (as `CreateDocumentInputSchema` matches `Omit<Document, 'id'>`).
    - It returns a `CallToolResult`. The created `Document` object should be stringified and put in `content[0].text`, or returned directly in `structuredContent` if an `outputSchema` is used.

## 6. Acceptance Criteria

- The `create_document` MCP tool is defined and registered with the `McpServer` instance.
- The tool's `inputSchema` correctly reflects the structure from `improvement-02.md`.
- The tool handler correctly calls `taskManager.createDocument()` with the parsed arguments.
- The tool returns a `CallToolResult` containing the newly created `Document` object (either as stringified JSON in `content` or as an object in `structuredContent` if `outputSchema` is used).
- The implementation uses Zod for schema definition.
- The code is clean, type-safe, and adheres to project conventions.
- Commit message clearly describes the changes (e.g., `feat(MCP): Implement create_document tool`).
