# Task 5.7: Implement `TaskManager.analyzeParallelization()`

**Parent Epic:** Epic 5: Enhanced Dependency Management and Parallelization Logic
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to implement the public `TaskManager.analyzeParallelization(projectId?: string, epicId?: string): Promise<ParallelizationAnalysis>` method. This method will gather the relevant tasks (scoped to a project, an epic, or globally) and use the helper methods (`getParallelizableTasks`, `getBlockedTasks`, `identifyResourceConflicts`, `getNextTasksByAssignee`) to construct and return a `ParallelizationAnalysis` object.

**Scope:**

- Define and implement `async analyzeParallelization(projectId?: string, epicId?: string): Promise<ParallelizationAnalysis>` in `TaskManager`.
- The method should first load all necessary data (`this.loadData()`).
- It will then filter the tasks based on the optional `projectId` or `epicId` parameters:
  - If `epicId` is provided, analyze tasks belonging to that epic.
  - Else if `projectId` is provided, analyze all tasks belonging to all epics within that project.
  - Else (neither provided), analyze all tasks in the system.
- Call the private helper methods implemented in Tasks 5.3, 5.4, 5.5, and 5.6, passing the scoped task list to them.
- Assemble the results from these helper methods into a `ParallelizationAnalysis` object (defined in `types.ts` via Epic 1, Task 1.2).
- Return the `ParallelizationAnalysis` object.

## 2. Technical Purpose

To provide a comprehensive analysis of the current state of task parallelizability, blocked tasks, resource conflicts, and next recommended actions for assignees, scoped to a relevant context (project, epic, or global).

## 3. Contextual Relevance

This is the primary server-side method that will be called by the `analyze_parallelization` MCP tool (Task 5.8). It consolidates all the parallelization logic into a single, coherent analysis result.

## 4. Semantic Meaning

This method provides a snapshot of the project's execution flow, highlighting opportunities for concurrent work and potential bottlenecks. It makes the underlying dependency graph and task statuses actionable for planning and execution.

## 5. Detailed Implementation Guidance

1.  **Prerequisites:**

    - `ParallelizationAnalysis` interface defined in `types.ts`.
    - Helper methods `getParallelizableTasks`, `getBlockedTasks`, `identifyResourceConflicts`, `getNextTasksByAssignee` implemented (Tasks 5.3-5.6).

2.  **Method Signature:**

    - `async analyzeParallelization(projectId?: string, epicId?: string): Promise<ParallelizationAnalysis>`

3.  **Implementation Steps (following `improvement-02.md`, Step 3):**

    ```typescript
    // Conceptual structure from improvement-02.md:
    // async analyzeParallelization(
    //   projectId?: string,
    //   epicId?: string
    // ): Promise<ParallelizationAnalysis> {
    //   const data = await this.loadData();
    //   let tasksToAnalyze: Task[];
    //
    //   if (epicId) {
    //     tasksToAnalyze = data.tasks.filter((t) => t.epic_id === epicId);
    //   } else if (projectId) {
    //     const projectEpics = data.epics.filter((e) => e.project_id === projectId);
    //     const projectEpicIds = projectEpics.map((e) => e.id);
    //     tasksToAnalyze = data.tasks.filter((t) => projectEpicIds.includes(t.epic_id));
    //   } else {
    //     tasksToAnalyze = data.tasks; // Analyze all tasks
    //   }
    //
    //   const parallelizable = this.getParallelizableTasks(tasksToAnalyze);
    //   const blocked = this.getBlockedTasks(tasksToAnalyze);
    //   const conflicts = this.identifyResourceConflicts(parallelizable); // Conflicts only on parallelizable tasks
    //   const nextByAssignee = this.getNextTasksByAssignee(parallelizable); // Next tasks from parallelizable set
    //
    //   return {
    //     parallelizable_tasks: parallelizable,
    //     blocked_tasks: blocked,
    //     resource_conflicts: conflicts,
    //     next_tasks_by_assignee: nextByAssignee,
    //   };
    // }
    ```

4.  **Detailed Breakdown of Logic:**
    - **Load Data:** `const data = await this.loadData();`
    - **Determine `tasksToAnalyze`:**
      - If `epicId` is provided, filter `data.tasks` for tasks where `task.epic_id === epicId`.
      - Else if `projectId` is provided:
        - Filter `data.epics` for epics where `epic.project_id === projectId`.
        - Get the IDs of these project-specific epics.
        - Filter `data.tasks` for tasks whose `epic_id` is in the set of `projectEpicIds`.
      - Else (neither `epicId` nor `projectId` is provided), `tasksToAnalyze` becomes `data.tasks` (all tasks).
    - **Call Helper Methods:**
      - `const parallelizable = this.getParallelizableTasks(tasksToAnalyze);`
      - `const blocked = this.getBlockedTasks(tasksToAnalyze);`
      - `const conflicts = this.identifyResourceConflicts(parallelizable);` (Note: `identifyResourceConflicts` operates on the already determined `parallelizable` tasks).
      - `const nextByAssignee = this.getNextTasksByAssignee(parallelizable);` (Note: `getNextTasksByAssignee` also operates on `parallelizable` tasks).
    - **Assemble and Return `ParallelizationAnalysis` Object:** Construct the object using the results from the helper methods.

## 6. Acceptance Criteria

- The `TaskManager.analyzeParallelization(...)` method is implemented correctly as a public or internal method.
- It correctly filters tasks based on `projectId` or `epicId` if provided, or uses all tasks if neither is provided.
- It correctly calls the private helper methods (`getParallelizableTasks`, `getBlockedTasks`, `identifyResourceConflicts`, `getNextTasksByAssignee`) with the appropriate task list.
- It accurately assembles and returns a `ParallelizationAnalysis` object conforming to the interface in `types.ts`.
- The logic for determining the scope of tasks to analyze (all, project-specific, or epic-specific) is correct.
- The code is clean, type-safe, and includes JSDoc comments.
- Commit message clearly describes the changes (e.g., `feat(TaskManager): Implement analyzeParallelization method`).
