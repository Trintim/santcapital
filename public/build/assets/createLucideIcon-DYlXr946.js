import{r as s,j as f}from"./app-CWQYjesW.js";function m(e,t){if(typeof e=="function")return e(t);e!=null&&(e.current=t)}function y(...e){return t=>{let n=!1;const o=e.map(r=>{const l=m(r,t);return!n&&typeof l=="function"&&(n=!0),l});if(n)return()=>{for(let r=0;r<o.length;r++){const l=o[r];typeof l=="function"?l():m(e[r],null)}}}}function A(...e){return s.useCallback(y(...e),e)}function b(e){const t=h(e),n=s.forwardRef((o,r)=>{const{children:l,...a}=o,i=s.Children.toArray(l),c=i.find(E);if(c){const u=c.props.children,p=i.map(d=>d===c?s.Children.count(u)>1?s.Children.only(null):s.isValidElement(u)?u.props.children:null:d);return f.jsx(t,{...a,ref:r,children:s.isValidElement(u)?s.cloneElement(u,void 0,p):null})}return f.jsx(t,{...a,ref:r,children:l})});return n.displayName=`${e}.Slot`,n}var I=b("Slot");function h(e){const t=s.forwardRef((n,o)=>{const{children:r,...l}=n;if(s.isValidElement(r)){const a=x(r),i=S(l,r.props);return r.type!==s.Fragment&&(i.ref=o?y(o,a):a),s.cloneElement(r,i)}return s.Children.count(r)>1?s.Children.only(null):null});return t.displayName=`${e}.SlotClone`,t}var g=Symbol("radix.slottable");function N(e){const t=({children:n})=>f.jsx(f.Fragment,{children:n});return t.displayName=`${e}.Slottable`,t.__radixId=g,t}function E(e){return s.isValidElement(e)&&typeof e.type=="function"&&"__radixId"in e.type&&e.type.__radixId===g}function S(e,t){const n={...t};for(const o in t){const r=e[o],l=t[o];/^on[A-Z]/.test(o)?r&&l?n[o]=(...i)=>{const c=l(...i);return r(...i),c}:r&&(n[o]=r):o==="style"?n[o]={...r,...l}:o==="className"&&(n[o]=[r,l].filter(Boolean).join(" "))}return{...e,...n}}function x(e){let t=Object.getOwnPropertyDescriptor(e.props,"ref")?.get,n=t&&"isReactWarning"in t&&t.isReactWarning;return n?e.ref:(t=Object.getOwnPropertyDescriptor(e,"ref")?.get,n=t&&"isReactWarning"in t&&t.isReactWarning,n?e.props.ref:e.props.ref||e.ref)}/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),C=(...e)=>e.filter((t,n,o)=>!!t&&t.trim()!==""&&o.indexOf(t)===n).join(" ").trim();/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var R={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=s.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:n=2,absoluteStrokeWidth:o,className:r="",children:l,iconNode:a,...i},c)=>s.createElement("svg",{ref:c,...R,width:t,height:t,stroke:e,strokeWidth:o?Number(n)*24/Number(t):n,className:C("lucide",r),...i},[...a.map(([u,p])=>s.createElement(u,p)),...Array.isArray(l)?l:[l]]));/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=(e,t)=>{const n=s.forwardRef(({className:o,...r},l)=>s.createElement(j,{ref:l,iconNode:t,className:C(`lucide-${w(e)}`,o),...r}));return n.displayName=`${e}`,n};export{I as S,N as a,b,_ as c,y as d,A as u};
