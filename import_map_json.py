import json
import time

import osmnx as ox
import requests

ox.settings.log_console = True

G = ox.graph_from_point((18.5204, 73.8567), dist=1000, network_type="drive")
ox.plot_graph(G)


def bbox_from_nodes(nodes):
    min_lon = min(n["x"] for n in nodes)
    max_lon = max(n["x"] for n in nodes)
    min_lat = min(n["y"] for n in nodes)
    max_lat = max(n["y"] for n in nodes)
    return min_lat, min_lon, max_lat, max_lon


def overpass_query(min_lat, min_lon, max_lat, max_lon):
    return f"""
[out:json][timeout:25];
(
  node["name"]["place"]({min_lat},{min_lon},{max_lat},{max_lon});
  way["name"]["place"]({min_lat},{min_lon},{max_lat},{max_lon});
  node["name"]["amenity"]({min_lat},{min_lon},{max_lat},{max_lon});
  node["name"]["shop"]({min_lat},{min_lon},{max_lat},{max_lon});
  node["name"]["tourism"]({min_lat},{min_lon},{max_lat},{max_lon});
  node["name"]["leisure"]({min_lat},{min_lon},{max_lat},{max_lon});
  node["name"]["railway"]({min_lat},{min_lon},{max_lat},{max_lon});
  node["name"]["public_transport"]({min_lat},{min_lon},{max_lat},{max_lon});
);
out center;
"""


def element_coords(el):
    if "lat" in el and "lon" in el:
        return el["lon"], el["lat"]
    center = el.get("center")
    if center and "lat" in center and "lon" in center:
        return center["lon"], center["lat"]
    return None, None


def classify_kind(tags):
    if "place" in tags:
        return "place"
    return "poi"


def dedupe_labels(labels, coord_decimals=4):
    seen = set()
    out = []
    for l in labels:
        key = (
            l["name"].strip().lower(),
            round(l["x"], coord_decimals),
            round(l["y"], coord_decimals),
        )
        if key in seen:
            continue
        seen.add(key)
        out.append(l)
    return out


def fetch_labels(min_lat, min_lon, max_lat, max_lon, retries=2):
    query = overpass_query(min_lat, min_lon, max_lat, max_lon)
    endpoint = "https://overpass-api.de/api/interpreter"
    headers = {
        'User-Agent': 'DeliveryOptimizer_CITY/1.0',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    for attempt in range(retries + 1):
        try:
            response = requests.post(endpoint, data={"data": query}, headers=headers, timeout=35)
            response.raise_for_status()
            data = response.json()
            labels = []
            for el in data.get("elements", []):
                tags = el.get("tags", {})
                name = tags.get("name")
                if not name:
                    continue
                lon, lat = element_coords(el)
                if lon is None or lat is None:
                    continue
                labels.append(
                    {
                        "name": name,
                        "x": lon,
                        "y": lat,
                        "kind": classify_kind(tags),
                    }
                )
            labels = dedupe_labels(labels)
            labels.sort(key=lambda x: (0 if x["kind"] == "place" else 1, x["name"].lower()))
            return labels[:250]
        except Exception:
            if attempt == retries:
                return []
            time.sleep(1.4 * (attempt + 1))
    return []


# --- extract nodes ---
nodes = []
for node_id, data in G.nodes(data=True):
    nodes.append({"id": int(node_id), "x": data["x"], "y": data["y"]})

# --- extract edges ---
edges = []
for u, v, data in G.edges(data=True):
    edges.append({"u": int(u), "v": int(v), "length": data.get("length", 0)})

min_lat, min_lon, max_lat, max_lon = bbox_from_nodes(nodes)
labels = fetch_labels(min_lat, min_lon, max_lat, max_lon)

graph = {"nodes": nodes, "edges": edges, "labels": labels}

# --- save compact JSON ---
with open("graph.json", "w", encoding="utf-8") as f:
    json.dump(graph, f, separators=(",", ":"), ensure_ascii=False)