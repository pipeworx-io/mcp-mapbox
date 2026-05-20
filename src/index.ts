interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Mapbox MCP.
 */


const BASE = 'https://api.mapbox.com';
const UA = 'pipeworx-mcp-mapbox/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'geocode_forward',
    description: 'Address → coords.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        country: { type: 'string' },
        types: { type: 'string' },
        proximity: { type: 'string' },
        bbox: { type: 'string' },
        autocomplete: { type: 'boolean' },
        limit: { type: 'number' },
        language: { type: 'string' },
        fuzzyMatch: { type: 'boolean' },
      },
      required: ['query'],
    },
  },
  {
    name: 'geocode_reverse',
    description: 'Coords → address.',
    inputSchema: { type: 'object', properties: { lon: { type: 'number' }, lat: { type: 'number' }, country: { type: 'string' }, types: { type: 'string' }, language: { type: 'string' }, limit: { type: 'number' } }, required: ['lon', 'lat'] },
  },
  {
    name: 'directions',
    description: 'Routing.',
    inputSchema: {
      type: 'object',
      properties: {
        coordinates: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
        profile: { type: 'string' },
        alternatives: { type: 'boolean' },
        geometries: { type: 'string' },
        overview: { type: 'string' },
        steps: { type: 'boolean' },
        annotations: { type: 'string' },
        voice_instructions: { type: 'boolean' },
        banner_instructions: { type: 'boolean' },
        language: { type: 'string' },
      },
      required: ['coordinates'],
    },
  },
  {
    name: 'directions_matrix',
    description: 'Distance/time matrix.',
    inputSchema: {
      type: 'object',
      properties: {
        coordinates: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
        profile: { type: 'string' },
        sources: { type: 'string' },
        destinations: { type: 'string' },
        annotations: { type: 'string' },
      },
      required: ['coordinates'],
    },
  },
  {
    name: 'isochrone',
    description: 'Isochrones.',
    inputSchema: {
      type: 'object',
      properties: {
        profile: { type: 'string' },
        coordinates: { type: 'array', items: { type: 'number' }, description: '[lon, lat]' },
        contours_minutes: { type: 'string' },
        contours_meters: { type: 'string' },
        contours_colors: { type: 'string' },
        polygons: { type: 'boolean' },
        denoise: { type: 'number' },
        generalize: { type: 'number' },
      },
      required: ['profile', 'coordinates'],
    },
  },
  {
    name: 'map_matching',
    description: 'Snap GPS trace to roads.',
    inputSchema: {
      type: 'object',
      properties: {
        coordinates: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
        profile: { type: 'string' },
        geometries: { type: 'string' },
        radiuses: { type: 'string' },
        steps: { type: 'boolean' },
        annotations: { type: 'string' },
        overview: { type: 'string' },
        timestamps: { type: 'string' },
        tidy: { type: 'boolean' },
      },
      required: ['coordinates'],
    },
  },
  {
    name: 'tilequery',
    description: 'Tile feature query.',
    inputSchema: {
      type: 'object',
      properties: {
        tileset_id: { type: 'string' },
        lon: { type: 'number' },
        lat: { type: 'number' },
        radius: { type: 'number' },
        limit: { type: 'number' },
        dedupe: { type: 'boolean' },
        geometry: { type: 'string' },
        layers: { type: 'string' },
      },
      required: ['tileset_id', 'lon', 'lat'],
    },
  },
  {
    name: 'static_image_url',
    description: 'Static Image URL.',
    inputSchema: {
      type: 'object',
      properties: {
        style_id: { type: 'string' },
        lon: { type: 'number' },
        lat: { type: 'number' },
        zoom: { type: 'number' },
        width: { type: 'number' },
        height: { type: 'number' },
        bearing: { type: 'number' },
        pitch: { type: 'number' },
        retina: { type: 'boolean' },
      },
      required: ['style_id', 'lon', 'lat', 'zoom', 'width', 'height'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  if (!apiKey) throw new Error('Mapbox requires an access token. Set PLATFORM_MAPBOX_KEY or pass ?_apiKey=… (free at https://account.mapbox.com/access-tokens/).');
  const get = async (url: string) => {
    const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
    if (res.status === 401 || res.status === 403) throw new Error('Mapbox: invalid access token.');
    if (!res.ok) throw new Error(`Mapbox: ${res.status}`);
    return res.json();
  };
  const reqStr = (k: string, ex: string) => {
    const v = args[k];
    if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${k}" is missing. Pass a string like ${ex}.`);
    return v;
  };
  const reqNum = (k: string, ex: string) => {
    const v = args[k];
    if (v == null || typeof v !== 'number') throw new Error(`Required argument "${k}" is missing. Pass a number like ${ex}.`);
    return v;
  };
  switch (name) {
    case 'geocode_forward': {
      const q = encodeURIComponent(reqStr('query', '"Paris"'));
      const p = new URLSearchParams({ access_token: apiKey });
      for (const k of ['country', 'types', 'proximity', 'bbox', 'language']) if (args[k]) p.set(k, String(args[k]));
      for (const k of ['autocomplete', 'fuzzyMatch']) if (args[k] != null) p.set(k, args[k] ? 'true' : 'false');
      if (args.limit != null) p.set('limit', String(args.limit));
      return get(`${BASE}/geocoding/v5/mapbox.places/${q}.json?${p}`);
    }
    case 'geocode_reverse': {
      const lon = reqNum('lon', '2.349');
      const lat = reqNum('lat', '48.864');
      const p = new URLSearchParams({ access_token: apiKey });
      for (const k of ['country', 'types', 'language']) if (args[k]) p.set(k, String(args[k]));
      if (args.limit != null) p.set('limit', String(args.limit));
      return get(`${BASE}/geocoding/v5/mapbox.places/${lon},${lat}.json?${p}`);
    }
    case 'directions': {
      const coords = (args.coordinates as number[][]).map(([lon, lat]) => `${lon},${lat}`).join(';');
      const profile = String(args.profile ?? 'driving');
      const p = new URLSearchParams({ access_token: apiKey });
      for (const k of ['geometries', 'overview', 'annotations', 'language']) if (args[k]) p.set(k, String(args[k]));
      for (const k of ['alternatives', 'steps', 'voice_instructions', 'banner_instructions']) if (args[k] != null) p.set(k, args[k] ? 'true' : 'false');
      return get(`${BASE}/directions/v5/mapbox/${encodeURIComponent(profile)}/${coords}?${p}`);
    }
    case 'directions_matrix': {
      const coords = (args.coordinates as number[][]).map(([lon, lat]) => `${lon},${lat}`).join(';');
      const profile = String(args.profile ?? 'driving');
      const p = new URLSearchParams({ access_token: apiKey });
      for (const k of ['sources', 'destinations', 'annotations']) if (args[k]) p.set(k, String(args[k]));
      return get(`${BASE}/directions-matrix/v1/mapbox/${encodeURIComponent(profile)}/${coords}?${p}`);
    }
    case 'isochrone': {
      const [lon, lat] = args.coordinates as [number, number];
      const profile = reqStr('profile', '"driving"');
      const p = new URLSearchParams({ access_token: apiKey });
      for (const k of ['contours_minutes', 'contours_meters', 'contours_colors']) if (args[k]) p.set(k, String(args[k]));
      if (args.polygons != null) p.set('polygons', args.polygons ? 'true' : 'false');
      if (args.denoise != null) p.set('denoise', String(args.denoise));
      if (args.generalize != null) p.set('generalize', String(args.generalize));
      return get(`${BASE}/isochrone/v1/mapbox/${encodeURIComponent(profile)}/${lon},${lat}?${p}`);
    }
    case 'map_matching': {
      const coords = (args.coordinates as number[][]).map(([lon, lat]) => `${lon},${lat}`).join(';');
      const profile = String(args.profile ?? 'driving');
      const p = new URLSearchParams({ access_token: apiKey });
      for (const k of ['geometries', 'radiuses', 'annotations', 'overview', 'timestamps']) if (args[k]) p.set(k, String(args[k]));
      for (const k of ['steps', 'tidy']) if (args[k] != null) p.set(k, args[k] ? 'true' : 'false');
      return get(`${BASE}/matching/v5/mapbox/${encodeURIComponent(profile)}/${coords}?${p}`);
    }
    case 'tilequery': {
      const id = reqStr('tileset_id', '"mapbox.mapbox-streets-v8"');
      const lon = reqNum('lon', '2.349');
      const lat = reqNum('lat', '48.864');
      const p = new URLSearchParams({ access_token: apiKey });
      for (const k of ['radius', 'limit']) if (args[k] != null) p.set(k, String(args[k]));
      if (args.dedupe != null) p.set('dedupe', args.dedupe ? 'true' : 'false');
      for (const k of ['geometry', 'layers']) if (args[k]) p.set(k, String(args[k]));
      return get(`${BASE}/v4/${encodeURIComponent(id)}/tilequery/${lon},${lat}.json?${p}`);
    }
    case 'static_image_url': {
      const style = reqStr('style_id', '"mapbox/streets-v12"');
      const lon = reqNum('lon', '2.349');
      const lat = reqNum('lat', '48.864');
      const zoom = reqNum('zoom', '12');
      const w = reqNum('width', '600');
      const h = reqNum('height', '400');
      const bearing = args.bearing != null ? `/${args.bearing}` : '';
      const pitch = args.pitch != null ? `/${args.pitch}` : '';
      const retina = args.retina ? '@2x' : '';
      const url = `${BASE}/styles/v1/${style}/static/${lon},${lat},${zoom}${bearing}${pitch}/${w}x${h}${retina}?access_token=${encodeURIComponent(apiKey)}`;
      return { url, note: 'URL to fetch the rendered map image. Open in a browser or fetch as a binary.' };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
