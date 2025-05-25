# Task 5.9: (Optional) Add Dependency Validation

**Parent Epic:** Epic 5: Enhanced Dependency Management and Parallelization Logic
**Status:** To Do
**Type:** Optional Enhancement

---

## 1. Objective & Scope

The objective of this optional task is to enhance the robustness of task dependency management by adding validation logic within the `TaskManager`. This could include checking for circular dependencies or ensuring that all UUIDs listed in a task's `dependencies` array correspond to existing, valid tasks.

**Scope:**

- **Circular Dependency Detection:** Implement logic (e.g., during task creation or update, or as a separate validation step) to detect if adding a new dependency would create a cycle (e.g., Task A -> Task B -> Task C -> Task A).
- **Valid Task UUID Check:** When tasks are created or updated with dependencies, verify that each UUID in the `dependencies` array actually refers to an existing task in the system.
- This validation logic would primarily reside within `TaskManager.createTasks()` and `TaskManager.updateTask()` or be callable by them.
- Decide on an error handling strategy: prevent the operation and return an error message, or allow it but log a warning.

## 2. Technical Purpose

To prevent data inconsistencies and logical errors in project plans that could arise from invalid or circular task dependencies. This makes the dependency graph more reliable.

## 3. Contextual Relevance

While the core parallelization logic (Tasks 5.3-5.8) assumes valid dependencies, this task adds a layer of proactive validation to ensure the integrity of that dependency data. It makes the overall system more robust.

## 4. Semantic Meaning

Adding dependency validation ensures that the relationships modeled in the system are logically sound, preventing impossible workflow scenarios (like circular dependencies) and ensuring all links are to real tasks.

## 5. Detailed Implementation Guidance

1.  **Circular Dependency Detection:**

    - This is a common graph traversal problem. When adding a dependency from Task A to Task B (`TaskA.dependencies.push(TaskB.id)`), you need to check if Task A is already reachable from Task B through existing dependencies.
    - A Depth-First Search (DFS) approach is often used:
      - To check if adding `TaskA -> TaskB` creates a cycle: Start a traversal from `TaskB`. If `TaskA` is visited during this traversal (following existing dependencies), then adding `TaskA -> TaskB` would create a cycle.
      - Keep track of visited nodes in the current recursion stack (visiting) and nodes that have been fully processed (visited) to detect cycles and avoid re-processing.
    - This check should ideally occur within `TaskManager.updateTask()` when `dependencies` are modified, or within `TaskManager.createTasks()` if dependencies can be set at creation.

2.  **Valid Task UUID Check:**

    - When `dependencies` are provided for a task (during creation or update):
      - Load all existing task IDs: `const allTaskIds = new Set(data.tasks.map(t => t.id));`
      - For each `depId` in the task's `dependencies` array, check if `allTaskIds.has(depId)`.
      - If any `depId` is not found, the dependency is invalid.

3.  **Integration Points:**

    - The best place to integrate these checks is within `TaskManager.createTasks()` (when tasks are first defined with dependencies) and `TaskManager.updateTask()` (when a task's dependencies might be changed).

4.  **Error Handling:**

    - If validation fails (cycle detected or invalid UUID), the `TaskManager` method should probably throw an error and not save the change, returning an informative error message to the caller (which would then be relayed by the MCP tool).
    - Example error: `"Circular dependency detected involving task X"` or `"Invalid dependency: Task with ID Y not found"`.

5.  **Consider Performance:** For very large numbers of tasks, cycle detection could be intensive if performed naively on every update. However, given typical project sizes, a standard DFS should be acceptable. The UUID check is relatively cheap if existing task IDs are in a Set.

## 6. Acceptance Criteria

- (If implemented) `TaskManager.createTasks()` and `TaskManager.updateTask()` include logic to validate provided task dependencies.
- Validation checks for circular dependencies before allowing a dependency to be added/modified.
- Validation checks that all UUIDs in a task's `dependencies` array correspond to existing task IDs.
- If validation fails, the operation is prevented, and an appropriate error is raised or communicated.
- The implementation is reasonably efficient for typical project sizes.
- The code is clean, well-tested (if unit tests are part of the scope), and includes JSDoc comments.
- Commit message clearly describes the validation enhancements (e.g., `feat(TaskManager): Add circular dependency and valid UUID checks for task dependencies`).
