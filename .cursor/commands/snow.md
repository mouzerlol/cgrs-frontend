# Snowflake CLI Operations

## Overview
Execute SQL queries and manage Snowflake resources using the Snowflake CLI. This command enables developers to interact with Snowflake databases, manage connections, execute queries, and troubleshoot configuration issues.

## Prerequisites
- **Snowflake CLI v3.14.0+** installed via Homebrew: `brew install snowflake-cli`
- Valid Snowflake account with appropriate permissions
- Configured Snowflake connection (see Configuration section)

## Connection Management

### 1. Configure Snowflake Connection
```bash
# Interactive connection setup
snow connection add

# View all configured connections
snow connection list

# Test a specific connection
snow connection test --connection <connection_name>

# Show connection details
snow connection show --connection <connection_name>

# Delete a connection
snow connection remove --connection <connection_name>
```

### 2. Connection Configuration File
Snowflake CLI uses `~/.snowflake/config.toml` for connections:

```toml
default_connection_name = "myconnection"

[connections.myconnection]
account = "myorganization-myaccount"
user = "jdoe"
authenticator = "externalbrowser"  # or "snowflake", "oauth", etc.
# For password auth:
password = "your_password"  # or use environment variable

[connections.testingconnection]
account = "myorganization-myaccount"
user = "jdoe"
warehouse = "COMPUTE_WH"
database = "TEST_DB"
schema = "PUBLIC"
role = "ANALYST"
```

### 3. Environment Variables for Connection
```bash
# Set as environment variables
export SNOWFLAKE_ACCOUNT="your_account"
export SNOWFLAKE_USER="your_username"
export SNOWFLAKE_PASSWORD="your_password"
export SNOWFLAKE_ROLE="your_role"
export SNOWFLAKE_WAREHOUSE="your_warehouse"
export SNOWFLAKE_DATABASE="your_database"
```

## Executing SQL Queries

### 1. Basic Query Execution
```bash
# Execute a single query
snow sql "SELECT * FROM my_table LIMIT 10"

# Execute from a file
snow sql --file queries.sql

# Execute multiple queries from file
snow sql --file /path/to/queries.sql

# Execute with connection specified
snow sql "SELECT COUNT(*) FROM orders" --connection myconnection
```

### 2. Query Output Formatting
```bash
# JSON output (default for scripting)
snow sql "SELECT * FROM my_table" --format json

# Table output (human-readable)
snow sql "SELECT * FROM my_table" --format table

# CSV output
snow sql "SELECT * FROM my_table" --format csv

# Pretty print for complex queries
snow sql "SELECT * FROM my_table" --format pretty
```

### 3. Query Options
```bash
# Execute with timeout (in seconds)
snow sql "SELECT * FROM large_table" --connection myconnection --timeout 300

# Dry run (validate query without executing)
snow sql "DELETE FROM table" --dry-run

# Execute and save results to file
snow sql "SELECT * FROM my_table" --output results.csv
```

### 4. Common Query Patterns
```bash
# Show tables in database
snow sql "SHOW TABLES IN DATABASE"

# Describe table structure
snow sql "DESCRIBE TABLE my_table"

# Get current session info
snow sql "SELECT CURRENT_ACCOUNT(), CURRENT_USER(), CURRENT_WAREHOUSE()"

# List schemas
snow sql "SHOW SCHEMAS IN DATABASE"

# View query history
snow sql "SELECT * FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY()) LIMIT 10"
```

## Troubleshooting Connection Issues

### 1. Verify Installation
```bash
# Check Snowflake CLI version
snow --version

# Show CLI information
snow --info

# Verify Python environment
snow connection test --connection <name>
```

### 2. Connection Testing
```bash
# Test connection with verbose output
snow connection test --connection myconnection --verbose

# Check account identifier format
snow sql "SELECT CURRENT_ACCOUNT()" --connection myconnection

# Verify authentication method
snow sql "SELECT CURRENT_USER()" --connection myconnection
```

### 3. Common Issues and Solutions

#### Issue: Authentication Failed
```bash
# Verify credentials
snow connection show --connection myconnection

# Re-authenticate with external browser
snow connection add  # Use authenticator=externalbrowser

# Check environment variables
echo $SNOWFLAKE_USER
echo $SNOWFLAKE_ACCOUNT
```

#### Issue: Account Not Found
```bash
# Ensure correct account format (orgname-accountname)
# Get from Snowflake web UI: Click account menu → Account URL
snow sql "SELECT CURRENT_ACCOUNT()"

# Alternative: Find in Snowsight → Admin → Accounts
```

#### Issue: Warehouse/Database Not Found
```bash
# List available warehouses
snow sql "SHOW WAREHOUSES"

# List available databases
snow sql "SHOW DATABASES"

# Specify explicitly in connection
snow sql "SELECT * FROM db.schema.table" \
  --connection myconnection \
  --warehouse WH_NAME \
  --database DB_NAME
```

#### Issue: Role Permissions
```bash
# Check current role
snow sql "SELECT CURRENT_ROLE()"

# List available roles
snow sql "SHOW ROLES"

# Request role assignment from Snowflake admin
```

### 4. Debug Logging
```bash
# Enable debug logging
export SNOWFLAKE_CLI_DEBUG=true

# View logs
cat ~/.snowflake/logs/snowflake-cli.log

# Check recent log entries
tail -100 ~/.snowflake/logs/snowflake-cli.log
```

### 5. Configuration File Location
```bash
# Default locations:
# Linux: ~/.config/snowflake/config.toml
# macOS: ~/.snowflake/config.toml
# Windows: %USERPROFILE%\.snowflake\config.toml

# Check current config location
snow connection list

# Validate config file
cat ~/.snowflake/config.toml
```

### 6. Proxy Configuration
If behind a proxy:
```bash
export HTTP_PROXY='http://username:password@proxyserver:80'
export HTTPS_PROXY='http://username:password@proxyserver:80'
export NO_PROXY='localhost,.snowflakecomputing.com'
```

## Common Commands Reference

### Connection Management
```bash
snow connection add              # Add new connection
snow connection list            # List all connections
snow connection test            # Test connection
snow connection show            # Show connection details
snow connection remove          # Remove connection
snow connection set-default     # Set default connection
```

### SQL Execution
```bash
snow sql "QUERY"                # Execute query
snow sql --file FILE            # Execute from file
snow sql --format FORMAT        # Output format (json/table/csv)
snow sql --output FILE          # Save results to file
```

### Object Management
```bash
snow object list warehouses     # List warehouses
snow object list databases      # List databases
snow object list schemas        # List schemas
snow object list tables         # List tables
```

### Stage Management
```bash
snow stage list                 # List stages
snow stage create               # Create stage
snow stage put FILE             # Upload file to stage
snow stage get FILE             # Download from stage
```

## Best Practices
1. **Use external browser authentication** for improved security
2. **Store credentials in environment variables** rather than config files for sensitive data
3. **Test connections** before running critical queries
4. **Use appropriate warehouses** for workload size
5. **Set default connection** for frequently used environments
6. **Enable logging** for debugging issues
7. **Use query timeouts** to prevent long-running queries

## Quick Reference
```bash
# Setup
snow connection add

# Test
snow connection test --connection myconnection

# Query
snow sql "SELECT 1" --connection myconnection

# Help
snow sql --help
snow connection --help
```
