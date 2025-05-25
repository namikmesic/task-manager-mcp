# Task 4.1: Implement `Document` CRUD methods in `TaskManager`

**Parent Epic:** Epic 4: Document Primitive Implementation
**Status:** To Do

---

## 1. Objective & Scope

The objective of this task is to implement core Create, Read (by ID), Update, and Delete (CRUD) methods for `Document` entities within the `TaskManager` class. These methods will form the internal API for managing documents.

**Scope:**

- **`createDocument(docData: Omit<Document, 'id'>): Promise<Document>`**: Takes data for a new document (all fields except `id`), generates a UUID for `id` (using `_generateUUID()` from Epic 2), adds the new document to `ProjectData.documents`, saves data, and returns the created document.
- **`getDocument(id: string): Promise<Document | undefined>`**: Takes a document `id` (UUID), loads data, and returns the document if found, otherwise `undefined`.
- **`updateDocument(id: string, updates: Partial<Omit<Document, 'id' | 'entity_id' | 'entity_type'>>): Promise<Document | undefined>`**: Takes a document `id` and partial updates. It should _not_ allow changing `id`, `entity_id`, or `entity_type` (these define its core identity and attachment). Updates other fields (title, content, type, author), saves data, and returns the updated document or `undefined` if not found.
- **`deleteDocument(id: string): Promise<boolean>`**: Takes a document `id`, removes it from `ProjectData.documents`, saves data, and returns `true` if deleted, `false` if not found.

## 2. Technical Purpose

To establish the fundamental data management operations for `Document` entities within the `TaskManager`. This enables the system to create, retrieve, modify, and remove documents.

## 3. Contextual Relevance

These CRUD methods are the building blocks for all higher-level document-related functionalities, including the MCP tools for document management (Tasks 4.3-4.7) and linking documents to other entities.

## 4. Semantic Meaning

Implementing these methods makes `Document` a fully managed entity within the system, capable of persisting project-related information independently and being associated with various parts of a project.

## 5. Detailed Implementation Guidance

1.  **Prerequisites:**

    - `Document` interface defined in `types.ts` (Epic 1, Task 1.1).
    - `_generateUUID()` method available in `TaskManager` (Epic 2, Task 2.1).
    - `loadData()` and `saveData()` methods handle `ProjectData.documents` array (Epic 1, Tasks 1.3, 1.4).

2.  **Implement `createDocument()`:**

    ```typescript
    // In TaskManager class
    // async createDocument(docData: Omit<Document, 'id'>): Promise<Document> {
    //   const data = await this.loadData();
    //   const newDocument: Document = {
    //     id: this._generateUUID(), // From Epic 2
    //     ...docData,
    //   };
    //   data.documents.push(newDocument);
    //   await this.saveData(data);
    //   return newDocument;
    // }
    ```

3.  **Implement `getDocument()`:**

    ```typescript
    // In TaskManager class
    // async getDocument(id: string): Promise<Document | undefined> {
    //   const data = await this.loadData();
    //   return data.documents.find(doc => doc.id === id);
    // }
    ```

4.  **Implement `updateDocument()`:**

    ```typescript
    // In TaskManager class
    // async updateDocument(id: string, updates: Partial<Omit<Document, 'id' | 'entity_id' | 'entity_type'>>): Promise<Document | undefined> {
    //   const data = await this.loadData();
    //   const docIndex = data.documents.findIndex(doc => doc.id === id);
    //   if (docIndex === -1) {
    //     return undefined;
    //   }
    //   // Ensure id, entity_id, and entity_type are not in updates to prevent their modification.
    //   // The Omit in the type signature helps, but runtime check/delete could be added if necessary.
    //   // delete (updates as Partial<Document>).id;
    //   // delete (updates as Partial<Document>).entity_id;
    //   // delete (updates as Partial<Document>).entity_type;

    //   data.documents[docIndex] = { ...data.documents[docIndex], ...updates };
    //   await this.saveData(data);
    //   return data.documents[docIndex];
    // }
    ```

    - Consider explicitly excluding `id`, `entity_id`, `entity_type` from `updates` if there's a concern they might be passed, though the type `Partial<Omit<...>>` should prevent this at compile time for TypeScript users.

5.  **Implement `deleteDocument()`:**
    ```typescript
    // In TaskManager class
    // async deleteDocument(id: string): Promise<boolean> {
    //   const data = await this.loadData();
    //   const initialLength = data.documents.length;
    //   data.documents = data.documents.filter(doc => doc.id !== id);
    //   if (data.documents.length < initialLength) {
    //     await this.saveData(data);
    //     return true;
    //   }
    //   return false;
    // }
    ```

## 6. Acceptance Criteria

- `TaskManager.createDocument()` correctly creates a new document with a UUID, adds it to `ProjectData.documents`, persists it, and returns the new document.
- `TaskManager.getDocument()` correctly retrieves a document by its ID or returns `undefined`.
- `TaskManager.updateDocument()` correctly updates modifiable fields of an existing document, persists changes, and returns the updated document. It prevents changes to `id`, `entity_id`, and `entity_type`.
- `TaskManager.deleteDocument()` correctly removes a document by ID, persists the change, and returns `true` on success, `false` if not found.
- All methods are `async` and correctly use `loadData()` and `saveData()`.
- Code is type-safe, adheres to project standards, and includes JSDoc comments.
- Commit message clearly describes the changes (e.g., `feat(TaskManager): Implement CRUD methods for Documents`).
