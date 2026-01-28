import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import quotesRoutes from "./src/routes/quotes.routes";

console.log("🔥 INDEX.TS CARGADO");

const app = express();

app.use(cors());
app.use(express.json());

// HEALTH
app.get("/", (_req, res) => {
  res.send("ROOT OK");
});

app.get("/health", (_req, res) => {
  res.json({ status: "OK", service: "CRM Agencia" });
});

// 🔥 ACA ESTABA EL PROBLEMA
app.use("/quotes", quotesRoutes);

// PUERTO
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 SERVER ESCUCHANDO EN PUERTO ${PORT}`);
});
