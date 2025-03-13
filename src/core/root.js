import './shim.js';
import { valid } from './valid.js';
import { state } from './state.js';
import { on } from './onto.js';
import { dup } from './dup.js';
import { ask } from './ask.js';

function Gun(o) {
	if (o instanceof Gun) { return (this._ = { $: this }).$ }
	if (!(this instanceof Gun)) { return new Gun(o) }
	return Gun.create(this._ = { $: this, opt: o });
}

Gun.is = function($) { return ($ instanceof Gun) || ($ && $._ && ($ === $._.$)) || false }

Gun.version = 0.2020;

Gun.chain = Gun.prototype;
Gun.chain.toJSON = function() { };

Gun.valid = valid;
Gun.state = state;
Gun.on = on;
Gun.dup = dup;
Gun.ask = ask;

Gun.create = function(at) {
	at.root = at.root || at;
	at.graph = at.graph || {};
	at.on = at.on || Gun.on;
	at.ask = at.ask || Gun.ask;
	at.dup = at.dup || Gun.dup();
	var gun = at.$.opt(at.opt);
	if(!at.once){
		at.on('in', universe, at);
		at.on('out', universe, at);
		at.on('put', map, at);
		Gun.on('create', at);
		at.on('create', at);
	}
	at.once = 1;
	return gun;
}

function universe(msg){
	if(!msg){ return }
	if(msg.out === universe){ this.to.next(msg); return }
	var eve = this, as = eve.as, at = as.at || as, gun = at.$, dup = at.dup, tmp, DBG = msg.DBG;
	(tmp = msg['#']) || (tmp = msg['#'] = text_rand(9));
	if(dup.check(tmp)){ return } dup.track(tmp);
	tmp = msg._; msg._ = ('function' == typeof tmp)? tmp : function(){};
	(msg.$ && (msg.$ === (msg.$._||'').$)) || (msg.$ = gun);
	if(msg['@'] && !msg.put){ ack(msg) }
	if(!at.ask(msg['@'], msg)){
		DBG && (DBG.u = +new Date);
		if(msg.put){ put(msg); return } else
		if(msg.get){ Gun.on.get(msg, gun) }
	}
	DBG && (DBG.uc = +new Date);
	eve.to.next(msg);
	DBG && (DBG.ua = +new Date);
	if(msg.nts || msg.NTS){ return }
	msg.out = universe; at.on('out', msg);
	DBG && (DBG.ue = +new Date);
}

function put(msg){
	if(!msg){ return }
	var ctx = msg._||'', root = ctx.root = ((ctx.$ = msg.$||'')._||'').root;
	if(msg['@'] && ctx.faith && !ctx.miss){
		msg.out = universe;
		root.on('out', msg);
		return;
	}
	ctx.latch = root.hatch; ctx.match = root.hatch = [];
	var put = msg.put;
	var DBG = ctx.DBG = msg.DBG, S = +new Date; CT = CT || S;
	if(put['#'] && put['.']){ return }
	DBG && (DBG.p = S);
	ctx['#'] = msg['#'];
	ctx.msg = msg;
	ctx.all = 0;
	ctx.stun = 1;
	var nl = Object.keys(put);//.sort();
	console.STAT && console.STAT(S, ((DBG||ctx).pk = +new Date) - S, 'put sort');
	var ni = 0, nj, kl, soul, node, states, err, tmp;
	(function pop(o){
		if(nj != ni){ nj = ni;
			if(!(soul = nl[ni])){
				console.STAT && console.STAT(S, ((DBG||ctx).pd = +new Date) - S, 'put');
				fire(ctx);
				return;
			}
			if(!(node = put[soul])){ err = ERR+cut(soul)+"no node." } else
			if(!(tmp = node._)){ err = ERR+cut(soul)+"no meta." } else
			if(soul !== tmp['#']){ err = ERR+cut(soul)+"soul not same." } else
			if(!(states = tmp['>'])){ err = ERR+cut(soul)+"no state." }
			kl = Object.keys(node||{});
		}
		if(err){
			msg.err = ctx.err = err;
			fire(ctx);
			return;
		}
		var i = 0, key; o = o || 0;
		while(o++ < 9 && (key = kl[i++])){
			if('_' === key){ continue }
			var val = node[key], state = states[key];
			if(u === state){ err = ERR+cut(key)+"on"+cut(soul)+"no state."; break }
			if(!valid(val)){ err = ERR+cut(key)+"on"+cut(soul)+"bad "+(typeof val)+cut(val); break }
			ham(val, key, soul, state, msg);
			++C;
		}
		if((kl = kl.slice(i)).length){ turn(pop); return }
		++ni; kl = null; pop(o);
	})();
} Gun.on.put = put;

