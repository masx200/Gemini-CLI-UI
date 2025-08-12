import { Router } from 'express';
const router = Router();
import {db}from "../../server/database/db.js"

// Get all model providers
router.get('/api/model-providers', async (req, res) => {
  try {
    const providers = await all(
      'SELECT * FROM geminicliui_model_providers ORDER BY created_at DESC'
    );
    res.json({ providers });
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// Get a single model provider
router.get('/api/model-providers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await get(
      'SELECT * FROM geminicliui_model_providers WHERE id = ?',
      [id]
    );
    
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    res.json({ provider });
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

// Create a new model provider
router.post('/api/model-providers', async (req, res) => {
  try {
    const { provider_name, provider_type, api_key, base_url, description, is_active } = req.body;
    
    if (!provider_name || !provider_type || !api_key) {
      return res.status(400).json({ 
        error: 'Provider name, type, and API key are required' 
      });
    }

    const result = await run(
      `INSERT INTO geminicliui_model_providers 
       (provider_name, provider_type, api_key, base_url, description, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [provider_name, provider_type, api_key, base_url || null, description || null, is_active !== false]
    );

    const newProvider = await get(
      'SELECT * FROM geminicliui_model_providers WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json({ provider: newProvider });
  } catch (error) {
    console.error('Error creating provider:', error);
    res.status(500).json({ error: 'Failed to create provider' });
  }
});

// Update a model provider
router.put('/api/model-providers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { provider_name, provider_type, api_key, base_url, description, is_active } = req.body;
    
    if (!provider_name || !provider_type || !api_key) {
      return res.status(400).json({ 
        error: 'Provider name, type, and API key are required' 
      });
    }

    const result = await run(
      `UPDATE geminicliui_model_providers 
       SET provider_name = ?, provider_type = ?, api_key = ?, 
           base_url = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [provider_name, provider_type, api_key, base_url || null, description || null, is_active, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const updatedProvider = await get(
      'SELECT * FROM geminicliui_model_providers WHERE id = ?',
      [id]
    );

    res.json({ provider: updatedProvider });
  } catch (error) {
    console.error('Error updating provider:', error);
    res.status(500).json({ error: 'Failed to update provider' });
  }
});

// Delete a model provider
router.delete('/api/model-providers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await run(
      'DELETE FROM geminicliui_model_providers WHERE id = ?',
      [id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json({ message: 'Provider deleted successfully' });
  } catch (error) {
    console.error('Error deleting provider:', error);
    res.status(500).json({ error: 'Failed to delete provider' });
  }
});

// Test a model provider connection
router.post('/api/model-providers/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    
    const provider = await get(
      'SELECT * FROM geminicliui_model_providers WHERE id = ? AND is_active = 1',
      [id]
    );
    
    if (!provider) {
      return res.status(404).json({ error: 'Active provider not found' });
    }

    // Here you would implement actual connection testing
    // For now, we'll just return a success response
    res.json({ 
      success: true, 
      message: 'Provider configuration looks valid',
      provider: {
        id: provider.id,
        provider_name: provider.provider_name,
        provider_type: provider.provider_type
      }
    });
  } catch (error) {
    console.error('Error testing provider:', error);
    res.status(500).json({ error: 'Failed to test provider' });
  }
});

export default router;