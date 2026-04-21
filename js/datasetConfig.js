export const CITY_DATASETS = [
  {
    key: "brasilia",
    name: "Brasilia",
    graphPath: "./brasilia.json",
    labelsPath: "./brasilia.json",  // if labels are in same file, use same path
  },
  {
    key: "pune",
    name: "Pune City",
    graphPath: "./pune_city.json",
    labelsPath: "./pune_city.json",  // if labels are in same file, use same path
  },
  {
    key: "dubai",
    name: "Dubai",
    graphPath: "./dubai.json",
    labelsPath: "./dubai.json",  // if labels are in same file, use same path
  },
  {
    key: "canberra",
    name: "Canberra, Australia",
    graphPath: "./canberra.json",
    labelsPath: "./canberra.json",  // if labels are in same file, use same path
  },
  {
    key: "newyork",
    name: "New York, USA",
    graphPath: "./new_york.json",
    labelsPath: "./new_york.json",  // if labels are in same file, use same path
  },
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

export const DEFAULT_CITY_KEY = "brasilia";

export function getCityDataset(key) {
  return CITY_DATASETS.find((c) => c.key === key) || CITY_DATASETS[0];
}
