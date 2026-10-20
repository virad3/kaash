export default function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({
    status: "ok",
    message: "Kaash Financial API is operational",
    endpoints: [
      "/api/health",
      "/api/gemini/extract-expense",
      "/api/gemini/extract-bill"
    ]
  });
}
