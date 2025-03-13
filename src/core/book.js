// Book is a replacement for JS objects, maps, dictionaries.
var sT = setTimeout;
var B = sT.Book || (sT.Book = function(text){
	var b = function book(word, is){
		var has = b.all[word], p;
		if(is === undefined){ return (has && has.is) || b.get(has || word) }
		if(has){
			if(p = has.page){
				p.size += size(is) - size(has.is);
				p.text = '';
			}
			has.text = '';
			has.is = is;
			return b;
		}
		return b.set(word, is);
	};
	b.list = [{from: text, size: (text||'').length, substring: sub, toString: to, book: b, get: b, read: list}];
	b.page = page;
	b.set = set;
	b.get = get;
	b.all = {};
	return b;
});

const PAGE = 2**12;

function page(word){
	var b = this, l = b.list, i = spot(word, l, b.parse), p = l[i];
	if('string' == typeof p){ l[i] = p = {size: -1, first: b.parse? b.parse(p) : p, substring: sub, toString: to, book: b, get: b, read: list} }
	return p;
}

function get(word){
	if(!word){ return }
	if(undefined !== word.is){ return word.is }
	var b = this, has = b.all[word];
	if(has){ return has.is }
	var page = b.page(word), l, has, a, i;
	if(!page || !page.from){ return }
	return got(word, page);
}

function got(word, page){
	var b = page.book, l, has, a, i;
	if(l = from(page)){ has = l[got.i = i = spot(word, l, B.decode)]; }
	if(has && word == has.word){ return (b.all[word] = has).is }
	if('string' != typeof has){ has = l[got.i = i+=1] }
	if(has && word == has.word){ return (b.all[word] = has).is }
	a = slot(has)
	if(word != B.decode(a[0])){
		has = l[got.i = i+=1];
		a = slot(has);
		if(word != B.decode(a[0])){ return }
	}
	has = l[i] = b.all[word] = {word: ''+word, is: B.decode(a[1]), page: page, substring: subt, toString: tot};
	return has.is;
}

function spot(word, sorted, parse){ 
	parse = parse || spot.no || (spot.no = function(t){ return t });
	var L = sorted, min = 0, page, found, l = (word=''+word).length, max = L.length, i = max/2;
	while(((word < (page = (parse(L[i=i>>0])||'').substring())) || ((parse(L[i+1])||'').substring() <= word)) && i != min){
		i += (page <= word)? (max - (min = i))/2 : -((max = i) - min)/2;
	}
	return i;
}

function from(a, t, l){
	if('string' != typeof a.from){ return a.from }
	(l = a.from = slot(t = t||a.from||''));
	return l;
}

function list(each){ 
	each = each || function(x){return x}
	var i = 0, l = sort(this), w, r = [], p = this.book.parse || function(){};
	while(w = l[i++]){ r.push(each(this.get(w = w.word||p(w)||w), w, this)) }
	return r;
}

function set(word, is){
	var b = this, has = b.all[word];
	if(has){ return b(word, is) }
	var page = b.page(word=''+word), tmp;
	if(page && page.from){
		b.get(word);
		if(b.all[word]){ return b(word, is) }
	}
	has = b.all[word] = {word: word, is: is, page: page, substring: subt, toString: tot};
	page.first = (page.first < word)? page.first : word;
	if(!page.limbo){ (page.limbo = []) }
	page.limbo.push(has);
	b(word, is);
	page.size += size(word) + size(is);
	if((b.PAGE || PAGE) < page.size){ split(page, b) }
	return b;
}

function split(p, b){
	var L = sort(p), l = L.length, i = l/2 >> 0, j = i, half = L[j], tmp;
	var next = {first: half.substring(), size: 0, substring: sub, toString: to, book: b, get: b, read: list}, f = next.from = [];
	while(tmp = L[i++]){
		f.push(tmp);
		next.size += (tmp.is||'').length||1;
		tmp.page = next;
	}
	p.from = p.from.slice(0, j);
	p.size -= next.size;
	b.list.splice(spot(next.first, b.list)+1, 0, next);
	if(b.split){ b.split(next, p) }
}

function slot(t){ return heal((t=t||'').substring(1, t.length-1).split(t[0]), t[0]) }
B.slot = slot;

function heal(l, s){ 
	var i, e;
	if(0 > (i = l.indexOf(''))){ return l }
	if('' == l[0] && 1 == l.length){ return [] }
	if((e=i+2+parseInt((e=l[i+1]).substring(0, e.indexOf('"'))||e)) != e){ return [] }
	l[i] = l.slice(i, e).join(s||'|');
	return l.slice(0,i+1).concat(heal(l.slice(e), s));
}

function size(t){ return (t||'').length||1 }
function subt(i,j){ return this.word }
function tot(){ 
	var tmp = {};
	return this.text = this.text || ":"+B.encode(this.word)+":"+B.encode(this.is)+":";
	tmp[this.word] = this.is;
	return this.text = this.text || B.encode(tmp,'|',':').slice(1,-1);
}
function sub(i,j){ return (this.first||this.word||B.decode((from(this)||'')[0]||'')).substring(i,j) }
function to(){ return this.text = this.text || text(this) }
function text(p){
	if(p.limbo){ sort(p) }
	return ('string' == typeof p.from)? p.from : '|'+(p.from||[]).join('|')+'|';
}

function sort(p, l){
	var f = p.from = ('string' == typeof p.from)? slot(p.from) : p.from||[];
	if(!(l = l || p.limbo)){ return f }
	return mix(p).sort(function(a,b){
		return (a.word||B.decode(''+a)) < (b.word||B.decode(''+b))? -1:1;
	});
}

function mix(p, l){
	l = l || p.limbo || []; p.limbo = null;
	var j = 0, i, f = p.from;
	while(i = l[j++]){
		if(got(i.word, p)){
			f[got.i] = i;
		} else {
			f.push(i);
		}
	}
	return f;
}

B.encode = function(d, s, u){ 
	s = s || "|"; u = u || String.fromCharCode(32);
	switch(typeof d){
		case 'string':
			var i = d.indexOf(s), c = 0;
			while(i != -1){ c++; i = d.indexOf(s, i+1) }
			return (c?s+c:'')+ '"' + d;
		case 'number': return (d < 0)? ''+d : '+'+d;
		case 'boolean': return d? '+' : '-';
		case 'object': if(!d){ return ' ' }
			var l = Object.keys(d).sort(), i = 0, t = s, k, v;
			while(k = l[i++]){ t += u+B.encode(k,s,u)+u+B.encode(d[k],s,u)+u+s }
			return t;
	}
}

B.decode = function(t, s){ 
	s = s || "|";
	if('string' != typeof t){ return }
	switch(t){ case ' ': return null; case '-': return false; case '+': return true; }
	switch(t[0]){
		case '-': case '+': return parseFloat(t);
		case '"': return t.slice(1);
	}
	return t.slice(t.indexOf('"')+1);
}

B.hash = function(s, c){
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

function record(key, val){ return key+B.encode(val)+"%"+key.length }
function decord(t){
	var o = {}, i = t.lastIndexOf("%"), c = parseFloat(t.slice(i+1));
	o[t.slice(0,c)] = B.decode(t.slice(c,i));
	return o;
}

export { B as Book, record, decord };