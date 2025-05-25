# Task 2.1: Implement UUID Generation Utility in `TaskManager`

**Parent Epic:** Epic 2: UUID Integration and Entity ID Management
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to implement a private utility method within the `TaskManager` class (in `index.ts` or its containing file) for generating version 4 UUIDs. This method will replace the existing `generateId(prefix: string)` method.

**Scope:**

- Add a new private method, for example, `_generateUUID(): string`.
- This method should use a standard UUID library (e.g., `uuid` and its `v4` function) to generate UUIDs.
- The existing `generateId(prefix: string)` method should be removed or refactored to use the new UUID generator if a prefix is still deemed absolutely necessary for some internal logging/debugging (though `improvement-02.md` implies pure UUIDs).

## 2. Technical Purpose

To centralize the generation of unique identifiers, ensuring they are standard, collision-resistant UUIDs (version 4) as required by the new architecture.

## 3. Contextual Relevance

This utility is a prerequisite for subsequent tasks in Epic 2, which involve updating all entity creation logic to use UUIDs. Having a reliable, centralized UUID generator is fundamental for data integrity and linking entities correctly.

## 4. Semantic Meaning

This change marks a concrete step towards adopting industry-standard identification mechanisms, moving away from custom or potentially less robust ID formats. It enhances the system's ability to uniquely identify and relate entities in a distributed or larger-scale environment if ever needed.

## 5. Detailed Implementation Guidance

1.  **Choose and Install UUID Library:**

    - The `improvement-02.md` document, under "Step 2: UUID Generation and Index Management," explicitly imports `v4 as uuidv4` from the `uuid` library: `import { v4 as uuidv4 } from "uuid";`
    - Ensure this library is added as a dependency to the project if it's not already present:
      ```bash
      npm install uuid
      npm install --save-dev @types/uuid # For TypeScript type definitions
      ```
    - Add the import statement to the top of the file containing the `TaskManager` class (e.g., `index.ts`).

2.  **Implement `_generateUUID()` Method:**

    - Inside the `TaskManager` class, add a new private method:
      ```typescript
      private _generateUUID(): string {
        return uuidv4();
      }
      ```

3.  **Refactor/Remove Old `generateId()`:**

    - The existing `TaskManager` (from `docs/ai-onboarding.xml -> index.ts`) has a `private generateId(prefix: string): string` method.
      ```typescript
      // Current generateId for reference
      // private generateId(prefix: string): string {
      //   const timestamp = Date.now().toString(36);
      //   const random = Math.random().toString(36).substring(2, 5);
      //   return `${prefix}_${timestamp}_${random}`;
      // }
      ```
    - Based on `improvement-02.md`'s focus on pure UUIDs, this old method should ideally be **removed**. All entity ID generation should switch to using `_generateUUID()`.
    - If there's a strong, temporary reason to keep prefixed IDs for some very specific internal logging during transition (not recommended for actual entity IDs), `generateId` could be refactored to _prepend_ a prefix to a UUID, but the core ID itself should be the UUID.
    - **Recommendation:** Remove the old `generateId` and replace its usages directly with calls to `_generateUUID()` in subsequent tasks.

4.  **No Direct Usage Yet:** This task is only about creating the utility. Calls to `_generateUUID()` for actual entity ID assignment will be done in Tasks 2.2-2.5.

## 6. Acceptance Criteria

- The `uuid` library (and its types `@types/uuid`) are added as project dependencies.
- The `import { v4 as uuidv4 } from "uuid";` statement is present in the `TaskManager`'s file.
- A new private method `_generateUUID(): string` is implemented within `TaskManager` and uses `uuidv4()` to return a string UUID.
- The old `generateId(prefix: string)` method is removed from `TaskManager`.
- The code is clean, well-formatted, and includes JSDoc comments for the new method.
- The changes do not introduce any TypeScript compilation errors.
- Commit message clearly describes the changes (e.g., `feat(TaskManager): Implement UUID v4 generation utility`).
