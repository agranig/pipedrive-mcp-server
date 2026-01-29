# Pipedrive MCP Server

A high-performance Model Context Protocol (MCP) server that enables Claude (and other MCP-compatible LLMs) to analyze your Pipedrive sales pipeline, deal velocity, and activity engagement.

This server is specifically designed to help sales teams understand why deals are stalling and where the "rubber isn't hitting the road" by providing deep visibility into deal stages, activities, and contact details.

## 🚀 Features

- **Deep Deal Analysis**: Retrieve full deal details enriched with contact person and organization metadata.
- **Activity Tracking**: Monitor user activities (calls, meetings, emails) to analyze engagement levels.
- **Pipeline Visibility**: Explore pipelines and stages to identify bottlenecks.
- **Lead Management**: Access the leads inbox for early-stage pipeline analysis.
- **Dockerized**: Easy deployment via Docker with zero-config on your host machine.
- **Clean Protocol**: Optimized for Claude Desktop with all logging redirected to `stderr` to prevent protocol corruption.

## 🛠 Built With

- **TypeScript**: Type-safe implementation for reliable API interactions.
- **MCP SDK**: Built on the official `@modelcontextprotocol/sdk`.
- **Pipedrive SDK**: Uses the official `pipedrive` Node.js library (v2 & v1).
- **Docker**: Containerized for consistent performance across environments.

## 📋 Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) installed and running.
- A [Pipedrive API Key](https://pipedrive.readme.io/docs/how-to-find-the-api-token).

## 📦 Installation & Setup

### 1. Build the Image

Clone this repository and build the Docker image:

```bash
docker build -t pipedrive-mcp .
```

### 2. Configure Claude Desktop

Add the Pipedrive MCP server to your Claude Desktop configuration.

**File Location:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

**Configuration:**

```json
{
  "mcpServers": {
    "pipedrive": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "PIPEDRIVE_API_KEY=your_api_key_here",
        "pipedrive-mcp"
      ]
    }
  }
}
```

*Replace `your_api_key_here` with your actual Pipedrive API token.*

## 🛠 Available Tools

- `get_deals`: List deals with pipeline, stage, and status filters.
- `get_deal_details`: Get a specific deal with full enrichment of Person and Organization data.
- `get_activities`: List activities filtered by deal, user, or type.
- `get_leads`: Retrieve leads from the leads inbox.
- `get_pipelines`: List all configured pipelines.
- `get_stages`: List stages for a specific pipeline.
- `get_users`: List all users in your Pipedrive company.

## 🔍 Example Queries

Once connected, you can ask Claude:

- "Analyze the deals in the 'Negotiation' stage. Which ones haven't had any activity in the last 7 days?"
- "Who is the main contact person for the 'Big Enterprise' deal, and what was our last interaction?"
- "Show me all leads owned by [User] and summarize why they haven't moved to the deal pipeline yet."
- "Are we talking to the right ICP for our open deals in the 'Discovery' stage?"

## 📄 License

MIT License. See `package.json` for details.
