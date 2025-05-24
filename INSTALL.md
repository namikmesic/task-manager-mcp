# Quick Installation Guide

## Local Development Setup

1. Navigate to the project directory:
```bash
cd /projects/project-manager-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

4. Test the server (optional):
```bash
node dist/index.js
```
(Press Ctrl+C to stop)

## Configure Claude Desktop

1. Find your Claude Desktop configuration file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/claude/claude_desktop_config.json`

2. Add the task-manager server configuration:
```json
{
  "mcpServers": {
    "task-manager": {
      "command": "node",
      "args": ["/projects/project-manager-mcp/dist/index.js"]
    }
  }
}
```

3. Restart Claude Desktop

## Docker Setup (Optional)

1. Build the Docker image:
```bash
docker build -t mcp/task-manager .
```

2. Update Claude Desktop config for Docker:
```json
{
  "mcpServers": {
    "task-manager": {
      "command": "docker",
      "args": ["run", "-i", "-v", "task-manager-data:/app/data", "--rm", "mcp/task-manager"]
    }
  }
}
```

## Verify Installation

After restarting Claude Desktop, you should see "task-manager" in the MCP tools menu.
Try creating a PRD to test the connection!