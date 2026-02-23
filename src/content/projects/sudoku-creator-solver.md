---
title: 'Sudoku Creator Solver'
description: 'A simple Sudoku app with a GUI to play, generate, save/load, and automatically solve boards.'
details: 'Built during undergrad to explore Sudoku and NP-hard solving strategies. The solver combines depth-first search with constraint propagation by choosing the square with the fewest candidates, assigning values, and propagating peer constraints while backtracking on contradictions. The generator reuses the solver by seeding a random value, solving to a full valid grid, then removing values while checking alternatives to preserve uniqueness and target single-solution puzzles. Includes 50 pre-made boards under "50 Random Problems".'
link: 'https://github.com/ronald-balutiu/sudoku-creator-solver'
icon: /assets/sudoku.svg
---
