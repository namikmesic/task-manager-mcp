# Task Manager MCP Server - Test Script

This script demonstrates basic usage of the Task Manager MCP Server.

## Prerequisites

1. Install dependencies:
```bash
cd /projects/project-manager-mcp
npm install
```

2. Build the project:
```bash
npm run build
```

## Test Commands

Once configured in Claude Desktop, you can test with these commands:

### 1. Create a PRD
```
Use the create_prd tool with:
- title: "User Authentication System"
- description: "Implement secure user authentication with OAuth2 support"
- owner: "john_doe"
```

### 2. Create Epics
```
Use the create_epics tool with:
- epics: [
    {
      "prd_id": "<PRD_ID_FROM_STEP_1>",
      "title": "OAuth2 Integration",
      "description": "Implement OAuth2 for Google and GitHub",
      "priority": "high"
    },
    {
      "prd_id": "<PRD_ID_FROM_STEP_1>",
      "title": "User Profile Management",
      "description": "Create user profile CRUD operations",
      "priority": "medium"
    }
  ]
```

### 3. Create Tasks
```
Use the create_tasks tool with:
- tasks: [
    {
      "epic_id": "<EPIC_ID_FROM_STEP_2>",
      "title": "Setup OAuth2 providers",
      "description": "Configure Google and GitHub OAuth applications",
      "priority": "high",
      "assignee": "jane_smith"
    }
  ]
```

### 4. Update Task Progress
```
Use the update_task tool with:
- id: "<TASK_ID_FROM_STEP_3>"
- status: "in_progress"
```

### 5. Add Notes
```
Use the add_task_notes tool with:
- task_id: "<TASK_ID_FROM_STEP_3>"
- notes: ["Created OAuth apps", "Waiting for approval from security team"]
```

### 6. Query Tasks
```
Use get_tasks_by_assignee with:
- assignee: "jane_smith"
```

## Verification

The data is stored in `tasks.json` (or the path specified in TASK_FILE_PATH).
You can view the raw data:

```bash
cat tasks.json | jq .
```