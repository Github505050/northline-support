/** Public, fictional store content. Change this file to customise the demo. */
export const STORE = {
  name: 'Northline Supply',
  tagline: 'Useful by design. Made for everyday.',
  currency: 'USD',
  freeShippingThreshold: 75,
  support: {
    hours: 'Monday–Friday, 9 am–5 pm Eastern Time',
    contact: 'This demo has no monitored support inbox. A real store would connect its email or helpdesk here.'
  },
  policies: {
    shipping: 'Standard shipping costs $6 for orders under $75, and is complimentary for orders of $75 or more. Orders are packed within 1–2 business days; standard delivery takes an estimated 3–6 business days after dispatch. Delivery timeframes are examples only.',
    returns: 'Unused items in their original condition can be returned within 30 days of delivery. In this demonstration, return requests cannot be submitted or processed.',
    refunds: 'For approved returns, a refund would be issued to the original payment method within 5–10 business days after inspection. No actual purchases or refunds are processed on this website.',
    exchanges: 'Exchanges are not available in this demo. In a real store, a support team would help with the next steps.',
    international: 'The sample store currently shows domestic US shipping only. International checkout is not available in the demo.',
    cancellations: 'Orders may be cancelled before dispatch in a production store. This demo cannot cancel or change orders.'
  },
  products: [
    { id: 'carryall', name: 'The Everyday Carryall', category: 'Bags & Carry', price: 68, color: 'Olive / Canvas', description: 'A thoughtfully proportioned canvas carryall with an interior pocket and comfortable wide handles.', tag: 'BESTSELLER', artwork: 'carryall.svg' },
    { id: 'bottle', name: 'The Everyday Bottle', category: 'Drinkware', price: 34, color: 'Oat / Stainless Steel', description: 'A double-wall insulated bottle with a simple, leak-resistant screw top. Holds 600 mL.', tag: 'NEW COLOR', artwork: 'bottle.svg' },
    { id: 'desk', name: 'The Desk Set', category: 'Workspace', price: 52, color: 'Sand / Solid Oak', description: 'A modular three-piece desk organiser for notes, pens and daily essentials.', tag: '', artwork: 'desk.svg' },
    { id: 'lamp', name: 'The Task Light', category: 'Workspace', price: 89, color: 'Warm Grey / Metal', description: 'A compact directional desk light with a warm finish and a straightforward on/off switch.', tag: 'LIMITED RUN', artwork: 'lamp.svg' }
  ],
  faqs: [
    { question: 'How long does shipping take?', answer: 'Orders are prepared within 1–2 business days. After dispatch, standard delivery is estimated at 3–6 business days.' },
    { question: 'How much is shipping?', answer: 'Standard shipping is $6, or free for orders of $75 and above.' },
    { question: 'Can I return something?', answer: 'Our sample return policy allows returns of unused items in original condition within 30 days of delivery. Returns cannot actually be initiated in the demo.' },
    { question: 'Can I track my order?', answer: 'Yes—try a fictional order number such as NS-1042 or NS-2085 in the chat. No real customer orders are available.' },
    { question: 'Can I talk to a person?', answer: 'A live support connection has not been set up for this fictional store. The chatbot can explain the escalation path, but cannot send messages to an agent.' }
  ],
  /** These identifiers and order details are intentionally fictional and public. */
  sampleOrders: {
    'NS-1042': { status: 'Shipped', item: 'The Everyday Carryall', detail: 'Dispatched with a sample tracking state. Estimated delivery: 3 business days after dispatch.' },
    'NS-2085': { status: 'Processing', item: 'The Everyday Bottle', detail: 'Being prepared for dispatch. No carrier tracking is available yet.' },
    'NS-3140': { status: 'Delivered', item: 'The Desk Set', detail: 'Marked delivered in the fictional demonstration records.' }
  }
};
