# Task 6.2: Refactor `TaskManager.createEpic(s)` and `create_epic(s)` MCP tool(s)

**Parent Epic:** Epic 6: Refactor Existing MCP Tools and TaskManager Methods
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to refactor the `TaskManager.createEpics()` method (and its corresponding MCP tool, likely `create_epics`) to align with the new `Epic` interface. This includes using `project_id` instead of `prd_id`, removing `description` and `priority` fields from the input and entity, and assigning an `index`.

**Scope:**

- **`TaskManager.createEpics(epicsData: Array<Omit<Epic, 'id' | 'status' | 'index'>>): Promise<Epic[]>` (or similar):**
  - Modify this method in `TaskManager`.
  - Input for each epic should now be `project_id` (UUID), `title`.
  - It should generate a UUID for each new epic (Task 2.3).
  - It should assign the next available index for epics within the parent project (Task 3.5, using `getNextIndex('epic', project_id)`).
  - It should set a default `status` (e.g., `"todo"`).
  - The created `Epic` object must not contain `description` or the old `priority` field.
  - Add new epics to `ProjectData.epics`, save data, and return the new epics.
- **`create_epics` MCP Tool:**
  - Update the `inputSchema` for this tool to reflect the new parameters for creating an epic (primarily `project_id`, `title`).
  - The handler should call the refactored `taskManager.createEpics()`.
  - Returns the created `Epic` objects.

## 2. Technical Purpose

To align the epic creation functionality with the new project-centric data model, ensuring that epics are correctly structured, identified with UUIDs, ordered by index, and associated with a parent `Project`.

## 3. Contextual Relevance

Epics are major workstreams within projects. Refactoring their creation logic is essential for building out the new project hierarchy correctly.

## 4. Semantic Meaning

This change simplifies epic creation by removing redundant fields (description, priority) and ties epics directly to projects through `project_id`, reinforcing the new data relationships and ordering principles.

## 5. Detailed Implementation Guidance

### A. Refactor `TaskManager.createEpics()` Method

1.  **Current Method (for reference, from `docs/ai-onboarding.xml -> index.ts`):**

    ```typescript
    // async createEpics(epics: Array<{
    //   prd_id: string;
    //   title: string;
    //   description: string;
    //   priority: 'low' | 'medium' | 'high';
    // }>): Promise<Epic[]> {
    //   // ... uses this.generateId('epic'), sets status: 'not_started', created_at ...
    // }
    ```

2.  **New Method Signature (Example):**
    The input type should reflect the fields needed to create an Epic according to the new interface, excluding auto-generated ones like `id`, `status`, `index`.

    ```typescript
    // In types.ts or locally:
    // export type CreateEpicInput = Omit<Epic, 'id' | 'status' | 'index'>;
    // Or more explicitly:
    // export type CreateEpicInput = {
    //   project_id: string; // UUID of parent project
    //   title: string;
    // };

    // In TaskManager class:
    // async createEpics(epicsData: CreateEpicInput[]): Promise<Epic[]> {
    ```

3.  **Implementation Details:**
    ```typescript
    // async createEpics(epicsData: Array<{ project_id: string; title: string }>): Promise<Epic[]> {
    //   const data = await this.loadData();
    //   const newEpics: Epic[] = [];
    //   for (const epicInput of epicsData) {
    //     const epic: Epic = {
    //       id: this._generateUUID(), // From Task 2.3
    //       project_id: epicInput.project_id,
    //       title: epicInput.title,
    //       status: "todo", // Default status
    //       index: await this.getNextIndex('epic', epicInput.project_id), // From Task 3.5
    //     };
    //     newEpics.push(epic);
    //   }
    //   data.epics.push(...newEpics);
    //   await this.saveData(data);
    //   return newEpics;
    // }
    ```
    - Use `this._generateUUID()` for `id`.
    - Use `await this.getNextIndex('epic', epicInput.project_id)` for `index`.
    - Set `status: "todo"` as default.
    - Ensure no `description`, `priority`, or old timestamp fields (`created_at`) are set on the new `Epic` object.

### B. Refactor `create_epics` MCP Tool

1.  **Locate Tool Definition:** In `index.ts` (or equivalent MCP server setup file).

2.  **Update Input Schema (Zod):**
    The schema in `improvement-02.md` for `create_epics` (within the `createEpics` example for a complex project) implies an array of epics, each with `project_id` and `title` (and `status`, but `status` should be default `todo` on creation, `index` is auto-assigned).

    ```typescript
    import { z } from "zod";

    const CreateEpicToolInputItemSchema = z.object({
      project_id: z.string().uuid().describe("UUID of the parent project"),
      title: z.string().min(1).describe("Epic title"),
      // status and index are set by the server, not client on creation
    });

    const CreateEpicsToolInputSchema = z.object({
      epics: z.array(CreateEpicToolInputItemSchema).min(1).describe("Array of epics to create"),
    });
    ```

3.  **Update Tool Registration:**

    ```typescript
    // Assuming mcpServer and taskManager instances
    // Optional: Define EpicZodSchema for typed output

    mcpServer.registerTool(
      "create_epics", // Or adapt if existing tool name is different
      {
        description: "Create one or more epics within a project.",
        inputSchema: CreateEpicsToolInputSchema,
        // outputSchema: z.array(EpicZodSchema), // Optional
      },
      async (args) => {
        // The input to taskManager.createEpics needs to match its new signature
        // The args here are from CreateEpicsToolInputSchema, which is { epics: [...] }
        // The taskManager.createEpics expects Array<{ project_id: string; title: string }>
        const epicsToCreate = args.epics.map((e) => ({
          project_id: e.project_id,
          title: e.title,
        }));
        const createdEpics = await taskManager.createEpics(epicsToCreate);
        return {
          // structuredContent: createdEpics, // If using outputSchema
          content: [{ type: "text", text: JSON.stringify(createdEpics, null, 2) }],
        };
      }
    );
    ```

## 6. Acceptance Criteria

- `TaskManager.createEpics()` is refactored:
  - It accepts an array of objects, each specifying `project_id` and `title`.
  - It correctly assigns a UUID `id`, default `status: "todo"`, and the next `index` (scoped to `project_id`) to each new epic.
  - It does not set `description` or `priority` on the `Epic` object.
  - It saves and returns the array of new `Epic` objects.
- The `create_epics` MCP tool is updated:
  - Its `inputSchema` reflects the new input structure for epics.
  - Its handler correctly calls the refactored `taskManager.createEpics()`.
  - It returns the created `Epic` objects.
- The code is clean, type-safe, and adheres to project standards.
- Commit message clearly describes the changes (e.g., `refactor(TaskManager): Update epic creation for new Epic model and tool schema`).
