# Task 8.1: Identify and Implement Specific `sendResourceUpdated` Scenarios

**Parent Epic:** Epic 8: Advanced MCP Protocol Features (Optional Stretch)
**Status:** To Do
**Type:** Optional Enhancement

---

## 1. Objective & Scope

The objective of this task is to identify specific scenarios where sending a `notifications/resources/updated` notification would be beneficial and, if deemed valuable, implement the logic to trigger it. This leverages the `server.sendResourceUpdated({ uri: string })` method from the MCP SDK.

**Scope:**

- **Analysis:** Review the new architecture and identify key events that modify resource-like data (especially `Document` content) where clients might benefit from a specific notification that a particular resource URI has changed (beyond a general `list_changed`).
  - Example: When a `Document`'s `content` is updated via `TaskManager.updateDocument()`.
- **Implementation (Conditional):** If a clear, high-value scenario is identified:
  - Modify the relevant `TaskManager` method(s) to call `this.mcpServer.server.sendResourceUpdated({ uri: relevantDocumentUri })` after the data has been successfully saved.
  - Ensure the URI provided matches a URI that clients can use to `readResource` (e.g., a URI that would be listed by `list_resources` or resolvable by a `ResourceTemplate`).

## 2. Technical Purpose

To enable more granular real-time updates to clients about changes to specific resources, allowing them to refresh only the necessary data instead of re-fetching entire lists or larger data structures.

## 3. Contextual Relevance

This goes beyond the automatic `list_changed` notifications provided by `McpServer` when resources are added/removed/updated via its helper methods. `sendResourceUpdated` is for when the _content_ or state of an _existing, identifiable resource URI_ changes in a way that clients subscribed to that URI (or interested in it) should know.

## 4. Semantic Meaning

Implementing targeted resource update notifications enhances the system's responsiveness and efficiency for clients that display or react to specific pieces of information, making the UI or agent behavior more dynamic.

## 5. Detailed Implementation Guidance

1.  **Identify Scenarios:**

    - The most prominent candidate is when a `Document` entity's `content` (or `title`, `type`, `author`) is modified via `TaskManager.updateDocument()`.
    - If `Project`, `Epic`, or `Task` entities were themselves exposed as readable resources via `mcpServer.resource()`, then updates to their fields could also trigger this notification for their specific URIs.

2.  **Prerequisites for Implementation:**

    - The `McpServer` instance must be accessible from within the `TaskManager` methods that will trigger these notifications (e.g., `this.mcpServer.server.sendResourceUpdated(...)`). This might require passing the `McpServer` instance to `TaskManager` or having a way for `TaskManager` to access it.
    - The resources being updated must have stable, known URIs that clients can use with `readResource`.

3.  **Implementation Example (for Document Update):**

    ```typescript
    // In TaskManager.updateDocument(id: string, updates: ...): Promise<Document | undefined>
    // async updateDocument(id: string, updates: ...): Promise<Document | undefined> {
    //   // ... existing logic to find and update the document ...
    //   if (updatedDocument) {
    //     await this.saveData(data);
    //
    //     // Construct the URI for this document. This depends on how document URIs are defined.
    //     // For example, if documents are exposed via a ResourceTemplate like "documents://{docId}"
    //     const documentUri = `documents://${updatedDocument.id}`; // Example URI construction
    //
    //     // Send notification if the server is connected
    //     if (this.mcpServer?.server.transport) { // Check if McpServer and its underlying server are connected
    //       this.mcpServer.server.sendResourceUpdated({ uri: documentUri }).catch(err => {
    //         console.error("Failed to send resource updated notification:", err);
    //       });
    //     }
    //     return updatedDocument;
    //   }
    //   return undefined;
    // }
    ```

    - **URI Construction:** The main challenge is determining the correct URI for the updated document. If `Document` entities are not directly exposed as MCP resources with their own URIs (e.g., if they are only ever fetched as part of `ProjectWithDetails` or `OnboardResponse`), then `sendResourceUpdated` might be less meaningful for them directly. This feature is most effective for resources that clients can individually fetch or subscribe to via `resources/read` or `resources/subscribe`.
    - If `Document` entities are intended to be individually addressable resources, a `mcpServer.resource()` definition for them (e.g., using a template like `docs/{docId}`) would establish their URIs.

4.  **Client-Side Subscription:** For `sendResourceUpdated` to be most effective, clients would typically use `resources/subscribe` (if the server supports it via `ServerCapabilities.resources.subscribe`) to register interest in specific URIs. The SDK's `Server` class does not automatically manage subscriptions; `sendResourceUpdated` sends to all connected clients that support the notification.

## 6. Acceptance Criteria

- (If implemented) Specific scenarios for using `sendResourceUpdated` are identified and justified.
- The relevant `TaskManager` methods are modified to call `mcpServer.server.sendResourceUpdated({ uri: ... })` upon successful data modification.
- The URI provided in the notification correctly identifies the resource that was updated.
- The notification is only sent if the server is connected to a transport.
- Error handling is in place for the notification sending process.
- Commit message clearly describes the changes (e.g., `feat(Notifications): Implement sendResourceUpdated for document modifications`).
