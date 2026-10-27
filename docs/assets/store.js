import { STORE } from './knowledge.js';
import { demoReply, detectOrderReference } from './chatbot.js';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const currency = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: STORE.currency, maximumFractionDigits: 0 }).format(n);
const escapeText = s => String(s);
const productsRoot = $('#products-grid');
const faqsRoot = $('#faq-list');
const cart = new Map();
let chatLog = [];
let waiting = false;
let chatOpened = false;
let activeMode = 'demo';
const API_URL = typeof window.NORTHLINE_API_URL === 'string' ? window.NORTHLINE_API_URL.trim().replace(/\/$/, '') : '';

function renderProducts() {
  productsRoot.replaceChildren(...STORE.products.map(p => {
    const article = document.createElement('article');
    article.className = 'product-card';
    article.innerHTML = `<div class="product-visual visual-${p.id}"><div class="product-badge"></div><img src="assets/${p.artwork}" loading="lazy" width="340" height="290" alt="Illustration of ${p.name}" /></div><div class="product-info"><div><p class="eyebrow muted">${p.category}</p><h3>${p.name}</h3><p class="finish"></p></div><span class="product-price">${currency(p.price)}</span></div><button class="add-button" type="button" aria-label="Add ${p.name} to demo cart"><span>Add to bag</span><span aria-hidden="true">↗</span></button>`;
    $('.product-badge', article).textContent = p.tag || '\u00a0';
    $('.finish', article).textContent = p.color;
    $('.add-button', article).addEventListener('click', () => addToCart(p.id));
    return article;
  }));
}
function renderFAQs() {
  faqsRoot.replaceChildren(...STORE.faqs.map(({question,answer}, i)=>{
    const details = document.createElement('details');
    details.className = 'faq-item';
    if (i===0) details.open = true;
    const summary = document.createElement('summary'); summary.textContent=question;
    const paragraph = document.createElement('p'); paragraph.textContent=answer;
    details.append(summary, paragraph);
    return details;
  }));
}
function addToCart(id) {
  cart.set(id, (cart.get(id) || 0)+1);
  renderCart(); openCart();
}
function renderCart() {
  const count = [...cart.values()].reduce((a,b)=>a+b,0);
  $('#cart-count').textContent = count;
  const list = $('#cart-items'); list.replaceChildren();
  if (!count) {
    const empty = document.createElement('p'); empty.className='empty-cart'; empty.textContent='Your bag is empty. Pick something you like.'; list.append(empty);
  } else {
    STORE.products.filter(p=>cart.has(p.id)).forEach(p=>{
      const el = document.createElement('div'); el.className='cart-item';
      const info = document.createElement('div');
      const name = document.createElement('strong'); name.textContent=p.name;
      const desc=document.createElement('small'); desc.textContent=`${currency(p.price)} · Qty ${cart.get(p.id)}`;
      info.append(name,desc);
      const button=document.createElement('button'); button.type='button';button.className='text-button'; button.textContent='Remove';
      button.setAttribute('aria-label',`Remove one ${p.name}`);
      button.addEventListener('click',()=>{const next=cart.get(p.id)-1;if(next)cart.set(p.id,next);else cart.delete(p.id);renderCart();});
      el.append(info,button); list.append(el);
    });
  }
  const total=STORE.products.reduce((sum,p)=>sum+(cart.get(p.id)||0)*p.price,0);
  $('#cart-total').textContent=currency(total);
  $('#checkout-demo').disabled = count===0;
}
function openCart() { $('#cart-panel').inert=false; $('#cart-panel').classList.add('visible'); $('#cart-panel').setAttribute('aria-hidden','false'); $('#cart-shade').hidden=false; $('#cart-close').focus(); }
function closeCart() { $('#cart-panel').inert=true; $('#cart-panel').classList.remove('visible'); $('#cart-panel').setAttribute('aria-hidden','true'); $('#cart-shade').hidden=true; $('#cart-open').focus(); }
$('#cart-open').addEventListener('click',openCart);
$('#cart-close').addEventListener('click',closeCart);
$('#cart-shade').addEventListener('click',closeCart);
$('#checkout-demo').addEventListener('click',()=>$('#cart-notice').hidden=false);

const chatPanel = $('#chat-panel');
const chatLauncher = $('#chat-launcher');
const messages = $('#chat-messages');
function setChatOpen(value) {
  chatPanel.inert=!value;
  chatPanel.classList.toggle('open', value);
  chatPanel.setAttribute('aria-hidden', String(!value));
  chatLauncher.setAttribute('aria-expanded', String(value));
  if(value) {
    if(!chatOpened) { chatOpened=true; appendMessage('assistant', 'Hi there! Welcome to Northline Supply. I can help with products, shipping, returns or fictional demo orders. What can I help you with?', 'demo'); }
    $('#chat-input').focus();
  } else chatLauncher.focus();
}
chatLauncher.addEventListener('click',()=>setChatOpen(!chatPanel.classList.contains('open')));
$('#chat-close').addEventListener('click',()=>setChatOpen(false));
$$('[data-open-chat]').forEach(button => button.addEventListener('click',()=>setChatOpen(true)));
$$('[data-question]').forEach(button => button.addEventListener('click',()=>{setChatOpen(true);submitMessage(button.dataset.question);}));

