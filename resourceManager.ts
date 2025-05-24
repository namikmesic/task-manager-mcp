import type { Resource, ResourceTemplate } from "@modelcontextprotocol/sdk/types.js";
import type { TaskManager } from "./index.js";
import type {
  Subscription,
  ResourceUpdate,
  ProjectResource,
  DashboardResource,
  MetricsResource,
  EventStreamResource,
  Task,
} from "./types.js";

export class ResourceManager {
  private subscriptions: Map<string, Set<Subscription>> = new Map();
  private taskManager: TaskManager;

  constructor(taskManager: TaskManager) {
    this.taskManager = taskManager;
  }

  // Parse resource URIs
  parseResourceUri(uri: string): { type: string; id?: string; params?: Record<string, string> } {
    const url = new URL(uri);
    const type = url.protocol.slice(0, -1); // Remove ':'
    const pathParts = url.pathname.split("/").filter(Boolean);

    return {
      type,
      id: pathParts[0],
      params: Object.fromEntries(url.searchParams),
    };
  }

  // List available resource templates
  listResourceTemplates(): ResourceTemplate[] {
    return [
      {
        uriTemplate: "project://{prd_id}",
        name: "Project State",
        description: "Live project state with PRD, epics, and tasks",
        mimeType: "application/json",
      },
      {
        uriTemplate: "dashboard://assignee/{name}",
        name: "Personal Dashboard",
        description: "Real-time task dashboard for an assignee",
        mimeType: "application/json",
      },
      {
        uriTemplate: "metrics://burndown/{prd_id}",
        name: "Burndown Chart",
        description: "Project burndown metrics",
        mimeType: "application/json",
      },
      {
        uriTemplate: "events://project/{prd_id}",
        name: "Project Event Stream",
        description: "Real-time event log for project changes",
        mimeType: "text/event-stream",
      },
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
        mimeType: "application/json",
      });
    }

    // Add dashboard resources for unique assignees
    const assignees = new Set(
      data.tasks.map((t) => t.assignee).filter((a): a is string => Boolean(a))
    );
    for (const assignee of assignees) {
      resources.push({
        uri: `dashboard://assignee/${assignee}`,
        name: `${assignee}'s Dashboard`,
        mimeType: "application/json",
      });
    }

    return resources;
  }

  // Read a resource
  async readResource(
    uri: string
  ): Promise<ProjectResource | DashboardResource | MetricsResource | EventStreamResource> {
    const { type, id, params } = this.parseResourceUri(uri);

    switch (type) {
      case "project":
        return await this.getProjectResource(id || "");

      case "dashboard":
        return await this.getDashboardResource(id || "", params || {});

      case "metrics":
        return await this.getMetricsResource(id || "");

      case "events":
        return this.getEventStreamResource(id || "");

      default:
        throw new Error(`Unknown resource type: ${type}`);
    }
  }

  // Get live project state
  private async getProjectResource(prdId: string): Promise<ProjectResource> {
    const projectData = await this.taskManager.readProject(prdId);

    // Ensure we have a single project, not an array
    if (Array.isArray(projectData)) {
      throw new Error(`Expected single project for ID ${prdId}, got array`);
    }

    // Enhance with real-time metadata
    return {
      ...projectData,
      _meta: {
        subscriberCount: this.getSubscriberCount(`project://${prdId}`),
        lastUpdated: new Date().toISOString(),
        liveUpdates: true,
      },
      // Add computed fields
      statistics: {
        totalEpics: projectData.epics.length,
        totalTasks: projectData.epics.reduce((sum, e) => sum + e.tasks.length, 0),
        completedTasks: projectData.epics.reduce(
          (sum, e) => sum + e.tasks.filter((t) => t.status === "done").length,
          0
        ),
        inProgressTasks: projectData.epics.reduce(
          (sum, e) => sum + e.tasks.filter((t) => t.status === "in_progress").length,
          0
        ),
      },
    };
  }

  /**
   * Get personal dashboard with optional filtering
   * @param assignee - The assignee to get dashboard for
   * @param params - Query parameters:
   *   - showCompleted: "false" to hide completed tasks
   *   - days: number of days to look back (e.g., "7" for last week)
   *   - priority: filter by priority ("low", "medium", "high")
   * @example
   *   // Get dashboard without completed tasks from last 7 days
   *   getDashboardResource("john_doe", { showCompleted: "false", days: "7" })
   */
  private async getDashboardResource(
    assignee: string,
    params: Record<string, string>
  ): Promise<DashboardResource> {
    let tasks = await this.taskManager.getTasksByAssignee(assignee);
    const data = await this.taskManager.loadData();

    // Apply filters based on params
    if (params.showCompleted === "false") {
      tasks = tasks.filter((t) => t.status !== "done");
    }

    if (params.days) {
      const daysAgo = parseInt(params.days, 10);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      tasks = tasks.filter((t) => new Date(t.updated_at) >= cutoffDate);
    }

    if (params.priority) {
      tasks = tasks.filter((t) => t.priority === params.priority);
    }

    // Group tasks by status
    const tasksByStatus = {
      todo: tasks.filter((t) => t.status === "todo"),
      in_progress: tasks.filter((t) => t.status === "in_progress"),
      review: tasks.filter((t) => t.status === "review"),
      done: tasks.filter((t) => t.status === "done"),
    };

    // Get related epics and PRDs
    const epicIds = [...new Set(tasks.map((t) => t.epic_id))];
    const epics = data.epics.filter((e) => epicIds.includes(e.id));
    const prdIds = [...new Set(epics.map((e) => e.prd_id))];
    const prds = data.prds.filter((p) => prdIds.includes(p.id));

    return {
      assignee,
      summary: {
        totalTasks: tasks.length,
        todoCount: tasksByStatus.todo.length,
        inProgressCount: tasksByStatus.in_progress.length,
        reviewCount: tasksByStatus.review.length,
        completedToday: tasks.filter(
          (t) =>
            t.status === "done" &&
            new Date(t.updated_at).toDateString() === new Date().toDateString()
        ).length,
      },
      tasksByStatus,
      upcomingDeadlines: tasks
        .filter((t) => t.due_date && new Date(t.due_date) > new Date())
        .sort((a, b) => {
          if (!a.due_date || !b.due_date) return 0;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        })
        .slice(0, 5),
      projects: prds.map((prd) => ({
        ...prd,
        taskCount: tasks.filter((t) => {
          const epic = epics.find((e) => e.id === t.epic_id);
          return epic?.prd_id === prd.id;
        }).length,
      })),
    };
  }

  // Get metrics
  private async getMetricsResource(prdId: string): Promise<MetricsResource> {
    const project = await this.taskManager.readProject(prdId);

    // Ensure we have a single project, not an array
    if (Array.isArray(project)) {
      throw new Error(`Expected single project for ID ${prdId}, got array`);
    }

    const tasks = project.epics.flatMap((e) => e.tasks);

    // Calculate burndown data
    const startDate = new Date(project.created_at);
    const days = 14; // 2-week sprint
    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return date.toISOString().split("T")[0];
    });

    return {
      burndown: {
        dates,
        totalPoints: tasks.length,
        remaining: tasks.filter((t) => t.status !== "done").length,
        completed: tasks.filter((t) => t.status === "done").length,
        velocity: this.calculateVelocity(tasks, 7),
      },
      epicProgress: project.epics.map((epic) => ({
        id: epic.id,
        title: epic.title,
        totalTasks: epic.tasks.length,
        completedTasks: epic.tasks.filter((t) => t.status === "done").length,
        percentComplete:
          epic.tasks.length > 0
            ? Math.round(
                (epic.tasks.filter((t) => t.status === "done").length / epic.tasks.length) * 100
              )
            : 0,
      })),
      teamLoad: this.calculateTeamLoad(tasks),
    };
  }

  // Get event stream
  private getEventStreamResource(_prdId: string): EventStreamResource {
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
            title: "Example task",
          },
        },
      ],
      _meta: {
        streaming: true,
        format: "json-lines",
      },
    };
  }

  // Subscribe to resource updates
  async subscribe(
    uri: string,
    clientId: string,
    callback: (update: ResourceUpdate) => void
  ): Promise<void> {
    if (!this.subscriptions.has(uri)) {
      this.subscriptions.set(uri, new Set());
    }

    const subs = this.subscriptions.get(uri);
    if (subs) {
      subs.add({ uri, clientId, callback });
    }

    // Send initial state
    const initialData = await this.readResource(uri);
    callback({
      type: "full",
      data: initialData,
      timestamp: new Date().toISOString(),
    });
  }

  // Unsubscribe from resource
  unsubscribe(uri: string, clientId: string): void {
    const subs = this.subscriptions.get(uri);
    if (subs) {
      subs.forEach((sub) => {
        if (sub.clientId === clientId) {
          subs.delete(sub);
        }
      });
    }
  }

  // Notify subscribers of changes
  notifySubscribers(uri: string, update: ResourceUpdate): void {
    const subs = this.subscriptions.get(uri);
    if (subs) {
      subs.forEach((sub) => {
        sub.callback(update);
      });
    }
  }

  // Helper methods
  private getSubscriberCount(uri: string): number {
    return this.subscriptions.get(uri)?.size || 0;
  }

  private calculateVelocity(tasks: Task[], days: number): number {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const completedRecently = tasks.filter(
      (t) => t.status === "done" && new Date(t.updated_at) >= since
    );

    return Math.round((completedRecently.length / days) * 7); // Weekly velocity
  }

  private calculateTeamLoad(tasks: Task[]): Array<{ assignee: string; taskCount: number }> {
    const load: Record<string, number> = {};

    tasks
      .filter((t) => t.assignee && t.status !== "done")
      .forEach((t) => {
        if (t.assignee) {
          load[t.assignee] = (load[t.assignee] || 0) + 1;
        }
      });

    return Object.entries(load)
      .map(([assignee, count]) => ({ assignee, taskCount: count }))
      .sort((a, b) => b.taskCount - a.taskCount);
  }
}
