// Properly typed interfaces for the project

export interface PRD {
  id: string;
  title: string;
  description: string;
  status: "draft" | "approved" | "in_progress" | "completed";
  owner: string;
  created_at: string;
  updated_at: string;
}

export interface Epic {
  id: string;
  prd_id: string;
  title: string;
  description: string;
  status: "not_started" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  created_at: string;
}

export interface Task {
  id: string;
  epic_id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  assignee?: string;
  due_date?: string;
  dependencies: string[];
  notes: string[];
  created_at: string;
  updated_at: string;
}

export type DataItem =
  | ({ type: "prd" } & PRD)
  | ({ type: "epic" } & Epic)
  | ({ type: "task" } & Task);

export interface ProjectData {
  prds: PRD[];
  epics: Epic[];
  tasks: Task[];
}

// Resource-related types
export interface ResourceUpdate {
  type: string;
  data?: unknown;
  entityType?: string;
  entity?: PRD | Epic | Task;
  oldEntity?: PRD | Epic | Task;
  timestamp?: string;
  changes?: Record<string, { from: unknown; to: unknown }> | null;
}

export interface Subscription {
  uri: string;
  clientId: string;
  callback: (update: ResourceUpdate) => void;
}

export interface ProjectWithEpics extends PRD {
  epics: Array<Epic & { tasks: Task[] }>;
}

export interface ProjectResource extends ProjectWithEpics {
  _meta: {
    subscriberCount: number;
    lastUpdated: string;
    liveUpdates: boolean;
  };
  statistics: {
    totalEpics: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
  };
}

export interface DashboardResource {
  assignee: string;
  summary: {
    totalTasks: number;
    todoCount: number;
    inProgressCount: number;
    reviewCount: number;
    completedToday: number;
  };
  tasksByStatus: {
    todo: Task[];
    in_progress: Task[];
    review: Task[];
    done: Task[];
  };
  upcomingDeadlines: Task[];
  projects: Array<PRD & { taskCount: number }>;
}

export interface MetricsResource {
  burndown: {
    dates: string[];
    totalPoints: number;
    remaining: number;
    completed: number;
    velocity: number;
  };
  epicProgress: Array<{
    id: string;
    title: string;
    totalTasks: number;
    completedTasks: number;
    percentComplete: number;
  }>;
  teamLoad: Array<{
    assignee: string;
    taskCount: number;
  }>;
}

export interface EventStreamResource {
  events: Array<{
    id: string;
    timestamp: string;
    type: string;
    actor: string;
    data: Record<string, unknown>;
  }>;
  _meta: {
    streaming: boolean;
    format: string;
  };
}

// Request parameter types
export interface CreatePRDParams {
  title: string;
  description: string;
  owner: string;
}

export interface UpdatePRDParams
  extends Partial<Omit<PRD, "id" | "created_at">> {
  id: string;
}

export interface CreateEpicParams {
  prd_id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
}

export interface UpdateEpicParams
  extends Partial<Omit<Epic, "id" | "prd_id" | "created_at">> {
  id: string;
}

export interface CreateTaskParams {
  epic_id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  assignee?: string;
  due_date?: string;
  dependencies?: string[];
}

export interface UpdateTaskParams
  extends Partial<Omit<Task, "id" | "epic_id" | "created_at">> {
  id: string;
}

// Error types
export interface ErrorWithCode extends Error {
  code?: string;
}

// Type guards
export function isErrorWithCode(error: unknown): error is ErrorWithCode {
  return error instanceof Error && "code" in error;
}

export function isPRD(item: DataItem): item is { type: "prd" } & PRD {
  return item.type === "prd";
}

export function isEpic(item: DataItem): item is { type: "epic" } & Epic {
  return item.type === "epic";
}

export function isTask(item: DataItem): item is { type: "task" } & Task {
  return item.type === "task";
}
