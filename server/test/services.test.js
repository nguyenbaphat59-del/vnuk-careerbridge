import test from 'node:test';
import assert from 'node:assert/strict';
import { analyseProfile, buildPlan, localDateKey } from '../src/services.js';

const profile = (overrides = {}) => ({
  fullName: 'Demo Student',
  age: 20,
  major: 'Information Technology',
  targetRole: 'Frontend Developer',
  interests: 'Web design and building useful products',
  currentSkills: 'HTML basics, communication, beginner English',
  careerGoal: 'Prepare for a frontend internship',
  jobDescription: 'HTML CSS JavaScript React Git and communication',
  timelineMonths: 1,
  dailyMinutes: 45,
  targetHireDate: '',
  ...overrides
});

test('analysis matches a target role and identifies evidence gaps', () => {
  const result = analyseProfile(profile());
  assert.ok(result.gaps.length > 0, 'at least one skill gap should be identified');
  assert.ok(result.gaps.some((item) => item.skill === 'JavaScript'));
  assert.ok(result.jdKeywords.includes('react'));
  assert.ok(Array.isArray(result.strengths));
  assert.ok(Array.isArray(result.weaknesses));
  assert.equal(result.mode, 'demo');
});

test('roadmap length follows the selected number of months and keeps focus time bounded', () => {
  const result = buildPlan(profile({ timelineMonths: 2, dailyMinutes: 60 }));
  assert.equal(result.tasks.length, 60);
  assert.ok(result.tasks.every((task) => task.durationMins >= 10 && task.durationMins <= 90));
  assert.equal(result.tasks[0].dueDate, localDateKey());
  assert.equal(result.tasks[0].dayNumber, 1);
  assert.equal(result.tasks.at(-1).dayNumber, 60);
});

test('roadmap dates advance by calendar day without UTC midnight shifting', () => {
  const result = buildPlan(profile({ timelineMonths: 1 }));
  const date = new Date(`${result.tasks[0].dueDate}T12:00:00`);
  for (let index = 0; index < result.tasks.length; index += 1) {
    const expected = new Date(date);
    expected.setDate(date.getDate() + index);
    assert.equal(result.tasks[index].dueDate, localDateKey(expected));
  }
});

test('a nearer target application date shortens the roadmap', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateKey = localDateKey(tomorrow);
  const result = buildPlan(profile({ timelineMonths: 6, targetHireDate: dateKey }));
  assert.ok(result.tasks.length <= 2);
  assert.equal(result.tasks[0].dueDate, localDateKey());
});
