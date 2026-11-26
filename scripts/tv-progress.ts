import assert from 'node:assert/strict';
import { MINUTES_PER_DAY, POLITICS } from '../src/sim/config';
import { tvHourly, watchMinute } from '../src/sim/media';
import { deserialize, serialize } from '../src/sim/save';
import { createState, Simulation } from '../src/sim/sim';
import { setTask } from '../src/sim/tasks';
import { hasTvReception, simulationYear, tvAvailable, tvEra, tvSchedules } from '../src/sim/television';
import { programsForYear } from '../src/ui/tvPrograms';

const year = MINUTES_PER_DAY * POLITICS.year;
for (const [tick, expectedYear, era, hours, programs] of [
  [0, 1, 'none', 0, 0], [year - 1, 1, 'none', 0, 0],
  [year, 2, 'monochrome', 3, 1], [2 * year - 1, 2, 'monochrome', 3, 1],
  [2 * year, 3, 'color', 6, 3], [3 * year - 1, 3, 'color', 6, 3],
  [3 * year, 4, 'cable', 9, 4], [10 * year, 11, 'cable', 9, 4],
] as const) {
  assert.equal(simulationYear(tick), expectedYear);
  assert.equal(tvEra(tick), era);
  assert.equal(tvAvailable(tick), era !== 'none');
  assert.equal(Object.keys(tvSchedules[tvEra(tick)]).length, hours);
  assert.equal(programsForYear(simulationYear(tick)).length, programs);
}

const city = new Simulation(createState(147));
const { ctx, state } = city;
assert.ok(state.people.length > 0);
assert.ok(state.people.every((p) => !p.durables.tv));
assert.equal(hasTvReception(state), false);
state.tick = year;
assert.equal(hasTvReception(state), false);
state.people[0].durables.tv = 100;
assert.equal(hasTvReception(state), true);
delete state.people[0].durables.tv;
state.tick = 7 * 60;

// Give the city a completed, staffed studio to isolate the calendar from its economy.
const station = state.firms.find((f) => f.sites.some((id) => ctx.bById.get(id)?.built));
assert.ok(station);
const studio = station.sites.map((id) => ctx.bById.get(id)).find((b) => b?.built);
assert.ok(studio);
station.kind = 'studio';
studio.kind = 'studio';
const presenter = state.people[0];
presenter.inside = studio.id;
setTask(ctx, presenter, 'Present a show', [{ k: 'ownWork', bid: studio.id, until: 23 * 60 }]);
const onAir = () => state.broadcasts.find((b) => b.id === station.channel?.onAir)?.show;

tvHourly(ctx);
assert.equal(state.broadcasts.length, 0);
assert.equal(watchMinute(ctx, presenter), null);
state.tick = year + 7 * 60;
tvHourly(ctx);
assert.equal(onAir(), 'Morning News');
assert.equal(hasTvReception(state), true);
assert.equal(presenter.pol.tv, -1);
assert.equal(watchMinute(ctx, presenter), `Morning News on ${station.channel?.name}`);
assert.equal(presenter.pol.tv, station.id);

state.tick = year + 21 * 60;
tvHourly(ctx);
assert.equal(onAir(), undefined);
state.tick = 2 * year + 21 * 60;
tvHourly(ctx);
assert.equal(onAir(), 'Prime Time Drama');
state.tick = 3 * year + 13 * 60;
tvHourly(ctx);
assert.equal(onAir(), 'Afternoon Matinee');
assert.equal(tvEra(new Simulation(deserialize(serialize(state))).tick), 'cable');

// Even a Year 1 legacy save with an on-air channel cannot be watched.
state.tick = 7 * 60;
assert.equal(hasTvReception(state), false);
assert.equal(watchMinute(ctx, presenter), null);
tvHourly(ctx);
assert.equal(onAir(), undefined);
console.log('TV progression checks passed.');
