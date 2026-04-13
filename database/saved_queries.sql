-- ============================================================
-- Saved Queries & Operation Pipeline Tables
-- Mirrors Metabase/Retool query-pipeline storage model
-- ============================================================

USE student_portal;

-- Drop if exists (idempotent)
DROP TABLE IF EXISTS query_operations;
DROP TABLE IF EXISTS saved_queries;

-- 1) Saved Queries
CREATE TABLE saved_queries (
    query_id      INT AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(200) NOT NULL DEFAULT 'Untitled Query',
    description   TEXT,
    created_by    INT NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sq_user FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 2) Operation pipeline steps  (order matters)
CREATE TABLE query_operations (
    op_id         INT AUTO_INCREMENT PRIMARY KEY,
    query_id      INT NOT NULL,
    op_order      INT NOT NULL DEFAULT 0,
    op_type       ENUM(
        'select_source','join','filter','project',
        'group','computed','append','sort','limit'
    ) NOT NULL,
    op_config     JSON NOT NULL,
    CONSTRAINT fk_qo_query FOREIGN KEY (query_id) REFERENCES saved_queries(query_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE KEY uq_query_order (query_id, op_order)
) ENGINE=InnoDB;

-- Index for fast operation retrieval
CREATE INDEX idx_qo_query ON query_operations(query_id, op_order);