function updateMode(mode, note='') {
  activeMode = mode;
  $('#chat-mode').textContent = mode==='ai' ? 'AI powered' : 'Guided demo';
  $('#chat-mode').classList.toggle('ai', mode==='ai');
  $('#chat-disclaimer').textContent = note || (mode==='ai'
    ? 'AI answers are limited to fictional store information. Do not enter personal data.'
    : 'FAQ demo mode · No AI model connected · Sample orders only');
}

function appendMessage(role, text, mode) {
  const item = document.createElement('div'); item.className=`message message-${role}`;
  const bubble = document.createElement('div'); bubble.className='bubble'; bubble.textContent=escapeText(text);
  item.append(bubble);
  if(role==='assistant') {
    const info=document.createElement('small');info.className='response-origin';
    info.textContent=mode==='ai'?'AI assistant':mode==='system'?'Connection notice':'Guided demo';
    item.append(info);
  }
  messages.append(item);
  messages.scrollTop=messages.scrollHeight;
  if(role!=='system') chatLog.push({role, text});
  if(chatLog.length>16) chatLog=chatLog.slice(-16);
}
function showTyping() {
  const item=document.createElement('div');item.id='typing';item.className='message message-assistant';
  item.innerHTML='<div class="bubble typing-dots" aria-label="Assistant is typing"><span></span><span></span><span></span></div>';
  messages.append(item);messages.scrollTop=messages.scrollHeight;
}
function removeTyping(){ $('#typing')?.remove(); }
async function sendAI(text) {
  const controller = new AbortController();
  const timer=setTimeout(()=>controller.abort(),12000);
  const previous = chatLog.slice(-9,-1);
  const firstUser = previous.findIndex(h => h.role === 'user');
  const history = firstUser < 0 ? [] : previous.slice(firstUser);
  try {
    const response = await fetch(`${API_URL}/chat`,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:text,history}),
      signal:controller.signal
    });
    if(!response.ok) throw new Error(`Backend error ${response.status}`);
    const data=await response.json();
    if(typeof data.reply!=='string'||!data.reply.trim()||data.reply.length>1800) throw new Error('Invalid server response');
    return data.reply;
  } finally {clearTimeout(timer);}
}
async function submitMessage(value) {
  const input=$('#chat-input');
  const text=(value??input.value).trim();
  if(waiting||!text) return;
  if(text.length>400) {$('#chat-error').textContent='Keep your question under 400 characters.';return;}
  $('#chat-error').textContent='';
  input.value=''; waiting=true; $('#chat-send').disabled=true;
  appendMessage('user',text);
  showTyping();
  // A short deliberate delay makes the deterministic demo feel conversational.
  await new Promise(resolve=>setTimeout(resolve,activeMode==='demo'?500:120));
  try {
    const response = activeMode==='ai' ? await sendAI(text) : demoReply(text).text;
    removeTyping();appendMessage('assistant',response,activeMode);
  } catch(error) {
    removeTyping();
    updateMode('demo','AI backend could not be reached. Guided demo mode is active.');
    appendMessage('assistant','The AI connection is temporarily unavailable. I switched to the clearly labeled guided demo, which can still answer common store questions.', 'system');
    appendMessage('assistant', demoReply(text).text,'demo');
  } finally {waiting=false;$('#chat-send').disabled=false;input.focus();}
}
$('#chat-form').addEventListener('submit', e=>{e.preventDefault();submitMessage();});
$('#chat-input').addEventListener('keydown',e=>{if(e.key==='Escape')setChatOpen(false);});
$('#chat-input').addEventListener('input',()=>{$('#chat-error').textContent='';});
$('#chat-reset').addEventListener('click',()=>{
  if(waiting)return;
  messages.replaceChildren();chatLog=[];
  appendMessage('assistant','Fresh start! Ask me about shipping, returns, products or a fictional order such as NS-1042.',activeMode);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(chatPanel.classList.contains('open'))setChatOpen(false);else if($('#cart-panel').classList.contains('visible'))closeCart();}});

function initNav(){
  const toggle=$('#menu-toggle'),nav=$('#nav-links');
  toggle.addEventListener('click',()=>{
    const open=nav.classList.toggle('expanded');toggle.setAttribute('aria-expanded',String(open));
  });
  $$('a',nav).forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('expanded');toggle.setAttribute('aria-expanded','false');}));
}
async function checkAI() {
  if (!API_URL) return;
  try {
    const c=new AbortController();const timer=setTimeout(()=>c.abort(),3000);
    const r=await fetch(`${API_URL}/health`,{signal:c.signal});clearTimeout(timer);
    const data=await r.json();
    if(r.ok && data.mode==='ai') updateMode('ai');
    else updateMode('demo','AI service is not configured. Using guided demo mode.');
  } catch {updateMode('demo','AI service is offline. Using guided demo mode.');}
}

renderProducts();renderFAQs();renderCart();initNav();checkAI();
