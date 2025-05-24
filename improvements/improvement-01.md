# Real-time Project State with Resource Subscriptions

**Status: TBD** (To Be Done)

## Overview

This document outlines how to enhance the Task Manager MCP Server with real-time capabilities using MCP's resource subscription model. This transforms the service from a static tool-based approach to a dynamic, collaborative system with live updates.

## Current vs. Proposed Architecture

### Current: Static Tool-based Approach
```typescript
// One-time fetch, requires polling for updates
client.callTool("read_project", { prd_id: "prd_123" });
```

### Proposed: Live Resource Subscriptions
```typescript
// Continuous updates via subscription
client.subscribe("project://prd_123");
```

## Implementation Guide

### Step 1: Update Server Capabilities

Modify `index.ts` to enable resource support:

```typescript
const server = new Server({
  name: "task-manager",
  version: "0.2.0",
}, {
  capabilities: {
    tools: {},  // Keep existing tools
    resources: {
      subscribe: true,  // Enable subscriptions
      includeContexts: ["project", "dashboard", "metrics"]
    },
  },
});
```

### Step 2: Create Resource Manager

Create a new file `resourceManager.ts`:

```typescript
import { Resource, ResourceTemplate } from "@modelcontextprotocol/sdk/types.js";
import { TaskManager } from "./index.js";

interface Subscription {
  uri: string;
  clientId: string;
  callback: (update: any) => void;
}

export class ResourceManager {
  private subscriptions: Map<string, Set<Subscription>> = new Map();
  private taskManager: TaskManager;
  
  constructor(taskManager: TaskManager) {
    this.taskManager = taskManager;
  }

  // Parse resource URIs
  parseResourceUri(uri: string): { type: string; id?: string; params?: any } {
    const url = new URL(uri);
    const type = url.protocol.slice(0, -1); // Remove ':'
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    return {
      type,
      id: pathParts[0],
      params: Object.fromEntries(url.searchParams)
    };
  }

  // List available resource templates
  async listResourceTemplates(): Promise<ResourceTemplate[]> {
    return [
      {
        uriTemplate: "project://{prd_id}",
        name: "Project State",
        description: "Live project state with PRD, epics, and tasks",
        mimeType: "application/json"
      },
      {
        uriTemplate: "dashboard://assignee/{name}",
        name: "Personal Dashboard",
        description: "Real-time task dashboard for an assignee",
        mimeType: "application/json"
      },
      {
        uriTemplate: "metrics://burndown/{prd_id}",
        name: "Burndown Chart",
        description: "Project burndown metrics",
        mimeType: "application/json"
      },
      {
        uriTemplate: "events://project/{prd_id}",
        name: "Project Event Stream",
        description: "Real-time event log for project changes",
        mimeType: "text/event-stream"
      }
    ];
  }

  // List current resources
  async listResources(): Promise<Resource[]> {
    const data = await this.taskManager.loadData();
    const resources: Resource[] = [];

    // Add resources for each PRD
    for (const prd of data.prds) {
      resources.push({
        uri: `project://${prd.id}`,
        name: `Project: ${prd.title}`,
        description: prd.description,
        mimeType: "application/json"
      });
    }

    // Add dashboard resources for unique assignees
    const assignees = new Set(data.tasks.map(t => t.assignee).filter(Boolean));
    for (const assignee of assignees) {
      resources.push({
        uri: `dashboard://assignee/${assignee}`,
        name: `${assignee}'s Dashboard`,
        mimeType: "application/json"
      });
    }

    return resources;
  }

  // Read a resource
  async readResource(uri: string): Promise<any> {
    const { type, id, params } = this.parseResourceUri(uri);

    switch (type) {
      case "project":
        return await this.getProjectResource(id!);
      
      case "dashboard":
        return await this.getDashboardResource(id!, params);
      
      case "metrics":
        return await this.getMetricsResource(id!);
      
      case "events":
        return await this.getEventStreamResource(id!);
      
      default:
        throw new Error(`Unknown resource type: ${type}`);
    }
  }

  // Get live project state
  private async getProjectResource(prdId: string): Promise<any> {
    const projectData = await this.taskManager.readProject(prdId);
    
    // Enhance with real-time metadata
    return {
      ...projectData,
      _meta: {
        subscriberCount: this.getSubscriberCount(`project://${prdId}`),
        lastUpdated: new Date().toISOString(),
        liveUpdates: true
      },
      // Add computed fields
      statistics: {
        totalEpics: projectData.epics.length,
        totalTasks: projectData.epics.reduce((sum, e) => sum + e.tasks.length, 0),
        completedTasks: projectData.epics.reduce((sum, e) => 
          sum + e.tasks.filter(t => t.status === 'done').length, 0
        ),
        inProgressTasks: projectData.epics.reduce((sum, e) => 
          sum + e.tasks.filter(t => t.status === 'in_progress').length, 0
        )
      }
    };
  }

  // Get personal dashboard
  private async getDashboardResource(assignee: string, params: any): Promise<any> {
    const tasks = await this.taskManager.getTasksByAssignee(assignee);
    const data = await this.taskManager.loadData();
    
    // Group tasks by status
    const tasksByStatus = {
      todo: tasks.filter(t => t.status === 'todo'),
      in_progress: tasks.filter(t => t.status === 'in_progress'),
      review: tasks.filter(t => t.status === 'review'),
      done: tasks.filter(t => t.status === 'done')
    };

    // Get related epics and PRDs
    const epicIds = [...new Set(tasks.map(t => t.epic_id))];
    const epics = data.epics.filter(e => epicIds.includes(e.id));
    const prdIds = [...new Set(epics.map(e => e.prd_id))];
    const prds = data.prds.filter(p => prdIds.includes(p.id));

    return {
      assignee,
      summary: {
        totalTasks: tasks.length,
        todoCount: tasksByStatus.todo.length,
        inProgressCount: tasksByStatus.in_progress.length,
        reviewCount: tasksByStatus.review.length,
        completedToday: tasks.filter(t => 
          t.status === 'done' && 
          new Date(t.updated_at).toDateString() === new Date().toDateString()
        ).length
      },
      tasksByStatus,
      upcomingDeadlines: tasks
        .filter(t => t.due_date && new Date(t.due_date) > new Date())
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
        .slice(0, 5),
      projects: prds.map(prd => ({
        ...prd,
        taskCount: tasks.filter(t => {
          const epic = epics.find(e => e.id === t.epic_id);
          return epic?.prd_id === prd.id;
        }).length
      }))
    };
  }

  // Get metrics
  private async getMetricsResource(prdId: string): Promise<any> {
    const project = await this.taskManager.readProject(prdId);
    const tasks = project.epics.flatMap(e => e.tasks);
    
    // Calculate burndown data
    const startDate = new Date(project.created_at);
    const days = 14; // 2-week sprint
    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return date.toISOString().split('T')[0];
    });

    return {
      burndown: {
        dates,
        totalPoints: tasks.length,
        remaining: tasks.filter(t => t.status !== 'done').length,
        completed: tasks.filter(t => t.status === 'done').length,
        velocity: this.calculateVelocity(tasks, 7)
      },
      epicProgress: project.epics.map(epic => ({
        id: epic.id,
        title: epic.title,
        totalTasks: epic.tasks.length,
        completedTasks: epic.tasks.filter(t => t.status === 'done').length,
        percentComplete: epic.tasks.length > 0 
          ? Math.round((epic.tasks.filter(t => t.status === 'done').length / epic.tasks.length) * 100)
          : 0
      })),
      teamLoad: this.calculateTeamLoad(tasks)
    };
  }

  // Get event stream
  private async getEventStreamResource(prdId: string): Promise<any> {
    // In a production system, you'd store events separately
    // For now, return a mock event stream
    return {
      events: [
        {
          id: "evt_1",
          timestamp: new Date().toISOString(),
          type: "task.created",
          actor: "system",
          data: {
            taskId: "task_123",
            title: "Example task"
          }
        }
      ],
      _meta: {
        streaming: true,
        format: "json-lines"
      }
    };
  }

  // Subscribe to resource updates
  async subscribe(uri: string, clientId: string, callback: (update: any) => void): Promise<void> {
    if (!this.subscriptions.has(uri)) {
      this.subscriptions.set(uri, new Set());
    }
    
    this.subscriptions.get(uri)!.add({ uri, clientId, callback });
    
    // Send initial state
    const initialData = await this.readResource(uri);
    callback({
      type: "full",
      data: initialData,
      timestamp: new Date().toISOString()
    });
  }

  // Unsubscribe from resource
  async unsubscribe(uri: string, clientId: string): Promise<void> {
    const subs = this.subscriptions.get(uri);
    if (subs) {
      subs.forEach(sub => {
        if (sub.clientId === clientId) {
          subs.delete(sub);
        }
      });
    }
  }

  // Notify subscribers of changes
  async notifySubscribers(uri: string, update: any): Promise<void> {
    const subs = this.subscriptions.get(uri);
    if (subs) {
      subs.forEach(sub => {
        sub.callback(update);
      });
    }
  }

  // Helper methods
  private getSubscriberCount(uri: string): number {
    return this.subscriptions.get(uri)?.size || 0;
  }

  private calculateVelocity(tasks: any[], days: number): number {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    const completedRecently = tasks.filter(t => 
      t.status === 'done' && 
      new Date(t.updated_at) >= since
    );
    
    return Math.round(completedRecently.length / days * 7); // Weekly velocity
  }

  private calculateTeamLoad(tasks: any[]): any {
    const load: Record<string, number> = {};
    
    tasks
      .filter(t => t.assignee && t.status !== 'done')
      .forEach(t => {
        load[t.assignee] = (load[t.assignee] || 0) + 1;
      });
    
    return Object.entries(load)
      .map(([assignee, count]) => ({ assignee, taskCount: count }))
      .sort((a, b) => b.taskCount - a.taskCount);
  }
}
```

### Step 3: Enhance TaskManager with Change Notifications

Update the TaskManager class to emit change events:

```typescript
// Add to TaskManager class
class TaskManager {
  private resourceManager?: ResourceManager;
  
