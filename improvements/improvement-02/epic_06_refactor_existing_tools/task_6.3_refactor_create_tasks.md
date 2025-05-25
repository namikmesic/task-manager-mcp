# Task 6.3: Refactor `TaskManager.createTask(s)` and `create_task(s)` MCP tool(s)

**Parent Epic:** Epic 6: Refactor Existing MCP Tools and TaskManager Methods
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to refactor the `TaskManager.createTasks()` method (and its corresponding MCP tool, likely `create_tasks`) to align with the new `Task` interface. This includes removing `description` and `priority` fields, ensuring `epic_id` and `dependencies` are handled correctly, and assigning an `index`.

**Scope:**

- **`TaskManager.createTasks(tasksData: Array<Omit<Task, 'id' | 'status' | 'index'>>): Promise<Task[]>` (or similar):**
  - Modify this method in `TaskManager`.
  - Input for each task should now include `epic_id` (UUID), `title`, and optionally `assignee`, `due_date`, `dependencies` (array of Task UUIDs).
  - It should generate a UUID for each new task (Task 2.4).
  - It should assign the next available index for tasks within the parent epic (Task 3.5, using `getNextIndex('task', epic_id)`).
  - It should set a default `status` (e.g., `"todo"`).
  - The created `Task` object must not contain `description` or the old `priority` field. `notes` should also be removed as per the new interface.
  - Add new tasks to `ProjectData.tasks`, save data, and return the new tasks.
- **`create_tasks` MCP Tool:**
  - Update the `inputSchema` for this tool to reflect the new parameters for creating a task.
  - The handler should call the refactored `taskManager.createTasks()`.
  - Returns the created `Task` objects.

## 2. Technical Purpose

To align the task creation functionality with the new project-centric data model, ensuring tasks are correctly structured, identified with UUIDs, ordered by index, associated with a parent `Epic`, and can declare dependencies.

## 3. Contextual Relevance

Tasks are the most granular work items. Refactoring their creation is essential for the detailed planning and execution capabilities of the new system.

## 4. Semantic Meaning

This change simplifies task creation by removing legacy fields and fully integrates tasks into the new indexed, dependency-aware hierarchy.

## 5. Detailed Implementation Guidance

### A. Refactor `TaskManager.createTasks()` Method

1.  **Current Method (for reference, from `docs/ai-onboarding.xml -> index.ts`):**

    ```typescript
    // async createTasks(tasks: Array<{
    //   epic_id: string;
    //   title: string;
    //   description: string;
    //   priority: 'low' | 'medium' | 'high';
    //   assignee?: string;
    //   due_date?: string;
    //   dependencies?: string[];
    // }>): Promise<Task[]> {
    //   // ... uses this.generateId('task'), sets status: 'todo', notes: [], created_at, updated_at ...
    // }
    ```

2.  **New Method Signature (Example):**
    Input type should reflect fields needed for the new `Task` interface, excluding auto-generated ones.

    ```typescript
    // In types.ts or locally:
    // export type CreateTaskInput = Omit<Task, 'id' | 'status' | 'index'>;
    // Or more explicitly:
    // export type CreateTaskInput = {
    //   epic_id: string; // UUID of parent epic
    //   title: string;
    //   assignee?: string;
    //   due_date?: string;
    //   dependencies?: string[];
    // };

    // In TaskManager class:
    // async createTasks(tasksData: CreateTaskInput[]): Promise<Task[]> {
    ```

3.  **Implementation Details:**
    ```typescript
    // async createTasks(tasksData: Array<{
    //   epic_id: string;
    //   title: string;
    //   assignee?: string;
    //   due_date?: string;
    //   dependencies?: string[];
    // }>): Promise<Task[]> {
    //   const data = await this.loadData();
    //   const newTasks: Task[] = [];
    //   for (const taskInput of tasksData) {
    //     const task: Task = {
    //       id: this._generateUUID(), // From Task 2.4
    //       epic_id: taskInput.epic_id,
    //       title: taskInput.title,
    //       status: "todo", // Default status
    //       index: await this.getNextIndex('task', taskInput.epic_id), // From Task 3.5
    //       assignee: taskInput.assignee,
    //       due_date: taskInput.due_date,
    //       dependencies: taskInput.dependencies || [],
    //     };
    //     newTasks.push(task);
    //   }
    //   data.tasks.push(...newTasks);
    //   await this.saveData(data);
    //   return newTasks;
    // }
    ```
    - Use `this._generateUUID()` for `id`.
    - Use `await this.getNextIndex('task', taskInput.epic_id)` for `index`.
    - Set `status: "todo"` as default.
    - Handle `dependencies` (default to empty array if not provided, as per Task 5.2).
    - Ensure no `description`, `priority`, `notes`, `created_at`, `updated_at` are set.

### B. Refactor `create_tasks` MCP Tool

1.  **Locate Tool Definition:** In `index.ts` (or MCP server setup file).

2.  **Update Input Schema (Zod):**
    Based on `improvement-02.md` (Step 5, `create_tasks` tool), the schema for each task in the input array:

    ```typescript
    import { z } from "zod";

    const CreateTaskToolInputItemSchema = z.object({
      epic_id: z.string().uuid().describe("UUID of the parent epic"),
      title: z.string().min(1).describe("Task title"),
      assignee: z.string().optional().describe("Optional assignee"),
      due_date: z
        .string()
        .datetime({ message: "Invalid ISO date format for due_date" })
        .optional()
        .describe("Optional due date (ISO format)"),
      dependencies: z
        .array(z.string().uuid())
        .optional()
        .describe("Array of task UUIDs that must complete before this task"),
    });

    const CreateTasksToolInputSchema = z.object({
      tasks: z.array(CreateTaskToolInputItemSchema).min(1).describe("Array of tasks to create"),
    });
    ```

3.  **Update Tool Registration:**

    ```typescript
    // Assuming mcpServer and taskManager instances
    // Optional: Define TaskZodSchema for typed output

    mcpServer.registerTool(
      "create_tasks", // Or adapt if existing tool name is different
      {
        description: "Create one or more tasks within an epic, with broad dependency modeling.",
        inputSchema: CreateTasksToolInputSchema,
        // outputSchema: z.array(TaskZodSchema), // Optional
      },
      async (args) => {
        // The input to taskManager.createTasks expects an array of objects matching its new parameter type
        // args.tasks already matches Array<{ epic_id: string; title: string; ... }>
        const createdTasks = await taskManager.createTasks(args.tasks);
        return {
          // structuredContent: createdTasks, // If using outputSchema
          content: [{ type: "text", text: JSON.stringify(createdTasks, null, 2) }],
        };
      }
    );
    ```

## 6. Acceptance Criteria

- `TaskManager.createTasks()` is refactored:
  - It accepts an array of objects, each matching the new structure for task creation.
  - It correctly assigns a UUID `id`, default `status: "todo"`, and the next `index` (scoped to `epic_id`) to each new task.
  - It correctly stores `dependencies`, `assignee`, and `due_date` if provided.
  - It does not set `description`, `priority`, or `notes` on the `Task` object.
  - It saves and returns the array of new `Task` objects.
- The `create_tasks` MCP tool is updated:
  - Its `inputSchema` reflects the new input structure for tasks.
  - Its handler correctly calls the refactored `taskManager.createTasks()`.
  - It returns the created `Task` objects.
- The code is clean, type-safe, and adheres to project standards.
- Commit message clearly describes the changes (e.g., `refactor(TaskManager): Update task creation for new Task model and tool schema`).
