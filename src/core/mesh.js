import './shim.js';

var noop = function(){}
var parse = JSON.parseAsync || function(t,cb,r){ var u, d = +new Date; try{ cb(u, JSON.parse(t,r), json.sucks(+new Date - d)) }catch(e){ cb(e) } }
var json = JSON.stringifyAsync || function(v,cb,r,s){ var u, d = +new Date; try{ cb(u, JSON.stringify(v,r,s), json.sucks(+new Date - d)) }catch(e){ cb(e) } }
json.sucks = function(d){ if(d > 99){ console.log("Warning: JSON blocking CPU detected. Add `gun/lib/yson.js` to fix."); json.sucks = noop } }

function Mesh(root){
	var mesh = function(){};
	var opt = root.opt || {};
	opt.log = opt.log || console.log;
	opt.gap = opt.gap || opt.wait || 0;
	opt.max = opt.max || (opt.memory? (opt.memory * 999 * 999) : 300000000) * 0.3;
	opt.pack = opt.pack || (opt.max * 0.01 * 0.01);
	opt.puff = opt.puff || 9;
	var puff = setTimeout.turn || setTimeout;

	var dup = root.dup, dup_check = dup.check, dup_track = dup.track;

	var ST = +new Date, LT = ST;

	var hear = mesh.hear = function(raw, peer){
		if(!raw){ return }
		if(opt.max <= raw.length){ return mesh.say({dam: '!', err: "Message too big!"}, peer) }
		if(mesh === this){
			hear.d += raw.length||0 ; ++hear.c }
		var S = peer.SH = +new Date;
		var tmp = raw[0], msg;
		if('[' === tmp){
			parse(raw, function(err, msg){
				if(err || !msg){ return mesh.say({dam: '!', err: "DAM JSON parse error."}, peer) }
				console.STAT && console.STAT(+new Date, msg.length, '# on hear batch');
				var P = opt.puff;
				(function go(){
					var S = +new Date;
					var i = 0, m; while(i < P && (m = msg[i++])){ mesh.hear(m, peer) }
					msg = msg.slice(i);
					console.STAT && console.STAT(S, +new Date - S, 'hear loop');
					flush(peer);
					if(!msg.length){ return }
					puff(go, 0);
				}());
			});
			raw = '';
			return;
		}
		if('{' === tmp || ((raw['#'] || Object.plain(raw)) && (msg = raw))){
			if(msg){ return hear.one(msg, peer, S) }
			parse(raw, function(err, msg){
				if(err || !msg){ return mesh.say({dam: '!', err: "DAM JSON parse error."}, peer) }
				hear.one(msg, peer, S);
			});
			return;
		}
	}

	hear.one = function(msg, peer, S){
		var id, hash, tmp, ash, DBG;
		if(msg.DBG){ msg.DBG = DBG = {DBG: msg.DBG} }
		DBG && (DBG.h = S);
		DBG && (DBG.hp = +new Date);
		if(!(id = msg['#'])){ id = msg['#'] = String.random(9) }
		if(tmp = dup_check(id)){ return }
		if(hash && (tmp = msg['@'] || (msg.get && id)) && dup.check(ash = tmp+hash)){ return }
		(msg._ = function(){}).via = mesh.leap = peer;
		if((tmp = msg['><']) && 'string' == typeof tmp){ tmp.slice(0,99).split(',').forEach(function(k){ this[k] = 1 }, (msg._).yo = {}) }
		if(tmp = msg.dam){
			if(tmp = mesh.hear[tmp]){
				tmp(msg, peer, root);
			}
			dup_track(id);
			return;
		}
		if(tmp = msg.ok){ msg._.near = tmp['/'] }
		var S = +new Date;
		DBG && (DBG.is = S); peer.SI = id;
		dup_track.ed = function(d){
			if(id !== d){ return }
			dup_track.ed = 0;
			if(!(d = dup.s[id])){ return }
			d.via = peer;
		}
		json(msg.put, function hash(err, text){
			if(err){ return mesh.say({dam: '!', err: "DAM JSON stringify error."}, peer) }
			msg.put = text;
			root.on('in', msg);
		});
	}

	mesh.say = function(msg, peer){
		if(!msg || !peer){ return }
		var id = msg['#'] || String.random(9);
		if(dup_check(id)){ return }
		msg['#'] = id;
		dup_track(id);
		var raw = json.stringify(msg);
		if(!raw){ return }
		if(opt.max <= raw.length){ return mesh.say({dam: '!', err: "Message too big!"}, peer) }
		send(raw, peer);
	}

	function flush(peer){
		if(!peer || !peer.wire){ return }
		peer.wire.send(peer.wire.buf);
		peer.wire.buf = '';
	}

	function send(raw, peer){ try{
		if(!peer || !peer.wire){ return }
		if(peer.wire.buf){ peer.wire.buf += raw }
		else { peer.wire.send(raw) }
	}catch(e){ opt.log('mesh send err', e) }}

	return mesh;
}

export { Mesh };