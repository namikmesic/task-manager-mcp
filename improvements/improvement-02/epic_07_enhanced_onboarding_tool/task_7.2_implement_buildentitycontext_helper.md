# Task 7.2: Implement `TaskManager.buildEntityContext()` Helper Method

**Parent Epic:** Epic 7: Enhanced Onboarding MCP Tool
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to implement a private helper method `TaskManager.buildEntityContext(entity_type, entity_id, data)` as outlined conceptually in `improvement-02.md` (Step 4, under `onboard` implementation). This method will construct the `context` object for the `OnboardResponse`, containing the parent, siblings, and children of the specified entity.

**Scope:**

- Implement `private async buildEntityContext(entity_type: "project" | "epic" | "task", entity_id: string, data: ProjectData): Promise<OnboardResponse['context']>` within `TaskManager`.
- The method takes the `entity_type`, `entity_id` (UUID of the primary entity), and the full `ProjectData` object.
- Based on `entity_type`:
  - **For a Project:** No parent, no siblings. Children are its top-level Epics.
  - **For an Epic:** Parent is its Project. Siblings are other Epics under the same Project. Children are its Tasks.
  - **For a Task:** Parent is its Epic. Siblings are other Tasks under the same Epic. No children in this model.
- Return the constructed `context` object, which might be `undefined` or have undefined fields if not applicable (e.g., a Project has no parent).

## 2. Technical Purpose

To encapsulate the logic for gathering hierarchical contextual information (parent, siblings, children) for any given entity (Project, Epic, or Task).

## 3. Contextual Relevance

This helper method is directly used by the main `TaskManager.onboard()` method (Task 7.3) when the `include_context` parameter is true. It provides the necessary data to populate the `context` field of the `OnboardResponse`.

## 4. Semantic Meaning

This function enables the onboarding process to provide agents with a clear understanding of where an entity sits within the broader project structure, aiding in navigation and comprehension of its relationships.

## 5. Detailed Implementation Guidance

1.  **Prerequisites:**

    - `Project`, `Epic`, `Task` interfaces defined in `types.ts`.
    - `OnboardResponse['context']` type structure available from `OnboardResponse` interface (Task 7.1).

2.  **Method Signature:**

    ```typescript
    // In TaskManager class
    // private async buildEntityContext(
    //   entity_type: "project" | "epic" | "task",
    //   entity_id: string,
    //   data: ProjectData // Pass loaded data to avoid reloading
    // ): Promise<OnboardResponse['context']> {
    ```

3.  **Implementation Logic (using a `switch` statement for `entity_type`):**

    ```typescript
    // Conceptual structure:
    // const context: OnboardResponse['context'] = {};
    //
    // switch (entity_type) {
    //   case "project":
    //     const project = data.projects.find(p => p.id === entity_id);
    //     if (project) {
    //       context.children = data.epics.filter(e => e.project_id === project.id);
    //       // Projects have no parent or siblings in this model
    //     }
    //     break;
    //
    //   case "epic":
    //     const epic = data.epics.find(e => e.id === entity_id);
    //     if (epic) {
    //       context.parent = data.projects.find(p => p.id === epic.project_id);
    //       context.siblings = data.epics.filter(e => e.project_id === epic.project_id && e.id !== epic.id);
    //       context.children = data.tasks.filter(t => t.epic_id === epic.id);
    //     }
    //     break;
    //
    //   case "task":
    //     const task = data.tasks.find(t => t.id === entity_id);
    //     if (task) {
    //       context.parent = data.epics.find(e => e.id === task.epic_id);
    //       if (context.parent) { // Parent (Epic) must exist to find siblings
    //         context.siblings = data.tasks.filter(t => t.epic_id === (context.parent as Epic).id && t.id !== task.id);
    //       }
    //       // Tasks have no children in this model
    //     }
    //     break;
    // }
    // return context;
    ```

4.  **Details & Edge Cases:**
    - **Finding Entities:** Use `Array.find()` to locate the primary entity and potential parent entities by their IDs.
    - **Filtering for Children/Siblings:** Use `Array.filter()` based on `project_id` or `epic_id`.
      - For siblings, ensure to exclude the entity itself (e.g., `e.id !== epic.id`).
    - **Handling Not Found:** If the primary `entity_id` doesn't correspond to an existing entity, the method might return an empty context or `undefined`. The calling `onboard` method should handle cases where the primary entity itself is not found.
    - **Parent/Siblings/Children can be undefined:** The `OnboardResponse['context']` type allows for fields like `parent`, `siblings`, or `children` to be `undefined` if not applicable (e.g., a Project has no parent). Ensure the logic correctly results in `undefined` for these cases rather than, for example, an empty array where `undefined` is more appropriate (e.g., for `parent`). An empty array is fine for `siblings` or `children` if none exist.

## 6. Acceptance Criteria

- The `TaskManager.buildEntityContext(...)` method is implemented correctly as a private async method.
- Given a `project` entity:
  - `context.parent` is `undefined`.
  - `context.siblings` is `undefined` or an empty array.
  - `context.children` contains all epics directly under that project.
- Given an `epic` entity:
  - `context.parent` is the correct `Project` object.
  - `context.siblings` contains other epics under the same project (excluding the epic itself).
  - `context.children` contains all tasks directly under that epic.
- Given a `task` entity:
  - `context.parent` is the correct `Epic` object.
    // - `context.siblings` contains other tasks under the same epic (excluding the task itself).
    // - `context.children` is `undefined` or an empty array.
- The method efficiently uses the provided `data: ProjectData` without redundant loading.
- The returned object structure matches `OnboardResponse['context']`.
- The code is clean, type-safe, and includes JSDoc comments.
- Commit message clearly describes the changes (e.g., `feat(TaskManager): Implement buildEntityContext helper for onboarding`).