function ham(val, key, soul, state, msg){
	var ctx = msg._||'', root = ctx.root, graph = root.graph, lot, tmp;
	var vertex = graph[soul] || empty, was = state_is(vertex, key, 1), known = vertex[key];
	
	var DBG = ctx.DBG; if(tmp = console.STAT){ if(!graph[soul] || !known){ tmp.has = (tmp.has || 0) + 1 } }

	var now = State(), u;
	if(state > now){
		setTimeout(function(){ ham(val, key, soul, state, msg) }, (tmp = state - now) > MD? MD : tmp);
		console.STAT && console.STAT(((DBG||ctx).Hf = +new Date), tmp, 'future');
		return;
	}
	if(state < was){ if(true || !ctx.miss){ return } }
	if(!ctx.faith){
		if(state === was && (val === known || L(val) <= L(known))){ if(!ctx.miss){ return } }
	}
	ctx.stun++;
	var aid = msg['#']+ctx.all++, id = {toString: function(){ return aid }, _: ctx}; id.toJSON = id.toString;
	root.dup.track(id)['#'] = msg['#'];
	DBG && (DBG.ph = DBG.ph || +new Date);
	root.on('put', {'#': id, '@': msg['@'], put: {'#': soul, '.': key, ':': val, '>': state}, ok: msg.ok, _: ctx});
}

function map(msg){
	var DBG; if(DBG = (msg._||'').DBG){ DBG.pa = +new Date; DBG.pm = DBG.pm || +new Date}
	var eve = this, root = eve.as, graph = root.graph, ctx = msg._, put = msg.put, soul = put['#'], key = put['.'], val = put[':'], state = put['>'], id = msg['#'], tmp;
	if((tmp = ctx.msg) && (tmp = tmp.put) && (tmp = tmp[soul])){ state_ify(tmp, key, state, val, soul) }
	graph[soul] = state_ify(graph[soul], key, state, val, soul);
	if(tmp = (root.next||'')[soul]){
		tmp.on('in', msg)
	}
	fire(ctx);
	eve.to.next(msg);
}

function fire(ctx, msg){ var root;
	if(ctx.stop){ return }
	if(!ctx.err && 0 < --ctx.stun){ return }
	ctx.stop = 1;
	if(!(root = ctx.root)){ return }
	var tmp = ctx.match; tmp.end = 1;
	if(tmp === root.hatch){ if(!(tmp = ctx.latch) || tmp.end){ delete root.hatch } else { root.hatch = tmp } }
	ctx.hatch && ctx.hatch();
	setTimeout.each(ctx.match, function(cb){cb && cb()}); 
	if(!(msg = ctx.msg) || ctx.err || msg.err){ return }
	msg.out = universe;
	ctx.root.on('out', msg);

	CF();
}

function ack(msg){
	var id = msg['@'] || '', ctx, ok, tmp;
	if(!(ctx = id._)){
		var dup = (dup = msg.$) && (dup = dup._) && (dup = dup.root) && (dup = dup.dup);
		if(!(dup = dup.check(id))){ return }
		msg['@'] = dup['#'] || msg['@'];
		return;
	}
	ctx.acks = (ctx.acks||0) + 1;
	if(ctx.err = msg.err){
		msg['@'] = ctx['#'];
		fire(ctx);
	}
	ctx.ok = msg.ok || ctx.ok;
	if(!ctx.stop && !ctx.crack){ ctx.crack = ctx.match && ctx.match.push(function(){back(ctx)}) }
	back(ctx);
}

function back(ctx){
	if(!ctx || !ctx.root){ return }
	if(ctx.stun || ctx.acks !== ctx.all){ return }
	ctx.root.on('in', {'@': ctx['#'], err: ctx.err, ok: ctx.err? u : ctx.ok || {'':1}});
}

var ERR = "Error: Invalid graph!";
var cut = function(s){ return " '"+(''+s).slice(0,9)+"...' " }
var L = JSON.stringify, MD = 2147483647, State = Gun.state;
var C = 0, CT, CF = function(){if(C>999 && (C/-(CT - (CT = +new Date))>1)){Gun.window && console.log("Warning: You're syncing 1K+ records a second, faster than DOM can update - consider limiting query.");CF=function(){C=0}}};

export default Gun;

if(typeof window !== "undefined"){ (window.GUN = window.Gun = Gun).window = window }
try{ if(typeof MODULE !== "undefined"){ MODULE.exports = Gun } }catch(e){}

(Gun.window||{}).console = (Gun.window||{}).console || {log: function(){}};
(C = console).only = function(i, s){ return (C.only.i && i === C.only.i && C.only.i++) && (C.log.apply(C, arguments) || s) };

;"Please do not remove welcome log unless you are paying for a monthly sponsorship, thanks!";
Gun.log.once("welcome", "Hello wonderful person! :) Thanks for using GUN, please ask for help on http://chat.gun.eco if anything takes you longer than 5min to figure out!");