// Shim for generic javascript utilities.
const stringRandom = function(l, c){
	var s = '';
	l = l || 24;
	c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
	while(l-- > 0){ s += c.charAt(Math.floor(Math.random() * c.length)) }
	return s;
}

const stringMatch = function(t, o){ var tmp, u;
	if('string' !== typeof t){ return false }
	if('string' == typeof o){ o = {'=': o} }
	o = o || {};
	tmp = (o['='] || o['*'] || o['>'] || o['<']);
	if(t === tmp){ return true }
	if(u !== o['=']){ return false }
	tmp = (o['*'] || o['>']);
	if(t.slice(0, (tmp||'').length) === tmp){ return true }
	if(u !== o['*']){ return false }
	if(u !== o['>'] && u !== o['<']){
		return (t >= o['>'] && t <= o['<'])? true : false;
	}
	if(u !== o['>'] && t >= o['>']){ return true }
	if(u !== o['<'] && t <= o['<']){ return true }
	return false;
}

const stringHash = function(s, c){
	if(typeof s !== 'string'){ return }
	c = c || 0;
	if(!s.length){ return c }
	for(var i=0,l=s.length,n; i<l; ++i){
		n = s.charCodeAt(i);
		c = ((c<<5)-c)+n;
		c |= 0;
	}
	return c;
}

var has = Object.prototype.hasOwnProperty;

const objectPlain = function(o){ return o? (o instanceof Object && o.constructor === Object) || Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] === 'Object' : false }

const objectEmpty = function(o, n){
	for(var k in o){ if(has.call(o, k) && (!n || -1==n.indexOf(k))){ return false } }
	return true;
}

const objectKeys = Object.keys || function(o){
	var l = [];
	for(var k in o){ if(has.call(o, k)){ l.push(k) } }
	return l;
}

var u, sT = setTimeout, l = 0, c = 0;
var sI = (typeof setImmediate !== ''+u && setImmediate) || (function(c,f){
	if(typeof MessageChannel == ''+u){ return sT }
	(c = new MessageChannel()).port1.onmessage = function(e){ ''==e.data && f() }
	return function(q){ f=q;c.port2.postMessage('') }
}());

var check = sT.check = sT.check || (typeof performance !== ''+u && performance) || {
	now: function(){ return +new Date }
};

sT.hold = sT.hold || 9;

sT.poll = sT.poll || function(f){
	if((sT.hold >= (check.now() - l)) && c++ < 3333){ f(); return }
	sI(function(){ l = check.now(); f() },c=0)
}

var s = [], i = 0, f;
var T = function(){
	if(f = s[i++]){ f() }
	if(i == s.length || 99 == i){
		s = sT.turn.s = s.slice(i);
		i = 0;
	}
	if(s.length){ sT.poll(T) }
}

sT.turn = function(f){ 1 == s.push(f) && sT.poll(T) }
sT.turn.s = s;

sT.each = sT.each || function(l,f,e,S){ 
	S = S || 9; 
	(function t(s,L,r){
		if(L = (s = (l||[]).splice(0,S)).length){
			for(var i = 0; i < L; i++){
				if(u !== (r = f(s[i]))){ break }
			}
			if(u === r){ sT.turn(t); return }
		} 
		e && e(r);
	}());
}

// Add our extensions to built-in objects
String.random = stringRandom;
String.match = stringMatch;
String.hash = stringHash;
Object.plain = objectPlain;
Object.empty = objectEmpty;
Object.keys = objectKeys;

export { sT as setTimeout };