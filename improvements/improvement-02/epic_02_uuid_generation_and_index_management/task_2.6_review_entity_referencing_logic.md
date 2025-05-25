# Task 2.6: Review and Update All Entity Referencing Logic to Use UUIDs

**Parent Epic:** Epic 2: UUID Integration and Entity ID Management
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to comprehensively review and update all parts of the `TaskManager` class and related data handling logic to ensure that entity references (like `project_id` in Epics, `epic_id` in Tasks, `entity_id` in Documents, and Task `dependencies`) are consistently and correctly handled as UUID strings.

**Scope:**

- Review all `TaskManager` methods that involve creating, updating, or querying entities based on their relationships (e.g., creating an Epic for a Project, finding Tasks for an Epic, resolving Task dependencies, retrieving Documents for an entity).
- Ensure that when these relationships are established or queried, the ID fields used for linking (`project_id`, `epic_id`, `entity_id`, elements in `dependencies` array) are expected to be and are treated as UUID strings.
- This task is less about new implementation and more about ensuring consistency and correctness of existing or soon-to-be-refactored logic in light of the universal adoption of UUIDs.

## 2. Technical Purpose

To guarantee data integrity and relational correctness across the entire system by ensuring all foreign key relationships and dependency links correctly use the new UUID standard.

## 3. Contextual Relevance

This task acts as a sweep to ensure that the introduction of UUIDs (Tasks 2.1-2.5) is holistically integrated. Without this, broken links or incorrect entity relationships could occur, undermining the new architecture.

## 4. Semantic Meaning

This task solidifies the relational integrity of the project data model. It ensures that references between entities are robust and based on the standardized UUIDs, paving the way for reliable querying, dependency tracking, and data aggregation.

## 5. Detailed Implementation Guidance

1.  **Identify Key Areas for Review:** Systematically go through the `TaskManager` class methods. Pay close attention to:

    - **Entity Creation Methods (Post-Refactor for UUIDs):**
      - `createEpic(s)`: Ensure `project_id` (input) is treated as a UUID string to link to a `Project`.
      - `createTask(s)`: Ensure `epic_id` (input) is treated as a UUID string to link to an `Epic`. Ensure `dependencies` (input) is an array of UUID strings, each linking to another `Task`.
      - `createDocument()`: Ensure `entity_id` (input) is treated as a UUID string to link to a `Project`, `Epic`, or `Task` based on `entity_type`.
    - **Entity Update Methods:** When updating entities that have foreign keys (e.g., changing a Task's `epic_id`), ensure the new ID is a valid UUID string.
    - **Data Retrieval/Query Methods:**
      - Methods like `getEpicsForProject(projectId: string)` (hypothetical, or part of `readProject`) must use `projectId` (a UUID) to filter epics.
      - Methods like `getTasksForEpic(epicId: string)` must use `epicId` (a UUID) to filter tasks.
      - Methods like `getDocumentsByEntity(entityId: string, entityType: ...)` must use `entityId` (a UUID).
      - Dependency resolution logic (Epic 5) will heavily rely on task `dependencies` being arrays of valid Task UUIDs.
    - **Deletion Logic:** Cascading deletes (e.g., deleting a Project should delete its Epics, Tasks, Documents) will rely on matching UUIDs (`project_id`, `epic_id`, `entity_id`).

2.  **Verify Type Usage:**

    - Ensure that parameters representing entity IDs in function signatures are typed as `string`.
    - Ensure that comparisons or lookups involving these IDs treat them as strings.
    - For example, when filtering an array: `data.epics.filter(e => e.project_id === projectId)`. Both `e.project_id` and `projectId` should be UUID strings.

3.  **No Data Migration in This Task:** This task focuses on the code logic. Data migration of an existing `tasks.json` file from old ID formats to new UUIDs is a separate concern, possibly handled by a one-off script or by a period of dual-support if absolutely necessary (though the goal of `improvement-02.md` is a clean switch).

4.  **Consider Search and Linking Logic:**
    - If there are any search functions or functions that build relationships (other than simple parent-child), ensure they correctly use UUIDs for matching and linking.

## 6. Acceptance Criteria

- All `TaskManager` methods that handle entity relationships (creation, updates, queries, deletion cascades, dependency resolution) correctly expect and use UUID strings for `project_id`, `epic_id`, `entity_id`, and elements within `Task.dependencies`.
- Type annotations for these ID fields in function parameters and internal variables are consistently `string`.
- Logic that filters or finds entities based on these IDs performs string comparisons correctly.
- Code review confirms that there are no remaining instances of the old ID format (e.g., prefixed strings) being used for entity linking or referencing within the `TaskManager`'s core logic.
- The system maintains relational integrity when creating, linking, and querying entities using their UUIDs.
- Commit message clearly describes the changes (e.g., `refactor(TaskManager): Ensure consistent UUID usage for all entity references`).
