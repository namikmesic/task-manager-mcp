# Task 7.1: Define `OnboardParams` and `OnboardResponse` Interfaces in `types.ts`

**Parent Epic:** Epic 7: Enhanced Onboarding MCP Tool
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to define the `OnboardParams` and `OnboardResponse` interfaces in `types.ts`. These interfaces specify the input parameters and the structure of the response for the enhanced onboarding functionality, as outlined in `improvement-02.md` (Step 4: Enhanced Onboarding with Parallelization Context).

**Scope:**

- Define `OnboardParams` interface:
  - `entity_type: "project" | "epic" | "task"`
  - `entity_id: string` (UUID)
  - `include_context?: boolean` (Optional)
  - `include_parallelization?: boolean` (Optional, new)
- Define `OnboardResponse` interface:
  - `entity: Project | Epic | Task` (Union type of core entities)
  - `documents: Document[]` (Documents directly attached to the primary `entity`)
  - `context?: { parent?: Project | Epic; siblings?: Array<Epic | Task>; children?: Array<Epic | Task>; }` (Optional)
  - `parallelization?: ParallelizationAnalysis` (Optional, new; `ParallelizationAnalysis` interface from Epic 1, Task 1.2).
- This task is purely about type definitions in `types.ts`.

## 2. Technical Purpose

To establish clear, typed contracts for the input and output of the enhanced onboarding process. This ensures that both the `TaskManager.onboard()` method and the `onboard` MCP tool operate with well-defined data structures.

## 3. Contextual Relevance

These interfaces are fundamental to implementing the enhanced onboarding feature. The `TaskManager.onboard()` method (Task 7.3) will consume `OnboardParams` and produce `OnboardResponse`. The `onboard` MCP tool (Task 7.4) will use these for its schema and data handling.

## 4. Semantic Meaning

These types formalize the concept of a rich, contextual onboarding experience for an LLM agent. They define what information an agent can request (`OnboardParams`) and what comprehensive details it can expect to receive (`OnboardResponse`), including hierarchical context and parallelization insights.

## 5. Detailed Implementation Guidance

1.  **Open `types.ts`:** This is the target file for all changes.
2.  **Prerequisites:** Ensure `Project`, `Epic`, `Task`, `Document`, and `ParallelizationAnalysis` interfaces are already defined from Epic 1.
3.  **Define `OnboardParams` Interface:**
    Refer to `improvement-02.md`, section "Step 4: Enhanced Onboarding with Parallelization Context".

    ```typescript
    // In types.ts
    export interface OnboardParams {
      entity_type: "project" | "epic" | "task";
      entity_id: string; // UUID
      include_context?: boolean;
      include_parallelization?: boolean; // New: include parallelization analysis
    }
    ```

    - Add JSDoc comments for each field, explaining its purpose (e.g., `include_parallelization` to request parallelization insights).

4.  **Define `OnboardResponse` Interface:**
    Refer to `improvement-02.md`, section "Step 4: Enhanced Onboarding with Parallelization Context".
    ```typescript
    // In types.ts
    export interface OnboardResponse {
      entity: Project | Epic | Task; // The primary entity being onboarded to
      documents: Document[]; // Documents directly attached to the primary entity
      context?: {
        parent?: Project | Epic; // Parent of the entity (e.g., Project for an Epic, Epic for a Task)
        siblings?: Array<Epic | Task>; // Siblings of the entity (e.g., other Epics in the same Project)
        children?: Array<Epic | Task>; // Children of the entity (e.g., Epics for a Project, Tasks for an Epic)
      };
      parallelization?: ParallelizationAnalysis; // New: parallelization insights for the relevant scope
    }
    ```
    - Add JSDoc comments for each field, especially for `context` (explaining `parent`, `siblings`, `children`) and `parallelization`.

## 6. Acceptance Criteria

- The `OnboardParams` interface is correctly defined in `types.ts` as specified in `improvement-02.md`.
- The `OnboardResponse` interface is correctly defined in `types.ts` as specified, including the `entity` union type, `documents` array, optional `context` object, and optional `parallelization` field (typed as `ParallelizationAnalysis`).
- All fields have appropriate JSDoc comments explaining their purpose.
- The changes do not introduce any TypeScript compilation errors and integrate correctly with existing types.
- Commit message clearly describes the changes (e.g., `feat(types): Define OnboardParams and OnboardResponse interfaces`).
