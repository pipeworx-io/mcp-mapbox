# mcp-mapbox

Mapbox geocode, directions, matrix, isochrones, map-matching, tilequery, static URL.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 250+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `geocode_forward` | Address → coords. |
| `geocode_reverse` | Coords → address. |
| `directions` | Routing. |
| `directions_matrix` | Distance/time matrix. |
| `isochrone` | Isochrones. |
| `map_matching` | Snap GPS trace to roads. |
| `tilequery` | Tile feature query. |
| `static_image_url` | Static Image URL. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "mapbox": {
      "url": "https://gateway.pipeworx.io/mapbox/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 250+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Mapbox data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
