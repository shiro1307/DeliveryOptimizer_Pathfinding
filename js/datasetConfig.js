export const CITY_DATASETS = [
  {
    key: "city_1",
    name: "City 1",
    graphPath: "./data/city_1_graph.json",
    labelsPath: "./data/city_1_labels.json",
  },
  {
    key: "city_2",
    name: "City 2",
    graphPath: "./data/city_2_graph.json",
    labelsPath: "./data/city_2_labels.json",
  },
  {
    key: "city_3",
    name: "City 3",
    graphPath: "./data/city_3_graph.json",
    labelsPath: "./data/city_3_labels.json",
  },
];

export const DEFAULT_CITY_KEY = "city_1";

export function getCityDataset(key) {
  return CITY_DATASETS.find((c) => c.key === key) || CITY_DATASETS[0];
}
