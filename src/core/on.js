import { Gun } from './root.js';

// Rules:
// 1. If cached, should be fast, but not read while write.
// 2. Should not retrigger other listeners, should get triggered even if nothing found.
// 3. If the same callback passed to many different once chains, each should resolve - an unsubscribe from the same callback should not effect the state of the other resolving chains, if you do want to cancel them all early you should mutate the callback itself with a flag & check for it at top of callback

Gun.chain.on = function(tag, arg, eas, as){ // don't rewrite!
	var gun = this, cat = gun._, root = cat.root, act, off, id, tmp;
	if(typeof tag === 'string'){
		if(!arg){ return cat.on(tag) }
		act = cat.on(tag, arg, eas || cat, as);
		if(eas && eas.$){
			(eas.subs || (eas.subs = [])).push(act);
		}
		return gun;
	}
	var opt = arg;
	(opt = (true === opt)? {change: true} : opt || {}).not = 1; opt.on = 1;
	var wait = {};
	gun.get(tag, opt);
	return gun;
}

Gun.chain.once = function(cb, opt){ opt = opt || {}; // avoid rewriting
	if(!cb){ return none(this,opt) }
	var gun = this, cat = gun._, root = cat.root, data = cat.put, id = String.random(7), one, tmp;
	gun.get(function(data,key,msg,eve){
		var $ = this, at = $._, one = (at.one||(at.one={}));
		if(eve.stun){ return } if('' === one[id]){ return }
		if(true === (tmp = Gun.valid(data))){ once(); return }
		if('string' == typeof tmp){ return }
		clearTimeout((cat.one||'')[id]);
		clearTimeout(one[id]); one[id] = setTimeout(once, opt.wait||99);
		function once(f){
			if(!at.has && !at.soul){ at = {put: data, get: key} }
			if(u === (tmp = at.put)){ tmp = ((msg.$$||'')._||'').put }
			if('string' == typeof Gun.valid(tmp)){
				tmp = root.$.get(tmp)._.put;
				if(tmp === u && !f){
					one[id] = setTimeout(function(){ once(1) }, opt.wait||99);
					return
				}
			}
			if(eve.stun){ return } if('' === one[id]){ return } one[id] = '';
			if(cat.soul || cat.has){ eve.off() }
			cb.call($, tmp, at.get);
			clearTimeout(one[id]);
		};
	}, {on: 1});
	return gun;
}

function none(gun,opt,chain){
	Gun.log.once("valonce", "Chainable val is experimental, its behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
	(chain = gun.chain())._.nix = gun.once(function(data, key){ chain._.on('in', this._) });
	chain._.lex = gun._.lex;
	return chain;
}

Gun.chain.off = function(){
	var gun = this, at = gun._, tmp;
	var cat = at.back;
	if(!cat){ return }
	at.ack = 0;
	if(tmp = cat.next){
		if(tmp[at.get]){
			delete tmp[at.get];
		}
	}
	if(tmp = cat.ask){
		delete tmp[at.get];
	}
	if(tmp = cat.put){
		delete tmp[at.get];
	}
	if(tmp = at.soul){
		delete cat.root.graph[tmp];
	}
	if(tmp = at.map){
		Object.keys(tmp).forEach(function(i,at){ at = tmp[i]; //obj_map(tmp, function(at){
			if(at.link){
				cat.root.$.get(at.link).off();
			}
		});
	}
	if(tmp = at.next){
		Object.keys(tmp).forEach(function(i,neat){ neat = tmp[i]; //obj_map(tmp, function(neat){
			neat.$.off();
		});
	}
	at.on('off', {});
	return gun;
}

export { Gun };