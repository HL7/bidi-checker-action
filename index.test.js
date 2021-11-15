const process = require('process');
const cp = require('child_process');
const path = require('path');
const { fail } = require('assert');


// shows how the runner will run a javascript action with env / stdout protocol
test('test valid-project', () => {
  process.env['GITHUB_WORKSPACE'] = './test-resources/valid-project';
  const ip = path.join(__dirname, 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
  console.log(result);
})

test('test invalid-project', () => {
  process.env['GITHUB_WORKSPACE'] = './test-resources/invalid-project';
  const ip = path.join(__dirname, 'index.js');
  try {
    cp.execSync(`node ${ip}`, {env: process.env});
    fail('invalid project should not reach this point.');
  } catch (e) {
    expect(e.message).toMatch(/Command failed/);
  }
})
