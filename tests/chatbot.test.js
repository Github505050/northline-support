import test from 'node:test';
import assert from 'node:assert/strict';
import {demoReply, detectOrderReference} from '../docs/assets/chatbot.js';
import {STORE} from '../docs/assets/knowledge.js';

test('product information is grounded in the editable knowledge file',()=>{
  assert.match(demoReply('Tell me about the carryall').text,/\$68/);
  assert.match(demoReply('What bottle do you sell?').text,/600 mL/);
  assert.match(demoReply('How much does the lamp cost?').text,/\$89/);
});
test('shipping, returns, refunds and handoff work',()=>{
  assert.match(demoReply('How long does shipping take?').text,/3–6 business days/);
  assert.match(demoReply('I want to return an item').text,/30 days/);
  assert.match(demoReply('When will I get a refund?').text,/5–10 business days/);
  assert.match(demoReply('Can I speak with a human?').text,/no monitored inbox/i);
});
test('sample orders are explicit and never claim live tracking',()=>{
  assert.equal(detectOrderReference('Where is ns 1042?'),'NS-1042');
  assert.match(demoReply('Status of order NS-1042?').text,/fictional sample data/);
  assert.match(demoReply('NS-2085').text,/Processing/);
  assert.match(demoReply('NS-3140').text,/Delivered/);
  assert.match(demoReply('NS-9999').text,/can't find/);
  assert.match(demoReply('Where is my order?').text,/No real orders/);
});
test('unknown messages do not hallucinate',()=>{
  assert.equal(demoReply('Please book me an airline ticket').type,'fallback');
  assert.equal(demoReply('  ').type,'validation');
  assert.equal(demoReply('a'.repeat(401)).type,'validation');
  assert.match(demoReply('<img onerror=alert(1)>').text,/don’t have a reliable demo answer/);
});
test('knowledge covers expected categories',()=>{
  assert.equal(STORE.products.length,4);
  assert.equal(STORE.faqs.length,5);
  assert.equal(Object.keys(STORE.sampleOrders).length,3);
});
