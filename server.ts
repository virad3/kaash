import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import healthHandler from "./api/health";
import extractExpenseHandler from "./api/gemini/extract-expense";
import extractBillHandler from "./api/gemini/extract-bill";
import indexHandler from "./api/index";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Mount API endpoints identical to Vercel serverless routes
  app.all("/api/health", (req, res) => healthHandler(req, res));
  app.all("/api/gemini/extract-expense", (req, res) => extractExpenseHandler(req, res));
  app.all("/api/gemini/extract-bill", (req, res) => extractBillHandler(req, res));
  app.all("/api", (req, res) => indexHandler(req, res));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
