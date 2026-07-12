# Evolite

![NPM Version](https://img.shields.io/npm/v/evolite)
![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/evolite)
![NPM License](https://img.shields.io/npm/l/evolite)

Evolite is a lightweight genetic algorithm library for TypeScript and JavaScript.
It gives you a small async API for evolving any data shape as long as you can
provide fitness, selection, crossover, and mutation functions.

## Features

- Small, dependency-free runtime API
- Async fitness, selection, crossover, and mutation hooks
- Built-in selection strategies
- Maximize or minimize optimization modes
- Early stop when a fitness objective is reached
- Optional generation logging

## Install

```bash
npm install evolite
```

If you are using Bun:

```bash
bun add evolite
```

## Quick Start

```ts
import { GeneticAlgorithm, Optimize, randomSelection } from "evolite";

type Individual = {
  value: number;
  fitness?: number;
};

const ga = new GeneticAlgorithm<Individual>({
  initialPopulation: [{ value: 1 }, { value: 5 }, { value: 10 }, { value: 20 }],
  maxPopulationSize: 4,
  mutationRate: 0.1,
  fittestAlwaysSurvives: true,
  optimization: Optimize.Maximize,
  fitnessObjective: 100,
  logging: false,
})
  .setFitnessFunction(async (individual) => individual.value * 10)
  .setSelectionMethod(randomSelection)
  .setCrossoverMethod(async (parent1, parent2) => ({
    value: Math.round((parent1.value + parent2.value) / 2),
  }))
  .setMutationMethod(async (individual) => ({
    ...individual,
    value: individual.value + 1,
  }));

const fittest = await ga.evolve(20);
console.log(fittest);
```

## API

### `GeneticAlgorithm`

Create a new optimizer with:

- `initialPopulation`: required array of individuals
- `maxPopulationSize`: maximum population size, default `20`
- `mutationRate`: probability of mutation, default `0.01`
- `fittestAlwaysSurvives`: keep the top individual in each generation, default `true`
- `optimization`: `Optimize.Maximize` or `Optimize.Minimize`, default `Optimize.Maximize`
- `fitnessObjective`: optional target fitness to stop early
- `logging`: print generation progress, default `false`
- `loggingInterval`: how often to log generations, default `1`

You then wire in the four async hooks:

- `setFitnessFunction(fitnessFunction)`
- `setSelectionMethod(selectionMethod)`
- `setCrossoverMethod(crossoverMethod)`
- `setMutationMethod(mutationMethod)`

Finally, run evolution with:

- `await evolve(generations, callback?)`

It returns the fittest individual from the final population.

#### Callback Parameter

You can optionally pass a callback function to `evolve()` that gets invoked after each generation:

```ts
await ga.evolve(20, (generation, population, fittest) => {
  console.log(`Generation ${generation}: Best fitness = ${fittest.fitness}`);
  // Your custom logic here
});
```

The callback receives:

- `generation`: current generation number
- `population`: entire population array
- `fittest`: the best individual in the current generation

This is useful for tracking progress, updating UI, or implementing custom stopping conditions.

### `Optimize`

- `Optimize.Maximize`: Maximizes the fitness value
- `Optimize.Minimize`: Minimizes the fitness value

## Built-in Selection Methods

Evolite exports these ready-to-use selection helpers:

- `fittestSelection(population)` - returns the first two individuals, assuming the population is already sorted by fitness
- `randomSelection(population)` - returns two random individuals
- `tournamentSelection(population)` - returns winners from repeated pairwise tournaments
- `linearRankingSelection(population)` - selects by rank after sorting by fitness
- `rouletteWheelSelection(population)` - selects proportionally to fitness

Each selection method expects a population with at least two individuals.

## Types

Individuals should include an optional `fitness` field:

```ts
type WithFitness = {
  fitness?: number;
};
```

The async hooks use these shapes internally:

- `fitnessFunction(individual) => Promise<number>`
- `selectionMethod(population) => Promise<[parent1, parent2]>`
- `mutationMethod(individual) => Promise<individual>`
- `crossoverMethod(parent1, parent2) => Promise<individual>`

## Development

```bash
bun install
bun run test
bun run build
bun run lint
```

## Repository

- GitHub: https://github.com/Seyronh/Evolite
- Issues: https://github.com/Seyronh/Evolite/issues

## License

MIT
