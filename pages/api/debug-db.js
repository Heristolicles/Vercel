// Debug endpoint to test database connection
import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).end();
  }
  
  try {
    const prisma = new PrismaClient();
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as connection_test`;
    
    return res.status(200).json({
      success: true,
      message: "Database connection successful",
      result
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to connect to database",
      error: error.message
    });
  }
}
