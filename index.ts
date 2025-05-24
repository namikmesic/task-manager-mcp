#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define data file path using environment variable with fallback
const defaultDataPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'tasks.json');
const TASK_FILE_PATH = process.env.TASK_FILE_PATH
  ? path.isAbsolute(process.env.TASK_FILE_PATH)
    ? process.env.TASK_FILE_PATH
    : path.join(path.dirname(fileURLToPath(import.meta.url)), process.env.TASK_FILE_PATH)
  : defaultDataPath;

// Data structures
interface PRD {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'approved' | 'in_progress' | 'completed';
  owner: string;
  created_at: string;
  updated_at: string;
}

interface Epic {
  id: string;
  prd_id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

interface Task {
  id: string;
  epic_id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  due_date?: string;
  dependencies: string[];
  notes: string[];
  created_at: string;
  updated_at: string;
}

type DataItem = 
  | { type: 'prd' } & PRD
  | { type: 'epic' } & Epic
  | { type: 'task' } & Task;

interface ProjectData {
  prds: PRD[];
  epics: Epic[];
  tasks: Task[];
}

// Task Manager class
class TaskManager {
  private async loadData(): Promise<ProjectData> {
    try {
      const data = await fs.readFile(TASK_FILE_PATH, "utf-8");
      const lines = data.split("\n").filter(line => line.trim() !== "");
      return lines.reduce((acc: ProjectData, line) => {
        const item = JSON.parse(line) as DataItem;
        if (item.type === "prd") {
          const { type, ...prd } = item;
          acc.prds.push(prd);
        } else if (item.type === "epic") {
          const { type, ...epic } = item;
          acc.epics.push(epic);
        } else if (item.type === "task") {
          const { type, ...task } = item;
          acc.tasks.push(task);
        }
        return acc;
      }, { prds: [], epics: [], tasks: [] });
    } catch (error) {
      if (error instanceof Error && 'code' in error && (error as any).code === "ENOENT") {
        return { prds: [], epics: [], tasks: [] };
      }
      throw error;
    }
  }

  private async saveData(data: ProjectData): Promise<void> {
    const lines = [
      ...data.prds.map(p => JSON.stringify({ type: "prd", ...p })),
      ...data.epics.map(e => JSON.stringify({ type: "epic", ...e })),
      ...data.tasks.map(t => JSON.stringify({ type: "task", ...t })),
    ];
    await fs.writeFile(TASK_FILE_PATH, lines.join("\n"));
  }

  private generateId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `${prefix}_${timestamp}_${random}`;
  }

  async createPRD(title: string, description: string, owner: string): Promise<PRD> {
    const data = await this.loadData();
    const now = new Date().toISOString();
    const prd: PRD = {
      id: this.generateId('prd'),
      title,
      description,
      status: 'draft',
      owner,
      created_at: now,
      updated_at: now,
    };
    data.prds.push(prd);
    await this.saveData(data);
    return prd;
  }

