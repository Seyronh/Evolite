export { GeneticAlgorithm } from "./geneticAlgorithm";
export { Optimize } from "./types";
export {
  fittestSelection,
  randomSelection,
  tournamentSelection,
  linearRankingSelection,
  rouletteWheelSelection,
} from "./selection";
export type {
  geneticAlgorithmOptions,
  WithFitness,
  crossoverMethod,
  fitnessFunction,
  selectionMethod,
  mutationMethod,
} from "./types";
