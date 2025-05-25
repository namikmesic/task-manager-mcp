# Task 6.11: Refactor `TaskManager.searchItems()` and `search_items` Tool

**Parent Epic:** Epic 6: Refactor Existing MCP Tools and TaskManager Methods
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to refactor the `TaskManager.searchItems()` method and its corresponding `search_items` MCP tool to work with the new entity types (`Project`, `Document` in addition to `Epic`, `Task`) and their refactored fields. The search should no longer look at `description` fields in Epics/Tasks (as these are removed) but could potentially search `Document` content if desired (though this might be a more advanced feature).

**Scope:**

- **`TaskManager.searchItems(query: string, itemType?: 'project' | 'epic' | 'task' | 'document'): Promise<any>` (Return type to be refined, e.g., `Promise<{[key: string]: (Project | Epic | Task | Document)[]}>`):**
  - Refactor the existing `TaskManager.searchItems()` method.
  - Update the optional `itemType` parameter to include `'project'` and `'document'`.
  - Modify search logic:
    - For `Project`: Search `title`, `owner`.
    - For `Epic`: Search `title`. Remove search on `description`.
    - For `Task`: Search `title`, `assignee`. Remove search on `description` and `notes`.
    - For `Document` (new): Search `title`, `content`, `type`, `author`.
  - The method should return a structure containing arrays of matching entities, keyed by their type.
- **`search_items` MCP Tool:**
  - Update the `inputSchema` for the `item_type` parameter to include `project` and `document` as enum values.
  - The handler calls the refactored `taskManager.searchItems()`.
  - Returns the search results.

## 2. Technical Purpose

To provide a flexible search capability across the new set of core entities and their relevant fields, allowing users and agents to find specific items based on keywords.

## 3. Contextual Relevance

Search is a fundamental feature for navigating and finding information within the project management system. Updating it to support the new entities and their fields is crucial for usability.

## 4. Semantic Meaning

This refactoring aligns the system's search capabilities with the new data model, ensuring that users can effectively query the project-centric structure and its associated documents.

## 5. Detailed Implementation Guidance

### A. Refactor `TaskManager.searchItems()` Method

1.  **Current Method (for reference, from `docs/ai-onboarding.xml -> index.ts`):**

    ```typescript
    // async searchItems(query: string, itemType?: 'prd' | 'epic' | 'task'): Promise<any> {
    //   const data = await this.loadData();
    //   const lowerQuery = query.toLowerCase();
    //   const results: any = {};
    //   if (!itemType || itemType === 'prd') { /* searches prd.title, prd.description, prd.owner */ }
    //   if (!itemType || itemType === 'epic') { /* searches epic.title, epic.description */ }
    //   if (!itemType || itemType === 'task') { /* searches task.title, task.description, task.assignee, task.notes */ }
    //   return results;
    // }
    ```

2.  **New Method Signature & Return Type:**
    A more typed return value would be beneficial.

    ```typescript
    // export interface SearchResults {
    //   projects?: Project[];
    //   epics?: Epic[];
    //   tasks?: Task[];
    //   documents?: Document[];
    // }
    // async searchItems(query: string, itemType?: "project" | "epic" | "task" | "document"): Promise<SearchResults> {
    ```

3.  **Implementation Details:**
    - Load data: `const data = await this.loadData();`
    - Convert `query` to lowercase: `const lowerQuery = query.toLowerCase();`
    - Initialize `results: SearchResults = {};`
    - **Project Search:** If `!itemType || itemType === 'project'`:
      - Filter `data.projects` where `p.title` or `p.owner` (lowercase) includes `lowerQuery`.
      - Store in `results.projects`.
    - **Epic Search:** If `!itemType || itemType === 'epic'`:
      - Filter `data.epics` where `e.title` (lowercase) includes `lowerQuery`.
      - (Remove search on `e.description`).
      - Store in `results.epics`.
    - **Task Search:** If `!itemType || itemType === 'task'`:
      - Filter `data.tasks` where `t.title` or `t.assignee` (if present, lowercase) includes `lowerQuery`.
      - (Remove search on `t.description` and `t.notes`).
      - Store in `results.tasks`.
    - **Document Search:** If `!itemType || itemType === 'document'`:
      - Filter `data.documents` where `d.title`, `d.content`, `d.type`, or `d.author` (all lowercase) includes `lowerQuery`.
      - Store in `results.documents`.
    - Return `results`.

### B. Refactor `search_items` MCP Tool

1.  **Locate Tool Definition:** In `index.ts`.

2.  **Update Input Schema (Zod):**

    ```typescript
    import { z } from "zod";

    const SearchItemsInputSchema = z.object({
      query: z.string().min(1).describe("Search query string"),
      item_type: z
        .enum(["project", "epic", "task", "document"])
        .optional()
        .describe("Optional: Filter results by item type (project, epic, task, document)"),
    });
    ```

3.  **Update Tool Registration:**
    - **Output Schema:** Define a Zod schema for `SearchResults` if returning structured output.
      ```typescript
      // const SearchResultsZodSchema = z.object({
      //   projects: z.array(ProjectZodSchema).optional(),
      //   epics: z.array(EpicZodSchema).optional(),
      //   tasks: z.array(TaskZodSchema).optional(),
      //   documents: z.array(DocumentZodSchema).optional(),
      // });
      ```
    - Register/Update the tool:
      ```typescript
      // mcpServer.registerTool(
      //   "search_items",
      //   {
      //     description: "Search across projects, epics, tasks, and documents.",
      //     inputSchema: SearchItemsInputSchema,
      //     // outputSchema: SearchResultsZodSchema, // Optional
      //   },
      //   async (args) => {
      //     const searchResults = await taskManager.searchItems(args.query, args.item_type);
      //     return {
      //       // structuredContent: searchResults, // If using outputSchema
      //       content: [
      //         { type: "text", text: JSON.stringify(searchResults, null, 2) },
      //       ],
      //     };
      //   }
      // );
      ```

## 6. Acceptance Criteria

- `TaskManager.searchItems()` is refactored:
  - The `itemType` parameter now accepts `"project"` and `"document"`.
  - Search logic for `Project` targets `title`, `owner`.
  - Search logic for `Epic` targets `title` (removes `description`).
  - Search logic for `Task` targets `title`, `assignee` (removes `description`, `notes`).
  - New search logic for `Document` targets `title`, `content`, `type`, `author`.
  - Returns a structured object with arrays of matching entities.
- The `search_items` MCP tool is updated:
  - Its `inputSchema` for `item_type` includes `project` and `document`.
  - Its handler calls the refactored `taskManager.searchItems()`.
  - It returns the search results appropriately.
- The code is clean, type-safe, and efficient.
- Commit message describes the changes (e.g., `refactor: Update searchItems for new entities and fields`).
