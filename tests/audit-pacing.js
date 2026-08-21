const fs = require('fs');
const vm = require('vm');

const context = vm.createContext({ window: {} });
for (const file of ['story.js', 'story-v2.js', 'story-v4.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}

const story = context.window.AFTER_ZERO_STORY;
const keys = ['lincheng', 'tangsha', 'sumi', 'guwanqing', 'jiyao'];

console.log(`START ${story.start} / REPLAY ${story.replayStart} / ROUTE ${story.routeSelect}`);
console.log('\nROUTE GATES');
for (const [id, node] of Object.entries(story.nodes)) {
  if (node.type === 'routeGate') console.log(id, Object.fromEntries(Object.entries(node.routes || {}).map(([key, route]) => [key, route.next])), node.trueRoute?.next || '');
}

console.log('\nROUTE PREFIX COUNTS');
for (const key of keys) {
  const ids = Object.keys(story.nodes).filter(id => id.includes(key));
  const types = {};
  for (const id of ids) types[story.nodes[id].type] = (types[story.nodes[id].type] || 0) + 1;
  console.log(key, ids.length, types, ids[0], ids.at(-1));
}

console.log('\nCHOICES');
for (const [id, node] of Object.entries(story.nodes)) {
  if (node.type === 'choice') console.log(id, node.choices?.length || 0, node.prompt || '');
}

console.log('\nCHAPTER COUNTS');
const chapters = {};
for (const node of Object.values(story.nodes)) {
  const title = node.chapter?.title || '(none)';
  chapters[title] = (chapters[title] || 0) + 1;
}
for (const [title, count] of Object.entries(chapters).sort((a, b) => b[1] - a[1])) console.log(count, title);

const lineNodes = Object.values(story.nodes).filter(node => node.type === 'line');
const textCharacters = lineNodes.reduce((sum, node) => sum + Array.from(node.text || '').length, 0);
console.log(`\nTEXT ${lineNodes.length} lines / ${textCharacters} characters / ${(textCharacters / lineNodes.length).toFixed(1)} average`);
