# Task 5.8: Implement `analyze_parallelization` MCP Tool

**Parent Epic:** Epic 5: Enhanced Dependency Management and Parallelization Logic
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to define and implement the `analyze_parallelization` MCP tool. This tool will expose the `TaskManager.analyzeParallelization()` functionality (implemented in Task 5.7) to MCP clients, providing them with a structured analysis of task parallelizability.

**Scope:**

- Define the `analyze_parallelization` tool in the MCP server setup (likely in `index.ts`).
- The tool's `inputSchema` should match the structure specified in `improvement-02.md` (Step 5), allowing optional `project_id` and `epic_id` for scoping the analysis.
- Crucially, this tool **must define an `outputSchema`** that corresponds to the `ParallelizationAnalysis` interface (defined in `types.ts` via Epic 1, Task 1.2). The Zod schema for this will need to be created.
- The tool's handler function will call `this.taskManager.analyzeParallelization(args.project_id, args.epic_id)`.
- The tool should return the `ParallelizationAnalysis` object in the `structuredContent` field of the `CallToolResult`.

## 2. Technical Purpose

To provide an MCP-compliant interface for clients to request and receive a detailed analysis of task dependencies, parallel work opportunities, and potential resource conflicts.

## 3. Contextual Relevance

This tool makes the server-side parallelization analysis (Task 5.7) actionable for external agents or UIs. It allows them to understand the current state of a project's workflow and make informed decisions about task execution or planning adjustments.

## 4. Semantic Meaning

Exposing this analysis as an MCP tool with a well-defined output structure empowers clients with deep insights into project dynamics, supporting more intelligent and efficient project management by LLM agents or human users.

## 5. Detailed Implementation Guidance

1.  **Locate MCP Server Setup:** Open `index.ts` (or the file where the `McpServer` instance is created and tools are registered).

2.  **Define Zod Schemas:**

    - **Input Schema (`AnalyzeParallelizationInputSchema`):**

      ```typescript
      import { z } from "zod"; // Ensure zod is imported

      const AnalyzeParallelizationInputSchema = z.object({
        project_id: z
          .string()
          .uuid()
          .optional()
          .describe(
            "Optional: UUID of the project to analyze. If omitted, analyzes tasks across all projects or scoped by epic_id."
          ),
        epic_id: z
          .string()
          .uuid()
          .optional()
          .describe("Optional: UUID of the epic to analyze. Narrows analysis to this epic."),
      });
      ```

    - **Output Schema (`ParallelizationAnalysisSchema`):** This needs to mirror the `ParallelizationAnalysis` interface.

      - First, ensure you have Zod schemas for `Task` (let's call it `TaskZodSchema`). This might have been implicitly created or needs to be defined based on your `Task` interface.

      ```typescript
      // Assuming TaskZodSchema is defined, e.g.:
      // const TaskZodSchema = z.object({
      //   id: z.string().uuid(),
      //   epic_id: z.string().uuid(),
      //   title: z.string(),
      //   status: z.enum(["todo", "in_progress", "done"]),
      //   index: z.number(),
      //   assignee: z.string().optional(),
      //   due_date: z.string().optional(),
      //   dependencies: z.array(z.string().uuid()).optional(),
      // });

      const BlockedTaskDetailSchema = z.object({
        task: TaskZodSchema,
        blocking_dependencies: z.array(z.string().uuid()),
      });

      const ParallelizationAnalysisZodSchema = z.object({
        parallelizable_tasks: z.array(TaskZodSchema),
        blocked_tasks: z.array(BlockedTaskDetailSchema),
        resource_conflicts: z.array(z.string()),
        next_tasks_by_assignee: z.record(z.union([TaskZodSchema, z.null()])),
      });
      ```

3.  **Register the Tool:**

    - Use `mcpServer.registerTool()`.

      ```typescript
      // Assuming mcpServer is your McpServer instance
      // Assuming taskManager is your TaskManager instance

      mcpServer.registerTool(
        "analyze_parallelization",
        {
          description: "Analyze which tasks can be parallelized based on dependency resolution.",
          inputSchema: AnalyzeParallelizationInputSchema,
          outputSchema: ParallelizationAnalysisZodSchema, // Use the Zod schema for typed output
        },
        async (args) => {
          const analysisResult = await taskManager.analyzeParallelization(
            args.project_id,
            args.epic_id
          );
          return {
            structuredContent: analysisResult, // Return the result directly in structuredContent
            // content array can be omitted if structuredContent is a complete representation,
            // or provide a summary if desired.
            // content: [{ type: "text", text: "Parallelization analysis complete." }],
          };
        }
      );
      ```

4.  **Handler Logic:**
    - The handler is `async`.
    - It calls `await taskManager.analyzeParallelization(args.project_id, args.epic_id)`.
    - It returns a `CallToolResult` with the `ParallelizationAnalysis` object directly in the `structuredContent` field. The MCP SDK will automatically create a textual representation in `content` if not provided, or you can provide a custom summary.

## 6. Acceptance Criteria

- The `analyze_parallelization` MCP tool is defined and registered.
- The tool's `inputSchema` correctly allows optional `project_id` and `epic_id`.
- The tool defines an `outputSchema` (using Zod) that accurately matches the `ParallelizationAnalysis` TypeScript interface.
- The tool handler correctly calls `taskManager.analyzeParallelization()` with the parsed arguments.
- The tool returns the `ParallelizationAnalysis` object in the `structuredContent` field of the `CallToolResult`.
- The implementation uses Zod for both input and output schema definitions.
- The code is clean, type-safe, and adheres to project conventions.
- Commit message clearly describes the changes (e.g., `feat(MCP): Implement analyze_parallelization tool with structured output`).
