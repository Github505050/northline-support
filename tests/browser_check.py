"""Isolated Chromium UI tests: in-memory HTML/CSS/JS (environment blocks browser navigation)."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import base64,re
root=Path(__file__).resolve().parents[1]
docs=root/'docs'
assets=docs/'assets'

def datauri(name):
    return 'data:image/svg+xml;base64,'+base64.b64encode((assets/name).read_bytes()).decode()
art={x:datauri(x) for x in ['carryall.svg','bottle.svg','lamp.svg','desk.svg','favicon.svg']}

# The browser runtime is identical code except: ES module imports are removed and
# three source modules are concatenated for an in-memory page where network is blocked.
knowledge=(assets/'knowledge.js').read_text().replace('export const STORE','const STORE')
chatbot=(assets/'chatbot.js').read_text().replace("import { STORE } from './knowledge.js';",'').replace('export function ','function ')
store=(assets/'store.js').read_text().replace("import { STORE } from './knowledge.js';",'').replace("import { demoReply, detectOrderReference } from './chatbot.js';",'')
store=store.replace('const $ = (selector',f'const ARTWORK = {repr(art)};\nconst $ = (selector')
# repr uses valid JS object keys and quoted strings; data URLs contain no problematic characters
store=store.replace('src="assets/${{p.artwork}}"', 'src="${ARTWORK[p.artwork]}"') if False else store.replace('src="assets/${p.artwork}"','src="${ARTWORK[p.artwork]}"')
script=knowledge+'\n'+chatbot+'\n'+store
css=(assets/'styles.css').read_text()

def get_html(page):
    s=(docs/page).read_text()
    s=re.sub(r'<script[^>]*src="[^"]+"[^>]*></script>','',s)
    s=re.sub(r'<link[^>]*rel="stylesheet"[^>]*>',f'<style>{css}</style>',s)
    for name,uri in art.items():
        s=s.replace(f'src="assets/{name}"',f'src="{uri}"')
    return s

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for name,width,height in [('desktop',1440,900),('mobile',390,844),('tablet',768,1024)]:
        page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
        errs=[]
        page.on('pageerror',lambda err: errs.append(str(err)))
        page.set_content(get_html('index.html'),wait_until='load')
        page.add_script_tag(content=script)
        assert page.locator('.product-card').count()==4, (name,'products missing')
        assert page.locator('.faq-item').count()==5,(name,'faqs missing')
        assert not page.evaluate('document.documentElement.scrollWidth > window.innerWidth'), (name,'horizontal overflow')
        page.screenshot(path=str(root/f'{name}-store.png'),full_page=(name=='desktop'))
        if name=='mobile':
            page.locator('#menu-toggle').click()
            assert page.locator('#nav-links').is_visible()
            page.locator('#menu-toggle').click()
        page.locator('#chat-launcher').click()
        assert page.locator('#chat-panel').is_visible(),name
        page.locator('#chat-input').fill('Where is order NS-1042?')
        page.locator('#chat-send').click()
        page.wait_for_timeout(660)
        assert 'fictional sample data' in page.locator('.message-assistant .bubble').last.inner_text(), (name,'order lookup')
        page.screenshot(path=str(root/f'{name}-chat.png'),full_page=False)
        page.locator('#chat-input').fill('Do you sell a jetpack?')
        page.locator('#chat-send').click()
        page.wait_for_timeout(660)
        assert 'reliable demo answer' in page.locator('.message-assistant .bubble').last.inner_text(), (name,'fallback')
        page.locator('#chat-reset').click()
        assert page.locator('.message-user').count()==0
        page.locator('#chat-close').click()
        page.locator('.product-card .add-button').first.click()
        assert page.locator('#cart-count').inner_text()=='1'
        assert page.locator('#cart-panel').is_visible()
        page.locator('#checkout-demo').click()
        assert page.locator('#cart-notice').is_visible()
        page.locator('#cart-close').click()
        page.set_content(get_html('case-study.html'),wait_until='load')
        assert page.locator('.case-details section').count()==3
        assert not page.evaluate('document.documentElement.scrollWidth > window.innerWidth'), (name,'case horizontal overflow')
        page.screenshot(path=str(root/f'{name}-case.png'),full_page=(name=='desktop'))
        assert not errs,(name,errs)
        print(f'PASS {name}: products, FAQs, navigation, chat, order, unknown, reset, cart, case study, no JS error/overflow')
        page.close()
    browser.close()