  setResourceManager(rm: ResourceManager) {
    this.resourceManager = rm;
  }

  // Modify existing methods to notify subscribers
  async createPRD(title: string, description: string, owner: string): Promise<PRD> {
    // ... existing implementation ...
    
    // Notify subscribers of new PRD
    await this.notifyChange('created', 'prd', prd);
    
    return prd;
  }

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'epic_id' | 'created_at'>>): Promise<Task> {
    // ... get old task state ...
    const oldTask = { ...data.tasks[taskIndex] };
    
    // ... update task ...
    
    // Notify about task update
    await this.notifyChange('updated', 'task', newTask, oldTask);
    
    return newTask;
  }

  // Add notification method
  private async notifyChange(action: string, entityType: string, entity: any, oldEntity?: any) {
    if (!this.resourceManager) return;
    
    // Determine affected resources
    const affectedUris: string[] = [];
    
    if (entityType === 'prd') {
      affectedUris.push(`project://${entity.id}`);
      affectedUris.push(`events://project/${entity.id}`);
    } else if (entityType === 'epic') {
      affectedUris.push(`project://${entity.prd_id}`);
      affectedUris.push(`events://project/${entity.prd_id}`);
      affectedUris.push(`metrics://burndown/${entity.prd_id}`);
    } else if (entityType === 'task') {
      // Find the PRD for this task
      const data = await this.loadData();
      const epic = data.epics.find(e => e.id === entity.epic_id);
      if (epic) {
        affectedUris.push(`project://${epic.prd_id}`);
        affectedUris.push(`events://project/${epic.prd_id}`);
        affectedUris.push(`metrics://burndown/${epic.prd_id}`);
      }
      
      // Notify assignee dashboards
      if (entity.assignee) {
        affectedUris.push(`dashboard://assignee/${entity.assignee}`);
      }
      if (oldEntity?.assignee && oldEntity.assignee !== entity.assignee) {
        affectedUris.push(`dashboard://assignee/${oldEntity.assignee}`);
      }
    }
    
    // Send updates to all affected resources
    for (const uri of affectedUris) {
      const update = {
        type: action,
        entityType,
        entity,
        oldEntity,
        timestamp: new Date().toISOString(),
        changes: this.computeChanges(oldEntity, entity)
      };
      
      await this.resourceManager.notifySubscribers(uri, update);
    }
  }

  private computeChanges(oldEntity: any, newEntity: any): any {
    if (!oldEntity) return null;
    
    const changes: any = {};
    for (const key in newEntity) {
      if (oldEntity[key] !== newEntity[key] && key !== 'updated_at') {
        changes[key] = {
          from: oldEntity[key],
          to: newEntity[key]
        };
      }
    }
    return Object.keys(changes).length > 0 ? changes : null;
  }
}
```

### Step 4: Wire Up Resource Handlers

Add these handlers to your server setup in `index.ts`:

```typescript
import {
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
  SubscribeRequestSchema,
  UnsubscribeRequestSchema,
  ResourceUpdatedNotificationSchema
} from "@modelcontextprotocol/sdk/types.js";
import { ResourceManager } from "./resourceManager.js";

