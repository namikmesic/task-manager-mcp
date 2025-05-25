# Task 6.1: Implement `create_project` MCP Tool and `TaskManager.createProject()`

**Parent Epic:** Epic 6: Refactor Existing MCP Tools and TaskManager Methods
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to implement the new `create_project` MCP tool and its corresponding `TaskManager.createProject()` method. This replaces the old PRD-centric creation flow with a project-centric one.

**Scope:**

- **`TaskManager.createProject(title: string, owner: string): Promise<Project>`:**
  - Implement this new method in `TaskManager`.
  - It should generate a UUID for the new project (Task 2.2).
  - It should assign the next available global index for projects (Task 3.5, using `getNextIndex('project')`).
  - It should create a `Project` object, add it to `ProjectData.projects`, save data, and return the new project.
- **`create_project` MCP Tool:**
  - Define this new tool in the MCP server setup.
  - Input schema (from `improvement-02.md`, Step 5): `title: string`, `owner: string`.
  - Handler calls `taskManager.createProject()`.
  - Returns the created `Project` object in the `CallToolResult`.

## 2. Technical Purpose

To introduce the primary mechanism for creating new `Project` entities, which are the top-level containers in the new architecture. This involves both the internal `TaskManager` logic and the external MCP tool interface.

## 3. Contextual Relevance

This is a fundamental change, as creating a `Project` is the new starting point for managing work, replacing the old `create_prd` flow. All subsequent epics and tasks will belong to a project.

## 4. Semantic Meaning

This task embodies the shift to a project-centric model. The `create_project` tool and method signify that any initiative, regardless of size or formality, starts as a `Project`.

## 5. Detailed Implementation Guidance

### A. `TaskManager.createProject()` Method

1.  **Method Signature:**
    `async createProject(title: string, owner: string): Promise<Project>`

2.  **Implementation:**
    ```typescript
    // In TaskManager class
    // async createProject(title: string, owner: string): Promise<Project> {
    //   const data = await this.loadData();
    //   const newProject: Project = {
    //     id: this._generateUUID(), // From Task 2.1 / 2.2
    //     title,
    //     owner,
    //     index: await this.getNextIndex('project'), // From Task 3.2 / 3.5
    //   };
    //   data.projects.push(newProject);
    //   await this.saveData(data);
    //   return newProject;
    // }
    ```
    - Ensure `_generateUUID()` and `getNextIndex('project')` are correctly called and their results used.
    - The new `Project` object adheres to the `Project` interface (no status, description, timestamps etc., just id, title, owner, index).

### B. `create_project` MCP Tool

1.  **Locate MCP Server Setup:** In `index.ts` (or equivalent).

2.  **Define Input Schema (Zod):**

    ```typescript
    import { z } from "zod"; // Ensure zod is imported

    const CreateProjectInputSchema = z.object({
      title: z.string().min(1).describe("Project title"),
      owner: z.string().min(1).describe("Project owner"),
    });
    ```

3.  **Register the Tool:**

    ```typescript
    // Assuming mcpServer and taskManager instances are available
    // Optional: Define ProjectZodSchema if not already for typed output
    // const ProjectZodSchema = z.object({ /* fields of Project interface */ });

    mcpServer.registerTool(
      "create_project",
      {
        description: "Create a new project with automatic index assignment.",
        inputSchema: CreateProjectInputSchema,
        // outputSchema: ProjectZodSchema, // Optional for typed structured output
      },
      async (args) => {
        const project = await taskManager.createProject(args.title, args.owner);
        return {
          // structuredContent: project, // If using outputSchema
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
        };
      }
    );
    ```

## 6. Acceptance Criteria

- `TaskManager.createProject()` method is implemented correctly.
  - It assigns a UUID to `id`.
  - It assigns the next global project index to `index`.
  - It saves the new project and returns it.
- The `create_project` MCP tool is defined and registered.
  - Its `inputSchema` matches `title: string, owner: string`.
  - Its handler calls `taskManager.createProject()`.
  - It returns the created `Project` object in the `CallToolResult`.
- The old `create_prd` tool and `TaskManager.createPRD()` method are either removed or marked for removal in a subsequent refactoring task if they cannot be directly adapted (the new `Project` has a different structure than old `PRD`).
- The code is clean, type-safe, and adheres to project standards.
- Commit message clearly describes the changes (e.g., `feat: Implement create_project tool and TaskManager.createProject method`).
