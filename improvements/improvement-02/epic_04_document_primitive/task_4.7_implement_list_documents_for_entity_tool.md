# Task 4.7: Implement `list_documents_for_entity` MCP Tool

**Parent Epic:** Epic 4: Document Primitive Implementation
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to define and implement an MCP tool, `list_documents_for_entity`, that allows clients to retrieve a list of all `Document` entities attached to a specific parent entity (Project, Epic, or Task).

**Scope:**

- Define the `list_documents_for_entity` tool in the MCP server setup.
- The input schema should require `entity_id` (UUID of the parent entity) and `entity_type` (`"project" | "epic" | "task"`).
- The tool's handler function will call `this.taskManager.getDocumentsByEntity(args.entity_id, args.entity_type)` (from Task 4.2).
- The tool should return an array of found `Document` objects in the `CallToolResult`.

## 2. Technical Purpose

To provide an MCP-compliant interface for clients to discover and access all documents associated with a particular Project, Epic, or Task.

## 3. Contextual Relevance

This tool is essential for providing comprehensive context. For example, when an agent is onboarded to a task, this tool can be used to fetch all relevant specifications, notes, or design documents attached to that task, its parent epic, or the overall project.

## 4. Semantic Meaning

Enables clients to easily view the complete documentary context surrounding any work item, supporting better understanding and more informed actions.

## 5. Detailed Implementation Guidance

1.  **Locate MCP Server Setup:** Open `index.ts` (or the file where the `McpServer` instance is created and tools are registered).

2.  **Define Input Schema (Zod):**

    ```typescript
    import { z } from "zod"; // Ensure zod is imported

    const ListDocumentsForEntityInputSchema = z.object({
      entity_id: z.string().uuid().describe("UUID of the parent entity (Project, Epic, or Task)"),
      entity_type: z.enum(["project", "epic", "task"]).describe("Type of the parent entity"),
    });
    ```

3.  **Register the Tool:**

    - Use `mcpServer.registerTool()`.

      ```typescript
      // Assuming mcpServer is your McpServer instance
      // Assuming taskManager is your TaskManager instance
      // Optional: Define a Zod schema for an array of Documents if using typed output
      // const DocumentArraySchema = z.array(DocumentZodSchema);

      mcpServer.registerTool(
        "list_documents_for_entity",
        {
          description: "List all documents attached to a specific project, epic, or task.",
          inputSchema: ListDocumentsForEntityInputSchema,
          // outputSchema: DocumentArraySchema, // Optional: For strictly typed structured output
        },
        async (args) => {
          const documents = await taskManager.getDocumentsByEntity(
            args.entity_id,
            args.entity_type
          );
          // If using outputSchema, the documents array could be returned in structuredContent
          // structuredContent: { documents_list: documents }, // Or directly documents if schema matches
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(documents, null, 2),
              },
            ],
          };
        }
      );
      ```

    - **Output Schema (Optional):** If returning a typed array of documents in `structuredContent`, an appropriate Zod schema (e.g., `z.array(DocumentZodSchema)`) would be beneficial.

4.  **Handler Logic:**
    - The handler is `async`.
    - It calls `await taskManager.getDocumentsByEntity(args.entity_id, args.entity_type)`.
    - It returns a `CallToolResult` containing the array of `Document` objects (stringified in `content` or as an array in `structuredContent`). If no documents are found, an empty array is returned, which is acceptable.

## 6. Acceptance Criteria

- The `list_documents_for_entity` MCP tool is defined and registered.
- The tool's `inputSchema` requires `entity_id` (UUID string) and `entity_type` (`"project" | "epic" | "task"`).
- The tool handler correctly calls `taskManager.getDocumentsByEntity()`.
- The tool returns an array of `Document` objects in the `CallToolResult`. This array is empty if no documents are attached to the specified entity.
- The implementation uses Zod for schema definition.
- The code is clean, type-safe, and adheres to project conventions.
- Commit message clearly describes the changes (e.g., `feat(MCP): Implement list_documents_for_entity tool`).
