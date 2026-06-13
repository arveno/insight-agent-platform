CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  updated_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_users_user_id (user_id),
  UNIQUE KEY uq_users_email (email)
);

CREATE TABLE IF NOT EXISTS workspaces (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  workspace_id VARCHAR(128) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  updated_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_workspaces_workspace_id (workspace_id)
);

CREATE TABLE IF NOT EXISTS workspace_memberships (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  membership_id VARCHAR(128) NOT NULL,
  user_id VARCHAR(128) NOT NULL,
  workspace_id VARCHAR(128) NOT NULL,
  role VARCHAR(64) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  updated_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_workspace_memberships_membership_id (membership_id),
  UNIQUE KEY uq_workspace_memberships_user_workspace (user_id, workspace_id),
  KEY idx_workspace_memberships_user_id (user_id),
  KEY idx_workspace_memberships_workspace_id (workspace_id)
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  auth_session_id VARCHAR(128) NOT NULL,
  user_id VARCHAR(128) NOT NULL,
  current_workspace_id VARCHAR(128) NULL,
  session_token_hash VARCHAR(255) NOT NULL,
  expires_at VARCHAR(40) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  updated_at VARCHAR(40) NOT NULL,
  last_accessed_at VARCHAR(40) NULL,
  revoked_at VARCHAR(40) NULL,
  UNIQUE KEY uq_auth_sessions_auth_session_id (auth_session_id),
  KEY idx_auth_sessions_user_id (user_id),
  KEY idx_auth_sessions_current_workspace_id (current_workspace_id)
);
