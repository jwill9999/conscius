# Cursor MCP (local)

**Do not put SonarCloud tokens or other secrets in `mcp.json`.** If that file is tracked or shared, use environment variables instead.

For the **SonarQube** MCP server, `docker … -e SONARQUBE_TOKEN` reads the token from the environment of the process that starts Cursor (or from values Cursor injects). Before launching Cursor, set:

```bash
export SONARQUBE_TOKEN="your-new-token"
```

Generate tokens in [SonarCloud](https://sonarcloud.io) → **My Account** → **Security**. **Revoke** any token that was pasted into git or chat, then create a new one.
