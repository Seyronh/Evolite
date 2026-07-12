import { GeneticAlgorithm } from "./geneticAlgorithm.ts";
import { Optimize } from "./types.ts";
import type { geneticAlgorithmOptions } from "./types.ts";
import {
  fittestSelection,
  randomSelection,
  tournamentSelection,
  linearRankingSelection,
  rouletteWheelSelection,
} from "./selection.ts";
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
