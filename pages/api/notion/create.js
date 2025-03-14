import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getApiKey } from "../../../utils/apiKeyService";
import { NotionClient } from "../../../../notion_generator/notion_client";
import { ClaudeClient } from "../../../../notion_generator/claude_client";
import { PageGenerator } from "../../../../notion_generator/page_generator";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  try {
    const { parentId, description } = req.body;
    
    if (!parentId || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Get API keys
    const notionKey = await getApiKey(session.user.id, "notion");
    const claudeKey = await getApiKey(session.user.id, "claude");
    
    if (!notionKey || !claudeKey) {
      return res.status(400).json({ error: "API keys not configured" });
    }
    
    // Initialize clients
    const notionClient = new NotionClient(notionKey);
    const claudeClient = new ClaudeClient(claudeKey);
    const pageGenerator = new PageGenerator(notionClient, claudeClient);
    
    // Create page
    const page = await pageGenerator.generate_page(parentId, description);
    
    return res.status(200).json(page);
  } catch (error) {
    console.error("Error creating page:", error);
    return res.status(500).json({ error: error.message || "Failed to create page" });
  }
}
