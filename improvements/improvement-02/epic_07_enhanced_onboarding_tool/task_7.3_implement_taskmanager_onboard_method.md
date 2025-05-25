# Task 7.3: Implement Main `TaskManager.onboard()` Method Logic

**Parent Epic:** Epic 7: Enhanced Onboarding MCP Tool
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to implement the main `TaskManager.onboard(params: OnboardParams): Promise<OnboardResponse>` method. This method will serve as the core logic for gathering all necessary information for onboarding an agent to a specific entity (Project, Epic, or Task), as detailed in `improvement-02.md` (Step 4).

**Scope:**

- Implement the public method `async onboard(params: OnboardParams): Promise<OnboardResponse>` in `TaskManager`.
- The method will:
  1.  Load all data (`this.loadData()`).
  2.  Find the primary `entity` (Project, Epic, or Task) based on `params.entity_id` and `params.entity_type`.
  3.  If the entity is not found, throw an error.
  4.  Fetch all `Document`s directly attached to this primary entity using `this.getDocumentsByEntity()` (Task 4.2).
  5.  If `params.include_context` is true, call `this.buildEntityContext()` (Task 7.2) to get parent, sibling, and child context.
  6.  If `params.include_parallelization` is true, call `this.analyzeParallelization()` (Task 5.7), scoping the analysis appropriately:
      - If `entity_type` is "project", call with `projectId = entity_id`.
      - If `entity_type` is "epic", call with `epicId = entity_id`.
      - If `entity_type` is "task", find the task's parent `epic_id` and call with that `epicId`.
  7.  Assemble and return the `OnboardResponse` object.

## 2. Technical Purpose

To provide a unified and comprehensive data retrieval mechanism for onboarding. This method orchestrates calls to various helper functions to gather all relevant information for a given entity in a structured manner.

## 3. Contextual Relevance

This method is the direct backend logic for the `onboard` MCP tool (Task 7.4). It's the primary way the system will provide rich, contextual information to LLM agents or other clients requiring a deep understanding of a specific work item.

## 4. Semantic Meaning

The `onboard` method embodies the principle of task-centric onboarding with flexible context. It allows an agent to get precisely the information needed (core entity, documents, hierarchical context, parallelization insights) to start working effectively.

## 5. Detailed Implementation Guidance

1.  **Prerequisites:**

    - `OnboardParams` and `OnboardResponse` interfaces defined (Task 7.1).
    - `getDocumentsByEntity()` method implemented (Task 4.2).
    - `buildEntityContext()` helper method implemented (Task 7.2).
    - `analyzeParallelization()` method implemented (Task 5.7).
    - Core entity interfaces (`Project`, `Epic`, `Task`, `Document`) and `ProjectData` are defined and `loadData()` works.

2.  **Method Signature:**
    `async onboard(params: OnboardParams): Promise<OnboardResponse>`

3.  **Implementation Steps (following `improvement-02.md`, Step 4):**

    ```typescript
    // In TaskManager class
    // async onboard(params: OnboardParams): Promise<OnboardResponse> {
    //   const data = await this.loadData();
    //   let entity: Project | Epic | Task | undefined;
    //
    //   // 1. Get the main entity
    //   switch (params.entity_type) {
    //     case "project":
    //       entity = data.projects.find((p) => p.id === params.entity_id);
    //       break;
    //     case "epic":
    //       entity = data.epics.find((e) => e.id === params.entity_id);
    //       break;
    //     case "task":
    //       entity = data.tasks.find((t) => t.id === params.entity_id);
    //       break;
    //     default:
    //       // Should be caught by type system, but good for robustness
    //       throw new Error(`Invalid entity type: ${params.entity_type}`);
    //   }
    //
    //   if (!entity) {
    //     throw new Error(`${params.entity_type} with ID ${params.entity_id} not found.`);
    //   }
    //
    //   // 2. Get attached documents
    //   const documents = await this.getDocumentsByEntity(params.entity_id, params.entity_type);
    //
    //   // 3. Initialize response object
    //   const response: OnboardResponse = { entity, documents };
    //
    //   // 4. Add context if requested
    //   if (params.include_context) {
    //     response.context = await this.buildEntityContext(params.entity_type, params.entity_id, data);
    //   }
    //
    //   // 5. Add parallelization analysis if requested
    //   if (params.include_parallelization) {
    //     if (params.entity_type === "project") {
    //       response.parallelization = await this.analyzeParallelization(params.entity_id, undefined);
    //     } else if (params.entity_type === "epic") {
    //       response.parallelization = await this.analyzeParallelization(undefined, params.entity_id);
    //     } else if (params.entity_type === "task") {
    //       // For a task, analyze its parent epic
    //       const taskEntity = entity as Task; // Cast because we know it's a task here
    //       if (taskEntity.epic_id) {
    //         response.parallelization = await this.analyzeParallelization(undefined, taskEntity.epic_id);
    //       } else {
    //         // Task has no epic_id, maybe return empty/default parallelization or handle as error?
    //         // For now, let's assume tasks always have an epic_id based on the model.
    //       }
    //     }
    //   }
    //
    //   return response;
    // }
    ```

4.  **Error Handling:** If the primary `entity` requested by `entity_id` and `entity_type` is not found, the method should throw an error, as onboarding to a non-existent entity is not possible.

5.  **Parallelization Scope for Tasks:** When `include_parallelization` is true for a `task` entity, the analysis should be performed for the task's parent epic. This requires fetching the task, getting its `epic_id`, and then calling `analyzeParallelization(undefined, task.epic_id)`.

## 6. Acceptance Criteria

- The `TaskManager.onboard(params: OnboardParams)` method is implemented correctly.
- It retrieves the correct primary `entity` (Project, Epic, or Task) based on `params`.
- It throws an error if the primary entity is not found.
- It correctly fetches and includes all directly attached `Document`s for the primary entity.
- If `params.include_context` is true, it calls `buildEntityContext` and includes the hierarchical context in the response.
- If `params.include_parallelization` is true:
  - For a project, it calls `analyzeParallelization` with the project ID.
  - For an epic, it calls `analyzeParallelization` with the epic ID.
  - For a task, it calls `analyzeParallelization` for the task's parent epic ID.
- The method returns an `OnboardResponse` object that accurately reflects the requested information and conforms to the interface.
- The code is clean, type-safe, and uses helper methods appropriately.
- Commit message clearly describes the changes (e.g., `feat(TaskManager): Implement onboard method for comprehensive entity context`).
