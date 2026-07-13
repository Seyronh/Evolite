import { GeneticAlgorithm } from "./geneticAlgorithm";
import { Optimize } from "./types";
import type { geneticAlgorithmOptions } from "./types";
import {
  fittestSelection,
  randomSelection,
  tournamentSelection,
  linearRankingSelection,
  rouletteWheelSelection,
} from "./selection";
export {
  GeneticAlgorithm,
  fittestSelection,
  randomSelection,
  tournamentSelection,
  linearRankingSelection,
  rouletteWheelSelection,
  Optimize,
};
export type { geneticAlgorithmOptions };
