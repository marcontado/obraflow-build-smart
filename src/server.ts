import 'dotenv/config';
import express from "express";
import cors from "cors";
import reportRouter from "./services/reportService.js";
import projectInfoRouter from "./services/projectInfoService.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", reportRouter);
app.use("/api", projectInfoRouter);

app.use((req, res, next) => {
  console.log("Rota chamada:", req.method, req.url);
  next();
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});