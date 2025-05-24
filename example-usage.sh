#!/bin/bash

# Example usage script for Task Manager MCP Server

echo "Task Manager MCP Server - Example Usage"
echo "======================================="
echo ""
echo "1. Install dependencies:"
echo "   npm install"
echo ""
echo "2. Build the project:"
echo "   npm run build"
echo ""
echo "3. Run the server locally:"
echo "   node dist/index.js"
echo ""
echo "4. Configure in Claude Desktop:"
echo "   Add the following to your claude_desktop_config.json:"
echo ""
echo '   {
     "mcpServers": {
       "task-manager": {
         "command": "node",
         "args": ["/projects/project-manager-mcp/dist/index.js"]
       }
     }
   }'
echo ""
echo "5. Example workflow:"
echo "   - Create a PRD using create_prd"
echo "   - Create epics for the PRD using create_epics"
echo "   - Break down epics into tasks using create_tasks"
echo "   - Update task status as work progresses"
echo "   - Add notes to track progress"
echo ""
echo "For Docker deployment:"
echo "   docker build -t mcp/task-manager ."
echo "   docker run -i -v task-data:/app/data mcp/task-manager"