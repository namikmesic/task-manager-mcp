# Task 6.4: Refactor `TaskManager.updatePrd()` to `updateProject()` and its MCP Tool

**Parent Epic:** Epic 6: Refactor Existing MCP Tools and TaskManager Methods
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to refactor the existing `TaskManager.updatePRD()` method and its corresponding MCP tool (likely `update_prd`) to become `TaskManager.updateProject()` and an `update_project` tool, aligning with the new `Project` entity and its simpler interface.

**Scope:**

- **`TaskManager.updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'index'>>): Promise<Project | undefined>`:**
  - Rename/refactor `TaskManager.updatePRD()` to `updateProject()`.
  - The `updates` should only allow changes to fields present in the new `Project` interface (e.g., `title`, `owner`). The `index` field is updated via reordering tools (Epic 3), and `id` is immutable.
  - The method should load data, find the project by `id`, apply valid updates, save data, and return the updated project or `undefined` if not found.
  - Remove handling for old PRD-specific fields like `description` or `status` as they are not part of the new `Project` interface.
- **`update_project` MCP Tool:**
  - Rename or replace the existing `update_prd` tool with `update_project`.
  - Update the `inputSchema` to require `id` (project UUID) and allow optional `title`, `owner`.
  - The handler calls the refactored `taskManager.updateProject()`.
  - Returns the updated `Project` object or a "not found" message.

## 2. Technical Purpose

To align the top-level entity update functionality with the new `Project` data model, removing obsolete fields and ensuring only relevant project attributes can be modified.

## 3. Contextual Relevance

This refactoring is essential for maintaining consistency in how the primary organizational unit (now `Project`) is managed and modified through both internal `TaskManager` logic and the external MCP interface.

## 4. Semantic Meaning

This change reinforces the shift from PRDs to Projects as the main high-level entities. Updating a "Project" now means modifying its core attributes like title and owner, with other aspects like documentation or detailed status being handled differently (via Documents or computed from Epics).

## 5. Detailed Implementation Guidance

### A. Refactor `TaskManager.updatePRD()` to `updateProject()`

1.  **Current Method (for reference, from `docs/ai-onboarding.xml -> index.ts`):**

    ```typescript
    // async updatePRD(id: string, updates: Partial<Omit<PRD, 'id' | 'created_at'>>): Promise<PRD> {
    //   // ... finds PRD by id, merges updates, sets updated_at ...
    // }
    ```

    The current `updates` allows changing `title`, `description`, `status`, `owner`.

2.  **New Method Signature:**

    ```typescript
    // In TaskManager class
    // async updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'index'>>): Promise<Project | undefined> {
    ```

    - The `updates` type uses `Omit<Project, 'id' | 'index'>` because `id` is immutable and `index` is handled by reordering logic.

3.  **Implementation Details:**

    ```typescript
    // async updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'index'>>): Promise<Project | undefined> {
    //   const data = await this.loadData();
    //   const projectIndex = data.projects.findIndex(p => p.id === id);
    //   if (projectIndex === -1) {
    //     return undefined;
    //   }
    //   // Ensure only allowed fields are updated (title, owner)
    //   const validUpdates: Partial<Project> = {};
    //   if (updates.title !== undefined) validUpdates.title = updates.title;
    //   if (updates.owner !== undefined) validUpdates.owner = updates.owner;
    //   // Explicitly ignore/do not carry over description, status, timestamps from old PRD logic

    //   data.projects[projectIndex] = { ...data.projects[projectIndex], ...validUpdates };
    //   await this.saveData(data);
    //   return data.projects[projectIndex];
    // }
    ```

    - Load `data.projects`.
    - Find the project by `id`.
    - Apply only `title` and `owner` from the `updates` object. Fields like `description`, `status`, `created_at`, `updated_at` from the old `PRD` are no longer part of the `Project` interface and their update logic should be removed.

### B. Refactor `update_prd` MCP Tool to `update_project`

1.  **Locate Tool Definition:** In `index.ts` (or MCP server setup file).

2.  **Update/Replace Tool Name and Input Schema (Zod):**
    The `improvement-02.md` (Step 5) does not list an `update_project` tool explicitly, but it's a natural counterpart to `create_project` and a refactor of the existing `update_prd`.

    ```typescript
    import { z } from "zod";

    const UpdateProjectInputSchema = z
      .object({
        id: z.string().uuid().describe("UUID of the project to update"),
        title: z.string().min(1).optional().describe("New project title"),
        owner: z.string().min(1).optional().describe("New project owner"),
      })
      .refine((data) => Object.keys(data).length > 1, {
        message: "At least one field to update (title or owner) must be provided besides the ID.",
      });
    ```

3.  **Update/Replace Tool Registration:**

    ```typescript
    // Assuming mcpServer and taskManager instances
    // Optional: Define ProjectZodSchema for typed output

    mcpServer.registerTool(
      "update_project", // New or renamed tool
      {
        description: "Update an existing project's title or owner.",
        inputSchema: UpdateProjectInputSchema,
        // outputSchema: ProjectZodSchema, // Optional
      },
      async (args) => {
        const { id, ...projectUpdates } = args;
        const updatedProject = await taskManager.updateProject(id, projectUpdates);
        if (!updatedProject) {
          return {
            content: [{ type: "text", text: `Project with ID ${id} not found.` }],
            isError: true,
          };
        }
        return {
          // structuredContent: updatedProject, // If using outputSchema
          content: [{ type: "text", text: JSON.stringify(updatedProject, null, 2) }],
        };
      }
    );
    // Ensure the old 'update_prd' tool is removed or its registration is updated.
    ```

## 6. Acceptance Criteria

- `TaskManager.updatePRD()` is refactored into `TaskManager.updateProject()`.
  - The method only accepts updates for `title` and `owner` of a `Project`.
  - It correctly finds, updates, saves, and returns the project.
  - Logic for updating old PRD fields (description, status, timestamps) is removed.
- The `update_prd` MCP tool is refactored/renamed to `update_project`.
  - Its `inputSchema` matches the new `Project` updatable fields.
  - Its handler calls the refactored `taskManager.updateProject()`.
  - It returns the updated `Project` object or a not-found message.
- The code is clean, type-safe, and adheres to project standards.
- Commit message clearly describes the changes (e.g., `refactor: Update PRD modification to project-centric updateProject tool and method`).
