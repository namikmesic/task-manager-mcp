# Project Implementation Plan: Project-Centric Architecture with Universal Document Primitives

This document outlines the epics and tasks required to implement the "Project-Centric Architecture with Universal Document Primitives" as detailed in `improvement-02.md`.

## 1. Overall Project Goals

The primary goal is to transition from the current rigid PRD-centric model to a flexible Project-centric approach. This involves:

- Introducing `Project` and `Document` as core primitives.
- Implementing index-based prioritization instead of vague priority labels.
- Utilizing UUIDs for all entity identification.
- Enabling broad dependency modeling for tasks.
- Simplifying status fields and entity structures.
- Enhancing the system with capabilities for automatic parallelization analysis.
- Ensuring clear, task-centric onboarding for LLM agents.

## 2. General Code Excellence Guidelines

- **Clarity and Simplicity:** Write code that is easy to understand and maintain.
- **Efficiency:** Optimize for performance where necessary, but prioritize clarity.
- **Documentation:**
  - Add JSDoc comments for all public functions, classes, and interfaces.
  - Explain complex logic with inline comments if necessary.
- **Modularity:** Design components that are reusable and have clear responsibilities.
- **Error Handling:** Implement robust error handling and provide informative error messages.
- **Adherence to Standards:** Follow existing coding conventions (TypeScript, ESLint, Prettier) as established in the repository.
- **Type Safety:** Leverage TypeScript's type system to ensure correctness. Define clear interfaces for all data structures.

## 3. Repository Management Best Practices

- **Branching Strategy:**
  - Create a main feature branch for this entire architectural refactor (e.g., `feature/project-centric-arch`).
  - For each Epic, create a sub-branch from the main feature branch (e.g., `epic/core-data-model` branched from `feature/project-centric-arch`).
  - For each Task within an epic, create a task-specific branch from its parent epic branch (e.g., `task/implement-project-interface` branched from `epic/core-data-model`).
- **Commits:**
  - Make atomic commits: each commit should represent a single logical change.
  - Write clear and concise commit messages using conventional commit format (e.g., `feat: Implement Project interface`, `fix: Correct UUID generation for Tasks`).
  - Reference relevant issue/task numbers if applicable.
- **Pull Requests (PRs):**
  - PRs should ideally be made from task branches to their epic branch.
  - Once an epic is complete, its epic branch can be PR'd into the main feature branch (`feature/project-centric-arch`).
  - Ensure PR descriptions are clear, linking to the epic/task definition.
  - Ensure all tests pass and linting issues are resolved before merging.
- **Code Reviews:** (Assuming a human supervisor or peer LLM for review)
  - Request reviews for all PRs.
  - Address feedback constructively.

## 4. Proposed Directory Structure for Tasks

A new directory `improvements/tasks/` will be created to hold individual task markdown files.
Inside `improvements/tasks/`, subdirectories will be created for each epic. For example:

- `improvements/tasks/epic_01_core_data_model/`
- `improvements/tasks/epic_02_uuid_and_indexing/`
- ...and so on.

Each task file will be named descriptively, e.g., `task_1.1_implement_project_interface.md`.

## 5. Epics & Tasks

Below is the breakdown of the project into manageable epics. Each epic will be further detailed in its own set of task files located in the `improvements/tasks/` directory.

### Epic 1: Core Data Model and Type Overhaul

- **Status:** To Do
- **Technical Purpose:** Implement the new TypeScript interfaces (`Project`, `Epic`, `Task`, `Document`, `ProjectData`, `ProjectWithDetails`, `ParallelizationAnalysis`) as defined in `improvement-02.md`. Update `types.ts` and refactor core data handling logic in `TaskManager` (e.g., `loadData`, `saveData`) to support the new unified `ProjectData` structure and individual entity types. This epic lays the foundational data structures for the new architecture.
- **Contextual Relevance:** This is the cornerstone of the entire refactor. All subsequent epics depend on these new data structures being correctly defined and handled.
- **Semantic Meaning:** Shifts the system from a PRD-first model to a flexible Project/Document-centric model, allowing for more diverse project management styles and richer data representation.
- **Tasks:** (Links to individual task files will be added here)
  - `[ ]` Task 1.1: Define Core Entity Interfaces in `types.ts`
  - `[ ]` Task 1.2: Define Helper/View Interfaces in `types.ts`
  - `[ ]` Task 1.3: Refactor `TaskManager.loadData()` for New Data Model
  - `[ ]` Task 1.4: Refactor `TaskManager.saveData()` for New Data Model

### Epic 2: UUID Integration and Entity ID Management

