# @pipeworx/mapbox

[Mapbox](https://docs.mapbox.com/api/) MCP — geocoding, directions, matrix, isochrones, static maps URLs, tilequery. Free tier ~50k req/mo.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1683+ live data sources.

## Auth

- Platform: `PLATFORM_MAPBOX_KEY`. BYO: `?_apiKey=…` (Mapbox access token).

## Tools

- `geocode_forward(query, country?, types?, proximity?, bbox?, autocomplete?, limit?, language?, fuzzyMatch?)` — address → coords
- `geocode_reverse(lon, lat, country?, types?, language?, limit?)` — coords → address
- `directions(coordinates, profile?, alternatives?, geometries?, overview?, steps?, annotations?, voice_instructions?, banner_instructions?, language?)` — routing
- `directions_matrix(coordinates, profile?, sources?, destinations?, annotations?)` — distance/time matrix
- `isochrone(profile, coordinates, contours_minutes?, contours_meters?, contours_colors?, polygons?, denoise?, generalize?)` — isochrones
- `map_matching(coordinates, profile?, geometries?, radiuses?, steps?, annotations?, overview?, timestamps?, tidy?)` — snap GPS trace to roads
- `tilequery(tileset_id, lon, lat, radius?, limit?, dedupe?, geometry?, layers?)` — tile feature query
- `static_image_url(style_id, lon, lat, zoom, width, height, bearing?, pitch?, retina?)` — returns a Static Image API URL (image not fetched server-side)

`profile`: `driving | walking | cycling | driving-traffic`. `coordinates`: `[[lon, lat], …]`.

## Data source

`https://api.mapbox.com`

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/mapbox/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1683+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

This pack takes your own API key (`_apiKey`) — we don't front one for it, so there's no curl here that would run without it. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/geocode_forward`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "mapbox": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-mapbox"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-mapbox
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Mapbox data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
