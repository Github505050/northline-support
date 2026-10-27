import { STORE } from './knowledge.js';

const normalise = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '').replace(/[^\p{L}\p{N}#-]+/gu, ' ').trim();
const includesAny = (text, words) => words.some(w => text.includes(w));
const containsTerm = (text, term) => text.split(/\s+/).includes(term);

export function detectOrderReference(input) {
  const match = input.toUpperCase().match(/\bNS[\s-]?(\d{4})\b/);
  return match ? `NS-${match[1]}` : null;
}

/** Deterministic, offline FAQ assistant: NOT a language model. */
export function demoReply(input) {
  const raw = String(input ?? '').trim();
  if (!raw || raw.length > 400) return { text: 'Please enter a question of 1–400 characters.', type: 'validation' };
  const text = normalise(raw);
  const order = detectOrderReference(raw);
  if (order) {
    const record = STORE.sampleOrders[order];
    return record
      ? { text: `Demo order ${order} — ${record.status}. Item: ${record.item}. ${record.detail} This is fictional sample data, not a real customer order.`, type: 'order' }
      : { text: `I can't find ${order} among the fictional sample orders. Try NS-1042, NS-2085 or NS-3140. I cannot access real orders.`, type: 'order' };
  }
  if (includesAny(text, ['track', 'tracking', 'order status', 'where is my order', 'my order', 'delivery status', 'purchase status', 'status of'])) {
    return { text: 'I can look up fictional sample orders only. Try NS-1042 (shipped), NS-2085 (processing) or NS-3140 (delivered). No real orders are stored or accessed.', type: 'order' };
  }
  if (includesAny(text, ['human', 'person', 'agent', 'representative', 'employee', 'complain', 'complaint', 'support team', 'contact', 'email', 'phone'])) {
    return { text: `For questions that need a person, a real store would route your request to its customer-support team (${STORE.support.hours}). This portfolio demo has no monitored inbox or live-agent connection, so I can't submit a support ticket.`, type: 'handoff' };
  }
  if (includesAny(text, ['refund', 'money back', 'reimburse'])) return { text: STORE.policies.refunds, type: 'policy' };
  if (includesAny(text, ['return', 'send back'])) return { text: STORE.policies.returns, type: 'policy' };
  if (includesAny(text, ['exchange', 'swap'])) return { text: STORE.policies.exchanges, type: 'policy' };
  if (includesAny(text, ['cancel', 'change order', 'modify order'])) return { text: STORE.policies.cancellations, type: 'policy' };
  if (includesAny(text, ['international', 'worldwide', 'outside the us', 'canada', 'europe'])) return { text: STORE.policies.international, type: 'policy' };
  if (includesAny(text, ['shipping', 'delivery', 'ship', 'arrive', 'postage', 'shipping cost', 'how long', 'free shipping', 'shipping fee'])) {
    return { text: STORE.policies.shipping, type: 'policy' };
  }
  const product = STORE.products.find(p => {
    const name = normalise(p.name);
    return containsTerm(text, p.id) || text.includes(name) || (p.id === 'carryall' && includesAny(text,['bag','tote','carryall'])) ||
      (p.id === 'bottle' && includesAny(text,['bottle','flask','drinkware'])) ||
      (p.id === 'desk' && includesAny(text,['organizer','organiser','desk set'])) ||
      (p.id === 'lamp' && includesAny(text,['lamp','light','task light']));
  });
  if (product) return { text: `${product.name} costs $${product.price}. ${product.description} Available demo finish: ${product.color}. Checkout is not enabled in this portfolio demonstration.`, type: 'product' };
  if (includesAny(text, ['price', 'cost', 'products', 'catalog', 'catalogue', 'what do you sell', 'shop', 'item'])) {
    return { text: `Our featured demo items are ${STORE.products.map(p=>`${p.name} ($${p.price})`).join(', ')}. Ask me about any of them!`, type: 'product' };
  }
  if (includesAny(text, ['hello', 'hi', 'hey', 'good morning', 'good evening'])) return { text: 'Hello! I can help with our sample products, shipping, returns or fictional order status. What would you like to know?', type: 'greeting' };
  if (includesAny(text, ['thank', 'thanks'])) return { text: 'You’re welcome. Is there anything else you’d like to know about Northline Supply?', type: 'greeting' };
  if (includesAny(text, ['hours', 'open'])) return { text: `Sample support hours: ${STORE.support.hours}. There is no staffed support channel behind this demonstration.`, type: 'policy' };
  return { text: 'I don’t have a reliable demo answer for that question. I can help with shipping, returns, product details and sample order IDs. For other requests, a production chatbot would hand this conversation to a support agent; no real handoff is connected here.', type: 'fallback' };
}
