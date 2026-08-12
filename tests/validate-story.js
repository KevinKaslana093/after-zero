const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.resolve(__dirname, '..');
const context = vm.createContext({ window: {} });
for (const file of ['story.js', 'story-v2.js', 'story-v4.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}

const story = context.window.AFTER_ZERO_STORY;
const errors = [];
const referencedAssets = new Set();
const assertNode = (source, target, field) => {
  if (target && !story.nodes[target]) errors.push(`${source}.${field} -> missing node ${target}`);
};

for (const [id, node] of Object.entries(story.nodes)) {
  if (!node || !node.type) errors.push(`${id} has no type`);
  if (node.bg && !story.backgrounds[node.bg]) errors.push(`${id}.bg -> missing background ${node.bg}`);
  if (node.char != null && !story.characters[node.char]) errors.push(`${id}.char -> missing character ${node.char}`);
  assertNode(id, node.next, 'next');
  assertNode(id, node.fallback, 'fallback');
  for (const choice of node.choices || []) assertNode(id, choice.next, 'choice.next');
  for (const branch of node.branches || []) assertNode(id, branch.next, 'branch.next');
  for (const route of Object.values(node.routes || {})) assertNode(id, route.next, 'route.next');
  if (node.trueRoute) assertNode(id, node.trueRoute.next, 'trueRoute.next');
  if (node.type === 'ending' && !story.endings[node.ending]) errors.push(`${id} -> missing ending ${node.ending}`);
}

for (const [key, bg] of Object.entries(story.backgrounds)) {
  if (!bg.src) errors.push(`background ${key} has no src`);
  else referencedAssets.add(bg.src);
}
for (const [key, character] of Object.entries(story.characters)) {
  referencedAssets.add(character.image);
  Object.values(character.expressions || {}).forEach(src => referencedAssets.add(src));
}
for (const [key, ending] of Object.entries(story.endings)) {
  if (!story.backgrounds[ending.bg]) errors.push(`ending ${key} -> missing background ${ending.bg}`);
  if (ending.image) referencedAssets.add(ending.image);
  if (ending.routeEnding !== false && !ending.evidence) errors.push(`ending ${key} has no evidence`);
  if (ending.evidence?.verify) {
    const verify = ending.evidence.verify;
    if (!verify.prompt || !verify.answer || !Array.isArray(verify.choices) || verify.choices.length < 2) errors.push(`ending ${key} has invalid evidence verification`);
    if (!verify.choices.some(choice => choice[0] === verify.answer)) errors.push(`ending ${key} verification answer is not selectable`);
  }
}
const puzzleEvidence = Object.values(story.endings).filter(ending => ending.evidence?.verify);
if (puzzleEvidence.length !== 5) errors.push(`decoder requires 5 verifiable artifacts, found ${puzzleEvidence.length}`);
for (const src of referencedAssets) {
  if (!fs.existsSync(path.join(root, src))) errors.push(`missing asset ${src}`);
}

if (!story.start || !story.nodes[story.start]) errors.push(`invalid story.start ${story.start}`);
if (!story.replayStart || !story.nodes[story.replayStart]) errors.push(`invalid story.replayStart ${story.replayStart}`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Story graph valid: ${Object.keys(story.nodes).length} nodes, ${Object.keys(story.endings).length} endings, ${referencedAssets.size} assets.`);
