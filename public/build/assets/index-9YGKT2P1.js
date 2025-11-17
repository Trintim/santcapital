function n(e){return Object.fromEntries(Object.entries(e).filter(([,t])=>!!t))}function u(e,t){let r;return function(...i){clearTimeout(r),r=setTimeout(()=>e.apply(this,i),t)}}export{u as d,n as f};