// Create resource manager
const resourceManager = new ResourceManager(taskManager);
taskManager.setResourceManager(resourceManager);

// Handle resource listing
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const resources = await resourceManager.listResources();
  return { resources };
});

// Handle resource template listing
server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
  const resourceTemplates = await resourceManager.listResourceTemplates();
  return { resourceTemplates };
});

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  const contents = await resourceManager.readResource(uri);
  
  return {
    contents: [{
      uri,
      mimeType: "application/json",
      text: JSON.stringify(contents, null, 2)
    }]
  };
});

// Handle subscriptions
const activeSubscriptions = new Map<string, Set<string>>();

server.setRequestHandler(SubscribeRequestSchema, async (request, { meta }) => {
  const { uri } = request.params;
  const clientId = meta.clientId || 'default';
  
  // Track subscription
  if (!activeSubscriptions.has(clientId)) {
    activeSubscriptions.set(clientId, new Set());
  }
  activeSubscriptions.get(clientId)!.add(uri);
  
  await resourceManager.subscribe(uri, clientId, async (update) => {
    // Send resource update notification
    await server.sendNotification({
      method: "notifications/resources/updated",
      params: { uri, update }
    });
  });
  
  return {};
});

// Handle unsubscribe
server.setRequestHandler(UnsubscribeRequestSchema, async (request, { meta }) => {
  const { uri } = request.params;
  const clientId = meta.clientId || 'default';
  
  await resourceManager.unsubscribe(uri, clientId);
  
  // Clean up tracking
  activeSubscriptions.get(clientId)?.delete(uri);
  
  return {};
});