- **Status:** To Do
- **Technical Purpose:** Replace the current ID generation mechanism (e.g., `${prefix}_${timestamp}_${random}`) with standard UUID v4 generation for all entities (`Project`, `Epic`, `Task`, `Document`). Update all functions within `TaskManager` that create or reference entities to use these UUIDs.
- **Contextual Relevance:** Ensures robust, globally unique, and standardized identification for all entities across the system, crucial for reliable dependency tracking and data integrity.
- **Semantic Meaning:** Moves away from potentially non-standard or collision-prone ID formats to an industry-standard, highly reliable identification system.
- **Tasks:**
  - `[ ]` Task 2.1: Implement UUID Generation Utility in `TaskManager`
  - `[ ]` Task 2.2: Update Project Creation Logic with UUIDs
  - `[ ]` Task 2.3: Update Epic Creation Logic with UUIDs
  - `[ ]` Task 2.4: Update Task Creation Logic with UUIDs
  - `[ ]` Task 2.5: Update Document Creation Logic with UUIDs (anticipating Epic 4)
  - `[ ]` Task 2.6: Review and Update All Entity Referencing Logic to Use UUIDs

### Epic 3: Index-Based Prioritization and Ordering

- **Status:** To Do
- **Technical Purpose:** Implement the `index` field for `Project`, `Epic`, and `Task` entities to manage their execution order. This involves creating logic in `TaskManager` for automatic index assignment upon entity creation and providing MCP tools for reordering entities.
- **Contextual Relevance:** Replaces ambiguous priority labels (high/medium/low) with a clear, numerical ordering system, simplifying planning and execution for agents.
- **Semantic Meaning:** Provides an unambiguous sequence for work items, directly supporting clearer prioritization and workflow management.
- **Tasks:**
  - `[ ]` Task 3.1: Add `index` field to Project, Epic, Task interfaces in `types.ts` (if not already done in Epic 1)
  - `[ ]` Task 3.2: Implement `TaskManager.getNextIndex()` for Projects
  - `[ ]` Task 3.3: Implement `TaskManager.getNextIndex()` for Epics within a Project
  - `[ ]` Task 3.4: Implement `TaskManager.getNextIndex()` for Tasks within an Epic
  - `[ ]` Task 3.5: Integrate `getNextIndex()` into Project, Epic, Task creation methods in `TaskManager`
  - `[ ]` Task 3.6: Implement `TaskManager.reorderEpics()`
  - `[ ]` Task 3.7: Implement `TaskManager.reorderTasks()`
  - `[ ]` Task 3.8: Implement `reorder_epics` MCP Tool
  - `[ ]` Task 3.9: Implement `reorder_tasks` MCP Tool

### Epic 4: Document Primitive Implementation

- **Status:** To Do
- **Technical Purpose:** Fully implement the `Document` entity as a universal primitive for storing various types of information (specs, designs, notes, etc.) and attaching it to Projects, Epics, or Tasks.
- **Contextual Relevance:** Decouples documentation and detailed information from fixed description fields, allowing for richer, more flexible knowledge management within projects.
- **Semantic Meaning:** Elevates documentation to a first-class citizen, attachable anywhere, making project context more comprehensive and accessible.
- **Tasks:**
  - `[ ]` Task 4.1: Implement `Document` CRUD methods in `TaskManager` (Create, Read by ID, Update, Delete)
  - `[ ]` Task 4.2: Implement `TaskManager.getDocumentsByEntity()`
  - `[ ]` Task 4.3: Implement `create_document` MCP Tool
  - `[ ]` Task 4.4: Implement `update_document` MCP Tool (or generic update tool)
  - `[ ]` Task 4.5: Implement `delete_document` MCP Tool (or generic delete tool)
  - `[ ]` Task 4.6: Implement `get_document` (by ID) MCP Tool (or generic read tool)
  - `[ ]` Task 4.7: Implement `list_documents_for_entity` MCP Tool

### Epic 5: Enhanced Dependency Management and Parallelization Logic

- **Status:** To Do
- **Technical Purpose:** Implement the broad dependency model for Tasks (allowing a task to depend on multiple other tasks via their UUIDs) and develop the server-side logic for parallelization analysis.
- **Contextual Relevance:** Enables more realistic project planning by capturing diverse blocking relationships and provides insights into which tasks can be worked on concurrently, optimizing workflow.
- **Semantic Meaning:** Transforms the task management system from a simple list to a dependency-aware graph, unlocking potential for automated parallelization and conflict detection.
- **Tasks:**
  - `[ ]` Task 5.1: Add `dependencies` field (array of Task UUIDs) to Task interface (if not done in Epic 1)
  - `[ ]` Task 5.2: Update `TaskManager.createTasks()` and `TaskManager.updateTask()` to handle `dependencies`.
  - `[ ]` Task 5.3: Implement `TaskManager.getParallelizableTasks()`
  - `[ ]` Task 5.4: Implement `TaskManager.getBlockedTasks()`
  - `[ ]` Task 5.5: Implement `TaskManager.identifyResourceConflicts()`
  - `[ ]` Task 5.6: Implement `TaskManager.getNextTasksByAssignee()`
  - `[ ]` Task 5.7: Implement `TaskManager.analyzeParallelization()` method assembling the `ParallelizationAnalysis` object.
  - `[ ]` Task 5.8: Implement `analyze_parallelization` MCP Tool (with `outputSchema` for `ParallelizationAnalysis`).
  - `[ ]` Task 5.9: (Optional) Add dependency validation (e.g., cycle detection, valid task UUIDs).

