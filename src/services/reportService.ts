import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

router.post("/save-report", async (req, res) => {
  try {
    const { project_id, report_type, report_markdown, generated_by } = req.body;

    if (!project_id || !report_type || !report_markdown || !generated_by) {
      return res.status(400).json({ success: false, message: "Campos obrigatórios ausentes" });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from("reports")
      .insert([
        {
          project_id,
          report_type,
          report_markdown,
          generated_by,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      return res.status(500).json({ success: false, message: "Erro ao salvar relatório", error: error.message });
    }

    res.status(201).json({ success: true, message: "Relatório salvo com sucesso!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro no endpoint", error: err.message });
  }
});

export default router;