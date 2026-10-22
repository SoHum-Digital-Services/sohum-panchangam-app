const assert = require('node:assert/strict');
const { test } = require('node:test');
const { monthlyObservances } = require('../src/monthlyObservances.ts');
// Public GET /v1/tithi-days, Cheruvugattu, fetched 7 October 2026.
const { days } = require('./fixtures/tithi-days.json');

test('monthly dates remain API dates and are sorted chronologically', () => {
  const items = monthlyObservances(days);
  assert.ok(items.length > 0);
  assert.deepEqual(items.map((item) => item.date), items.map((item) => item.date).sort());
  for (const item of items) {
    assert.ok(days[item.key].some((day) => day.date === item.date && day.weekday === item.weekday));
  }
  assert.ok(items.some((item) => item.key === 'maha_shivaratri'));
  assert.deepEqual(monthlyObservances({}), []);
});

test('Masa Shivaratri uses the sunset list and excludes the midnight variant', () => {
  const items = monthlyObservances(days).filter((item) => item.key === 'masa_shivaratri');
  assert.deepEqual(items.map((item) => item.date), days.masa_shivaratri.map((day) => day.date));
  assert.ok(items.some((item) => item.date === '2026-10-09'));
  assert.ok(!items.some((item) => item.date === '2026-10-08'));
  assert.ok(!monthlyObservances(days).some((item) => item.key === 'masa_shivaratri_midnight'));
});

test('Pitru Tarpanam appears only when the API explicitly distinguishes it from Amavasya', () => {
  const items = monthlyObservances(days).filter((item) => item.key === 'pitru_tarpanam');
  assert.deepEqual(items.map((item) => item.date), days.pitru_tarpanam.filter((day) => day.differs_from_amavasya === true).map((day) => day.date));
  const unflagged = { ...days.pitru_tarpanam[0] };
  delete unflagged.differs_from_amavasya;
  assert.deepEqual(monthlyObservances({ pitru_tarpanam: [unflagged] }), []);
});

test('Pradosham preserves API English and Telugu titles, including Saturday Maha Pradosham', () => {
  const items = monthlyObservances(days).filter((item) => item.key === 'pradosham');
  for (const item of items) {
    const day = days.pradosham.find((entry) => entry.date === item.date);
    assert.equal(item.name, day.title);
    assert.equal(item.name_te, day.title_te);
  }
  assert.ok(items.some((item) => item.name === 'Maha Pradosham (Shani Pradosham)' && item.name_te === 'మహా ప్రదోషం (శని ప్రదోషం)'));
});
