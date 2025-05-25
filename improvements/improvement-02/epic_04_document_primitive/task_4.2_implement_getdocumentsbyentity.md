# Task 4.2: Implement `TaskManager.getDocumentsByEntity()`

**Parent Epic:** Epic 4: Document Primitive Implementation
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to implement a `TaskManager.getDocumentsByEntity()` method. This method will retrieve all `Document` entities that are attached to a specified parent entity (Project, Epic, or Task) by matching `entity_id` and `entity_type`.

**Scope:**

- Define and implement `async getDocumentsByEntity(entityId: string, entityType: "project" | "epic" | "task"): Promise<Document[]>` in the `TaskManager` class.
- The method will take the `entityId` (UUID of the parent) and `entityType` as parameters.
- It should load data and filter the `ProjectData.documents` array to find all documents where `doc.entity_id === entityId` and `doc.entity_type === entityType`.
- It should return an array of matching `Document` objects. If no documents match, it returns an empty array.

## 2. Technical Purpose

To provide a dedicated way to retrieve all documentation and associated information for any given core entity in the system. This is essential for providing context to users and agents.

## 3. Contextual Relevance

This method will be used by various parts of the system, particularly the `onboard` tool (Epic 7) and potentially by tools that list or display entity details (e.g., an enhanced `read_project`). It's a key part of making the `Document` primitive useful.

## 4. Semantic Meaning

This function makes the linkage between documents and other entities queryable, allowing the system to aggregate and present all relevant information associated with a project, epic, or task.

## 5. Detailed Implementation Guidance

1.  **Prerequisites:**

    - `Document` interface defined in `types.ts`.
    - `loadData()` correctly loads `ProjectData.documents`.

2.  **Implement `getDocumentsByEntity()`:**

    ```typescript
    // In TaskManager class
    // async getDocumentsByEntity(
    //   entityId: string,
    //   entityType: "project" | "epic" | "task"
    // ): Promise<Document[]> {
    //   const data = await this.loadData();
    //   return data.documents.filter(
    //     (doc) => doc.entity_id === entityId && doc.entity_type === entityType
    //   );
    // }
    ```

3.  **Considerations:**
    - The method should simply return an empty array if no matching documents are found; no error needs to be thrown for this case.
    - Ensure type safety with the `entityType` literal union.

## 6. Acceptance Criteria

- `TaskManager.getDocumentsByEntity()` method is implemented in `index.ts` (or its containing file).
- The method accepts `entityId` (string) and `entityType` (`"project" | "epic" | "task"`) as parameters.
- It correctly filters `ProjectData.documents` based on both `entityId` and `entityType`.
- It returns an array of `Document` objects that match the criteria.
- It returns an empty array if no documents are associated with the specified entity.
- The method is `async` and uses `loadData()` correctly.
- The code is clean, type-safe, and includes JSDoc comments.
- Commit message clearly describes the changes (e.g., `feat(TaskManager): Implement getDocumentsByEntity method`).
