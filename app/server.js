import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

// Кэш картинок — как на дорогих сайтах
app.use("/images", express.static(path.join(__dirname, "frontend/public"), {
  maxAge: "30d",
  immutable: true,
}));

// Раздаём собранный фронт (например, Vite build в dist)
app.use(express.static(path.join(__dirname, "frontend/build"), { maxAge: "7d" }));

// API маршруты для backend
app.use("/api", express.static(path.join(__dirname, "backend/src")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Frontend: http://localhost:3000`);
  console.log(`Backend: http://localhost:5001`);
});
