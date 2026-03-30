-- Backfill: replace the unofficial "AWS" MCP entry with official awslabs server
-- Run once: psql "$DATABASE_URL" -f supabase/backfill-aws-mcp.sql

BEGIN;

UPDATE imported_mcps
SET
  name          = 'AWS API',
  description   = 'Official AWS Labs MCP server — interact with AWS services and resources through AWS CLI commands. Covers S3, Lambda, DynamoDB, EC2, CloudFormation, and all other AWS APIs.',
  manifest_url  = 'https://github.com/awslabs/mcp',
  homepage_url  = 'https://awslabs.github.io/mcp/servers/aws-api-mcp-server',
  command       = 'uvx',
  args          = ARRAY['awslabs.aws-api-mcp-server@latest'],
  env_keys      = ARRAY['AWS_REGION','AWS_PROFILE','AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY'],
  tags          = ARRAY['aws','cloud','s3','lambda','infra','official'],
  icon_url      = 'https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=64',
  updated_at    = now()
WHERE name = 'AWS';

COMMIT;
