import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { v2 as pipedrive, v1 as pipedriveV1 } from "pipedrive";

const API_KEY = process.env.PIPEDRIVE_API_KEY;

if (!API_KEY) {
  process.stderr.write("PIPEDRIVE_API_KEY environment variable is required\n");
  process.exit(1);
}

// Configure Pipedrive client
const config = new pipedrive.Configuration({
  apiKey: API_KEY,
});

const configV1 = new pipedriveV1.Configuration({
  apiKey: API_KEY,
});

const dealsApi = new pipedrive.DealsApi(config);
const activitiesApi = new pipedrive.ActivitiesApi(config);
const leadsApiV1 = new pipedriveV1.LeadsApi(configV1);
const stagesApi = new pipedrive.StagesApi(config);
const pipelinesApi = new pipedrive.PipelinesApi(config);
const personsApi = new pipedrive.PersonsApi(config);
const organizationsApi = new pipedrive.OrganizationsApi(config);
const usersApiV1 = new pipedriveV1.UsersApi(configV1);

const server = new Server(
  {
    name: "pipedrive-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_deals",
        description: "Get all deals with optional filters",
        inputSchema: {
          type: "object",
          properties: {
            pipelineId: { type: "number", description: "Filter by pipeline ID" },
            stageId: { type: "number", description: "Filter by stage ID" },
            status: { type: "string", enum: ["open", "won", "lost", "deleted", "all_not_deleted"], description: "Filter by status" },
          },
        },
      },
      {
        name: "get_deal_details",
        description: "Get detailed information about a specific deal, including person and organization info",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "number", description: "The ID of the deal" },
          },
          required: ["id"],
        },
      },
      {
        name: "get_activities",
        description: "Get activities with optional filters",
        inputSchema: {
          type: "object",
          properties: {
            dealId: { type: "number", description: "Filter by deal ID" },
            userId: { type: "number", description: "Filter by user ID" },
            type: { type: "string", description: "Filter by activity type" },
          },
        },
      },
      {
        name: "get_leads",
        description: "Get leads with optional filters",
        inputSchema: {
          type: "object",
          properties: {
            ownerId: { type: "number", description: "Filter by owner ID" },
          },
        },
      },
      {
        name: "get_pipelines",
        description: "Get all pipelines",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_stages",
        description: "Get all stages for a pipeline",
        inputSchema: {
          type: "object",
          properties: {
            pipelineId: { type: "number", description: "The ID of the pipeline" },
          },
          required: ["pipelineId"],
        },
      },
      {
        name: "get_users",
        description: "Get all users in the company",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_deals": {
        const response = await dealsApi.getDeals(args as any);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      }
      case "get_deal_details": {
        const dealId = (args as any).id;
        const dealResponse = await dealsApi.getDeal({ id: dealId });
        
        // Enrich with person and organization details if available
        const deal = dealResponse.data;
        let person = null;
        let organization = null;

        if (deal && deal.person_id) {
           if (typeof deal.person_id === 'object') {
              person = deal.person_id;
           } else {
              const personResponse = await personsApi.getPerson({ id: deal.person_id as any });
              person = personResponse.data;
           }
        }

        if (deal && deal.org_id) {
           if (typeof deal.org_id === 'object') {
              organization = deal.org_id;
           } else {
              const orgResponse = await organizationsApi.getOrganization({ id: deal.org_id as any });
              organization = orgResponse.data;
           }
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              deal,
              person,
              organization
            }, null, 2)
          }]
        };
      }
      case "get_activities": {
        const response = await activitiesApi.getActivities(args as any);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      }
      case "get_leads": {
        const response = await leadsApiV1.getLeads(args as any);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      }
      case "get_pipelines": {
        const response = await pipelinesApi.getPipelines();
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      }
      case "get_stages": {
        const response = await stagesApi.getStages(args as any);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      }
      case "get_users": {
        const response = await usersApiV1.getUsers();
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  process.stderr.write(`Fatal error in main(): ${error}\n`);
  process.exit(1);
});
