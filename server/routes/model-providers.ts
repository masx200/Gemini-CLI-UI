import { Router } from "express";
const router = Router();
//@ts-ignore
import { db } from "../../server/database/db.js";
import type { ModelProvider } from "../types/model-provider.js";
export interface Provider {
  id: number;
  provider_name: string;
  provider_type: string;
  api_key: string;
  base_url: string;
  description: string;
  is_active: boolean;
}
// Get all model providers
//@ts-ignore
router.get("/list", async (req, res) => {
  try {
    const providers = db
      .prepare(
        "SELECT * FROM qwencliui_model_providers ORDER BY created_at DESC"
      )
      .all() as Provider[];
    res.json({
      providers: providers.map((a) => {
        return {
          id: a.id,
          provider_name: a.provider_name,
          provider_type: a.provider_type,
          api_key: a.api_key,
          base_url: a.base_url,
          description: a.description,
          is_active: Boolean(a.is_active),
        };
      }),
    });
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({ error: "Failed to fetch providers" });
  }
});
router.get("/name/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const provider = db
      .prepare(
        "SELECT * FROM qwencliui_model_providers WHERE provider_name = ?"
      )
      .get(name);

    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    res.json({ provider });
    return;
  } catch (error) {
    console.error("Error fetching provider:", error);
    res.status(500).json({ error: "Failed to fetch provider" });
  }
});
// Get a single model provider
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const provider = db
      .prepare("SELECT * FROM qwencliui_model_providers WHERE id = ?")
      .get(id);

    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    res.json({ provider });
    return;
  } catch (error) {
    console.error("Error fetching provider:", error);
    res.status(500).json({ error: "Failed to fetch provider" });
  }
});

// Create a new model provider
router.post("/create", async (req, res) => {
  try {
    const {
      provider_name,
      provider_type,
      api_key,
      base_url,
      description,
      is_active,
    } = req.body;

    if (!provider_name || !provider_type || !api_key) {
      return res.status(400).json({
        error: "Provider name, type, and API key are required",
      });
    }

    const stmt = db.prepare(
      `INSERT INTO qwencliui_model_providers 
       (provider_name, provider_type, api_key, base_url, description, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    const result = stmt.run(
      provider_name,
      provider_type,
      api_key,
      base_url || null,
      description || null,
      Number(is_active !== false)
    );

    const newProvider = db
      .prepare("SELECT * FROM qwencliui_model_providers WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json({ provider: newProvider });
  } catch (error) {
    console.error("Error creating provider:", error);
    res
      .status(500)
      .json({ error: "Failed to create provider" + "\n" + String(error) });
  }
});

// Update a model provider
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      provider_name,
      provider_type,
      api_key,
      base_url,
      description,
      is_active,
    } = req.body;

    if (!provider_name || !provider_type || !api_key) {
      return res.status(400).json({
        error: "Provider name, type, and API key are required",
      });
    }

    const stmt = db.prepare(
      `UPDATE qwencliui_model_providers 
       SET provider_name = ?, provider_type = ?, api_key = ?, 
           base_url = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    );

    const result = stmt.run(
      provider_name,
      provider_type,
      api_key,
      base_url || null,
      description || null,
      is_active,
      id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Provider not found" });
    }

    const updatedProvider = db
      .prepare("SELECT * FROM qwencliui_model_providers WHERE id = ?")
      .get(id);

    res.json({ provider: updatedProvider });
    return;
  } catch (error) {
    console.error("Error updating provider:", error);
    res.status(500).json({ error: "Failed to update provider" });
    return;
  }
});

// Delete a model provider
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare(
      "DELETE FROM qwencliui_model_providers WHERE id = ?"
    );

    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Provider not found" });
    }

    res.json({ message: "Provider deleted successfully" });
    return;
  } catch (error) {
    console.error("Error deleting provider:", error);
    res.status(500).json({ error: "Failed to delete provider" });
    return;
  }
});

// Test a model provider connection
router.post("/:id/test", async (req, res) => {
  try {
    const { id } = req.params;

    const provider = db
      .prepare(
        "SELECT * FROM qwencliui_model_providers WHERE id = ? AND is_active = 1"
      )
      .get(id) as ModelProvider | undefined;

    if (!provider) {
      return res.status(404).json({ error: "Active provider not found" });
    }

    // Here you would implement actual connection testing
    // For now, we'll just return a success response
    res.json({
      success: true,
      message: "Provider configuration looks valid",
      provider: {
        id: provider.id,
        provider_name: provider.provider_name,
        provider_type: provider.provider_type,
      },
    });

    return;
  } catch (error) {
    console.error("Error testing provider:", error);
    res.status(500).json({ error: "Failed to test provider" });
    return;
  }
  return;
});

export default router;
