# Task 6.10: Refactor `TaskManager.readProject()` and `read_project` Tool

**Parent Epic:** Epic 6: Refactor Existing MCP Tools and TaskManager Methods
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to refactor the `TaskManager.readProject()` method and its corresponding `read_project` MCP tool. The refactored method should retrieve a specific project by its ID (or all projects if no ID is provided) and structure the output according to the `ProjectWithDetails` interface, which includes associated documents and nested epics with their tasks and documents.

**Scope:**

- **`TaskManager.readProject(projectId?: string): Promise<ProjectWithDetails | ProjectWithDetails[] | undefined>`:**
  - Refactor the existing `TaskManager.readProject()` method.
  - If `projectId` is provided, find that specific project.
    - Fetch its directly attached documents.
    - Fetch its epics. For each epic, fetch its tasks and its directly attached documents.
    - Assemble and return a single `ProjectWithDetails` object or `undefined` if not found.
  - If `projectId` is _not_ provided, retrieve all projects.
    - For each project, perform the same aggregation of documents, epics (with their tasks and documents) as above.
    - Return an array of `ProjectWithDetails` objects.
- **`read_project` MCP Tool:**
  - Update the `inputSchema` to accept an optional `project_id` (UUID).
  - The handler calls the refactored `taskManager.readProject()`.
  - Returns the `ProjectWithDetails` object or array of objects in the `CallToolResult` (ideally in `structuredContent` with an appropriate Zod schema).

## 2. Technical Purpose

To provide a comprehensive view of a project, including all its constituent parts (epics, tasks) and associated documentation, aligning with the new `ProjectWithDetails` data structure.

## 3. Contextual Relevance

This is a primary query method for clients wanting a full overview of one or all projects. It's essential for UIs, reporting, and for agents needing complete context before planning or execution.

## 4. Semantic Meaning

This refactoring allows the system to present a holistic view of a "Project" as defined by the new architecture—not just the project entity itself, but its entire hierarchy of work and associated knowledge (documents).

## 5. Detailed Implementation Guidance

### A. Refactor `TaskManager.readProject()` Method

1.  **Current Method (for reference, from `docs/ai-onboarding.xml -> index.ts`):**

    ```typescript
    // async readProject(prdId?: string): Promise<any> {
    //   // ... loads data, if prdId, finds PRD, its epics, and tasks for those epics.
    //   // ... if no prdId, maps over all PRDs to do the same.
    //   // Current return type is PRD & { epics: Array<Epic & { tasks: Task[] }> }
    // }
    ```

    The current method does not include `Document` entities.

2.  **New Method Signature:**
    `async readProject(projectId?: string): Promise<ProjectWithDetails | ProjectWithDetails[] | undefined>`

3.  **Implementation Details:**
    - **Load Data:** `const data = await this.loadData();`
    - **Helper Function for Assembling `ProjectWithDetails`:** It might be useful to create a private helper method, e.g., `_assembleProjectWithDetails(project: Project, allEpics: Epic[], allTasks: Task[], allDocuments: Document[]): ProjectWithDetails`.
      ```typescript
      // private _assembleProjectWithDetails(project: Project, allEpics: Epic[], allTasks: Task[], allDocuments: Document[]): ProjectWithDetails {
      //   const projectDocuments = allDocuments.filter(d => d.entity_id === project.id && d.entity_type === 'project');
      //   const projectEpicsData = allEpics
      //     .filter(e => e.project_id === project.id)
      //     .map(epic => {
      //       const epicDocuments = allDocuments.filter(d => d.entity_id === epic.id && d.entity_type === 'epic');
      //       const epicTasks = allTasks.filter(t => t.epic_id === epic.id).map(task => {
      //          // Optionally, include documents for tasks here too if ProjectWithDetails is extended further
      //          // For now, improvement-02.md shows documents at project and epic level in ProjectWithDetails.
      //          // The diagram ERD shows documents can attach to tasks as well.
      //          // Let's assume for now that tasks within ProjectWithDetails do not list their own docs to match the interface,
      //          // but individual task onboarding would show them.
      //          return task;
      //       });
      //       return { ...epic, tasks: epicTasks, documents: epicDocuments };
      //     });
      //   return { ...project, documents: projectDocuments, epics: projectEpicsData };
      // }
      ```
      - **Note on Task Documents:** The `ProjectWithDetails` interface in `improvement-02.md` shows documents at the Project level and at the Epic level. It does _not_ show documents directly nested under each Task _within_ an Epic in this specific view. If task-specific documents are also desired in this aggregated view, the `ProjectWithDetails` interface and this assembly logic would need to be extended.
    - **If `projectId` is provided:**
      - Find the `project` from `data.projects`.
      - If not found, return `undefined`.
      - Call `_assembleProjectWithDetails` with the found project and all epics, tasks, documents from `data`.
    - **If `projectId` is NOT provided:**
      - Map over `data.projects`.
      - For each `project`, call `_assembleProjectWithDetails`.
      - Return the array of `ProjectWithDetails` objects.

