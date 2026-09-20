import test from 'node:test';
import assert from 'node:assert/strict';
import { initWorkspaceNavigation } from '../workspace-navigation.js';

// Exercise the disclosure state and keyboard behaviour independently of account data.
function fixture() {
  const node = () => {
    const attrs = new Map(), events = new Map(), classes = new Set();
    return { attrs, events, classes, innerHTML:'', focused:false,
      setAttribute:(k,v)=>attrs.set(k,v),getAttribute:k=>attrs.get(k),
      addEventListener:(k,f)=>events.set(k,f),
      classList:{contains:k=>classes.has(k),toggle:(k,on)=>on?classes.add(k):classes.delete(k)},
      focus(){this.focused=true;}
    };
  };
  const root=node(),button=node(),sidebar=node(),active=node(),other=node();
  active.classes.add('active');button.attrs.set('aria-expanded','false');
  sidebar.querySelectorAll=()=>[active,other];
  root.querySelector=s=>s==='#workspace-menu'?button:sidebar;
  return {root,button,sidebar,active,other};
}
test('mobile navigation opens, closes on selection, and preserves active-page semantics',()=>{
  const f=fixture();initWorkspaceNavigation(f.root);
  assert.equal(f.active.attrs.get('aria-current'),'page');
  assert.equal(f.other.attrs.has('aria-current'),false);
  f.button.events.get('click')();assert.equal(f.button.attrs.get('aria-expanded'),'true');
  assert.equal(f.root.classes.has('workspace-menu-open'),true);
  f.other.events.get('click')();assert.equal(f.button.attrs.get('aria-expanded'),'false');
  assert.equal(f.root.classes.has('workspace-menu-open'),false);
});
test('Escape closes navigation and restores focus to its trigger',()=>{
  const f=fixture();initWorkspaceNavigation(f.root);f.button.events.get('click')();
  f.sidebar.events.get('keydown')({key:'Escape'});
  assert.equal(f.button.focused,true);assert.equal(f.button.attrs.get('aria-expanded'),'false');
});
test('pages without a merchant shell require no navigation binding',()=>{
  assert.doesNotThrow(()=>initWorkspaceNavigation(null));
});
