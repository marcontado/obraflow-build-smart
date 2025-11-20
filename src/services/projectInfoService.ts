import express from "express";
import { supabase } from "./supabase.server.js";

const router = express.Router();

router.get("/project-info/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("ID recebido:", id);

    const { data, error } = await supabase
      .from("projects")
      .select("id, name, description, status, start_date, end_date, budget, progress")
      .eq("id", id)
      .single();

    console.log("Resultado Supabase:", { data, error });

    if (error) {
      return res.status(500).json({ success: false, message: "Erro na consulta", error: error.message });
    }

    if (!data) {
      return res.status(404).json({ success: false, message: "Projeto não encontrado" });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro no endpoint", error: err.message });
  }
});

// Nova rota para buscar projeto pelo nome
router.get("/project-info/by-name/", async (_req, res) => {
  try {
    const name = "Projeto Moema"; // hardcoded

    const { data, error } = await supabase
      .from("projects")
      .select("id, name, client, address, status, end_date")
      .ilike("name", `%${name}%`)
      .maybeSingle();

    console.log("Resultado Supabase:", { data, error });

    if (error || !data) {
      return res.status(404).json({ success: false, message: "Projeto não encontrado pelo nome" });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro no endpoint", error: err.message });
  }
});

export default router;