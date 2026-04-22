export const CITY_DATASETS = [
  {
    key: "brasilia",
    name: "Brasilia",
    graphPath: "./brasilia.json",
    labelsPath: "./brasilia.json",  // if labels are in same file, use same path
  },
  {
    key: "mumbai",
    name: "Dadar, Mumbai",
    graphPath: "./mumbai.json",
    labelsPath: "./mumbai.json",  // if labels are in same file, use same path
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
  }
];

export const DEFAULT_CITY_KEY = "brasilia";

export function getCityDataset(key) {
  return CITY_DATASETS.find((c) => c.key === key) || CITY_DATASETS[0];
}