### Epic 6: Refactor Existing MCP Tools and TaskManager Methods

- **Status:** To Do
- **Technical Purpose:** Update all relevant existing `TaskManager` methods and their corresponding MCP tools to align with the new data models (Project, Document entities), UUIDs, index-based ordering, simplified status fields, and the removal of direct description fields from Epics/Tasks in favor of Documents.
- **Contextual Relevance:** Ensures the entire system consistently uses the new architecture, maintaining coherence and leveraging the benefits of the refactor across all functionalities.
- **Semantic Meaning:** Completes the transition to the new project-centric paradigm by overhauling existing functionalities to speak the new architectural language.
- **Tasks:**
  - `[ ]` Task 6.1: Implement `create_project` MCP Tool and associated `TaskManager.createProject()` method.
  - `[ ]` Task 6.2: Refactor `TaskManager.createEpic(s)` and `create_epic(s)` MCP tool(s) for new Epic structure (no description, project_id, index).
  - `[ ]` Task 6.3: Refactor `TaskManager.createTask(s)` and `create_task(s)` MCP tool(s) for new Task structure (no description, epic_id, index, dependencies).
  - `[ ]` Task 6.4: Refactor `TaskManager.updatePrd()` (rename or adapt to `updateProject`) and its MCP tool.
  - `[ ]` Task 6.5: Refactor `TaskManager.updateEpic()` and its MCP tool for new Epic structure.
  - `[ ]` Task 6.6: Refactor `TaskManager.updateTask()` and its MCP tool for new Task structure.
  - `[ ]` Task 6.7: Refactor `TaskManager.deletePrd()` (rename or adapt to `deleteProject`) and its MCP tool, ensuring cascading deletes of Epics, Tasks, and associated Documents.
  - `[ ]` Task 6.8: Refactor `TaskManager.deleteEpics()` and its MCP tool, ensuring cascading deletes of Tasks and associated Documents.
  - `[ ]` Task 6.9: Refactor `TaskManager.deleteTasks()` and its MCP tool, ensuring deletion of associated Documents.
  - `[ ]` Task 6.10: Refactor `TaskManager.readProject()` (adapt to new Project structure with `ProjectWithDetails` including documents) and its MCP tool.
  - `[ ]` Task 6.11: Refactor `TaskManager.searchItems()` and its MCP tool for new entities and fields.
  - `[ ]` Task 6.12: Refactor `TaskManager.getTasksByStatus()` and `TaskManager.getTasksByAssignee()` and their MCP tools.
  - `[ ]` Task 6.13: Remove `add_task_notes` tool and `TaskManager.addTaskNotes()` if notes are fully replaced by Documents.

### Epic 7: Enhanced Onboarding MCP Tool

- **Status:** To Do
- **Technical Purpose:** Implement the new `onboard` MCP tool as specified in `improvement-02.md`. This tool will provide comprehensive contextual information for a given Project, Epic, or Task, including options to include parent/sibling/child context and parallelization analysis.
- **Contextual Relevance:** Provides LLM agents with a richer, more targeted understanding of the work item they are assigned, improving their ability to act effectively.
- **Semantic Meaning:** Streamlines agent onboarding by delivering all necessary context in a single, structured call, tailored to the entity type.
- **Tasks:**
  - `[ ]` Task 7.1: Define `OnboardParams` and `OnboardResponse` interfaces in `types.ts` (if not done in Epic 1).
  - `[ ]` Task 7.2: Implement `TaskManager.buildEntityContext()` helper method.
  - `[ ]` Task 7.3: Implement main `TaskManager.onboard()` method logic.
  - `[ ]` Task 7.4: Implement `onboard` MCP Tool, using Zod for `OnboardParams` schema.

### Epic 8: Advanced MCP Protocol Features (Optional Stretch)

- **Status:** To Do
- **Technical Purpose:** Explore and implement selected advanced MCP protocol features from `improvement-02.md`, such as specific real-time notifications (e.g., `sendResourceUpdated` when a Document attached to a Task changes) or dynamic contextual resources (e.g., a resource showing overdue tasks for a project).
- **Contextual Relevance:** Further enhances the interactivity and real-time capabilities of the project management system, making it more responsive and informative for clients/agents.
- **Semantic Meaning:** Leverages deeper SDK capabilities to create a more sophisticated and dynamic user experience.
- **Tasks:** (Specific tasks will be defined if this epic is pursued, e.g.)
  - `[ ]` Task 8.1: Identify specific scenarios for `sendResourceUpdated` (e.g., on Document content change).
  - `[ ]` Task 8.2: Implement a dynamic resource for overdue tasks using `mcpServer.resource()`.

---

Next, I will start creating the detailed task files for Epic 1.
