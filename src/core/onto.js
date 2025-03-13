// On event emitter generic javascript utility.
export function on(tag, arg, as) {
	if(!tag){ return {to: on} }
	var u, f = 'function' == typeof arg, tag = (this.tag || (this.tag = {}))[tag] || f && (
		this.tag[tag] = {tag: tag, to: on._ = { next: function(arg){ var tmp;
			if(tmp = this.to){ tmp.next(arg) }
	}}});
	if(f){
		var be = {
			off: on.off ||
			(on.off = function(){
				if(this.next === on._.next){ return !0 }
				if(this === this.the.last){
					this.the.last = this.back;
				}
				this.to.back = this.back;
				this.next = on._.next;
				this.back.to = this.to;
				if(this.the.last === this.the){
					delete this.on.tag[this.the.tag];
				}
			}),
			to: on._,
			next: arg,
			the: tag,
			on: this,
			as: as,
		};
		(be.back = tag.last || tag).to = be;
		return tag.last = be;
	}
	if((tag = tag.to) && u !== arg){ tag.next(arg) }
	return tag;
}