import osmnx as ox

ox.settings.log_console = True

G = ox.graph_from_point((18.5204, 73.8567), dist=1000, network_type="drive")

ox.plot_graph(G)

import json

# --- extract nodes ---
nodes = []
for node_id, data in G.nodes(data=True):
    nodes.append({
        "id": int(node_id),
        "x": data["x"],   # longitude
        "y": data["y"]    # latitude
    })

# --- extract edges ---
edges = []
for u, v, data in G.edges(data=True):
    edges.append({
        "u": int(u),
        "v": int(v),
        "length": data.get("length", 0)
    })

graph = {
    "nodes": nodes,
    "edges": edges
}

# --- save compact JSON ---
with open("graph.json", "w") as f:
    json.dump(graph, f, separators=(",", ":"))