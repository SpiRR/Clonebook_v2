
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
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

    const user = writable({ 
        "friends": []
     });

     const post = writable([]);

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
    	let div6;
    	let div2;
    	let i1;
    	let t2;
    	let div3;
    	let i2;
    	let t3;
    	let div4;
    	let i3;
    	let t4;
    	let div5;
    	let i4;
    	let t5;
    	let div9;
    	let div7;
    	let img;
    	let img_src_value;
    	let t6;
    	let p;
    	let t7_value = /*$user*/ ctx[0].firstName + "";
    	let t7;
    	let t8;
    	let div8;
    	let a;
    	let i5;
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
    			div6 = element("div");
    			div2 = element("div");
    			i1 = element("i");
    			t2 = space();
    			div3 = element("div");
    			i2 = element("i");
    			t3 = space();
    			div4 = element("div");
    			i3 = element("i");
    			t4 = space();
    			div5 = element("div");
    			i4 = element("i");
    			t5 = space();
    			div9 = element("div");
    			div7 = element("div");
    			img = element("img");
    			t6 = space();
    			p = element("p");
    			t7 = text(t7_value);
    			t8 = space();
    			div8 = element("div");
    			a = element("a");
    			i5 = element("i");
    			attr_dev(i0, "class", "fab fa-cuttlefish svelte-32vboh");
    			add_location(i0, file, 28, 3, 458);
    			attr_dev(div0, "class", "logo svelte-32vboh");
    			add_location(div0, file, 27, 2, 435);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Search on CloneBook");
    			attr_dev(input, "class", "svelte-32vboh");
    			add_location(input, file, 32, 4, 519);
    			attr_dev(form, "class", "svelte-32vboh");
    			add_location(form, file, 31, 2, 507);
    			attr_dev(div1, "class", "left svelte-32vboh");
    			add_location(div1, file, 26, 1, 413);
    			attr_dev(i1, "class", "fas fa-home svelte-32vboh");
    			add_location(i1, file, 41, 6, 725);
    			attr_dev(div2, "class", "svelte-32vboh");
    			add_location(div2, file, 40, 4, 671);
    			attr_dev(i2, "class", "fas fa-users svelte-32vboh");
    			add_location(i2, file, 46, 6, 864);
    			attr_dev(div3, "class", "svelte-32vboh");
    			add_location(div3, file, 45, 4, 808);
    			attr_dev(i3, "class", "fas fa-video svelte-32vboh");
    			add_location(i3, file, 51, 6, 1006);
    			attr_dev(div4, "class", "svelte-32vboh");
    			add_location(div4, file, 50, 4, 950);
    			attr_dev(i4, "class", "fas fa-shopping-basket svelte-32vboh");
    			add_location(i4, file, 56, 6, 1153);
    			attr_dev(div5, "class", "svelte-32vboh");
    			add_location(div5, file, 55, 4, 1092);
    			attr_dev(div6, "class", "middle svelte-32vboh");
    			add_location(div6, file, 39, 1, 645);
    			if (img.src !== (img_src_value = "http://localhost:5000/images/userImages/" + /*$user*/ ctx[0].profilepicture)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "user");
    			attr_dev(img, "class", "svelte-32vboh");
    			add_location(img, file, 64, 3, 1357);
    			attr_dev(p, "class", "svelte-32vboh");
    			add_location(p, file, 65, 6, 1452);
    			attr_dev(div7, "class", "profilelink svelte-32vboh");
    			add_location(div7, file, 63, 2, 1279);
    			attr_dev(i5, "class", "fas fa-sign-out-alt svelte-32vboh");
    			add_location(i5, file, 69, 39, 1560);
    			attr_dev(a, "id", "logout");
    			add_location(a, file, 69, 6, 1527);
    			attr_dev(div8, "class", "menu svelte-32vboh");
    			add_location(div8, file, 68, 4, 1501);
    			attr_dev(div9, "class", "right svelte-32vboh");
    			add_location(div9, file, 62, 1, 1256);
    			attr_dev(nav, "class", "svelte-32vboh");
    			add_location(nav, file, 24, 0, 403);
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
    			append_dev(nav, div6);
    			append_dev(div6, div2);
    			append_dev(div2, i1);
    			append_dev(div6, t2);
    			append_dev(div6, div3);
    			append_dev(div3, i2);
    			append_dev(div6, t3);
    			append_dev(div6, div4);
    			append_dev(div4, i3);
    			append_dev(div6, t4);
    			append_dev(div6, div5);
    			append_dev(div5, i4);
    			append_dev(nav, t5);
    			append_dev(nav, div9);
    			append_dev(div9, div7);
    			append_dev(div7, img);
    			append_dev(div7, t6);
    			append_dev(div7, p);
    			append_dev(p, t7);
    			append_dev(div9, t8);
    			append_dev(div9, div8);
    			append_dev(div8, a);
    			append_dev(a, i5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div2, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(div3, "click", /*click_handler_1*/ ctx[5], false, false, false),
    					listen_dev(div4, "click", /*click_handler_2*/ ctx[6], false, false, false),
    					listen_dev(div5, "click", /*click_handler_3*/ ctx[7], false, false, false),
    					listen_dev(div7, "click", /*click_handler_4*/ ctx[8], false, false, false),
    					listen_dev(a, "click", logout, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$user*/ 1 && img.src !== (img_src_value = "http://localhost:5000/images/userImages/" + /*$user*/ ctx[0].profilepicture)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$user*/ 1 && t7_value !== (t7_value = /*$user*/ ctx[0].firstName + "")) set_data_dev(t7, t7_value);
    		},
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

    function logout() {
    	window.localStorage.removeItem("token");
    	location.href = "http://localhost:80/login";
    }

    function instance($$self, $$props, $$invalidate) {
    	let $showPage;
    	let $user;
    	validate_store(showPage, "showPage");
    	component_subscribe($$self, showPage, $$value => $$invalidate(2, $showPage = $$value));
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(0, $user = $$value));
    	let src = "http://localhost:5000/images/me.jpg";

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
    		currentPage("videos");
    	};

    	const click_handler_3 = () => {
    		currentPage("marketplace");
    	};

    	const click_handler_4 = () => {
    		currentPage("profilepage");
    	};

    	$$self.$capture_state = () => ({
    		src,
    		showPage,
    		user,
    		currentPage,
    		logout,
    		$showPage,
    		$user
    	});

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) src = $$props.src;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		$user,
    		currentPage,
    		$showPage,
    		src,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
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

    const { console: console_1 } = globals;
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
    	let button;
    	let i0;
    	let t2;
    	let div0;
    	let i1;
    	let p0;
    	let t4;
    	let i2;
    	let p1;
    	let t6;
    	let i3;
    	let p2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			form = element("form");
    			input = element("input");
    			t1 = space();
    			button = element("button");
    			i0 = element("i");
    			t2 = space();
    			div0 = element("div");
    			i1 = element("i");
    			p0 = element("p");
    			p0.textContent = "Video";
    			t4 = space();
    			i2 = element("i");
    			p1 = element("p");
    			p1.textContent = "Images";
    			t6 = space();
    			i3 = element("i");
    			p2 = element("p");
    			p2.textContent = "Surprise";
    			if (img.src !== (img_src_value = "http://localhost:5000/images/userImages/" + /*$user*/ ctx[1].profilepicture)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "user");
    			attr_dev(img, "class", "svelte-ehd4ae");
    			add_location(img, file$1, 33, 4, 712);
    			attr_dev(input, "placeholder", "What's on your mind?");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", "postmsg");
    			attr_dev(input, "class", "svelte-ehd4ae");
    			add_location(input, file$1, 36, 12, 882);
    			attr_dev(i0, "class", "fas fa-paper-plane svelte-ehd4ae");
    			add_location(i0, file$1, 37, 20, 997);
    			add_location(button, file$1, 37, 12, 989);
    			attr_dev(form, "id", "status");
    			add_location(form, file$1, 35, 8, 811);
    			attr_dev(p0, "class", "svelte-ehd4ae");
    			add_location(p0, file$1, 41, 34, 1121);
    			attr_dev(i1, "class", "fab fa-youtube svelte-ehd4ae");
    			add_location(i1, file$1, 41, 8, 1095);
    			attr_dev(p1, "class", "svelte-ehd4ae");
    			add_location(p1, file$1, 42, 33, 1172);
    			attr_dev(i2, "class", "far fa-images svelte-ehd4ae");
    			add_location(i2, file$1, 42, 8, 1147);
    			attr_dev(p2, "class", "svelte-ehd4ae");
    			add_location(p2, file$1, 43, 35, 1229);
    			attr_dev(i3, "class", "far fa-surprise svelte-ehd4ae");
    			add_location(i3, file$1, 43, 8, 1202);
    			attr_dev(div0, "class", "extras svelte-ehd4ae");
    			add_location(div0, file$1, 40, 4, 1065);
    			attr_dev(div1, "id", "post-container");
    			attr_dev(div1, "class", "svelte-ehd4ae");
    			add_location(div1, file$1, 31, 0, 675);
    			attr_dev(section, "class", "svelte-ehd4ae");
    			add_location(section, file$1, 30, 0, 664);
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
    			set_input_value(input, /*postmsg*/ ctx[0]);
    			append_dev(form, t1);
    			append_dev(form, button);
    			append_dev(button, i0);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, i1);
    			append_dev(i1, p0);
    			append_dev(div0, t4);
    			append_dev(div0, i2);
    			append_dev(i2, p1);
    			append_dev(div0, t6);
    			append_dev(div0, i3);
    			append_dev(i3, p2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    					listen_dev(form, "submit", prevent_default(/*createAPost*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$user*/ 2 && img.src !== (img_src_value = "http://localhost:5000/images/userImages/" + /*$user*/ ctx[1].profilepicture)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*postmsg*/ 1 && input.value !== /*postmsg*/ ctx[0]) {
    				set_input_value(input, /*postmsg*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			run_all(dispose);
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
    	let $post;
    	let $user;
    	validate_store(post, "post");
    	component_subscribe($$self, post, $$value => $$invalidate(3, $post = $$value));
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(1, $user = $$value));
    	let postmsg = "";

    	// CREATE A POST
    	const createAPost = async () => {
    		let formData = new FormData();
    		formData.append("postmsg", postmsg);

    		const connection = await fetch("/create-post", {
    			method: "post",
    			credentials: "include",
    			body: formData,
    			headers: { "token": localStorage.token }
    		});

    		let response = await connection.json();
    		console.log(response);
    		set_store_value(post, $post = response);
    		document.querySelector("#status").reset();
    		console.log($post);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Posts> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Posts", $$slots, []);

    	function input_input_handler() {
    		postmsg = this.value;
    		$$invalidate(0, postmsg);
    	}

    	$$self.$capture_state = () => ({
    		user,
    		post,
    		postmsg,
    		createAPost,
    		$post,
    		$user
    	});

    	$$self.$inject_state = $$props => {
    		if ("postmsg" in $$props) $$invalidate(0, postmsg = $$props.postmsg);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [postmsg, $user, createAPost, $post, input_input_handler];
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

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (25:8) {#each $post.reverse() as userPost}
    function create_each_block(ctx) {
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let p0;
    	let t1_value = /*userPost*/ ctx[2].author.author_firstName + "";
    	let t1;
    	let t2;
    	let t3_value = /*userPost*/ ctx[2].author.author_lastName + "";
    	let t3;
    	let t4;
    	let div0;
    	let t5_value = /*userPost*/ ctx[2].post + "";
    	let t5;
    	let t6;
    	let p1;
    	let i0;
    	let t8;
    	let p2;
    	let i1;
    	let t9;
    	let i2;
    	let t10;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			p0 = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			div0 = element("div");
    			t5 = text(t5_value);
    			t6 = space();
    			p1 = element("p");
    			i0 = element("i");
    			i0.textContent = "1";
    			t8 = space();
    			p2 = element("p");
    			i1 = element("i");
    			t9 = space();
    			i2 = element("i");
    			t10 = space();
    			if (img.src !== (img_src_value = "http://localhost:5000/images/userImages/" + /*userPost*/ ctx[2].author.author_img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "user");
    			attr_dev(img, "class", "svelte-bduyqc");
    			add_location(img, file$2, 27, 20, 605);
    			attr_dev(p0, "class", "svelte-bduyqc");
    			add_location(p0, file$2, 28, 24, 742);
    			attr_dev(div0, "id", "post");
    			attr_dev(div0, "class", "svelte-bduyqc");
    			add_location(div0, file$2, 29, 20, 859);
    			attr_dev(div1, "id", "mypost");
    			attr_dev(div1, "class", "svelte-bduyqc");
    			add_location(div1, file$2, 26, 16, 566);
    			attr_dev(i0, "class", "far fa-thumbs-up");
    			add_location(i0, file$2, 34, 20, 1000);
    			attr_dev(p1, "id", "like-counter");
    			attr_dev(p1, "class", "svelte-bduyqc");
    			add_location(p1, file$2, 33, 16, 957);
    			attr_dev(i1, "class", "far fa-thumbs-up");
    			add_location(i1, file$2, 38, 20, 1111);
    			attr_dev(i2, "class", "far fa-comment");
    			add_location(i2, file$2, 39, 20, 1165);
    			attr_dev(p2, "id", "like");
    			attr_dev(p2, "class", "svelte-bduyqc");
    			add_location(p2, file$2, 37, 16, 1076);
    			attr_dev(div2, "class", "user-posts svelte-bduyqc");
    			add_location(div2, file$2, 25, 12, 524);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, p0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, div0);
    			append_dev(div0, t5);
    			append_dev(div2, t6);
    			append_dev(div2, p1);
    			append_dev(p1, i0);
    			append_dev(div2, t8);
    			append_dev(div2, p2);
    			append_dev(p2, i1);
    			append_dev(p2, t9);
    			append_dev(p2, i2);
    			append_dev(div2, t10);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$post*/ 1 && img.src !== (img_src_value = "http://localhost:5000/images/userImages/" + /*userPost*/ ctx[2].author.author_img)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$post*/ 1 && t1_value !== (t1_value = /*userPost*/ ctx[2].author.author_firstName + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$post*/ 1 && t3_value !== (t3_value = /*userPost*/ ctx[2].author.author_lastName + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*$post*/ 1 && t5_value !== (t5_value = /*userPost*/ ctx[2].post + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(25:8) {#each $post.reverse() as userPost}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let section;
    	let each_value = /*$post*/ ctx[0].reverse();
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(section, file$2, 22, 0, 454);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$post*/ 1) {
    				each_value = /*$post*/ ctx[0].reverse();
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(section, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
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
    	let $post;
    	validate_store(post, "post");
    	component_subscribe($$self, post, $$value => $$invalidate(0, $post = $$value));

    	const fetchUserPosts = (async () => {
    		const connection = await fetch("/posts", {
    			method: "get",
    			credentials: "include",
    			headers: { "token": localStorage.token }
    		});

    		let response = await connection.json();
    		set_store_value(post, $post = response);
    	})(); // console.log($post)

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<UserPosts> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("UserPosts", $$slots, []);
    	$$self.$capture_state = () => ({ post, user, fetchUserPosts, $post });
    	return [$post];
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
    	let t;
    	let current;
    	const posts = new Posts({ $$inline: true });
    	const userposts = new UserPosts({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(posts.$$.fragment);
    			t = space();
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
    			mount_component(posts, section, null);
    			append_dev(section, t);
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
    	let div20;
    	let div3;
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
    	let div2;
    	let i2;
    	let t10;
    	let i3;
    	let t11;
    	let div7;
    	let img1;
    	let img1_src_value;
    	let t12;
    	let h41;
    	let t14;
    	let p1;
    	let t15;
    	let a1;
    	let t17;
    	let div4;
    	let i4;
    	let t19;
    	let div5;
    	let i5;
    	let t21;
    	let div6;
    	let i6;
    	let t22;
    	let i7;
    	let t23;
    	let div11;
    	let img2;
    	let img2_src_value;
    	let t24;
    	let h42;
    	let t26;
    	let p2;
    	let t27;
    	let a2;
    	let t29;
    	let div8;
    	let i8;
    	let t31;
    	let div9;
    	let i9;
    	let t33;
    	let div10;
    	let i10;
    	let t34;
    	let i11;
    	let t35;
    	let div15;
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
    	let div12;
    	let i12;
    	let t43;
    	let div13;
    	let i13;
    	let t45;
    	let div14;
    	let i14;
    	let t46;
    	let i15;
    	let t47;
    	let div19;
    	let img4;
    	let img4_src_value;
    	let t48;
    	let h44;
    	let t50;
    	let p4;
    	let t52;
    	let div16;
    	let i16;
    	let t54;
    	let div17;
    	let i17;
    	let t56;
    	let div18;
    	let i18;
    	let t57;
    	let i19;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div20 = element("div");
    			div3 = element("div");
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
    			i0.textContent = "109.754";
    			t7 = space();
    			div1 = element("div");
    			i1 = element("i");
    			i1.textContent = "40.985";
    			t9 = space();
    			div2 = element("div");
    			i2 = element("i");
    			t10 = space();
    			i3 = element("i");
    			t11 = space();
    			div7 = element("div");
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
    			div4 = element("div");
    			i4 = element("i");
    			i4.textContent = "20.975";
    			t19 = space();
    			div5 = element("div");
    			i5 = element("i");
    			i5.textContent = "1.251";
    			t21 = space();
    			div6 = element("div");
    			i6 = element("i");
    			t22 = space();
    			i7 = element("i");
    			t23 = space();
    			div11 = element("div");
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
    			div8 = element("div");
    			i8 = element("i");
    			i8.textContent = "300.785";
    			t31 = space();
    			div9 = element("div");
    			i9 = element("i");
    			i9.textContent = "100.873";
    			t33 = space();
    			div10 = element("div");
    			i10 = element("i");
    			t34 = space();
    			i11 = element("i");
    			t35 = space();
    			div15 = element("div");
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
    			div12 = element("div");
    			i12 = element("i");
    			i12.textContent = "17.025";
    			t43 = space();
    			div13 = element("div");
    			i13 = element("i");
    			i13.textContent = "9.022";
    			t45 = space();
    			div14 = element("div");
    			i14 = element("i");
    			t46 = space();
    			i15 = element("i");
    			t47 = space();
    			div19 = element("div");
    			img4 = element("img");
    			t48 = space();
    			h44 = element("h4");
    			h44.textContent = "World of Warcraft";
    			t50 = space();
    			p4 = element("p");
    			p4.textContent = "Within war-torn Maldraxxus, might—of all kinds—makes right. Here, in the birthplace of necromantic magic, \r\n                those who master the powers of death turn legions of ambitious souls into relentless immortal armies.";
    			t52 = space();
    			div16 = element("div");
    			i16 = element("i");
    			i16.textContent = "400.477";
    			t54 = space();
    			div17 = element("div");
    			i17 = element("i");
    			i17.textContent = "3.746";
    			t56 = space();
    			div18 = element("div");
    			i18 = element("i");
    			t57 = space();
    			i19 = element("i");
    			if (img0.src !== (img0_src_value = "http://localhost:5000/images/nodejs.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "point");
    			attr_dev(img0, "class", "svelte-1tfocu3");
    			add_location(img0, file$4, 12, 12, 255);
    			attr_dev(h40, "class", "svelte-1tfocu3");
    			add_location(h40, file$4, 13, 12, 332);
    			attr_dev(a0, "href", "https://nodejs.org/en/blog/");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "svelte-1tfocu3");
    			add_location(a0, file$4, 20, 32, 736);
    			attr_dev(p0, "class", "svelte-1tfocu3");
    			add_location(p0, file$4, 14, 12, 373);
    			attr_dev(i0, "class", "far fa-thumbs-up");
    			add_location(i0, file$4, 24, 16, 876);
    			attr_dev(div0, "id", "like-counter");
    			attr_dev(div0, "class", "svelte-1tfocu3");
    			add_location(div0, file$4, 23, 12, 835);
    			attr_dev(i1, "class", "far fa-comment");
    			add_location(i1, file$4, 28, 16, 995);
    			attr_dev(div1, "id", "comment-counter");
    			attr_dev(div1, "class", "svelte-1tfocu3");
    			add_location(div1, file$4, 27, 12, 951);
    			attr_dev(i2, "class", "far fa-thumbs-up");
    			add_location(i2, file$4, 32, 16, 1101);
    			attr_dev(i3, "class", "far fa-comment");
    			add_location(i3, file$4, 33, 16, 1152);
    			attr_dev(div2, "id", "like");
    			attr_dev(div2, "class", "svelte-1tfocu3");
    			add_location(div2, file$4, 31, 12, 1068);
    			attr_dev(div3, "id", "group-posts");
    			attr_dev(div3, "class", "svelte-1tfocu3");
    			add_location(div3, file$4, 11, 8, 219);
    			if (img1.src !== (img1_src_value = "http://localhost:5000/images/webdev.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "point");
    			attr_dev(img1, "class", "svelte-1tfocu3");
    			add_location(img1, file$4, 39, 12, 1269);
    			attr_dev(h41, "class", "svelte-1tfocu3");
    			add_location(h41, file$4, 40, 12, 1346);
    			attr_dev(a1, "href", "https://reactjsnews.com/");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "svelte-1tfocu3");
    			add_location(a1, file$4, 44, 25, 1719);
    			attr_dev(p1, "class", "svelte-1tfocu3");
    			add_location(p1, file$4, 41, 12, 1384);
    			attr_dev(i4, "class", "far fa-thumbs-up");
    			add_location(i4, file$4, 48, 16, 1859);
    			attr_dev(div4, "id", "like-counter");
    			attr_dev(div4, "class", "svelte-1tfocu3");
    			add_location(div4, file$4, 47, 12, 1818);
    			attr_dev(i5, "class", "far fa-comment");
    			add_location(i5, file$4, 52, 16, 1977);
    			attr_dev(div5, "id", "comment-counter");
    			attr_dev(div5, "class", "svelte-1tfocu3");
    			add_location(div5, file$4, 51, 12, 1933);
    			attr_dev(i6, "class", "far fa-thumbs-up");
    			add_location(i6, file$4, 56, 16, 2082);
    			attr_dev(i7, "class", "far fa-comment");
    			add_location(i7, file$4, 57, 16, 2133);
    			attr_dev(div6, "id", "like");
    			attr_dev(div6, "class", "svelte-1tfocu3");
    			add_location(div6, file$4, 55, 12, 2049);
    			attr_dev(div7, "id", "group-posts");
    			attr_dev(div7, "class", "svelte-1tfocu3");
    			add_location(div7, file$4, 38, 8, 1233);
    			if (img2.src !== (img2_src_value = "http://localhost:5000/images/dat.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "point");
    			attr_dev(img2, "class", "svelte-1tfocu3");
    			add_location(img2, file$4, 62, 12, 2248);
    			attr_dev(h42, "class", "svelte-1tfocu3");
    			add_location(h42, file$4, 63, 12, 2322);
    			attr_dev(a2, "href", "https://www.sciencedaily.com/releases/2020/06/200610102726.htm");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "class", "svelte-1tfocu3");
    			add_location(a2, file$4, 68, 32, 2693);
    			attr_dev(p2, "class", "svelte-1tfocu3");
    			add_location(p2, file$4, 64, 12, 2361);
    			attr_dev(i8, "class", "far fa-thumbs-up");
    			add_location(i8, file$4, 72, 16, 2873);
    			attr_dev(div8, "id", "like-counter");
    			attr_dev(div8, "class", "svelte-1tfocu3");
    			add_location(div8, file$4, 71, 12, 2832);
    			attr_dev(i9, "class", "far fa-comment");
    			add_location(i9, file$4, 76, 16, 2993);
    			attr_dev(div9, "id", "comment-counter");
    			attr_dev(div9, "class", "svelte-1tfocu3");
    			add_location(div9, file$4, 75, 12, 2949);
    			attr_dev(i10, "class", "far fa-thumbs-up");
    			add_location(i10, file$4, 81, 16, 3102);
    			attr_dev(i11, "class", "far fa-comment");
    			add_location(i11, file$4, 82, 16, 3153);
    			attr_dev(div10, "id", "like");
    			attr_dev(div10, "class", "svelte-1tfocu3");
    			add_location(div10, file$4, 80, 12, 3069);
    			attr_dev(div11, "id", "group-posts");
    			attr_dev(div11, "class", "svelte-1tfocu3");
    			add_location(div11, file$4, 61, 8, 2212);
    			if (img3.src !== (img3_src_value = "http://localhost:5000/images/lol.jpg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "point");
    			attr_dev(img3, "class", "svelte-1tfocu3");
    			add_location(img3, file$4, 87, 12, 3268);
    			attr_dev(h43, "class", "svelte-1tfocu3");
    			add_location(h43, file$4, 88, 12, 3342);
    			add_location(br, file$4, 90, 88, 3475);
    			attr_dev(p3, "class", "svelte-1tfocu3");
    			add_location(p3, file$4, 89, 12, 3382);
    			attr_dev(i12, "class", "far fa-thumbs-up");
    			add_location(i12, file$4, 96, 16, 3762);
    			attr_dev(div12, "id", "like-counter");
    			attr_dev(div12, "class", "svelte-1tfocu3");
    			add_location(div12, file$4, 95, 12, 3721);
    			attr_dev(i13, "class", "far fa-comment");
    			add_location(i13, file$4, 100, 16, 3883);
    			attr_dev(div13, "id", "comment-counter");
    			attr_dev(div13, "class", "svelte-1tfocu3");
    			add_location(div13, file$4, 99, 14, 3839);
    			attr_dev(i14, "class", "far fa-thumbs-up");
    			add_location(i14, file$4, 105, 16, 3990);
    			attr_dev(i15, "class", "far fa-comment");
    			add_location(i15, file$4, 106, 16, 4041);
    			attr_dev(div14, "id", "like");
    			attr_dev(div14, "class", "svelte-1tfocu3");
    			add_location(div14, file$4, 104, 12, 3957);
    			attr_dev(div15, "id", "group-posts");
    			attr_dev(div15, "class", "svelte-1tfocu3");
    			add_location(div15, file$4, 86, 8, 3232);
    			if (img4.src !== (img4_src_value = "http://localhost:5000/images/wow.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "point");
    			attr_dev(img4, "class", "svelte-1tfocu3");
    			add_location(img4, file$4, 111, 12, 4156);
    			attr_dev(h44, "class", "svelte-1tfocu3");
    			add_location(h44, file$4, 112, 12, 4230);
    			attr_dev(p4, "class", "svelte-1tfocu3");
    			add_location(p4, file$4, 113, 12, 4270);
    			attr_dev(i16, "class", "far fa-thumbs-up");
    			add_location(i16, file$4, 119, 16, 4591);
    			attr_dev(div16, "id", "like-counter");
    			attr_dev(div16, "class", "svelte-1tfocu3");
    			add_location(div16, file$4, 118, 12, 4550);
    			attr_dev(i17, "class", "far fa-comment");
    			add_location(i17, file$4, 123, 16, 4713);
    			attr_dev(div17, "id", "comment-counter");
    			attr_dev(div17, "class", "svelte-1tfocu3");
    			add_location(div17, file$4, 122, 14, 4669);
    			attr_dev(i18, "class", "far fa-thumbs-up");
    			add_location(i18, file$4, 128, 16, 4820);
    			attr_dev(i19, "class", "far fa-comment");
    			add_location(i19, file$4, 129, 16, 4871);
    			attr_dev(div18, "id", "like");
    			attr_dev(div18, "class", "svelte-1tfocu3");
    			add_location(div18, file$4, 127, 12, 4787);
    			attr_dev(div19, "id", "group-posts");
    			attr_dev(div19, "class", "svelte-1tfocu3");
    			add_location(div19, file$4, 110, 8, 4120);
    			attr_dev(div20, "id", "group-container");
    			add_location(div20, file$4, 9, 4, 181);

    			set_style(section, "display", /*$showPage*/ ctx[0].pageShown == "groups"
    			? "block"
    			: "none");

    			add_location(section, file$4, 7, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div20);
    			append_dev(div20, div3);
    			append_dev(div3, img0);
    			append_dev(div3, t0);
    			append_dev(div3, h40);
    			append_dev(div3, t2);
    			append_dev(div3, p0);
    			append_dev(p0, t3);
    			append_dev(p0, a0);
    			append_dev(div3, t5);
    			append_dev(div3, div0);
    			append_dev(div0, i0);
    			append_dev(div3, t7);
    			append_dev(div3, div1);
    			append_dev(div1, i1);
    			append_dev(div3, t9);
    			append_dev(div3, div2);
    			append_dev(div2, i2);
    			append_dev(div2, t10);
    			append_dev(div2, i3);
    			append_dev(div20, t11);
    			append_dev(div20, div7);
    			append_dev(div7, img1);
    			append_dev(div7, t12);
    			append_dev(div7, h41);
    			append_dev(div7, t14);
    			append_dev(div7, p1);
    			append_dev(p1, t15);
    			append_dev(p1, a1);
    			append_dev(div7, t17);
    			append_dev(div7, div4);
    			append_dev(div4, i4);
    			append_dev(div7, t19);
    			append_dev(div7, div5);
    			append_dev(div5, i5);
    			append_dev(div7, t21);
    			append_dev(div7, div6);
    			append_dev(div6, i6);
    			append_dev(div6, t22);
    			append_dev(div6, i7);
    			append_dev(div20, t23);
    			append_dev(div20, div11);
    			append_dev(div11, img2);
    			append_dev(div11, t24);
    			append_dev(div11, h42);
    			append_dev(div11, t26);
    			append_dev(div11, p2);
    			append_dev(p2, t27);
    			append_dev(p2, a2);
    			append_dev(div11, t29);
    			append_dev(div11, div8);
    			append_dev(div8, i8);
    			append_dev(div11, t31);
    			append_dev(div11, div9);
    			append_dev(div9, i9);
    			append_dev(div11, t33);
    			append_dev(div11, div10);
    			append_dev(div10, i10);
    			append_dev(div10, t34);
    			append_dev(div10, i11);
    			append_dev(div20, t35);
    			append_dev(div20, div15);
    			append_dev(div15, img3);
    			append_dev(div15, t36);
    			append_dev(div15, h43);
    			append_dev(div15, t38);
    			append_dev(div15, p3);
    			append_dev(p3, t39);
    			append_dev(p3, br);
    			append_dev(p3, t40);
    			append_dev(div15, t41);
    			append_dev(div15, div12);
    			append_dev(div12, i12);
    			append_dev(div15, t43);
    			append_dev(div15, div13);
    			append_dev(div13, i13);
    			append_dev(div15, t45);
    			append_dev(div15, div14);
    			append_dev(div14, i14);
    			append_dev(div14, t46);
    			append_dev(div14, i15);
    			append_dev(div20, t47);
    			append_dev(div20, div19);
    			append_dev(div19, img4);
    			append_dev(div19, t48);
    			append_dev(div19, h44);
    			append_dev(div19, t50);
    			append_dev(div19, p4);
    			append_dev(div19, t52);
    			append_dev(div19, div16);
    			append_dev(div16, i16);
    			append_dev(div19, t54);
    			append_dev(div19, div17);
    			append_dev(div17, i17);
    			append_dev(div19, t56);
    			append_dev(div19, div18);
    			append_dev(div18, i18);
    			append_dev(div18, t57);
    			append_dev(div18, i19);
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
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			img = element("img");
    			if (img.src !== (img_src_value = /*src*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-em1o54");
    			add_location(img, file$5, 11, 4, 247);

    			set_style(section, "display", /*$showPage*/ ctx[0].pageShown == "marketplace"
    			? "block"
    			: "none");

    			attr_dev(section, "class", "svelte-em1o54");
    			add_location(section, file$5, 9, 0, 155);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, img);
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
    	let src = "http://localhost:5000/images/construction.png";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Marketplace> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Marketplace", $$slots, []);
    	$$self.$capture_state = () => ({ showPage, src, $showPage });

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(1, src = $$props.src);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$showPage, src];
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
    	let div2;
    	let img;
    	let img_src_value;
    	let t0;
    	let h30;
    	let t1_value = /*$user*/ ctx[1].firstName + "";
    	let t1;
    	let t2;
    	let t3_value = /*$user*/ ctx[1].lastName + "";
    	let t3;
    	let t4;
    	let button0;
    	let i0;
    	let t5;
    	let div1;
    	let div0;
    	let h31;
    	let t7;
    	let button1;
    	let i1;
    	let t8;
    	let form;
    	let input0;
    	let t9;
    	let input1;
    	let t10;
    	let input2;
    	let input2_value_value;
    	let t11;
    	let button2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			h30 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			button0 = element("button");
    			i0 = element("i");
    			t5 = space();
    			div1 = element("div");
    			div0 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Update you info";
    			t7 = space();
    			button1 = element("button");
    			i1 = element("i");
    			t8 = space();
    			form = element("form");
    			input0 = element("input");
    			t9 = space();
    			input1 = element("input");
    			t10 = space();
    			input2 = element("input");
    			t11 = space();
    			button2 = element("button");
    			button2.textContent = "Update";
    			if (img.src !== (img_src_value = "http://localhost:5000/images/userImages/" + /*$user*/ ctx[1].profilepicture)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "user");
    			attr_dev(img, "class", "svelte-yihajv");
    			add_location(img, file$6, 53, 4, 1234);
    			attr_dev(h30, "class", "svelte-yihajv");
    			add_location(h30, file$6, 54, 4, 1327);
    			attr_dev(i0, "class", "fas fa-cog svelte-yihajv");
    			add_location(i0, file$6, 56, 30, 1404);
    			attr_dev(button0, "class", "svelte-yihajv");
    			add_location(button0, file$6, 56, 4, 1378);
    			attr_dev(h31, "class", "svelte-yihajv");
    			add_location(h31, file$6, 60, 12, 1513);
    			attr_dev(i1, "class", "fas fa-times svelte-yihajv");
    			add_location(i1, file$6, 61, 37, 1576);
    			attr_dev(button1, "class", "svelte-yihajv");
    			add_location(button1, file$6, 61, 12, 1551);
    			attr_dev(div0, "class", "modal-header svelte-yihajv");
    			add_location(div0, file$6, 59, 8, 1473);
    			attr_dev(input0, "type", "text");
    			input0.value = /*firstName*/ ctx[0];
    			attr_dev(input0, "name", "firstName");
    			attr_dev(input0, "class", "svelte-yihajv");
    			add_location(input0, file$6, 64, 12, 1719);
    			attr_dev(input1, "type", "text");
    			input1.value = /*lastName*/ ctx[2];
    			attr_dev(input1, "name", "lastName");
    			attr_dev(input1, "class", "svelte-yihajv");
    			add_location(input1, file$6, 65, 12, 1830);
    			attr_dev(input2, "type", "email");
    			input2.value = input2_value_value = /*$user*/ ctx[1].email;
    			attr_dev(input2, "name", "email");
    			input2.disabled = true;
    			attr_dev(input2, "class", "svelte-yihajv");
    			add_location(input2, file$6, 66, 12, 1938);
    			attr_dev(button2, "class", "svelte-yihajv");
    			add_location(button2, file$6, 67, 12, 2014);
    			attr_dev(form, "class", "modal-body svelte-yihajv");
    			add_location(form, file$6, 63, 8, 1639);
    			attr_dev(div1, "id", "modal");
    			attr_dev(div1, "class", "svelte-yihajv");
    			add_location(div1, file$6, 58, 4, 1447);
    			attr_dev(div2, "class", "profileinfo svelte-yihajv");
    			add_location(div2, file$6, 52, 0, 1203);

    			set_style(section, "display", /*$showPage*/ ctx[3].pageShown == "profilepage"
    			? "block"
    			: "none");

    			attr_dev(section, "class", "svelte-yihajv");
    			add_location(section, file$6, 50, 0, 1115);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, img);
    			append_dev(div2, t0);
    			append_dev(div2, h30);
    			append_dev(h30, t1);
    			append_dev(h30, t2);
    			append_dev(h30, t3);
    			append_dev(div2, t4);
    			append_dev(div2, button0);
    			append_dev(button0, i0);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h31);
    			append_dev(div0, t7);
    			append_dev(div0, button1);
    			append_dev(button1, i1);
    			append_dev(div1, t8);
    			append_dev(div1, form);
    			append_dev(form, input0);
    			append_dev(form, t9);
    			append_dev(form, input1);
    			append_dev(form, t10);
    			append_dev(form, input2);
    			append_dev(form, t11);
    			append_dev(form, button2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", toggle, false, false, false),
    					listen_dev(button1, "click", close, false, false, false),
    					listen_dev(input0, "input", /*input_handler*/ ctx[5], false, false, false),
    					listen_dev(input1, "input", /*input_handler_1*/ ctx[6], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*updateDetails*/ ctx[4]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$user*/ 2 && img.src !== (img_src_value = "http://localhost:5000/images/userImages/" + /*$user*/ ctx[1].profilepicture)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$user*/ 2 && t1_value !== (t1_value = /*$user*/ ctx[1].firstName + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$user*/ 2 && t3_value !== (t3_value = /*$user*/ ctx[1].lastName + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*firstName*/ 1 && input0.value !== /*firstName*/ ctx[0]) {
    				prop_dev(input0, "value", /*firstName*/ ctx[0]);
    			}

    			if (dirty & /*lastName*/ 4 && input1.value !== /*lastName*/ ctx[2]) {
    				prop_dev(input1, "value", /*lastName*/ ctx[2]);
    			}

    			if (dirty & /*$user*/ 2 && input2_value_value !== (input2_value_value = /*$user*/ ctx[1].email) && input2.value !== input2_value_value) {
    				prop_dev(input2, "value", input2_value_value);
    			}

    			if (dirty & /*$showPage*/ 8) {
    				set_style(section, "display", /*$showPage*/ ctx[3].pageShown == "profilepage"
    				? "block"
    				: "none");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			run_all(dispose);
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

    function toggle() {
    	const modal = document.getElementById("modal");

    	if (modal.style.display === "block") {
    		modal.style.display = "none";
    	} else {
    		modal.style.display = "block";
    	}
    }

    function close() {
    	const modal = document.getElementById("modal");

    	if (modal.style.display === "block") {
    		modal.style.display = "none";
    	} else {
    		modal.style.display = "block";
    	}
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $user;
    	let $showPage;
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(1, $user = $$value));
    	validate_store(showPage, "showPage");
    	component_subscribe($$self, showPage, $$value => $$invalidate(3, $showPage = $$value));

    	async function updateDetails() {
    		let formData = new FormData();
    		formData.append("firstName", firstName);
    		formData.append("lastName", lastName);

    		const connection = await fetch("/edit", {
    			method: "post",
    			credentials: "include",
    			body: formData,
    			headers: { "token": localStorage.token }
    		});

    		let response = await connection.json();
    		set_store_value(user, $user = response);
    		close();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Profilepage> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Profilepage", $$slots, []);
    	const input_handler = e => $$invalidate(0, firstName = e.target.value);
    	const input_handler_1 = e => $$invalidate(2, lastName = e.target.value);

    	$$self.$capture_state = () => ({
    		showPage,
    		user,
    		toggle,
    		close,
    		updateDetails,
    		firstName,
    		$user,
    		lastName,
    		$showPage
    	});

    	$$self.$inject_state = $$props => {
    		if ("firstName" in $$props) $$invalidate(0, firstName = $$props.firstName);
    		if ("lastName" in $$props) $$invalidate(2, lastName = $$props.lastName);
    	};

    	let firstName;
    	let lastName;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$user*/ 2) {
    			 $$invalidate(0, firstName = $user.firstName);
    		}

    		if ($$self.$$.dirty & /*$user*/ 2) {
    			 $$invalidate(2, lastName = $user.lastName);
    		}
    	};

    	return [
    		firstName,
    		$user,
    		lastName,
    		$showPage,
    		updateDetails,
    		input_handler,
    		input_handler_1
    	];
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

    /* src\Nav\videos.svelte generated by Svelte v3.23.0 */
    const file$7 = "src\\Nav\\videos.svelte";

    function create_fragment$7(ctx) {
    	let section;
    	let div4;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let h40;
    	let t2;
    	let p0;
    	let t4;
    	let iframe0;
    	let iframe0_src_value;
    	let t5;
    	let div1;
    	let i0;
    	let t7;
    	let div2;
    	let i1;
    	let t9;
    	let div3;
    	let i2;
    	let t10;
    	let i3;
    	let t11;
    	let div9;
    	let div5;
    	let img1;
    	let img1_src_value;
    	let t12;
    	let h41;
    	let t14;
    	let p1;
    	let t16;
    	let iframe1;
    	let iframe1_src_value;
    	let t17;
    	let div6;
    	let i4;
    	let t19;
    	let div7;
    	let i5;
    	let t21;
    	let div8;
    	let i6;
    	let t22;
    	let i7;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div4 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			h40 = element("h4");
    			h40.textContent = "LixianTV";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Hey guys, it's been a while I know, starting this week I'll be posting weekly animations!";
    			t4 = space();
    			iframe0 = element("iframe");
    			t5 = space();
    			div1 = element("div");
    			i0 = element("i");
    			i0.textContent = "103.000";
    			t7 = space();
    			div2 = element("div");
    			i1 = element("i");
    			i1.textContent = "30.957";
    			t9 = space();
    			div3 = element("div");
    			i2 = element("i");
    			t10 = space();
    			i3 = element("i");
    			t11 = space();
    			div9 = element("div");
    			div5 = element("div");
    			img1 = element("img");
    			t12 = space();
    			h41 = element("h4");
    			h41.textContent = "Markiplier";
    			t14 = space();
    			p1 = element("p");
    			p1.textContent = "It's time for yet another Random Horror Reaction Compilation chock full of scary and funny moments!";
    			t16 = space();
    			iframe1 = element("iframe");
    			t17 = space();
    			div6 = element("div");
    			i4 = element("i");
    			i4.textContent = "13.050";
    			t19 = space();
    			div7 = element("div");
    			i5 = element("i");
    			i5.textContent = "37.957";
    			t21 = space();
    			div8 = element("div");
    			i6 = element("i");
    			t22 = space();
    			i7 = element("i");
    			if (img0.src !== (img0_src_value = /*lixiantv*/ ctx[2])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "markiplier");
    			attr_dev(img0, "class", "svelte-7fwtay");
    			add_location(img0, file$7, 18, 8, 479);
    			attr_dev(h40, "class", "svelte-7fwtay");
    			add_location(h40, file$7, 19, 12, 530);
    			attr_dev(p0, "class", "svelte-7fwtay");
    			add_location(p0, file$7, 20, 12, 561);
    			attr_dev(iframe0, "class", "vids svelte-7fwtay");
    			attr_dev(iframe0, "title", "");
    			attr_dev(iframe0, "width", "560");
    			attr_dev(iframe0, "height", "315");
    			if (iframe0.src !== (iframe0_src_value = "https://www.youtube.com/embed/CN34Fjh0c6c")) attr_dev(iframe0, "src", iframe0_src_value);
    			attr_dev(iframe0, "frameborder", "0");
    			attr_dev(iframe0, "allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    			iframe0.allowFullscreen = true;
    			add_location(iframe0, file$7, 22, 11, 672);
    			attr_dev(div0, "class", "vidoes svelte-7fwtay");
    			add_location(div0, file$7, 17, 8, 449);
    			attr_dev(i0, "class", "far fa-thumbs-up");
    			add_location(i0, file$7, 26, 12, 961);
    			attr_dev(div1, "id", "like-counter");
    			attr_dev(div1, "class", "svelte-7fwtay");
    			add_location(div1, file$7, 25, 8, 924);
    			attr_dev(i1, "class", "far fa-comment");
    			add_location(i1, file$7, 30, 12, 1069);
    			attr_dev(div2, "id", "comment-counter");
    			attr_dev(div2, "class", "svelte-7fwtay");
    			add_location(div2, file$7, 29, 8, 1029);
    			attr_dev(i2, "class", "far fa-thumbs-up");
    			add_location(i2, file$7, 34, 12, 1163);
    			attr_dev(i3, "class", "far fa-comment");
    			add_location(i3, file$7, 35, 12, 1210);
    			attr_dev(div3, "id", "like");
    			attr_dev(div3, "class", "svelte-7fwtay");
    			add_location(div3, file$7, 33, 8, 1134);
    			attr_dev(div4, "id", "video-container");
    			attr_dev(div4, "class", "svelte-7fwtay");
    			add_location(div4, file$7, 15, 4, 403);
    			if (img1.src !== (img1_src_value = /*markiplier*/ ctx[1])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "markiplier");
    			attr_dev(img1, "class", "svelte-7fwtay");
    			add_location(img1, file$7, 43, 8, 1359);
    			attr_dev(h41, "class", "svelte-7fwtay");
    			add_location(h41, file$7, 44, 12, 1412);
    			attr_dev(p1, "class", "svelte-7fwtay");
    			add_location(p1, file$7, 45, 12, 1445);
    			attr_dev(iframe1, "class", "vids svelte-7fwtay");
    			attr_dev(iframe1, "title", "");
    			attr_dev(iframe1, "width", "560");
    			attr_dev(iframe1, "height", "315");
    			if (iframe1.src !== (iframe1_src_value = "https://www.youtube.com/embed/R_AXogxHGDo")) attr_dev(iframe1, "src", iframe1_src_value);
    			attr_dev(iframe1, "frameborder", "0");
    			attr_dev(iframe1, "allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    			iframe1.allowFullscreen = true;
    			add_location(iframe1, file$7, 47, 11, 1566);
    			attr_dev(div5, "class", "vidoes svelte-7fwtay");
    			add_location(div5, file$7, 42, 8, 1329);
    			attr_dev(i4, "class", "far fa-thumbs-up");
    			add_location(i4, file$7, 51, 12, 1855);
    			attr_dev(div6, "id", "like-counter");
    			attr_dev(div6, "class", "svelte-7fwtay");
    			add_location(div6, file$7, 50, 8, 1818);
    			attr_dev(i5, "class", "far fa-comment");
    			add_location(i5, file$7, 55, 12, 1962);
    			attr_dev(div7, "id", "comment-counter");
    			attr_dev(div7, "class", "svelte-7fwtay");
    			add_location(div7, file$7, 54, 8, 1922);
    			attr_dev(i6, "class", "far fa-thumbs-up");
    			add_location(i6, file$7, 59, 12, 2056);
    			attr_dev(i7, "class", "far fa-comment");
    			add_location(i7, file$7, 60, 12, 2103);
    			attr_dev(div8, "id", "like");
    			attr_dev(div8, "class", "svelte-7fwtay");
    			add_location(div8, file$7, 58, 8, 2027);
    			attr_dev(div9, "id", "video-container");
    			attr_dev(div9, "class", "svelte-7fwtay");
    			add_location(div9, file$7, 40, 8, 1283);

    			set_style(section, "display", /*$showPage*/ ctx[0].pageShown == "videos"
    			? "block"
    			: "none");

    			add_location(section, file$7, 14, 0, 318);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div4);
    			append_dev(div4, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, h40);
    			append_dev(div0, t2);
    			append_dev(div0, p0);
    			append_dev(div0, t4);
    			append_dev(div0, iframe0);
    			append_dev(div4, t5);
    			append_dev(div4, div1);
    			append_dev(div1, i0);
    			append_dev(div4, t7);
    			append_dev(div4, div2);
    			append_dev(div2, i1);
    			append_dev(div4, t9);
    			append_dev(div4, div3);
    			append_dev(div3, i2);
    			append_dev(div3, t10);
    			append_dev(div3, i3);
    			append_dev(section, t11);
    			append_dev(section, div9);
    			append_dev(div9, div5);
    			append_dev(div5, img1);
    			append_dev(div5, t12);
    			append_dev(div5, h41);
    			append_dev(div5, t14);
    			append_dev(div5, p1);
    			append_dev(div5, t16);
    			append_dev(div5, iframe1);
    			append_dev(div9, t17);
    			append_dev(div9, div6);
    			append_dev(div6, i4);
    			append_dev(div9, t19);
    			append_dev(div9, div7);
    			append_dev(div7, i5);
    			append_dev(div9, t21);
    			append_dev(div9, div8);
    			append_dev(div8, i6);
    			append_dev(div8, t22);
    			append_dev(div8, i7);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$showPage*/ 1) {
    				set_style(section, "display", /*$showPage*/ ctx[0].pageShown == "videos"
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $showPage;
    	validate_store(showPage, "showPage");
    	component_subscribe($$self, showPage, $$value => $$invalidate(0, $showPage = $$value));
    	let markiplier = "http://localhost:5000/images/markiplier.jpg";
    	let lixiantv = "http://localhost:5000/images/lixiantv.jpg";

    	const currentPage = nameOfPage => {
    		set_store_value(showPage, $showPage.pageShown = nameOfPage, $showPage);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Videos> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Videos", $$slots, []);

    	$$self.$capture_state = () => ({
    		markiplier,
    		lixiantv,
    		showPage,
    		currentPage,
    		$showPage
    	});

    	$$self.$inject_state = $$props => {
    		if ("markiplier" in $$props) $$invalidate(1, markiplier = $$props.markiplier);
    		if ("lixiantv" in $$props) $$invalidate(2, lixiantv = $$props.lixiantv);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$showPage, markiplier, lixiantv];
    }

    class Videos extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Videos",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\Right.svelte generated by Svelte v3.23.0 */
    const file$8 = "src\\Right.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (15:7) {#each $user.friends as friend}
    function create_each_block$1(ctx) {
    	let li;
    	let img;
    	let img_src_value;
    	let t0;
    	let p;
    	let t1_value = /*friend*/ ctx[1].firstName + "";
    	let t1;
    	let t2;
    	let t3_value = /*friend*/ ctx[1].lastName + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			li = element("li");
    			img = element("img");
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			if (img.src !== (img_src_value = "http://localhost:5000/images/userImages/" + /*friend*/ ctx[1].profilepicture)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "user");
    			attr_dev(img, "class", "svelte-k6ijio");
    			add_location(img, file$8, 16, 12, 253);
    			attr_dev(p, "class", "svelte-k6ijio");
    			add_location(p, file$8, 17, 12, 354);
    			attr_dev(li, "class", "svelte-k6ijio");
    			add_location(li, file$8, 15, 8, 235);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, img);
    			append_dev(li, t0);
    			append_dev(li, p);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(li, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$user*/ 1 && img.src !== (img_src_value = "http://localhost:5000/images/userImages/" + /*friend*/ ctx[1].profilepicture)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$user*/ 1 && t1_value !== (t1_value = /*friend*/ ctx[1].firstName + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$user*/ 1 && t3_value !== (t3_value = /*friend*/ ctx[1].lastName + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(15:7) {#each $user.friends as friend}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let main;
    	let section;
    	let h3;
    	let t1;
    	let div;
    	let each_value = /*$user*/ ctx[0].friends;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			section = element("section");
    			h3 = element("h3");
    			h3.textContent = "Contacts";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h3, "class", "svelte-k6ijio");
    			add_location(h3, file$8, 11, 4, 137);
    			attr_dev(div, "class", "friend svelte-k6ijio");
    			add_location(div, file$8, 13, 7, 165);
    			attr_dev(section, "id", "contacts");
    			attr_dev(section, "class", "svelte-k6ijio");
    			add_location(section, file$8, 10, 1, 108);
    			add_location(main, file$8, 8, 0, 97);
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

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$user*/ 1) {
    				each_value = /*$user*/ ctx[0].friends;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
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

    function instance$8($$self, $$props, $$invalidate) {
    	let $user;
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(0, $user = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Right> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Right", $$slots, []);
    	$$self.$capture_state = () => ({ user, $user });
    	return [$user];
    }

    class Right extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Right",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\Left.svelte generated by Svelte v3.23.0 */

    const file$9 = "src\\Left.svelte";

    function create_fragment$9(ctx) {
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
    	let t27;
    	let section2;
    	let h32;
    	let t29;
    	let div8;
    	let img8;
    	let img8_src_value;
    	let t30;
    	let h48;
    	let t32;
    	let div9;
    	let img9;
    	let img9_src_value;
    	let t33;
    	let h49;

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
    			t27 = space();
    			section2 = element("section");
    			h32 = element("h3");
    			h32.textContent = "Liked pages";
    			t29 = space();
    			div8 = element("div");
    			img8 = element("img");
    			t30 = space();
    			h48 = element("h4");
    			h48.textContent = "Markiplier";
    			t32 = space();
    			div9 = element("div");
    			img9 = element("img");
    			t33 = space();
    			h49 = element("h4");
    			h49.textContent = "LixinaTV";
    			attr_dev(h30, "class", "svelte-1y6lu86");
    			add_location(h30, file$9, 9, 7, 99);
    			if (img0.src !== (img0_src_value = "http://localhost:5000/images/point.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "point");
    			attr_dev(img0, "class", "svelte-1y6lu86");
    			add_location(img0, file$9, 12, 8, 140);
    			attr_dev(h40, "class", "svelte-1y6lu86");
    			add_location(h40, file$9, 13, 8, 212);
    			attr_dev(div0, "class", "svelte-1y6lu86");
    			add_location(div0, file$9, 11, 8, 125);
    			if (img1.src !== (img1_src_value = "http://localhost:5000/images/building.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "point");
    			attr_dev(img1, "class", "svelte-1y6lu86");
    			add_location(img1, file$9, 17, 8, 271);
    			attr_dev(h41, "class", "svelte-1y6lu86");
    			add_location(h41, file$9, 18, 8, 346);
    			attr_dev(div1, "class", "svelte-1y6lu86");
    			add_location(div1, file$9, 16, 8, 256);
    			if (img2.src !== (img2_src_value = "http://localhost:5000/images/virus.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "point");
    			attr_dev(img2, "class", "svelte-1y6lu86");
    			add_location(img2, file$9, 22, 8, 407);
    			attr_dev(h42, "class", "svelte-1y6lu86");
    			add_location(h42, file$9, 23, 8, 479);
    			attr_dev(div2, "class", "svelte-1y6lu86");
    			add_location(div2, file$9, 21, 8, 392);
    			attr_dev(section0, "id", "sites");
    			attr_dev(section0, "class", "svelte-1y6lu86");
    			add_location(section0, file$9, 8, 1, 70);
    			attr_dev(h31, "class", "svelte-1y6lu86");
    			add_location(h31, file$9, 29, 7, 588);
    			if (img3.src !== (img3_src_value = "http://localhost:5000/images/nodejs.jpg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "point");
    			attr_dev(img3, "class", "svelte-1y6lu86");
    			add_location(img3, file$9, 32, 8, 630);
    			attr_dev(h43, "class", "svelte-1y6lu86");
    			add_location(h43, file$9, 33, 8, 703);
    			attr_dev(div3, "class", "svelte-1y6lu86");
    			add_location(div3, file$9, 31, 8, 615);
    			if (img4.src !== (img4_src_value = "http://localhost:5000/images/webdev.jpg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "point");
    			attr_dev(img4, "class", "svelte-1y6lu86");
    			add_location(img4, file$9, 37, 8, 773);
    			attr_dev(h44, "class", "svelte-1y6lu86");
    			add_location(h44, file$9, 38, 8, 846);
    			attr_dev(div4, "class", "svelte-1y6lu86");
    			add_location(div4, file$9, 36, 8, 758);
    			if (img5.src !== (img5_src_value = "http://localhost:5000/images/dat.jpg")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "point");
    			attr_dev(img5, "class", "svelte-1y6lu86");
    			add_location(img5, file$9, 42, 8, 913);
    			attr_dev(h45, "class", "svelte-1y6lu86");
    			add_location(h45, file$9, 43, 8, 983);
    			attr_dev(div5, "class", "svelte-1y6lu86");
    			add_location(div5, file$9, 41, 8, 898);
    			if (img6.src !== (img6_src_value = "http://localhost:5000/images/lol.jpg")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "point");
    			attr_dev(img6, "class", "svelte-1y6lu86");
    			add_location(img6, file$9, 47, 8, 1051);
    			attr_dev(h46, "class", "svelte-1y6lu86");
    			add_location(h46, file$9, 48, 8, 1121);
    			attr_dev(div6, "class", "svelte-1y6lu86");
    			add_location(div6, file$9, 46, 8, 1036);
    			if (img7.src !== (img7_src_value = "http://localhost:5000/images/wow.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "point");
    			attr_dev(img7, "class", "svelte-1y6lu86");
    			add_location(img7, file$9, 52, 8, 1190);
    			attr_dev(h47, "class", "svelte-1y6lu86");
    			add_location(h47, file$9, 53, 8, 1260);
    			attr_dev(div7, "class", "svelte-1y6lu86");
    			add_location(div7, file$9, 51, 8, 1175);
    			attr_dev(section1, "id", "groups");
    			attr_dev(section1, "class", "svelte-1y6lu86");
    			add_location(section1, file$9, 28, 4, 558);
    			attr_dev(h32, "class", "svelte-1y6lu86");
    			add_location(h32, file$9, 59, 8, 1371);
    			if (img8.src !== (img8_src_value = "http://localhost:5000/images/markiplier.jpg")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "point");
    			attr_dev(img8, "class", "svelte-1y6lu86");
    			add_location(img8, file$9, 62, 8, 1418);
    			attr_dev(h48, "class", "svelte-1y6lu86");
    			add_location(h48, file$9, 63, 12, 1499);
    			attr_dev(div8, "class", "svelte-1y6lu86");
    			add_location(div8, file$9, 61, 8, 1403);
    			if (img9.src !== (img9_src_value = "http://localhost:5000/images/lixiantv.jpg")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "point");
    			attr_dev(img9, "class", "svelte-1y6lu86");
    			add_location(img9, file$9, 67, 8, 1561);
    			attr_dev(h49, "class", "svelte-1y6lu86");
    			add_location(h49, file$9, 68, 12, 1640);
    			attr_dev(div9, "class", "svelte-1y6lu86");
    			add_location(div9, file$9, 66, 8, 1546);
    			attr_dev(section2, "id", "liked-pages");
    			attr_dev(section2, "class", "svelte-1y6lu86");
    			add_location(section2, file$9, 58, 4, 1335);
    			attr_dev(main, "class", "svelte-1y6lu86");
    			add_location(main, file$9, 6, 0, 59);
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
    			append_dev(main, t27);
    			append_dev(main, section2);
    			append_dev(section2, h32);
    			append_dev(section2, t29);
    			append_dev(section2, div8);
    			append_dev(div8, img8);
    			append_dev(div8, t30);
    			append_dev(div8, h48);
    			append_dev(section2, t32);
    			append_dev(section2, div9);
    			append_dev(div9, img9);
    			append_dev(div9, t33);
    			append_dev(div9, h49);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Left> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Left", $$slots, []);
    	return [];
    }

    class Left extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Left",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\ChatContainer.svelte generated by Svelte v3.23.0 */

    const file$a = "src\\ChatContainer.svelte";

    function create_fragment$a(ctx) {
    	let section;
    	let i;

    	const block = {
    		c: function create() {
    			section = element("section");
    			i = element("i");
    			attr_dev(i, "class", "far fa-comment svelte-1asufji");
    			add_location(i, file$a, 9, 0, 93);
    			attr_dev(section, "class", "svelte-1asufji");
    			add_location(section, file$a, 7, 0, 80);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChatContainer",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\OpenChatContainer.svelte generated by Svelte v3.23.0 */

    const file$b = "src\\OpenChatContainer.svelte";

    function create_fragment$b(ctx) {
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
    	let i2;

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
    			i2 = element("i");
    			if (img.src !== (img_src_value = src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "user");
    			attr_dev(img, "class", "svelte-1ackrwg");
    			add_location(img, file$b, 13, 8, 209);
    			attr_dev(p, "class", "svelte-1ackrwg");
    			add_location(p, file$b, 14, 8, 242);
    			attr_dev(i0, "class", "fas fa-minus svelte-1ackrwg");
    			add_location(i0, file$b, 15, 8, 270);
    			attr_dev(i1, "class", "fas fa-times svelte-1ackrwg");
    			add_location(i1, file$b, 16, 8, 308);
    			attr_dev(div0, "id", "top-container");
    			attr_dev(div0, "class", "svelte-1ackrwg");
    			add_location(div0, file$b, 12, 4, 175);
    			attr_dev(div1, "id", "chat");
    			attr_dev(div1, "class", "svelte-1ackrwg");
    			add_location(div1, file$b, 20, 4, 358);
    			attr_dev(input, "placeholder", "Aa");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-1ackrwg");
    			add_location(input, file$b, 25, 8, 429);
    			attr_dev(i2, "class", "fas fa-paper-plane svelte-1ackrwg");
    			add_location(i2, file$b, 28, 8, 494);
    			attr_dev(div2, "id", "bot-container");
    			attr_dev(div2, "class", "svelte-1ackrwg");
    			add_location(div2, file$b, 24, 4, 395);
    			attr_dev(div3, "id", "chat-container");
    			attr_dev(div3, "class", "svelte-1ackrwg");
    			add_location(div3, file$b, 11, 0, 144);
    			attr_dev(section, "class", "svelte-1ackrwg");
    			add_location(section, file$b, 9, 0, 131);
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
    			append_dev(div2, i2);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let src = "http://localhost:5000/images/me.jpg";

    function instance$b($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OpenChatContainer",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.23.0 */

    const { console: console_1$1 } = globals;
    const file$c = "src\\App.svelte";

    // (44:2) {#if $showPage.pageShown != 'profilepage'}
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
    		source: "(44:2) {#if $showPage.pageShown != 'profilepage'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let section;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let current;
    	let if_block = /*$showPage*/ ctx[0].pageShown != "profilepage" && create_if_block(ctx);
    	const nav = new Nav({ $$inline: true });
    	const home = new Home({ $$inline: true });
    	const groups = new Groups({ $$inline: true });
    	const marketplace = new Marketplace({ $$inline: true });
    	const videos = new Videos({ $$inline: true });
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
    			create_component(videos.$$.fragment);
    			t5 = space();
    			create_component(profilepage.$$.fragment);
    			t6 = space();
    			create_component(chatcontainer.$$.fragment);
    			t7 = space();
    			create_component(openchatcontainer.$$.fragment);
    			add_location(section, file$c, 41, 0, 981);
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
    			mount_component(videos, section, null);
    			append_dev(section, t5);
    			mount_component(profilepage, section, null);
    			append_dev(section, t6);
    			mount_component(chatcontainer, section, null);
    			append_dev(section, t7);
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
    			transition_in(videos.$$.fragment, local);
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
    			transition_out(videos.$$.fragment, local);
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
    			destroy_component(videos);
    			destroy_component(profilepage);
    			destroy_component(chatcontainer);
    			destroy_component(openchatcontainer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $user;
    	let $showPage;
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(1, $user = $$value));
    	validate_store(showPage, "showPage");
    	component_subscribe($$self, showPage, $$value => $$invalidate(0, $showPage = $$value));

    	const fetchUserInfo = (async () => {
    		const connection = await fetch("/profile", {
    			credentials: "include",
    			headers: { "token": localStorage.token }
    		});

    		let response = await connection.json();
    		set_store_value(user, $user = response);
    		console.log($user);
    	})();

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Nav,
    		Home,
    		Groups,
    		Marketplace,
    		Profilepage,
    		Videos,
    		Right,
    		Left,
    		ChatContainer,
    		OpenChatContainer,
    		showPage,
    		user,
    		fetchUserInfo,
    		$user,
    		$showPage
    	});

    	return [$showPage];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
