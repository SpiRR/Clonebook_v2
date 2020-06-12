
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.23.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const showPage = writable({
        "pageShown": "home"
    });

    /* src\Nav.svelte generated by Svelte v3.23.0 */
    const file = "src\\Nav.svelte";

    function create_fragment(ctx) {
    	let nav;
    	let div1;
    	let div0;
    	let i0;
    	let t0;
    	let form;
    	let input;
    	let t1;
    	let div5;
    	let div2;
    	let i1;
    	let t2;
    	let div3;
    	let i2;
    	let t3;
    	let div4;
    	let i3;
    	let t4;
    	let div12;
    	let div6;
    	let img;
    	let img_src_value;
    	let t5;
    	let p;
    	let t7;
    	let div7;
    	let i4;
    	let t8;
    	let div9;
    	let i5;
    	let t9;
    	let div8;
    	let t11;
    	let div11;
    	let i6;
    	let t12;
    	let div10;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div1 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			form = element("form");
    			input = element("input");
    			t1 = space();
    			div5 = element("div");
    			div2 = element("div");
    			i1 = element("i");
    			t2 = space();
    			div3 = element("div");
    			i2 = element("i");
    			t3 = space();
    			div4 = element("div");
    			i3 = element("i");
    			t4 = space();
    			div12 = element("div");
    			div6 = element("div");
    			img = element("img");
    			t5 = space();
    			p = element("p");
    			p.textContent = "Stine";
    			t7 = space();
    			div7 = element("div");
    			i4 = element("i");
    			t8 = space();
    			div9 = element("div");
    			i5 = element("i");
    			t9 = space();
    			div8 = element("div");
    			div8.textContent = "1";
    			t11 = space();
    			div11 = element("div");
    			i6 = element("i");
    			t12 = space();
    			div10 = element("div");
    			div10.textContent = "5";
    			attr_dev(i0, "class", "fab fa-cuttlefish");
    			add_location(i0, file, 20, 3, 275);
    			attr_dev(div0, "class", "logo svelte-t26orr");
    			add_location(div0, file, 19, 2, 252);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Search on CloneBook");
    			attr_dev(input, "class", "svelte-t26orr");
    			add_location(input, file, 24, 4, 336);
    			attr_dev(form, "class", "svelte-t26orr");
    			add_location(form, file, 23, 2, 324);
    			attr_dev(div1, "class", "left svelte-t26orr");
    			add_location(div1, file, 18, 1, 230);
    			attr_dev(i1, "class", "fas fa-home");
    			add_location(i1, file, 33, 6, 542);
    			attr_dev(div2, "class", "svelte-t26orr");
    			add_location(div2, file, 32, 4, 488);
    			attr_dev(i2, "class", "fas fa-users");
    			add_location(i2, file, 37, 6, 645);
    			attr_dev(div3, "class", "svelte-t26orr");
    			add_location(div3, file, 36, 4, 589);
    			attr_dev(i3, "class", "fas fa-shopping-basket");
    			add_location(i3, file, 41, 6, 756);
    			attr_dev(div4, "class", "svelte-t26orr");
    			add_location(div4, file, 40, 4, 695);
    			attr_dev(div5, "class", "middle svelte-t26orr");
    			add_location(div5, file, 31, 1, 462);
    			if (img.src !== (img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "user");
    			attr_dev(img, "class", "svelte-t26orr");
    			add_location(img, file, 47, 3, 925);
    			add_location(p, file, 48, 6, 957);
    			attr_dev(div6, "class", "profilelink svelte-t26orr");
    			add_location(div6, file, 46, 2, 847);
    			attr_dev(i4, "class", "fas fa-plus-circle");
    			add_location(i4, file, 52, 3, 1005);
    			attr_dev(div7, "class", "svelte-t26orr");
    			add_location(div7, file, 51, 2, 995);
    			attr_dev(i5, "class", "far fa-comment-alt");
    			add_location(i5, file, 56, 3, 1065);
    			attr_dev(div8, "class", "chat-counter svelte-t26orr");
    			add_location(div8, file, 57, 3, 1104);
    			attr_dev(div9, "class", "svelte-t26orr");
    			add_location(div9, file, 55, 2, 1055);
    			attr_dev(i6, "class", "far fa-bell");
    			add_location(i6, file, 61, 3, 1170);
    			attr_dev(div10, "class", "notification-counter svelte-t26orr");
    			add_location(div10, file, 62, 3, 1203);
    			attr_dev(div11, "class", "svelte-t26orr");
    			add_location(div11, file, 60, 2, 1160);
    			attr_dev(div12, "class", "right svelte-t26orr");
    			add_location(div12, file, 45, 1, 824);
    			attr_dev(nav, "class", "svelte-t26orr");
    			add_location(nav, file, 16, 0, 220);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div1);
    			append_dev(div1, div0);
    			append_dev(div0, i0);
    			append_dev(div1, t0);
    			append_dev(div1, form);
    			append_dev(form, input);
    			append_dev(nav, t1);
    			append_dev(nav, div5);
    			append_dev(div5, div2);
    			append_dev(div2, i1);
    			append_dev(div5, t2);
    			append_dev(div5, div3);
    			append_dev(div3, i2);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, i3);
    			append_dev(nav, t4);
    			append_dev(nav, div12);
    			append_dev(div12, div6);
    			append_dev(div6, img);
    			append_dev(div6, t5);
    			append_dev(div6, p);
    			append_dev(div12, t7);
    			append_dev(div12, div7);
    			append_dev(div7, i4);
    			append_dev(div12, t8);
    			append_dev(div12, div9);
    			append_dev(div9, i5);
    			append_dev(div9, t9);
    			append_dev(div9, div8);
    			append_dev(div12, t11);
    			append_dev(div12, div11);
    			append_dev(div11, i6);
    			append_dev(div11, t12);
    			append_dev(div11, div10);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div2, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(div3, "click", /*click_handler_1*/ ctx[4], false, false, false),
    					listen_dev(div4, "click", /*click_handler_2*/ ctx[5], false, false, false),
    					listen_dev(div6, "click", /*click_handler_3*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $showPage;
    	validate_store(showPage, "showPage");
    	component_subscribe($$self, showPage, $$value => $$invalidate(2, $showPage = $$value));
    	let src = "./images/me.jpg";

    	const currentPage = nameOfPage => {
    		set_store_value(showPage, $showPage.pageShown = nameOfPage, $showPage);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Nav", $$slots, []);

    	const click_handler = () => {
    		currentPage("home");
    	};

    	const click_handler_1 = () => {
    		currentPage("groups");
    	};

    	const click_handler_2 = () => {
    		currentPage("marketplace");
    	};

    	const click_handler_3 = () => {
    		currentPage("profilepage");
    	};

    	$$self.$capture_state = () => ({ src, showPage, currentPage, $showPage });

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		src,
    		currentPage,
    		$showPage,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\Posts.svelte generated by Svelte v3.23.0 */

    const file$1 = "src\\Posts.svelte";

    function create_fragment$1(ctx) {
    	let section;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let form;
    	let input;
    	let t1;
    	let i0;
    	let t2;
    	let div0;
    	let i1;
    	let t4;
    	let i2;
    	let t6;
    	let i3;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			form = element("form");
    			input = element("input");
    			t1 = space();
    			i0 = element("i");
    			t2 = space();
    			div0 = element("div");
    			i1 = element("i");
    			i1.textContent = "Video";
    			t4 = space();
    			i2 = element("i");
    			i2.textContent = "Images";
    			t6 = space();
    			i3 = element("i");
    			i3.textContent = "Surprise me!";
    			if (img.src !== (img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "user");
    			attr_dev(img, "class", "svelte-5rue4h");
    			add_location(img, file$1, 11, 4, 148);
    			attr_dev(input, "placeholder", "What's on your mind?");
    			attr_dev(input, "class", "svelte-5rue4h");
    			add_location(input, file$1, 14, 12, 214);
    			attr_dev(i0, "class", "fas fa-paper-plane svelte-5rue4h");
    			add_location(i0, file$1, 15, 12, 271);
    			attr_dev(form, "action", "");
    			add_location(form, file$1, 13, 8, 184);
    			attr_dev(i1, "class", "fab fa-youtube svelte-5rue4h");
    			add_location(i1, file$1, 19, 8, 360);
    			attr_dev(i2, "class", "far fa-images svelte-5rue4h");
    			add_location(i2, file$1, 20, 8, 405);
    			attr_dev(i3, "class", "far fa-surprise svelte-5rue4h");
    			add_location(i3, file$1, 21, 8, 450);
    			attr_dev(div0, "class", "extras svelte-5rue4h");
    			add_location(div0, file$1, 18, 4, 330);
    			attr_dev(div1, "id", "post-container");
    			attr_dev(div1, "class", "svelte-5rue4h");
    			add_location(div1, file$1, 9, 0, 111);
    			add_location(section, file$1, 8, 0, 100);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, form);
    			append_dev(form, input);
    			append_dev(form, t1);
    			append_dev(form, i0);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, i1);
    			append_dev(div0, t4);
    			append_dev(div0, i2);
    			append_dev(div0, t6);
    			append_dev(div0, i3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let src = "./images/me.jpg";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Posts> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Posts", $$slots, []);
    	$$self.$capture_state = () => ({ src });

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src];
    }

    class Posts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Posts",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\UserPosts.svelte generated by Svelte v3.23.0 */

    const file$2 = "src\\UserPosts.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let div4;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let p;
    	let t2;
    	let div0;
    	let t4;
    	let div2;
    	let i0;
    	let t6;
    	let div3;
    	let i1;
    	let t8;
    	let i2;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div4 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Stine Knarkegaard Andersen";
    			t2 = space();
    			div0 = element("div");
    			div0.textContent = "Report writing before I'm gonna throw my code out the window for being a bitch 😂👌\r\n                #webdevelopment #webdeveloper  #reactjs #nodejs #bachelordegree";
    			t4 = space();
    			div2 = element("div");
    			i0 = element("i");
    			i0.textContent = "1";
    			t6 = space();
    			div3 = element("div");
    			i1 = element("i");
    			i1.textContent = "Like";
    			t8 = space();
    			i2 = element("i");
    			i2.textContent = "Comment";
    			if (img.src !== (img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "user");
    			attr_dev(img, "class", "svelte-5ngs7f");
    			add_location(img, file$2, 12, 12, 184);
    			attr_dev(p, "class", "svelte-5ngs7f");
    			add_location(p, file$2, 13, 12, 222);
    			attr_dev(div0, "id", "post");
    			attr_dev(div0, "class", "svelte-5ngs7f");
    			add_location(div0, file$2, 14, 12, 269);
    			attr_dev(div1, "id", "mypost");
    			attr_dev(div1, "class", "svelte-5ngs7f");
    			add_location(div1, file$2, 11, 8, 153);
    			attr_dev(i0, "class", "far fa-thumbs-up");
    			add_location(i0, file$2, 21, 12, 551);
    			attr_dev(div2, "id", "like-counter");
    			attr_dev(div2, "class", "svelte-5ngs7f");
    			add_location(div2, file$2, 20, 8, 514);
    			attr_dev(i1, "class", "far fa-thumbs-up svelte-5ngs7f");
    			add_location(i1, file$2, 25, 12, 642);
    			attr_dev(i2, "class", "far fa-comment svelte-5ngs7f");
    			add_location(i2, file$2, 26, 12, 693);
    			attr_dev(div3, "id", "like");
    			attr_dev(div3, "class", "svelte-5ngs7f");
    			add_location(div3, file$2, 24, 8, 613);
    			attr_dev(div4, "class", "user-posts svelte-5ngs7f");
    			add_location(div4, file$2, 10, 4, 119);
    			add_location(section, file$2, 8, 0, 102);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div4);
    			append_dev(div4, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, p);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div4, t4);
    			append_dev(div4, div2);
    			append_dev(div2, i0);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div3, i1);
    			append_dev(div3, t8);
    			append_dev(div3, i2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let src = "../images/me.jpg";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<UserPosts> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("UserPosts", $$slots, []);
    	$$self.$capture_state = () => ({ src });

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src];
    }

    class UserPosts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserPosts",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\nav\Home.svelte generated by Svelte v3.23.0 */
    const file$3 = "src\\nav\\Home.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let t0;
    	let t1;
    	let current;
    	const posts = new Posts({ $$inline: true });
    	const userposts = new UserPosts({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			t0 = text("Home\r\n\r\n");
    			create_component(posts.$$.fragment);
    			t1 = space();
    			create_component(userposts.$$.fragment);

    			set_style(section, "display", /*$showPage*/ ctx[0].pageShown == "home"
    			? "block"
    			: "none");

    			add_location(section, file$3, 9, 0, 159);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, t0);
    			mount_component(posts, section, null);
    			append_dev(section, t1);
    			mount_component(userposts, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$showPage*/ 1) {
    				set_style(section, "display", /*$showPage*/ ctx[0].pageShown == "home"
    				? "block"
    				: "none");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(posts.$$.fragment, local);
    			transition_in(userposts.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(posts.$$.fragment, local);
    			transition_out(userposts.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(posts);
    			destroy_component(userposts);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $showPage;
    	validate_store(showPage, "showPage");
    	component_subscribe($$self, showPage, $$value => $$invalidate(0, $showPage = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);
    	$$self.$capture_state = () => ({ Posts, UserPosts, showPage, $showPage });
    	return [$showPage];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\nav\Groups.svelte generated by Svelte v3.23.0 */
    const file$4 = "src\\nav\\Groups.svelte";

    function create_fragment$4(ctx) {
    	let section;
    	let div15;
    	let div2;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let h40;
    	let t2;
    	let p0;
    	let t3;
    	let a0;
    	let t5;
    	let div0;
    	let i0;
    	let t7;
    	let div1;
    	let i1;
    	let t9;
    	let i2;
    	let t11;
    	let div5;
    	let img1;
    	let img1_src_value;
    	let t12;
    	let h41;
    	let t14;
    	let p1;
    	let t15;
    	let a1;
    	let t17;
    	let div3;
    	let i3;
    	let t19;
    	let div4;
    	let i4;
    	let t21;
    	let i5;
    	let t23;
    	let div8;
    	let img2;
    	let img2_src_value;
    	let t24;
    	let h42;
    	let t26;
    	let p2;
    	let t27;
    	let a2;
    	let t29;
    	let div6;
    	let i6;
    	let t31;
    	let div7;
    	let i7;
    	let t33;
    	let i8;
    	let t35;
    	let div11;
    	let img3;
    	let img3_src_value;
    	let t36;
    	let h43;
    	let t38;
    	let p3;
    	let t39;
    	let br;
    	let t40;
    	let t41;
    	let div9;
    	let i9;
    	let t43;
    	let div10;
    	let i10;
    	let t45;
    	let i11;
    	let t47;
    	let div14;
    	let img4;
    	let img4_src_value;
    	let t48;
    	let h44;
    	let t50;
    	let p4;
    	let t52;
    	let div12;
    	let i12;
    	let t54;
    	let div13;
    	let i13;
    	let t56;
    	let i14;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div15 = element("div");
    			div2 = element("div");
    			img0 = element("img");
    			t0 = space();
    			h40 = element("h4");
    			h40.textContent = "Node.js Developers";
    			t2 = space();
    			p0 = element("p");
    			t3 = text("This is a security release.\r\n            Vulnerabilities fixed:\r\n            CVE-2020-8174: napi_get_value_string_*() allows various kinds of memory corruption (High).\r\n            CVE-2020-10531: ICU-20958 Prevent SEGV_MAPERR in append (High).\r\n            CVE-2020-11080: HTTP/2 Large Settings Frame DoS (Low).\r\n            For more info go to ");
    			a0 = element("a");
    			a0.textContent = "Node.js";
    			t5 = space();
    			div0 = element("div");
    			i0 = element("i");
    			i0.textContent = "1";
    			t7 = space();
    			div1 = element("div");
    			i1 = element("i");
    			i1.textContent = "Like";
    			t9 = space();
    			i2 = element("i");
    			i2.textContent = "Comment";
    			t11 = space();
    			div5 = element("div");
    			img1 = element("img");
    			t12 = space();
    			h41 = element("h4");
    			h41.textContent = "Web Development";
    			t14 = space();
    			p1 = element("p");
    			t15 = text("One of the most common problems that I run into when using Redux is trying to figure out why an action is not being captured by a reducer. \r\n            For someone just getting starting with Redux, debugging this issue can be especially overwhelming because of how Redux manages data flow. \r\n            Read more on ");
    			a1 = element("a");
    			a1.textContent = "React News";
    			t17 = space();
    			div3 = element("div");
    			i3 = element("i");
    			i3.textContent = "1";
    			t19 = space();
    			div4 = element("div");
    			i4 = element("i");
    			i4.textContent = "Like";
    			t21 = space();
    			i5 = element("i");
    			i5.textContent = "Comment";
    			t23 = space();
    			div8 = element("div");
    			img2 = element("img");
    			t24 = space();
    			h42 = element("h4");
    			h42.textContent = "Computer Science";
    			t26 = space();
    			p2 = element("p");
    			t27 = text("Scientists have developed the world's first 3D artificial eye with capabilities better than existing bionic eyes and in some cases, \r\n            even exceed those of the human eyes, \r\n            bringing vision to humanoid robots and new hope to patients with visual impairment. \r\n            For more info to go ");
    			a2 = element("a");
    			a2.textContent = "SciendeDaily";
    			t29 = space();
    			div6 = element("div");
    			i6 = element("i");
    			i6.textContent = "1";
    			t31 = space();
    			div7 = element("div");
    			i7 = element("i");
    			i7.textContent = "Like";
    			t33 = space();
    			i8 = element("i");
    			i8.textContent = "Comment";
    			t35 = space();
    			div11 = element("div");
    			img3 = element("img");
    			t36 = space();
    			h43 = element("h4");
    			h43.textContent = "League of Legends";
    			t38 = space();
    			p3 = element("p");
    			t39 = text("Happy June! Y'all ready for a summer of fun (safely indoors on League?) ");
    			br = element("br");
    			t40 = text("\r\n                This patch, we dipped our toe in the usual pool, adjusting some champions that have been standing out, some of whom have been in a rough spot \r\n                (Akali, Brand, Viktor, Xayah).");
    			t41 = space();
    			div9 = element("div");
    			i9 = element("i");
    			i9.textContent = "1";
    			t43 = space();
    			div10 = element("div");
    			i10 = element("i");
    			i10.textContent = "Like";
    			t45 = space();
    			i11 = element("i");
    			i11.textContent = "Comment";
    			t47 = space();
    			div14 = element("div");
    			img4 = element("img");
    			t48 = space();
    			h44 = element("h4");
    			h44.textContent = "World of Warcraft";
    			t50 = space();
    			p4 = element("p");
    			p4.textContent = "Within war-torn Maldraxxus, might—of all kinds—makes right. Here, in the birthplace of necromantic magic, \r\n                those who master the powers of death turn legions of ambitious souls into relentless immortal armies.";
    			t52 = space();
    			div12 = element("div");
    			i12 = element("i");
    			i12.textContent = "1";
    			t54 = space();
    			div13 = element("div");
    			i13 = element("i");
    			i13.textContent = "Like";
    			t56 = space();
    			i14 = element("i");
    			i14.textContent = "Comment";
    			if (img0.src !== (img0_src_value = "./images/nodejs.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "point");
    			attr_dev(img0, "class", "svelte-rumixg");
    			add_location(img0, file$4, 12, 12, 255);
    			attr_dev(h40, "class", "svelte-rumixg");
    			add_location(h40, file$4, 13, 12, 312);
    			attr_dev(a0, "href", "https://nodejs.org/en/blog/");
    			add_location(a0, file$4, 20, 32, 734);
    			attr_dev(p0, "id", "post-message");
    			add_location(p0, file$4, 14, 12, 353);
    			attr_dev(i0, "class", "far fa-thumbs-up");
    			add_location(i0, file$4, 24, 16, 858);
    			attr_dev(div0, "id", "like-counter");
    			attr_dev(div0, "class", "svelte-rumixg");
    			add_location(div0, file$4, 23, 12, 817);
    			attr_dev(i1, "class", "far fa-thumbs-up svelte-rumixg");
    			add_location(i1, file$4, 28, 16, 961);
    			attr_dev(i2, "class", "far fa-comment svelte-rumixg");
    			add_location(i2, file$4, 29, 16, 1016);
    			attr_dev(div1, "id", "like");
    			attr_dev(div1, "class", "svelte-rumixg");
    			add_location(div1, file$4, 27, 12, 928);
    			attr_dev(div2, "id", "group-posts");
    			attr_dev(div2, "class", "svelte-rumixg");
    			add_location(div2, file$4, 11, 8, 219);
    			if (img1.src !== (img1_src_value = "./images/webdev.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "point");
    			attr_dev(img1, "class", "svelte-rumixg");
    			add_location(img1, file$4, 35, 12, 1140);
    			attr_dev(h41, "class", "svelte-rumixg");
    			add_location(h41, file$4, 36, 12, 1197);
    			attr_dev(a1, "href", "https://reactjsnews.com/");
    			add_location(a1, file$4, 40, 25, 1588);
    			attr_dev(p1, "id", "post-message");
    			add_location(p1, file$4, 37, 12, 1235);
    			attr_dev(i3, "class", "far fa-thumbs-up");
    			add_location(i3, file$4, 44, 16, 1712);
    			attr_dev(div3, "id", "like-counter");
    			attr_dev(div3, "class", "svelte-rumixg");
    			add_location(div3, file$4, 43, 12, 1671);
    			attr_dev(i4, "class", "far fa-thumbs-up svelte-rumixg");
    			add_location(i4, file$4, 48, 16, 1815);
    			attr_dev(i5, "class", "far fa-comment svelte-rumixg");
    			add_location(i5, file$4, 49, 16, 1870);
    			attr_dev(div4, "id", "like");
    			attr_dev(div4, "class", "svelte-rumixg");
    			add_location(div4, file$4, 47, 12, 1782);
    			attr_dev(div5, "id", "group-posts");
    			attr_dev(div5, "class", "svelte-rumixg");
    			add_location(div5, file$4, 34, 8, 1104);
    			if (img2.src !== (img2_src_value = "./images/dat.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "point");
    			attr_dev(img2, "class", "svelte-rumixg");
    			add_location(img2, file$4, 54, 12, 1992);
    			attr_dev(h42, "class", "svelte-rumixg");
    			add_location(h42, file$4, 55, 12, 2046);
    			attr_dev(a2, "href", "https://www.sciencedaily.com/releases/2020/06/200610102726.htm");
    			add_location(a2, file$4, 60, 32, 2435);
    			attr_dev(p2, "id", "post-message");
    			add_location(p2, file$4, 56, 12, 2085);
    			attr_dev(i6, "class", "far fa-thumbs-up");
    			add_location(i6, file$4, 64, 16, 2599);
    			attr_dev(div6, "id", "like-counter");
    			attr_dev(div6, "class", "svelte-rumixg");
    			add_location(div6, file$4, 63, 12, 2558);
    			attr_dev(i7, "class", "far fa-thumbs-up svelte-rumixg");
    			add_location(i7, file$4, 68, 16, 2702);
    			attr_dev(i8, "class", "far fa-comment svelte-rumixg");
    			add_location(i8, file$4, 69, 16, 2757);
    			attr_dev(div7, "id", "like");
    			attr_dev(div7, "class", "svelte-rumixg");
    			add_location(div7, file$4, 67, 12, 2669);
    			attr_dev(div8, "id", "group-posts");
    			attr_dev(div8, "class", "svelte-rumixg");
    			add_location(div8, file$4, 53, 8, 1956);
    			if (img3.src !== (img3_src_value = "./images/lol.jpg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "point");
    			attr_dev(img3, "class", "svelte-rumixg");
    			add_location(img3, file$4, 74, 12, 2879);
    			attr_dev(h43, "class", "svelte-rumixg");
    			add_location(h43, file$4, 75, 12, 2933);
    			add_location(br, file$4, 77, 88, 3084);
    			attr_dev(p3, "id", "post-message");
    			add_location(p3, file$4, 76, 12, 2973);
    			attr_dev(i9, "class", "far fa-thumbs-up");
    			add_location(i9, file$4, 83, 16, 3371);
    			attr_dev(div9, "id", "like-counter");
    			attr_dev(div9, "class", "svelte-rumixg");
    			add_location(div9, file$4, 82, 12, 3330);
    			attr_dev(i10, "class", "far fa-thumbs-up svelte-rumixg");
    			add_location(i10, file$4, 87, 16, 3474);
    			attr_dev(i11, "class", "far fa-comment svelte-rumixg");
    			add_location(i11, file$4, 88, 16, 3529);
    			attr_dev(div10, "id", "like");
    			attr_dev(div10, "class", "svelte-rumixg");
    			add_location(div10, file$4, 86, 12, 3441);
    			attr_dev(div11, "id", "group-posts");
    			attr_dev(div11, "class", "svelte-rumixg");
    			add_location(div11, file$4, 73, 8, 2843);
    			if (img4.src !== (img4_src_value = "./images/wow.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "point");
    			attr_dev(img4, "class", "svelte-rumixg");
    			add_location(img4, file$4, 93, 12, 3651);
    			attr_dev(h44, "class", "svelte-rumixg");
    			add_location(h44, file$4, 94, 12, 3705);
    			attr_dev(p4, "id", "post-message");
    			add_location(p4, file$4, 95, 12, 3745);
    			attr_dev(i12, "class", "far fa-thumbs-up");
    			add_location(i12, file$4, 101, 16, 4084);
    			attr_dev(div12, "id", "like-counter");
    			attr_dev(div12, "class", "svelte-rumixg");
    			add_location(div12, file$4, 100, 12, 4043);
    			attr_dev(i13, "class", "far fa-thumbs-up svelte-rumixg");
    			add_location(i13, file$4, 105, 16, 4187);
    			attr_dev(i14, "class", "far fa-comment svelte-rumixg");
    			add_location(i14, file$4, 106, 16, 4242);
    			attr_dev(div13, "id", "like");
    			attr_dev(div13, "class", "svelte-rumixg");
    			add_location(div13, file$4, 104, 12, 4154);
    			attr_dev(div14, "id", "group-posts");
    			attr_dev(div14, "class", "svelte-rumixg");
    			add_location(div14, file$4, 92, 8, 3615);
    			attr_dev(div15, "id", "group-container");
    			add_location(div15, file$4, 9, 4, 181);

    			set_style(section, "display", /*$showPage*/ ctx[0].pageShown == "groups"
    			? "block"
    			: "none");

    			attr_dev(section, "class", "svelte-rumixg");
    			add_location(section, file$4, 7, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div15);
    			append_dev(div15, div2);
    			append_dev(div2, img0);
    			append_dev(div2, t0);
    			append_dev(div2, h40);
    			append_dev(div2, t2);
    			append_dev(div2, p0);
    			append_dev(p0, t3);
    			append_dev(p0, a0);
    			append_dev(div2, t5);
    			append_dev(div2, div0);
    			append_dev(div0, i0);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div1, i1);
    			append_dev(div1, t9);
    			append_dev(div1, i2);
    			append_dev(div15, t11);
    			append_dev(div15, div5);
    			append_dev(div5, img1);
    			append_dev(div5, t12);
    			append_dev(div5, h41);
    			append_dev(div5, t14);
    			append_dev(div5, p1);
    			append_dev(p1, t15);
    			append_dev(p1, a1);
    			append_dev(div5, t17);
    			append_dev(div5, div3);
    			append_dev(div3, i3);
    			append_dev(div5, t19);
    			append_dev(div5, div4);
    			append_dev(div4, i4);
    			append_dev(div4, t21);
    			append_dev(div4, i5);
    			append_dev(div15, t23);
    			append_dev(div15, div8);
    			append_dev(div8, img2);
    			append_dev(div8, t24);
    			append_dev(div8, h42);
    			append_dev(div8, t26);
    			append_dev(div8, p2);
    			append_dev(p2, t27);
    			append_dev(p2, a2);
    			append_dev(div8, t29);
    			append_dev(div8, div6);
    			append_dev(div6, i6);
    			append_dev(div8, t31);
    			append_dev(div8, div7);
    			append_dev(div7, i7);
    			append_dev(div7, t33);
    			append_dev(div7, i8);
    			append_dev(div15, t35);
    			append_dev(div15, div11);
    			append_dev(div11, img3);
    			append_dev(div11, t36);
    			append_dev(div11, h43);
    			append_dev(div11, t38);
    			append_dev(div11, p3);
    			append_dev(p3, t39);
    			append_dev(p3, br);
    			append_dev(p3, t40);
    			append_dev(div11, t41);
    			append_dev(div11, div9);
    			append_dev(div9, i9);
    			append_dev(div11, t43);
    			append_dev(div11, div10);
    			append_dev(div10, i10);
    			append_dev(div10, t45);
    			append_dev(div10, i11);
    			append_dev(div15, t47);
    			append_dev(div15, div14);
    			append_dev(div14, img4);
    			append_dev(div14, t48);
    			append_dev(div14, h44);
    			append_dev(div14, t50);
    			append_dev(div14, p4);
    			append_dev(div14, t52);
    			append_dev(div14, div12);
    			append_dev(div12, i12);
    			append_dev(div14, t54);
    			append_dev(div14, div13);
    			append_dev(div13, i13);
    			append_dev(div13, t56);
    			append_dev(div13, i14);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$showPage*/ 1) {
    				set_style(section, "display", /*$showPage*/ ctx[0].pageShown == "groups"
    				? "block"
    				: "none");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $showPage;
    	validate_store(showPage, "showPage");
    	component_subscribe($$self, showPage, $$value => $$invalidate(0, $showPage = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Groups> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Groups", $$slots, []);
    	$$self.$capture_state = () => ({ showPage, $showPage });
    	return [$showPage];
    }

    class Groups extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Groups",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\nav\Marketplace.svelte generated by Svelte v3.23.0 */
    const file$5 = "src\\nav\\Marketplace.svelte";

    function create_fragment$5(ctx) {
    	let section;
    	let t;

    	const block = {
    		c: function create() {
    			section = element("section");
    			t = text("MNarket");

    			set_style(section, "display", /*$showPage*/ ctx[0].pageShown == "marketplace"
    			? "block"
    			: "none");

    			attr_dev(section, "class", "svelte-8jkueu");
    			add_location(section, file$5, 7, 0, 94);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$showPage*/ 1) {
    				set_style(section, "display", /*$showPage*/ ctx[0].pageShown == "marketplace"
    				? "block"
    				: "none");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $showPage;
    	validate_store(showPage, "showPage");
    	component_subscribe($$self, showPage, $$value => $$invalidate(0, $showPage = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Marketplace> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Marketplace", $$slots, []);
    	$$self.$capture_state = () => ({ showPage, $showPage });
    	return [$showPage];
    }

    class Marketplace extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Marketplace",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\Nav\Profilepage.svelte generated by Svelte v3.23.0 */
    const file$6 = "src\\Nav\\Profilepage.svelte";

    function create_fragment$6(ctx) {
    	let section;
    	let div0;
    	let t1;
    	let div1;
    	let img;
    	let img_src_value;
    	let t2;
    	let h3;
    	let t4;
    	let i;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			div0.textContent = "*insert cover image here*";
    			t1 = space();
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			h3 = element("h3");
    			h3.textContent = "Stine Knarkegaard Andersen";
    			t4 = space();
    			i = element("i");
    			attr_dev(div0, "class", "cover svelte-axzehi");
    			add_location(div0, file$6, 11, 0, 233);
    			if (img.src !== (img_src_value = /*src*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "user");
    			attr_dev(img, "class", "svelte-axzehi");
    			add_location(img, file$6, 14, 4, 318);
    			attr_dev(h3, "class", "svelte-axzehi");
    			add_location(h3, file$6, 15, 4, 348);
    			attr_dev(i, "class", "fas fa-cog svelte-axzehi");
    			add_location(i, file$6, 16, 4, 389);
    			attr_dev(div1, "class", "profileinfo svelte-axzehi");
    			add_location(div1, file$6, 13, 0, 287);

    			set_style(section, "display", /*$showPage*/ ctx[0].pageShown == "profilepage"
    			? "block"
    			: "none");

    			attr_dev(section, "class", "svelte-axzehi");
    			add_location(section, file$6, 9, 0, 145);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(section, t1);
    			append_dev(section, div1);
    			append_dev(div1, img);
    			append_dev(div1, t2);
    			append_dev(div1, h3);
    			append_dev(div1, t4);
    			append_dev(div1, i);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$showPage*/ 1) {
    				set_style(section, "display", /*$showPage*/ ctx[0].pageShown == "profilepage"
    				? "block"
    				: "none");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $showPage;
    	validate_store(showPage, "showPage");
    	component_subscribe($$self, showPage, $$value => $$invalidate(0, $showPage = $$value));
    	let src = "./images/me.jpg";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Profilepage> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Profilepage", $$slots, []);
    	$$self.$capture_state = () => ({ showPage, src, $showPage });

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(1, src = $$props.src);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$showPage, src];
    }

    class Profilepage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Profilepage",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\Right.svelte generated by Svelte v3.23.0 */

    const file$7 = "src\\Right.svelte";

    function create_fragment$7(ctx) {
    	let main;
    	let section;
    	let h3;
    	let t1;
    	let div;
    	let img;
    	let img_src_value;
    	let t2;
    	let p;

    	const block = {
    		c: function create() {
    			main = element("main");
    			section = element("section");
    			h3 = element("h3");
    			h3.textContent = "Contacts";
    			t1 = space();
    			div = element("div");
    			img = element("img");
    			t2 = space();
    			p = element("p");
    			p.textContent = "Stine Knarkegaard Petersen";
    			attr_dev(h3, "class", "svelte-h0hsjn");
    			add_location(h3, file$7, 11, 4, 132);
    			if (img.src !== (img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "user");
    			attr_dev(img, "class", "svelte-h0hsjn");
    			add_location(img, file$7, 14, 8, 190);
    			attr_dev(p, "class", "svelte-h0hsjn");
    			add_location(p, file$7, 15, 8, 223);
    			attr_dev(div, "class", "friend svelte-h0hsjn");
    			add_location(div, file$7, 13, 7, 160);
    			attr_dev(section, "id", "contacts");
    			attr_dev(section, "class", "svelte-h0hsjn");
    			add_location(section, file$7, 10, 1, 103);
    			add_location(main, file$7, 8, 0, 92);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section);
    			append_dev(section, h3);
    			append_dev(section, t1);
    			append_dev(section, div);
    			append_dev(div, img);
    			append_dev(div, t2);
    			append_dev(div, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let src = "./images/me.jpg";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Right> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Right", $$slots, []);
    	$$self.$capture_state = () => ({ src });

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src];
    }

    class Right extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Right",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\Left.svelte generated by Svelte v3.23.0 */

    const file$8 = "src\\Left.svelte";

    function create_fragment$8(ctx) {
    	let main;
    	let section0;
    	let h30;
    	let t1;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let h40;
    	let t4;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t5;
    	let h41;
    	let t7;
    	let div2;
    	let img2;
    	let img2_src_value;
    	let t8;
    	let h42;
    	let t10;
    	let section1;
    	let h31;
    	let t12;
    	let div3;
    	let img3;
    	let img3_src_value;
    	let t13;
    	let h43;
    	let t15;
    	let div4;
    	let img4;
    	let img4_src_value;
    	let t16;
    	let h44;
    	let t18;
    	let div5;
    	let img5;
    	let img5_src_value;
    	let t19;
    	let h45;
    	let t21;
    	let div6;
    	let img6;
    	let img6_src_value;
    	let t22;
    	let h46;
    	let t24;
    	let div7;
    	let img7;
    	let img7_src_value;
    	let t25;
    	let h47;

    	const block = {
    		c: function create() {
    			main = element("main");
    			section0 = element("section");
    			h30 = element("h3");
    			h30.textContent = "Sites";
    			t1 = space();
    			div0 = element("div");
    			img0 = element("img");
    			t2 = space();
    			h40 = element("h4");
    			h40.textContent = "General";
    			t4 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t5 = space();
    			h41 = element("h4");
    			h41.textContent = "Goverment";
    			t7 = space();
    			div2 = element("div");
    			img2 = element("img");
    			t8 = space();
    			h42 = element("h4");
    			h42.textContent = "COVID-19: Information Center";
    			t10 = space();
    			section1 = element("section");
    			h31 = element("h3");
    			h31.textContent = "Groups";
    			t12 = space();
    			div3 = element("div");
    			img3 = element("img");
    			t13 = space();
    			h43 = element("h4");
    			h43.textContent = "Node.js Developers";
    			t15 = space();
    			div4 = element("div");
    			img4 = element("img");
    			t16 = space();
    			h44 = element("h4");
    			h44.textContent = "Web Development";
    			t18 = space();
    			div5 = element("div");
    			img5 = element("img");
    			t19 = space();
    			h45 = element("h4");
    			h45.textContent = "Computer Science";
    			t21 = space();
    			div6 = element("div");
    			img6 = element("img");
    			t22 = space();
    			h46 = element("h4");
    			h46.textContent = "Leauge of Legends";
    			t24 = space();
    			div7 = element("div");
    			img7 = element("img");
    			t25 = space();
    			h47 = element("h4");
    			h47.textContent = "World of Warcraft";
    			attr_dev(h30, "class", "svelte-n3wtru");
    			add_location(h30, file$8, 9, 7, 99);
    			if (img0.src !== (img0_src_value = "./images/point.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "point");
    			attr_dev(img0, "class", "svelte-n3wtru");
    			add_location(img0, file$8, 12, 8, 140);
    			attr_dev(h40, "class", "svelte-n3wtru");
    			add_location(h40, file$8, 13, 8, 192);
    			attr_dev(div0, "class", "svelte-n3wtru");
    			add_location(div0, file$8, 11, 8, 125);
    			if (img1.src !== (img1_src_value = "./images/building.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "point");
    			attr_dev(img1, "class", "svelte-n3wtru");
    			add_location(img1, file$8, 17, 8, 251);
    			attr_dev(h41, "class", "svelte-n3wtru");
    			add_location(h41, file$8, 18, 8, 306);
    			attr_dev(div1, "class", "svelte-n3wtru");
    			add_location(div1, file$8, 16, 8, 236);
    			if (img2.src !== (img2_src_value = "./images/virus.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "point");
    			attr_dev(img2, "class", "svelte-n3wtru");
    			add_location(img2, file$8, 22, 8, 367);
    			attr_dev(h42, "class", "svelte-n3wtru");
    			add_location(h42, file$8, 23, 8, 419);
    			attr_dev(div2, "class", "svelte-n3wtru");
    			add_location(div2, file$8, 21, 8, 352);
    			attr_dev(section0, "id", "sites");
    			attr_dev(section0, "class", "svelte-n3wtru");
    			add_location(section0, file$8, 8, 1, 70);
    			attr_dev(h31, "class", "svelte-n3wtru");
    			add_location(h31, file$8, 29, 7, 528);
    			if (img3.src !== (img3_src_value = "./images/nodejs.jpg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "point");
    			attr_dev(img3, "class", "svelte-n3wtru");
    			add_location(img3, file$8, 32, 8, 570);
    			attr_dev(h43, "class", "svelte-n3wtru");
    			add_location(h43, file$8, 33, 8, 623);
    			attr_dev(div3, "class", "svelte-n3wtru");
    			add_location(div3, file$8, 31, 8, 555);
    			if (img4.src !== (img4_src_value = "./images/webdev.jpg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "point");
    			attr_dev(img4, "class", "svelte-n3wtru");
    			add_location(img4, file$8, 37, 8, 693);
    			attr_dev(h44, "class", "svelte-n3wtru");
    			add_location(h44, file$8, 38, 8, 746);
    			attr_dev(div4, "class", "svelte-n3wtru");
    			add_location(div4, file$8, 36, 8, 678);
    			if (img5.src !== (img5_src_value = "./images/dat.jpg")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "point");
    			attr_dev(img5, "class", "svelte-n3wtru");
    			add_location(img5, file$8, 42, 8, 813);
    			attr_dev(h45, "class", "svelte-n3wtru");
    			add_location(h45, file$8, 43, 8, 863);
    			attr_dev(div5, "class", "svelte-n3wtru");
    			add_location(div5, file$8, 41, 8, 798);
    			if (img6.src !== (img6_src_value = "./images/lol.jpg")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "point");
    			attr_dev(img6, "class", "svelte-n3wtru");
    			add_location(img6, file$8, 47, 8, 931);
    			attr_dev(h46, "class", "svelte-n3wtru");
    			add_location(h46, file$8, 48, 8, 981);
    			attr_dev(div6, "class", "svelte-n3wtru");
    			add_location(div6, file$8, 46, 8, 916);
    			if (img7.src !== (img7_src_value = "./images/wow.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "point");
    			attr_dev(img7, "class", "svelte-n3wtru");
    			add_location(img7, file$8, 52, 8, 1050);
    			attr_dev(h47, "class", "svelte-n3wtru");
    			add_location(h47, file$8, 53, 8, 1100);
    			attr_dev(div7, "class", "svelte-n3wtru");
    			add_location(div7, file$8, 51, 8, 1035);
    			attr_dev(section1, "id", "groups");
    			attr_dev(section1, "class", "svelte-n3wtru");
    			add_location(section1, file$8, 28, 4, 498);
    			attr_dev(main, "class", "svelte-n3wtru");
    			add_location(main, file$8, 6, 0, 59);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section0);
    			append_dev(section0, h30);
    			append_dev(section0, t1);
    			append_dev(section0, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t2);
    			append_dev(div0, h40);
    			append_dev(section0, t4);
    			append_dev(section0, div1);
    			append_dev(div1, img1);
    			append_dev(div1, t5);
    			append_dev(div1, h41);
    			append_dev(section0, t7);
    			append_dev(section0, div2);
    			append_dev(div2, img2);
    			append_dev(div2, t8);
    			append_dev(div2, h42);
    			append_dev(main, t10);
    			append_dev(main, section1);
    			append_dev(section1, h31);
    			append_dev(section1, t12);
    			append_dev(section1, div3);
    			append_dev(div3, img3);
    			append_dev(div3, t13);
    			append_dev(div3, h43);
    			append_dev(section1, t15);
    			append_dev(section1, div4);
    			append_dev(div4, img4);
    			append_dev(div4, t16);
    			append_dev(div4, h44);
    			append_dev(section1, t18);
    			append_dev(section1, div5);
    			append_dev(div5, img5);
    			append_dev(div5, t19);
    			append_dev(div5, h45);
    			append_dev(section1, t21);
    			append_dev(section1, div6);
    			append_dev(div6, img6);
    			append_dev(div6, t22);
    			append_dev(div6, h46);
    			append_dev(section1, t24);
    			append_dev(section1, div7);
    			append_dev(div7, img7);
    			append_dev(div7, t25);
    			append_dev(div7, h47);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Left> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Left", $$slots, []);
    	return [];
    }

    class Left extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Left",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\ChatContainer.svelte generated by Svelte v3.23.0 */

    const file$9 = "src\\ChatContainer.svelte";

    function create_fragment$9(ctx) {
    	let section;
    	let i;

    	const block = {
    		c: function create() {
    			section = element("section");
    			i = element("i");
    			attr_dev(i, "class", "far fa-comment svelte-peh5f7");
    			add_location(i, file$9, 9, 0, 93);
    			attr_dev(section, "class", "svelte-peh5f7");
    			add_location(section, file$9, 7, 0, 80);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, i);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ChatContainer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ChatContainer", $$slots, []);
    	return [];
    }

    class ChatContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChatContainer",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\OpenChatContainer.svelte generated by Svelte v3.23.0 */

    const file$a = "src\\OpenChatContainer.svelte";

    function create_fragment$a(ctx) {
    	let section;
    	let div3;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let p;
    	let t2;
    	let i0;
    	let t3;
    	let i1;
    	let t4;
    	let div1;
    	let t5;
    	let div2;
    	let input;
    	let t6;
    	let button;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Friend Name";
    			t2 = space();
    			i0 = element("i");
    			t3 = space();
    			i1 = element("i");
    			t4 = space();
    			div1 = element("div");
    			t5 = space();
    			div2 = element("div");
    			input = element("input");
    			t6 = space();
    			button = element("button");
    			button.textContent = ">";
    			if (img.src !== (img_src_value = src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "user");
    			attr_dev(img, "class", "svelte-1gw1tyb");
    			add_location(img, file$a, 13, 8, 189);
    			attr_dev(p, "class", "svelte-1gw1tyb");
    			add_location(p, file$a, 14, 8, 222);
    			attr_dev(i0, "class", "fas fa-minus svelte-1gw1tyb");
    			add_location(i0, file$a, 15, 8, 250);
    			attr_dev(i1, "class", "fas fa-times svelte-1gw1tyb");
    			add_location(i1, file$a, 16, 8, 288);
    			attr_dev(div0, "id", "top-container");
    			attr_dev(div0, "class", "svelte-1gw1tyb");
    			add_location(div0, file$a, 12, 4, 155);
    			attr_dev(div1, "id", "chat");
    			attr_dev(div1, "class", "svelte-1gw1tyb");
    			add_location(div1, file$a, 20, 4, 338);
    			attr_dev(input, "placeholder", "Aa");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-1gw1tyb");
    			add_location(input, file$a, 25, 8, 409);
    			attr_dev(button, "class", "svelte-1gw1tyb");
    			add_location(button, file$a, 28, 8, 474);
    			attr_dev(div2, "id", "bot-container");
    			attr_dev(div2, "class", "svelte-1gw1tyb");
    			add_location(div2, file$a, 24, 4, 375);
    			attr_dev(div3, "id", "chat-container");
    			attr_dev(div3, "class", "svelte-1gw1tyb");
    			add_location(div3, file$a, 11, 0, 124);
    			add_location(section, file$a, 9, 0, 111);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, p);
    			append_dev(div0, t2);
    			append_dev(div0, i0);
    			append_dev(div0, t3);
    			append_dev(div0, i1);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, input);
    			append_dev(div2, t6);
    			append_dev(div2, button);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let src = "./images/me.jpg";

    function instance$a($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OpenChatContainer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OpenChatContainer", $$slots, []);
    	$$self.$capture_state = () => ({ src });
    	return [];
    }

    class OpenChatContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OpenChatContainer",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.23.0 */
    const file$b = "src\\App.svelte";

    // (23:2) {#if $showPage.pageShown != 'profilepage'}
    function create_if_block(ctx) {
    	let t;
    	let current;
    	const left = new Left({ $$inline: true });
    	const right = new Right({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(left.$$.fragment);
    			t = space();
    			create_component(right.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(left, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(right, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(left.$$.fragment, local);
    			transition_in(right.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(left.$$.fragment, local);
    			transition_out(right.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(left, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(right, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(23:2) {#if $showPage.pageShown != 'profilepage'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let section;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let current;
    	let if_block = /*$showPage*/ ctx[0].pageShown != "profilepage" && create_if_block(ctx);
    	const nav = new Nav({ $$inline: true });
    	const home = new Home({ $$inline: true });
    	const groups = new Groups({ $$inline: true });
    	const marketplace = new Marketplace({ $$inline: true });
    	const profilepage = new Profilepage({ $$inline: true });
    	const chatcontainer = new ChatContainer({ $$inline: true });
    	const openchatcontainer = new OpenChatContainer({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (if_block) if_block.c();
    			t0 = space();
    			create_component(nav.$$.fragment);
    			t1 = space();
    			create_component(home.$$.fragment);
    			t2 = space();
    			create_component(groups.$$.fragment);
    			t3 = space();
    			create_component(marketplace.$$.fragment);
    			t4 = space();
    			create_component(profilepage.$$.fragment);
    			t5 = space();
    			create_component(chatcontainer.$$.fragment);
    			t6 = space();
    			create_component(openchatcontainer.$$.fragment);
    			add_location(section, file$b, 20, 0, 539);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if (if_block) if_block.m(section, null);
    			append_dev(section, t0);
    			mount_component(nav, section, null);
    			append_dev(section, t1);
    			mount_component(home, section, null);
    			append_dev(section, t2);
    			mount_component(groups, section, null);
    			append_dev(section, t3);
    			mount_component(marketplace, section, null);
    			append_dev(section, t4);
    			mount_component(profilepage, section, null);
    			append_dev(section, t5);
    			mount_component(chatcontainer, section, null);
    			append_dev(section, t6);
    			mount_component(openchatcontainer, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$showPage*/ ctx[0].pageShown != "profilepage") {
    				if (if_block) {
    					if (dirty & /*$showPage*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(section, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(nav.$$.fragment, local);
    			transition_in(home.$$.fragment, local);
    			transition_in(groups.$$.fragment, local);
    			transition_in(marketplace.$$.fragment, local);
    			transition_in(profilepage.$$.fragment, local);
    			transition_in(chatcontainer.$$.fragment, local);
    			transition_in(openchatcontainer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(nav.$$.fragment, local);
    			transition_out(home.$$.fragment, local);
    			transition_out(groups.$$.fragment, local);
    			transition_out(marketplace.$$.fragment, local);
    			transition_out(profilepage.$$.fragment, local);
    			transition_out(chatcontainer.$$.fragment, local);
    			transition_out(openchatcontainer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block) if_block.d();
    			destroy_component(nav);
    			destroy_component(home);
    			destroy_component(groups);
    			destroy_component(marketplace);
    			destroy_component(profilepage);
    			destroy_component(chatcontainer);
    			destroy_component(openchatcontainer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $showPage;
    	validate_store(showPage, "showPage");
    	component_subscribe($$self, showPage, $$value => $$invalidate(0, $showPage = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Nav,
    		Home,
    		Groups,
    		Marketplace,
    		Profilepage,
    		Right,
    		Left,
    		ChatContainer,
    		OpenChatContainer,
    		showPage,
    		$showPage
    	});

    	return [$showPage];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
