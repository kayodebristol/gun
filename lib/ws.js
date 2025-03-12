import ws from './ws-deno.js';
import Gun from '../gun.js';

// Use Deno WebSocket implementation
const WebSocket = ws.WebSocket;
const Server = ws.Server;

// Use built-in URL class
const parseUrl = (urlStr) => new URL(urlStr);

export { WebSocket, Server };
export default ws;

var url = require('url');

Gun.on('opt', function mount(ctx) {
	this.to.next(ctx);
	const opt = ctx.opt;
	
	if (!opt.peers && typeof opt === "string") {
		opt.peers = [opt];
	}

	if (ctx.once) return;
	if (false === opt.ws) return;
	
	const ws = opt.ws || (opt.ws = {});
	let batch;

	if (opt.web) {
		ws.server = ws.server || opt.web;
		ws.path = ws.path || '/gun';

		if (!ws.web) {
			ws.web = new Server(ws);
		}

		ws.web.on('connection', function(wire) {
			wire.upgradeReq = wire.upgradeReq || {};
			wire.url = new URL(wire.upgradeReq.url || '', 'ws://localhost');
			wire.id = wire.id || Gun.text.random(6);
			const peer = opt.peers[wire.id] = { wire: wire };
			wire.peer = () => peer;
			ctx.on('hi', peer);
			
			wire.onmessage = function(msg) {
				receive(msg, wire, ctx);
			};
			
			wire.onclose = function() {
				ctx.on('bye', peer);
				delete opt.peers[wire.id];
			};
			
			wire.onerror = function(e) {
				console.error('WebSocket error:', e);
			};
		});
	}

	ctx.on('out', function(at) {
		this.to.next(at);
		batch = JSON.stringify(at);
		if (ws.drain) {
			ws.drain.push(batch);
			return;
		}
		ws.drain = [];
		setTimeout(function() {
			if (!ws.drain) return;
			const tmp = ws.drain;
			ws.drain = null;
			if (!tmp.length) return;
			batch = JSON.stringify(tmp);
			Gun.obj.map(opt.peers, send, ctx);
		}, opt.gap || opt.wait || 1);
		Gun.obj.map(opt.peers, send, ctx);
	});

	function send(peer) {
		const ctx = this;
		const msg = batch;
		const wire = peer.wire || open(peer, ctx);
		if (!wire) return;
		if (wire.readyState === WebSocket.OPEN) {
			wire.send(msg);
			return;
		}
		(peer.queue = peer.queue || []).push(msg);
	}

	function receive(msg, wire, ctx) {
		if (!ctx) return;
		try {
			msg = JSON.parse(msg.data || msg);
		} catch (e) {
			console.error('Failed to parse message:', e);
			return;
		}
		if (Array.isArray(msg)) {
			for (const m of msg) {
				receive(m, wire, ctx);
			}
			return;
		}
		msg.peer = wire.peer;
		ctx.on('in', msg);
	}

	function open(peer, as) {
		if (!peer || !peer.url) return;
		const wsUrl = peer.url.replace('http', 'ws');
		const wire = peer.wire = new WebSocket(wsUrl);
		
		wire.onclose = function() {
			reconnect(peer, as);
		};
		
		wire.onerror = function(error) {
			if (!error) return;
			if (error.code === 'ECONNREFUSED') {
				reconnect(peer, as);
			}
		};
		
		wire.onopen = function() {
			const queue = peer.queue || [];
			peer.queue = [];
			for (const msg of queue) {
				batch = msg;
				send.call(as, peer);
			}
		};
		
		wire.onmessage = function(msg) {
			receive(msg, wire, as);
		};
		
		return wire;
	}

	function reconnect(peer, as) {
		clearTimeout(peer.defer);
		peer.defer = setTimeout(function() {
			open(peer, as);
		}, 2000);
	}
});
