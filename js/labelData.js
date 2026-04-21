export async function loadLabelData(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      return { labels: [] };
    }
    const raw = await response.json();
    const labels = Array.isArray(raw.labels) ? raw.labels : [];
    return { labels };
  } catch (_) {
    return { labels: [] };
  }
}