// Clean up subscriptions on disconnect
server.onClientDisconnect = async (clientId: string) => {
  const subs = activeSubscriptions.get(clientId);
  if (subs) {
    for (const uri of subs) {
      await resourceManager.unsubscribe(uri, clientId);
    }
    activeSubscriptions.delete(clientId);
  }
};
```

## Client Usage Examples

### Basic Subscription

```typescript
// Subscribe to project updates
await client.subscribe({ uri: "project://prd_123" });

// Handle real-time updates
client.setNotificationHandler(ResourceUpdatedNotificationSchema, (notification) => {
  const { uri, update } = notification.params;
  
  console.log(`Resource ${uri} updated:`, update);
  
  if (update.type === 'updated' && update.entityType === 'task') {
    console.log(`Task ${update.entity.title} changed:`, update.changes);
  }
});
```

### Dashboard Subscription

```typescript
// Subscribe to personal dashboard
await client.subscribe({ uri: "dashboard://assignee/john_doe" });

// Dashboard automatically updates when:
// - New tasks are assigned to John
// - John's tasks change status  
// - Tasks are reassigned away from John
```

### Metrics Subscription

```typescript
// Subscribe to burndown metrics
await client.subscribe({ uri: "metrics://burndown/prd_123" });

// Receive updates whenever tasks complete or project velocity changes
```

## Advanced Features

### 1. Streaming Event Log

The event stream resource (`events://project/{prd_id}`) can provide a real-time audit trail:

```typescript
// Subscribe to project events
await client.subscribe({ uri: "events://project/prd_123" });

// Receive structured events
{
  "type": "task.status_changed",
  "timestamp": "2024-01-15T10:30:00Z",
  "actor": "jane_smith",
  "data": {
    "taskId": "task_456",
    "from": "todo",
    "to": "in_progress"
  }
}
```

### 2. Computed Metrics

Resources can include computed fields that update automatically:

```typescript
// Project resource includes live statistics
{
  "statistics": {
    "totalTasks": 42,
    "completedTasks": 15,
    "inProgressTasks": 8,
    "velocity": 5.2,  // tasks/week
    "estimatedCompletion": "2024-02-15"
  }
}
```

### 3. Multi-Resource Subscriptions

Clients can subscribe to multiple resources for comprehensive views:

```typescript
// Subscribe to multiple resources
await Promise.all([
  client.subscribe({ uri: "project://prd_123" }),
  client.subscribe({ uri: "dashboard://assignee/john_doe" }),
  client.subscribe({ uri: "metrics://burndown/prd_123" })
]);
```

## Benefits

1. **Real-time Collaboration**: Multiple agents and users see updates instantly
2. **Reduced Network Traffic**: No polling required; updates pushed only when changes occur
3. **Resource-Centric Design**: Intuitive URI scheme for accessing different data views
4. **Selective Updates**: Clients only receive notifications for subscribed resources
5. **Scalability**: Easy to add new resource types without modifying existing code
6. **Audit Trail**: Event stream provides complete history of changes

## Migration Path

1. **Phase 1**: Implement ResourceManager without breaking existing tools
2. **Phase 2**: Add change notifications to TaskManager methods
3. **Phase 3**: Deploy with both tools and resources enabled
4. **Phase 4**: Gradually migrate clients to use subscriptions
5. **Phase 5**: Deprecate polling-based tools in favor of resources

## Performance Considerations

- **Memory**: Each subscription maintains state; implement cleanup for inactive clients
- **Storage**: Consider storing events separately for large projects
- **Throttling**: Implement update batching for high-frequency changes
- **Caching**: Cache computed metrics and invalidate on relevant changes

## Security Considerations

- **Access Control**: Validate permissions before allowing subscriptions
- **Rate Limiting**: Limit subscription count per client
- **Data Isolation**: Ensure clients only receive updates for authorized resources
- **Audit Logging**: Track all subscription activity for compliance

This enhancement transforms the Task Manager from a simple CRUD service into a sophisticated real-time collaboration platform, fully leveraging MCP's advanced capabilities.