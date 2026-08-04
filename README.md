# @pipeworx/mapbox

[Mapbox](https://docs.mapbox.com/api/) MCP — geocoding, directions, matrix, isochrones, static maps URLs, tilequery. Free tier ~50k req/mo.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
