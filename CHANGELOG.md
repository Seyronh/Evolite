# [1.3.0](https://github.com/Seyronh/Evolite/compare/v1.2.1...v1.3.0) (2026-07-15)


### Features

* :sparkles: early stop method and reset method ([94f14ad](https://github.com/Seyronh/Evolite/commit/94f14adfa44f3fcbadf5ebe1cf3f5c89a90df51d))

## [1.2.1](https://github.com/Seyronh/Evolite/compare/v1.2.0...v1.2.1) (2026-07-15)


### Bug Fixes

* :bug: fitnessObjective was initialized to 0 when it has to be undefined ([c2f1bd2](https://github.com/Seyronh/Evolite/commit/c2f1bd280395acb1b6682f9ed790d505699e17c3))
* :bug: if fitnessObjective is 0 it doesnt stop ([04d574c](https://github.com/Seyronh/Evolite/commit/04d574cda4c5502b9103118a203473b940deaf97))

# [1.2.0](https://github.com/Seyronh/Evolite/compare/v1.1.1...v1.2.0) (2026-07-14)


### Bug Fixes

* :bug: mutationRate if statement was inverted ([96529c7](https://github.com/Seyronh/Evolite/commit/96529c74781e1ed608f114c60a455317944def55))


### Features

* :sparkles: add yieldEvery property ([a58838f](https://github.com/Seyronh/Evolite/commit/a58838f655599f95712c60bbfaf481aa0873db0a))

## [1.1.1](https://github.com/Seyronh/Evolite/compare/v1.1.0...v1.1.1) (2026-07-13)


### Bug Fixes

* :bug: minimize not working properly with fitnessObjective ([fbda31f](https://github.com/Seyronh/Evolite/commit/fbda31f40d9b194fe90243e705b44f3b9d4d92a9))
* :lock: use .at method to fix Generic object injection sink ([c5975e1](https://github.com/Seyronh/Evolite/commit/c5975e1af661f606f5934cf81cbf2e81606aee76))


### Performance Improvements

* :zap: make offSpring generation more async ([d977791](https://github.com/Seyronh/Evolite/commit/d9777915859b175d0ace0818c47ba3403161b9d2))

# [1.1.0](https://github.com/Seyronh/Evolite/compare/v1.0.2...v1.1.0) (2026-07-12)


### Bug Fixes

* :bug: type not working properly for selection functions ([ceab1d2](https://github.com/Seyronh/Evolite/commit/ceab1d237592d4a095dbee7397501528e1a13eda))


### Features

* :sparkles: optional callback function in evolve method ([a1b4732](https://github.com/Seyronh/Evolite/commit/a1b4732e7bee7ab295eecf75abdc967693cf0c0a))
