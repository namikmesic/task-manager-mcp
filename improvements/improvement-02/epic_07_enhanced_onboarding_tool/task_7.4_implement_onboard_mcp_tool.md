# Task 7.4: Implement `onboard` MCP Tool

**Parent Epic:** Epic 7: Enhanced Onboarding MCP Tool
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to define and implement the `onboard` MCP tool. This tool will expose the `TaskManager.onboard()` functionality (Task 7.3) to MCP clients, providing them with comprehensive contextual information for a specified entity.

**Scope:**

- Define the `onboard` tool in the MCP server setup (likely in `index.ts`).
- The tool's `inputSchema` must match the `OnboardParams` interface (defined in Task 7.1 and specified in `improvement-02.md`, Step 5).
- An `outputSchema` corresponding to the `OnboardResponse` interface should be defined using Zod for strongly-typed structured output.
- The tool's handler function will call `this.taskManager.onboard(args)`.
- The tool should return the `OnboardResponse` object in the `structuredContent` field of the `CallToolResult`.

## 2. Technical Purpose

To provide an MCP-compliant interface for clients (especially LLM agents) to retrieve detailed contextual information about a Project, Epic, or Task, including its documents, hierarchical relationships, and parallelization analysis if requested.

## 3. Contextual Relevance

This tool is central to the "Task-centric onboarding" principle. It allows an agent to get all necessary information to understand and start working on an entity with a single call.

## 4. Semantic Meaning

Exposing `onboard` as an MCP tool with a rich, structured response empowers agents to efficiently gather context, reducing the need for multiple queries and enabling more informed decision-making and action.

## 5. Detailed Implementation Guidance

1.  **Locate MCP Server Setup:** In `index.ts` (or the file where `McpServer` is instantiated).

2.  **Define Zod Schemas:**

    - **Input Schema (`OnboardParamsZodSchema`):** Based on `OnboardParams` interface and `improvement-02.md` (Step 5).

      ```typescript
      import { z } from "zod"; // Ensure zod is imported

      const OnboardParamsZodSchema = z.object({
        entity_type: z.enum(["project", "epic", "task"]).describe("Type of entity to onboard to"),
        entity_id: z.string().uuid().describe("UUID of the entity to onboard to"),
        include_context: z
          .boolean()
          .optional()
          .default(true)
          .describe("Include parent/sibling/children context"),
        include_parallelization: z
          .boolean()
          .optional()
          .default(false)
          .describe("Include parallelization analysis"),
      });
      ```

    - **Output Schema (`OnboardResponseZodSchema`):** This needs to mirror the `OnboardResponse` interface. This will be complex and require pre-defined Zod schemas for `Project`, `Epic`, `Task`, `Document`, and `ParallelizationAnalysis`.

      ```typescript
      // Assuming ProjectZodSchema, EpicZodSchema, TaskZodSchema, DocumentZodSchema,
      // and ParallelizationAnalysisZodSchema are already defined.

      const OnboardContextZodSchema = z.object({
        parent: z.union([ProjectZodSchema, EpicZodSchema]).optional(),
        siblings: z.array(z.union([EpicZodSchema, TaskZodSchema])).optional(),
        children: z.array(z.union([EpicZodSchema, TaskZodSchema])).optional(),
      });

      const OnboardResponseZodSchema = z.object({
        entity: z.union([ProjectZodSchema, EpicZodSchema, TaskZodSchema]),
        documents: z.array(DocumentZodSchema),
        context: OnboardContextZodSchema.optional(),
        parallelization: ParallelizationAnalysisZodSchema.optional(),
      });
      ```

3.  **Register the Tool:**

    - Use `mcpServer.registerTool()`.

      ```typescript
      // Assuming mcpServer and taskManager instances

      mcpServer.registerTool(
        "onboard",
        {
          description:
            "Get comprehensive context for an entity, including documents, hierarchy, and parallelization analysis.",
          inputSchema: OnboardParamsZodSchema,
          outputSchema: OnboardResponseZodSchema, // Crucial for typed structured output
        },
        async (args) => {
          // The args directly match the OnboardParams type expected by taskManager.onboard
          const onboardData = await taskManager.onboard(args);
          return {
            structuredContent: onboardData, // Return the full OnboardResponse object
            // Optional: A summary text in content if desired
            // content: [{ type: "text", text: `Onboarding context for ${args.entity_type} ${args.entity_id} retrieved.` }],
          };
        }
      );
      ```

4.  **Handler Logic:**
    - The handler is `async`.
    - It calls `await taskManager.onboard(args)` directly, as the Zod input schema should match the `OnboardParams` type.
    - It returns a `CallToolResult` with the complete `OnboardResponse` object in the `structuredContent` field.

## 6. Acceptance Criteria

- The `onboard` MCP tool is defined and registered with the `McpServer` instance.
- The tool's `inputSchema` correctly matches the `OnboardParams` interface, including `entity_type`, `entity_id`, and optional booleans for `include_context` and `include_parallelization`.
- The tool defines an `outputSchema` (using Zod) that accurately matches the `OnboardResponse` TypeScript interface.
- The tool handler correctly calls `taskManager.onboard()` with the parsed arguments.
- The tool returns the full `OnboardResponse` object in the `structuredContent` field of the `CallToolResult`.
- The implementation uses Zod for both input and output schema definitions.
- The code is clean, type-safe, and adheres to project conventions.
- Commit message clearly describes the changes (e.g., `feat(MCP): Implement enhanced onboard tool with structured I/O`).
