import express from "express";
import cors from "cors";

console.log("🔥 INDEX.TS CARGADO");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("ROOT OK");
});

app.get("/health", (_req, res) => {
  res.json({ status: "OK", service: "CRM Agencia" });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 SERVER ESCUCHANDO EN PUERTO ${PORT}`);
});