  async updatePRD(id: string, updates: Partial<Omit<PRD, 'id' | 'created_at'>>): Promise<PRD> {
    const data = await this.loadData();
    const prdIndex = data.prds.findIndex(p => p.id === id);
    if (prdIndex === -1) {
      throw new Error(`PRD with id ${id} not found`);
    }
    
    data.prds[prdIndex] = {
      ...data.prds[prdIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    await this.saveData(data);
    return data.prds[prdIndex];
  }

  async deletePRD(id: string): Promise<void> {
    const data = await this.loadData();
    
    // Find all epics for this PRD
    const epicIds = data.epics.filter(e => e.prd_id === id).map(e => e.id);
    
    // Delete all tasks for those epics
    data.tasks = data.tasks.filter(t => !epicIds.includes(t.epic_id));
    
    // Delete all epics for this PRD
    data.epics = data.epics.filter(e => e.prd_id !== id);
    
    // Delete the PRD
    data.prds = data.prds.filter(p => p.id !== id);
    
    await this.saveData(data);
  }

  async createEpics(epics: Array<{
    prd_id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>): Promise<Epic[]> {
    const data = await this.loadData();
    const now = new Date().toISOString();
    
    const newEpics = epics.map(e => ({
      id: this.generateId('epic'),
      ...e,
      status: 'not_started' as const,
      created_at: now,
    }));
    
    data.epics.push(...newEpics);
    await this.saveData(data);
    return newEpics;
  }

  async updateEpic(id: string, updates: Partial<Omit<Epic, 'id' | 'prd_id' | 'created_at'>>): Promise<Epic> {
    const data = await this.loadData();
    const epicIndex = data.epics.findIndex(e => e.id === id);
    if (epicIndex === -1) {
      throw new Error(`Epic with id ${id} not found`);
    }
    
    data.epics[epicIndex] = {
      ...data.epics[epicIndex],
      ...updates,
    };
    
    await this.saveData(data);
    return data.epics[epicIndex];
  }

  async deleteEpics(ids: string[]): Promise<void> {
    const data = await this.loadData();
    
    // Delete all tasks for these epics
    data.tasks = data.tasks.filter(t => !ids.includes(t.epic_id));
    
    // Delete the epics
    data.epics = data.epics.filter(e => !ids.includes(e.id));
    
    await this.saveData(data);
  }

  async createTasks(tasks: Array<{
    epic_id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    assignee?: string;
    due_date?: string;
    dependencies?: string[];
  }>): Promise<Task[]> {
    const data = await this.loadData();
    const now = new Date().toISOString();
    
    const newTasks = tasks.map(t => ({
      id: this.generateId('task'),
      status: 'todo' as const,
      dependencies: [],
      notes: [],
      ...t,
      created_at: now,
      updated_at: now,
    }));
    
    data.tasks.push(...newTasks);
    await this.saveData(data);
    return newTasks;
  }

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'epic_id' | 'created_at'>>): Promise<Task> {
    const data = await this.loadData();
    const taskIndex = data.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    data.tasks[taskIndex] = {
      ...data.tasks[taskIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    await this.saveData(data);
    return data.tasks[taskIndex];
  }

  async addTaskNotes(taskId: string, notes: string[]): Promise<Task> {
    const data = await this.loadData();
    const taskIndex = data.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error(`Task with id ${taskId} not found`);
    }
    
    data.tasks[taskIndex].notes.push(...notes);
    data.tasks[taskIndex].updated_at = new Date().toISOString();
    
    await this.saveData(data);
    return data.tasks[taskIndex];
  }

  async deleteTasks(ids: string[]): Promise<void> {
    const data = await this.loadData();
    data.tasks = data.tasks.filter(t => !ids.includes(t.id));
    await this.saveData(data);
  }

  async readProject(prdId?: string): Promise<any> {
    const data = await this.loadData();
    
    if (prdId) {
      const prd = data.prds.find(p => p.id === prdId);
      if (!prd) {
        throw new Error(`PRD with id ${prdId} not found`);
      }
      
      const epics = data.epics.filter(e => e.prd_id === prdId);
      const epicIds = epics.map(e => e.id);
      const tasks = data.tasks.filter(t => epicIds.includes(t.epic_id));
      
      return {
        ...prd,
        epics: epics.map(epic => ({
          ...epic,
          tasks: tasks.filter(t => t.epic_id === epic.id),
        })),
      };
    }
    
    // Return all projects
    return data.prds.map(prd => {
      const epics = data.epics.filter(e => e.prd_id === prd.id);
      const epicIds = epics.map(e => e.id);
      const tasks = data.tasks.filter(t => epicIds.includes(t.epic_id));
      
      return {
        ...prd,
        epics: epics.map(epic => ({
          ...epic,
          tasks: tasks.filter(t => t.epic_id === epic.id),
        })),
      };
    });
  }

  async searchItems(query: string, itemType?: 'prd' | 'epic' | 'task'): Promise<any> {
    const data = await this.loadData();
    const lowerQuery = query.toLowerCase();
    
    const results: any = {};
    
    if (!itemType || itemType === 'prd') {
      results.prds = data.prds.filter(p =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.owner.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (!itemType || itemType === 'epic') {
      results.epics = data.epics.filter(e =>
        e.title.toLowerCase().includes(lowerQuery) ||
        e.description.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (!itemType || itemType === 'task') {
      results.tasks = data.tasks.filter(t =>
        t.title.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        (t.assignee && t.assignee.toLowerCase().includes(lowerQuery)) ||
        t.notes.some(n => n.toLowerCase().includes(lowerQuery))
      );
    }
    
    return results;
  }

  async getTasksByStatus(
    status: Task['status'],
    epicId?: string,
    assignee?: string
  ): Promise<Task[]> {
    const data = await this.loadData();
    
    return data.tasks.filter(t => {
      if (t.status !== status) return false;
      if (epicId && t.epic_id !== epicId) return false;
      if (assignee && t.assignee !== assignee) return false;
      return true;
    });
  }

  async getTasksByAssignee(assignee: string): Promise<Task[]> {
    const data = await this.loadData();
    return data.tasks.filter(t => t.assignee === assignee);
  }
}

const taskManager = new TaskManager();

// MCP Server setup
const server = new Server({
  name: "task-manager",
  version: "0.1.0",
}, {
  capabilities: {
    tools: {},
  },
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_prd",
        description: "Create a new Product Requirements Document",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Title of the PRD" },
            description: { type: "string", description: "Detailed description of the product requirements" },
            owner: { type: "string", description: "Owner of the PRD" },
          },
          required: ["title", "description", "owner"],
        },
      },
      {
        name: "update_prd",
        description: "Update an existing PRD",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "ID of the PRD to update" },
            title: { type: "string", description: "New title" },
            description: { type: "string", description: "New description" },
            status: { 
              type: "string", 
              enum: ["draft", "approved", "in_progress", "completed"],
              description: "New status" 
            },
            owner: { type: "string", description: "New owner" },
          },
          required: ["id"],
        },
      },
      {
        name: "delete_prd",
        description: "Delete a PRD and all its associated epics and tasks",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "ID of the PRD to delete" },
          },
          required: ["id"],
        },
      },
      {
        name: "create_epics",
        description: "Create multiple epics linked to a PRD",
        inputSchema: {
          type: "object",
          properties: {
            epics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  prd_id: { type: "string", description: "ID of the parent PRD" },
                  title: { type: "string", description: "Epic title" },
                  description: { type: "string", description: "Epic description" },
                  priority: { 
                    type: "string", 
                    enum: ["low", "medium", "high"],
                    description: "Priority level" 
                  },
                },
                required: ["prd_id", "title", "description", "priority"],
              },
            },
          },
          required: ["epics"],
        },
      },
      {
        name: "update_epic",
        description: "Update an existing epic",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "ID of the epic to update" },
            title: { type: "string", description: "New title" },
            description: { type: "string", description: "New description" },
            status: {
              type: "string",
              enum: ["not_started", "in_progress", "completed"],
              description: "New status"
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "New priority"
            },
          },
          required: ["id"],
        },
      },
      {
        name: "delete_epics",
        description: "Delete epics and their associated tasks",
        inputSchema: {
          type: "object",
          properties: {
            ids: {
              type: "array",
              items: { type: "string" },
              description: "IDs of epics to delete"
            },
          },
          required: ["ids"],
        },
      },
      {
        name: "create_tasks",
        description: "Create multiple tasks linked to epics",
        inputSchema: {
          type: "object",
          properties: {
            tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  epic_id: { type: "string", description: "ID of the parent epic" },
                  title: { type: "string", description: "Task title" },
                  description: { type: "string", description: "Task description" },
                  priority: {
                    type: "string",
                    enum: ["low", "medium", "high"],
                    description: "Priority level"
                  },
                  assignee: { type: "string", description: "Person assigned to the task" },
                  due_date: { type: "string", description: "Due date in ISO format" },
                  dependencies: {
                    type: "array",
                    items: { type: "string" },
                    description: "IDs of tasks this depends on"
                  },
                },
                required: ["epic_id", "title", "description", "priority"],
              },
            },
          },
          required: ["tasks"],
        },
      },
      {
        name: "update_task",
        description: "Update an existing task",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "ID of the task to update" },
            title: { type: "string", description: "New title" },
            description: { type: "string", description: "New description" },
            status: {
              type: "string",
              enum: ["todo", "in_progress", "review", "done"],
              description: "New status"
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "New priority"
            },
            assignee: { type: "string", description: "New assignee" },
            due_date: { type: "string", description: "New due date in ISO format" },
            dependencies: {
              type: "array",
              items: { type: "string" },
              description: "Updated dependency task IDs"
            },
          },
          required: ["id"],
        },
      },
      {
        name: "add_task_notes",
        description: "Add progress notes to a task",
        inputSchema: {
          type: "object",
          properties: {
            task_id: { type: "string", description: "ID of the task" },
            notes: {
              type: "array",
              items: { type: "string" },
              description: "Notes to add"
            },
          },
          required: ["task_id", "notes"],
        },
      },
      {
        name: "delete_tasks",
        description: "Delete multiple tasks",
        inputSchema: {
          type: "object",
          properties: {
            ids: {
              type: "array",
              items: { type: "string" },
              description: "IDs of tasks to delete"
            },
          },
          required: ["ids"],
        },
      },
      {
        name: "read_project",
        description: "Read project hierarchy (PRD with nested epics and tasks)",
        inputSchema: {
          type: "object",
          properties: {
            prd_id: { type: "string", description: "Optional PRD ID to read specific project" },
          },
        },
      },
      {
        name: "search_items",
        description: "Search across PRDs, epics, and tasks",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
            item_type: {
              type: "string",
              enum: ["prd", "epic", "task"],
              description: "Optional filter by item type"
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_tasks_by_status",
        description: "Get tasks filtered by status",
        inputSchema: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["todo", "in_progress", "review", "done"],
              description: "Task status to filter by"
            },
            epic_id: { type: "string", description: "Optional epic ID filter" },
            assignee: { type: "string", description: "Optional assignee filter" },
          },
          required: ["status"],
        },
      },
      {
        name: "get_tasks_by_assignee",
        description: "Get all tasks assigned to a specific person",
        inputSchema: {
          type: "object",
          properties: {
            assignee: { type: "string", description: "Assignee name" },
          },
          required: ["assignee"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error(`No arguments provided for tool: ${name}`);
  }

  switch (name) {
    case "create_prd":
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(await taskManager.createPRD(
            args.title as string,
            args.description as string,
            args.owner as string
          ), null, 2) 
        }] 
      };

    case "update_prd":
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(await taskManager.updatePRD(
            args.id as string,
            args as any
          ), null, 2) 
        }] 
      };

    case "delete_prd":
      await taskManager.deletePRD(args.id as string);
      return { content: [{ type: "text", text: "PRD and all associated items deleted successfully" }] };

    case "create_epics":
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(await taskManager.createEpics(args.epics as any[]), null, 2) 
        }] 
      };

    case "update_epic":
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(await taskManager.updateEpic(
            args.id as string,
            args as any
          ), null, 2) 
        }] 
      };

    case "delete_epics":
      await taskManager.deleteEpics(args.ids as string[]);
      return { content: [{ type: "text", text: "Epics and associated tasks deleted successfully" }] };

    case "create_tasks":
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(await taskManager.createTasks(args.tasks as any[]), null, 2) 
        }] 
      };

    case "update_task":
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(await taskManager.updateTask(
            args.id as string,
            args as any
          ), null, 2) 
        }] 
      };

    case "add_task_notes":
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(await taskManager.addTaskNotes(
            args.task_id as string,
            args.notes as string[]
          ), null, 2) 
        }] 
      };

    case "delete_tasks":
      await taskManager.deleteTasks(args.ids as string[]);
      return { content: [{ type: "text", text: "Tasks deleted successfully" }] };

    case "read_project":
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(await taskManager.readProject(args.prd_id as string), null, 2) 
        }] 
      };

    case "search_items":
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(await taskManager.searchItems(
            args.query as string,
            args.item_type as any
          ), null, 2) 
        }] 
      };

    case "get_tasks_by_status":
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(await taskManager.getTasksByStatus(
            args.status as any,
            args.epic_id as string,
            args.assignee as string
          ), null, 2) 
        }] 
      };

    case "get_tasks_by_assignee":
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(await taskManager.getTasksByAssignee(
            args.assignee as string
          ), null, 2) 
        }] 
      };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Task Manager MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});