### B. Refactor `read_project` MCP Tool

1.  **Locate Tool Definition:** In `index.ts`.

2.  **Update Input Schema (Zod):**
    The existing tool already has an optional `prd_id`. This will become `project_id`.

    ```typescript
    import { z } from "zod";

    const ReadProjectInputSchema = z.object({
      project_id: z
        .string()
        .uuid()
        .optional()
        .describe("Optional UUID of the project to read. If omitted, returns all projects."),
    });
    ```

3.  **Update Tool Registration:**

    - **Output Schema (`ProjectWithDetailsSchema` / `ProjectWithDetailsArraySchema`):** This is crucial. Define Zod schemas that match the `ProjectWithDetails` interface and an array of it.

      ```typescript
      // Assume DocumentZodSchema, TaskZodSchema, EpicZodSchema, ProjectZodSchema are defined

      // const EpicWithDetailsSchema = EpicZodSchema.extend({
      //   tasks: z.array(TaskZodSchema),
      //   documents: z.array(DocumentZodSchema),
      // });

      // const ProjectWithDetailsZodSchema = ProjectZodSchema.extend({
      //   documents: z.array(DocumentZodSchema),
      //   epics: z.array(EpicWithDetailsSchema),
      // });
      ```

    - Register the tool:
      ```typescript
      // mcpServer.registerTool(
      //   "read_project",
      //   {
      //     description: "Read project hierarchy (Project with nested epics, tasks, and documents). Can specify a project ID or get all projects.",
      //     inputSchema: ReadProjectInputSchema,
      //     // Output schema will be complex, potentially a union if both single and array can be returned,
      //     // or the handler can ensure it always returns an array (even if 0 or 1 element).
      //     // For simplicity, if outputSchema is used, assume it's for ProjectWithDetails and the handler manages array case.
      //     // outputSchema: ProjectWithDetailsZodSchema, // if always single, or use a wrapper for array
      //   },
      //   async (args) => {
      //     const result = await taskManager.readProject(args.project_id);
      //     if (!result) {
      //       return { content: [{ type: "text", text: `Project with ID ${args.project_id} not found.`}], isError: true };
      //     }
      //     return {
      //       structuredContent: result, // This assumes result is single ProjectWithDetails if id provided, or array if not.
      //                               // The outputSchema would need to reflect this, possibly using z.union or z.array.
      //       content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      //     };
      //   }
      // );
      ```

## 6. Acceptance Criteria

- `TaskManager.readProject()` is refactored:
  - If `projectId` is given, it returns a single `ProjectWithDetails` object (or `undefined`) including project-level documents, its epics, each epic including its tasks and epic-level documents.
  - If `projectId` is omitted, it returns an array of `ProjectWithDetails` for all projects.
- The `read_project` MCP tool is updated:
  - Its `inputSchema` takes an optional `project_id`.
  - Its handler calls the refactored `taskManager.readProject()`.
  - It returns the `ProjectWithDetails` data (ideally in `structuredContent` with a Zod schema).
- The structure of the returned data matches the `ProjectWithDetails` interface from `types.ts`.
- The code is clean, type-safe, and efficient in data aggregation.
- Commit message clearly describes the changes (e.g., `refactor: Update readProject to return ProjectWithDetails including documents`).
