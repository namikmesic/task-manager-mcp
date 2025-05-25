# Task 6.5: Refactor `TaskManager.updateEpic()` and its MCP Tool

**Parent Epic:** Epic 6: Refactor Existing MCP Tools and TaskManager Methods
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to refactor the `TaskManager.updateEpic()` method and its corresponding MCP tool (likely `update_epic`) to align with the new `Epic` interface. This involves removing the ability to update `description` and `priority`, and ensuring only fields present in the new `Epic` interface (like `title`, `status`) can be modified.

**Scope:**

- **`TaskManager.updateEpic(id: string, updates: Partial<Omit<Epic, 'id' | 'project_id' | 'index'>>): Promise<Epic | undefined>`:**
  - Refactor the existing `TaskManager.updateEpic()` method.
  - The `updates` should only allow changes to fields like `title` and `status`. The `id`, `project_id`, and `index` fields should be immutable through this method (index is handled by reordering tools).
  - The method should load data, find the epic by `id`, apply valid updates, save data, and return the updated epic or `undefined` if not found.
  - Remove logic for updating `description` or `priority` (and old `created_at`/`updated_at` if they were managed here).
- **`update_epic` MCP Tool:**
  - Update the `inputSchema` to require `id` (epic UUID) and allow optional `title`, `status`.
  - The handler calls the refactored `taskManager.updateEpic()`.
  - Returns the updated `Epic` object or a "not found" message.

## 2. Technical Purpose

To align epic modification functionality with the new, simplified `Epic` data model, ensuring that only relevant attributes are updatable and that linkage fields (`project_id`) and ordering fields (`index`) are managed through dedicated mechanisms.

## 3. Contextual Relevance

This refactoring ensures consistency in how `Epic` entities are managed. As `description` is now handled by `Document` entities and `priority` by `index`, the update logic must reflect these changes.

## 4. Semantic Meaning

This change reinforces the streamlined nature of `Epic` entities in the new architecture. Updating an epic focuses on its name and progress status, with other contextual information and ordering handled separately.

## 5. Detailed Implementation Guidance

### A. Refactor `TaskManager.updateEpic()` Method

1.  **Current Method (for reference, from `docs/ai-onboarding.xml -> index.ts`):**

    ```typescript
    // async updateEpic(id: string, updates: Partial<Omit<Epic, 'id' | 'prd_id' | 'created_at'>>): Promise<Epic> {
    //   // ... finds Epic by id, merges updates ...
    // }
    ```

    The current `updates` allows changing `title`, `description`, `status`, `priority`.

2.  **New Method Signature:**

    ```typescript
    // In TaskManager class
    // async updateEpic(id: string, updates: Partial<Omit<Epic, 'id' | 'project_id' | 'index'>>): Promise<Epic | undefined> {
    ```

    - `Omit` ensures `id`, `project_id` (immutable link), and `index` (managed by reorder tools) are not part of the `updates` type.

3.  **Implementation Details:**
    ```typescript
    // async updateEpic(id: string, updates: Partial<Omit<Epic, 'id' | 'project_id' | 'index'>>): Promise<Epic | undefined> {
    //   const data = await this.loadData();
    //   const epicIndex = data.epics.findIndex(e => e.id === id);
    //   if (epicIndex === -1) {
    //     return undefined;
    //   }
    //
    //   // Ensure only allowed fields (title, status) are updated
    //   const validUpdates: Partial<Epic> = {};
    //   if (updates.title !== undefined) validUpdates.title = updates.title;
    //   if (updates.status !== undefined) validUpdates.status = updates.status;
    //   // Explicitly ignore/do not carry over description, priority, timestamps
    //
    //   data.epics[epicIndex] = { ...data.epics[epicIndex], ...validUpdates };
    //   await this.saveData(data);
    //   return data.epics[epicIndex];
    // }
    ```
    - Only `title` and `status` should be updatable from the `updates` object.
    - Remove any logic related to updating `description` or `priority` or old timestamps.

### B. Refactor `update_epic` MCP Tool

1.  **Locate Tool Definition:** In `index.ts` (or MCP server setup file).

2.  **Update Input Schema (Zod):**
    Based on `improvement-02.md` (Step 5, `update_epic` tool, though it also listed description/priority which are now removed from the core Epic interface for updates via this method).

    ```typescript
    import { z } from "zod";

    const UpdateEpicInputSchema = z
      .object({
        id: z.string().uuid().describe("UUID of the epic to update"),
        title: z.string().min(1).optional().describe("New epic title"),
        status: z.enum(["todo", "in_progress", "done"]).optional().describe("New epic status"),
      })
      .refine((data) => Object.keys(data).length > 1, {
        message: "At least one field to update (title or status) must be provided besides the ID.",
      });
    ```

3.  **Update Tool Registration:**

    ```typescript
    // Assuming mcpServer and taskManager instances
    // Optional: Define EpicZodSchema for typed output

    mcpServer.registerTool(
      "update_epic",
      {
        description: "Update an existing epic's title or status.",
        inputSchema: UpdateEpicInputSchema,
        // outputSchema: EpicZodSchema, // Optional
      },
      async (args) => {
        const { id, ...epicUpdates } = args;
        const updatedEpic = await taskManager.updateEpic(id, epicUpdates);
        if (!updatedEpic) {
          return {
            content: [{ type: "text", text: `Epic with ID ${id} not found.` }],
            isError: true,
          };
        }
        return {
          // structuredContent: updatedEpic, // If using outputSchema
          content: [{ type: "text", text: JSON.stringify(updatedEpic, null, 2) }],
        };
      }
    );
    ```

## 6. Acceptance Criteria

- `TaskManager.updateEpic()` is refactored:
  - The method only accepts updates for `title` and `status` of an `Epic`.
  - It correctly finds, updates, saves, and returns the epic.
  - Logic for updating old Epic fields (description, priority, timestamps) is removed.
- The `update_epic` MCP tool is refactored:
  - Its `inputSchema` reflects the new `Epic` updatable fields (`title`, `status`).
  - Its handler calls the refactored `taskManager.updateEpic()`.
  - It returns the updated `Epic` object or a not-found message.
- The code is clean, type-safe, and adheres to project standards.
- Commit message clearly describes the changes (e.g., `refactor: Align updateEpic method and tool with new Epic model`).
