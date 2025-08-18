-- Initialize authentication database
PRAGMA foreign_keys = ON;

-- Users table (single user system) - prefixed with qwencliui_ to avoid conflicts
CREATE TABLE
    IF NOT EXISTS qwencliui_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_active BOOLEAN DEFAULT 1
    );

-- Model providers table for managing different AI model providers
CREATE TABLE
    IF NOT EXISTS qwencliui_model_providers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider_name TEXT NOT NULL,
        provider_type TEXT NOT NULL CHECK (
            provider_type IN (
                'openai',
                'anthropic',
                'qwen',
                'bedrock',
                'baidu',
                'dashscope',
                'deepseek',
                "volcengine",
                "moonshot",
                "siliconflow",
                "modelscope",
                "openrouter",
                "pangu",
                "xunfei"
            )
        ),
        api_key TEXT NOT NULL,
        base_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        description TEXT
    );

-- Indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_qwencliui_users_username ON qwencliui_users (username);

CREATE INDEX IF NOT EXISTS idx_qwencliui_users_active ON qwencliui_users (is_active);

CREATE INDEX IF NOT EXISTS idx_qwencliui_model_providers_type ON qwencliui_model_providers (provider_type);

CREATE INDEX IF NOT EXISTS idx_qwencliui_model_providers_active ON qwencliui_model_providers (is_active);

CREATE UNIQUE INDEX IF NOT EXISTS idx_qwencliui_model_providers_name ON qwencliui_model_providers (provider_name);