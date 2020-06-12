
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
    function null_to_empty(value) {
        return value == null ? '' : value;
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
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

    /* src\nav\Marketplace.svelte generated by Svelte v3.23.0 */

    const file = "src\\nav\\Marketplace.svelte";

    function create_fragment(ctx) {
    	let section;

    	const block = {
    		c: function create() {
    			section = element("section");
    			add_location(section, file, 5, 0, 66);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
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
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Marketplace> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Marketplace", $$slots, []);
    	return [];
    }

    class Marketplace extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Marketplace",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\nav\Groups.svelte generated by Svelte v3.23.0 */

    const file$1 = "src\\nav\\Groups.svelte";

    function create_fragment$1(ctx) {
    	let section;

    	const block = {
    		c: function create() {
    			section = element("section");
    			add_location(section, file$1, 5, 0, 65);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
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

    function instance$1($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Groups> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Groups", $$slots, []);
    	return [];
    }

    class Groups extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Groups",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\UserPosts.svelte generated by Svelte v3.23.0 */

    const file$2 = "src\\UserPosts.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let div5;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let p0;
    	let t2;
    	let div0;
    	let t4;
    	let div2;
    	let button0;
    	let t6;
    	let button1;
    	let t8;
    	let div3;
    	let img1;
    	let img1_src_value;
    	let t9;
    	let p1;
    	let t11;
    	let div4;
    	let img2;
    	let img2_src_value;
    	let t12;
    	let input;
    	let t13;
    	let button2;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div5 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "User name";
    			t2 = space();
    			div0 = element("div");
    			div0.textContent = "Report writing before I'm gonna throw my code out the window for being a bitch 😂👌\r\n            #webdevelopment #webdeveloper  #reactjs #nodejs #bachelordegree";
    			t4 = space();
    			div2 = element("div");
    			button0 = element("button");
    			button0.textContent = "Like";
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "Comment";
    			t8 = space();
    			div3 = element("div");
    			img1 = element("img");
    			t9 = space();
    			p1 = element("p");
    			p1.textContent = "I feel you!!";
    			t11 = space();
    			div4 = element("div");
    			img2 = element("img");
    			t12 = space();
    			input = element("input");
    			t13 = space();
    			button2 = element("button");
    			button2.textContent = ">";
    			if (img0.src !== (img0_src_value = /*src*/ ctx[0])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "user");
    			attr_dev(img0, "class", "svelte-ci1ur9");
    			add_location(img0, file$2, 12, 12, 184);
    			attr_dev(p0, "class", "svelte-ci1ur9");
    			add_location(p0, file$2, 13, 12, 222);
    			attr_dev(div0, "id", "post");
    			attr_dev(div0, "class", "svelte-ci1ur9");
    			add_location(div0, file$2, 14, 12, 252);
    			attr_dev(div1, "id", "mypost");
    			attr_dev(div1, "class", "svelte-ci1ur9");
    			add_location(div1, file$2, 11, 8, 153);
    			attr_dev(button0, "class", "svelte-ci1ur9");
    			add_location(button0, file$2, 20, 12, 504);
    			attr_dev(button1, "class", "svelte-ci1ur9");
    			add_location(button1, file$2, 21, 12, 539);
    			attr_dev(div2, "id", "like");
    			attr_dev(div2, "class", "svelte-ci1ur9");
    			add_location(div2, file$2, 19, 8, 475);
    			if (img1.src !== (img1_src_value = /*src*/ ctx[0])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "user");
    			attr_dev(img1, "class", "svelte-ci1ur9");
    			add_location(img1, file$2, 25, 8, 618);
    			attr_dev(p1, "class", "svelte-ci1ur9");
    			add_location(p1, file$2, 26, 8, 652);
    			attr_dev(div3, "id", "comments");
    			attr_dev(div3, "class", "svelte-ci1ur9");
    			add_location(div3, file$2, 24, 6, 589);
    			if (img2.src !== (img2_src_value = /*src*/ ctx[0])) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "user");
    			attr_dev(img2, "class", "svelte-ci1ur9");
    			add_location(img2, file$2, 30, 12, 733);
    			attr_dev(input, "placeholder", "Your comment....");
    			attr_dev(input, "class", "svelte-ci1ur9");
    			add_location(input, file$2, 31, 12, 771);
    			attr_dev(button2, "class", "svelte-ci1ur9");
    			add_location(button2, file$2, 33, 12, 838);
    			attr_dev(div4, "id", "comment-post");
    			attr_dev(div4, "class", "svelte-ci1ur9");
    			add_location(div4, file$2, 29, 7, 696);
    			attr_dev(div5, "class", "user-posts svelte-ci1ur9");
    			add_location(div5, file$2, 10, 4, 119);
    			add_location(section, file$2, 8, 0, 102);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div5);
    			append_dev(div5, div1);
    			append_dev(div1, img0);
    			append_dev(div1, t0);
    			append_dev(div1, p0);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div5, t4);
    			append_dev(div5, div2);
    			append_dev(div2, button0);
    			append_dev(div2, t6);
    			append_dev(div2, button1);
    			append_dev(div5, t8);
    			append_dev(div5, div3);
    			append_dev(div3, img1);
    			append_dev(div3, t9);
    			append_dev(div3, p1);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div4, img2);
    			append_dev(div4, t12);
    			append_dev(div4, input);
    			append_dev(div4, t13);
    			append_dev(div4, button2);
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

    /* src\Posts.svelte generated by Svelte v3.23.0 */

    const file$3 = "src\\Posts.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let form;
    	let input;
    	let t1;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let button2;
    	let t7;
    	let button3;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			form = element("form");
    			input = element("input");
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "Post";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Photo / Video";
    			t5 = space();
    			button2 = element("button");
    			button2.textContent = "Tag a friend";
    			t7 = space();
    			button3 = element("button");
    			button3.textContent = "Something";
    			if (img.src !== (img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "user");
    			attr_dev(img, "class", "svelte-s2ux91");
    			add_location(img, file$3, 11, 4, 153);
    			attr_dev(input, "placeholder", "What's on your mind?");
    			attr_dev(input, "class", "svelte-s2ux91");
    			add_location(input, file$3, 14, 12, 219);
    			attr_dev(button0, "class", "svelte-s2ux91");
    			add_location(button0, file$3, 17, 12, 308);
    			attr_dev(form, "action", "");
    			add_location(form, file$3, 13, 8, 189);
    			attr_dev(button1, "class", "svelte-s2ux91");
    			add_location(button1, file$3, 20, 12, 362);
    			attr_dev(button2, "class", "svelte-s2ux91");
    			add_location(button2, file$3, 21, 12, 406);
    			attr_dev(button3, "class", "svelte-s2ux91");
    			add_location(button3, file$3, 22, 12, 449);
    			attr_dev(div, "id", "post-container");
    			attr_dev(div, "class", "svelte-s2ux91");
    			add_location(div, file$3, 9, 4, 116);
    			add_location(section, file$3, 8, 0, 101);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, form);
    			append_dev(form, input);
    			append_dev(form, t1);
    			append_dev(form, button0);
    			append_dev(div, t3);
    			append_dev(div, button1);
    			append_dev(div, t5);
    			append_dev(div, button2);
    			append_dev(div, t7);
    			append_dev(div, button3);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Posts",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\ChatContainer.svelte generated by Svelte v3.23.0 */

    const file$4 = "src\\ChatContainer.svelte";

    function create_fragment$4(ctx) {
    	let section;

    	const block = {
    		c: function create() {
    			section = element("section");
    			attr_dev(section, "class", "svelte-1w8q08t");
    			add_location(section, file$4, 7, 0, 80);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChatContainer",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\Left.svelte generated by Svelte v3.23.0 */

    const file$5 = "src\\Left.svelte";

    function create_fragment$5(ctx) {
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
    			attr_dev(h30, "class", "svelte-tad157");
    			add_location(h30, file$5, 9, 7, 99);
    			if (img0.src !== (img0_src_value = "./images/point.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "point");
    			attr_dev(img0, "class", "svelte-tad157");
    			add_location(img0, file$5, 12, 8, 140);
    			attr_dev(h40, "class", "svelte-tad157");
    			add_location(h40, file$5, 13, 8, 192);
    			attr_dev(div0, "class", "svelte-tad157");
    			add_location(div0, file$5, 11, 8, 125);
    			if (img1.src !== (img1_src_value = "./images/building.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "point");
    			attr_dev(img1, "class", "svelte-tad157");
    			add_location(img1, file$5, 17, 8, 251);
    			attr_dev(h41, "class", "svelte-tad157");
    			add_location(h41, file$5, 18, 8, 306);
    			attr_dev(div1, "class", "svelte-tad157");
    			add_location(div1, file$5, 16, 8, 236);
    			if (img2.src !== (img2_src_value = "./images/virus.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "point");
    			attr_dev(img2, "class", "svelte-tad157");
    			add_location(img2, file$5, 22, 8, 367);
    			attr_dev(h42, "class", "svelte-tad157");
    			add_location(h42, file$5, 23, 8, 419);
    			attr_dev(div2, "class", "svelte-tad157");
    			add_location(div2, file$5, 21, 8, 352);
    			attr_dev(section0, "id", "sites");
    			attr_dev(section0, "class", "svelte-tad157");
    			add_location(section0, file$5, 8, 1, 70);
    			attr_dev(h31, "class", "svelte-tad157");
    			add_location(h31, file$5, 29, 7, 528);
    			if (img3.src !== (img3_src_value = "./images/nodejs.jpg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "point");
    			attr_dev(img3, "class", "svelte-tad157");
    			add_location(img3, file$5, 32, 8, 570);
    			attr_dev(h43, "class", "svelte-tad157");
    			add_location(h43, file$5, 33, 8, 623);
    			attr_dev(div3, "class", "svelte-tad157");
    			add_location(div3, file$5, 31, 8, 555);
    			if (img4.src !== (img4_src_value = "./images/webdev.jpg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "point");
    			attr_dev(img4, "class", "svelte-tad157");
    			add_location(img4, file$5, 37, 8, 693);
    			attr_dev(h44, "class", "svelte-tad157");
    			add_location(h44, file$5, 38, 8, 746);
    			attr_dev(div4, "class", "svelte-tad157");
    			add_location(div4, file$5, 36, 8, 678);
    			if (img5.src !== (img5_src_value = "./images/dat.jpg")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "point");
    			attr_dev(img5, "class", "svelte-tad157");
    			add_location(img5, file$5, 42, 8, 813);
    			attr_dev(h45, "class", "svelte-tad157");
    			add_location(h45, file$5, 43, 8, 863);
    			attr_dev(div5, "class", "svelte-tad157");
    			add_location(div5, file$5, 41, 8, 798);
    			attr_dev(section1, "id", "groups");
    			attr_dev(section1, "class", "svelte-tad157");
    			add_location(section1, file$5, 28, 4, 498);
    			attr_dev(main, "class", "svelte-tad157");
    			add_location(main, file$5, 6, 0, 59);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Left",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\Right.svelte generated by Svelte v3.23.0 */

    const file$6 = "src\\Right.svelte";

    function create_fragment$6(ctx) {
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
    			attr_dev(h3, "class", "svelte-1eljw0p");
    			add_location(h3, file$6, 11, 4, 132);
    			if (img.src !== (img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "user");
    			attr_dev(img, "class", "svelte-1eljw0p");
    			add_location(img, file$6, 14, 8, 190);
    			attr_dev(p, "class", "svelte-1eljw0p");
    			add_location(p, file$6, 15, 8, 223);
    			attr_dev(div, "class", "friend svelte-1eljw0p");
    			add_location(div, file$6, 13, 7, 160);
    			attr_dev(section, "id", "contacts");
    			attr_dev(section, "class", "svelte-1eljw0p");
    			add_location(section, file$6, 10, 1, 103);
    			add_location(main, file$6, 8, 0, 92);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Right",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\nav\Home.svelte generated by Svelte v3.23.0 */
    const file$7 = "src\\nav\\Home.svelte";

    function create_fragment$7(ctx) {
    	let section;
    	let current;
    	const right = new Right({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(right.$$.fragment);
    			add_location(section, file$7, 11, 0, 272);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(right, section, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(right.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(right.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(right);
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);

    	$$self.$capture_state = () => ({
    		Right,
    		Left,
    		ChatContainer,
    		Posts,
    		UserPosts
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\Nav.svelte generated by Svelte v3.23.0 */

    const navOptions = [
    	{ page: "Home", component: Home },
    	{ page: "Groups", component: Groups },
    	{
    		page: "Marketplace",
    		component: Marketplace
    	}
    ]; // profile

    /* src\App.svelte generated by Svelte v3.23.0 */
    const file$8 = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (41:3) {#each navOptions as option, i}
    function create_each_block(ctx) {
    	let i1;
    	let i0;
    	let t_value = /*option*/ ctx[3].page + "";
    	let t;
    	let i0_class_value;
    	let i0_id_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i1 = element("i");
    			i0 = element("i");
    			t = text(t_value);

    			attr_dev(i0, "class", i0_class_value = "" + (null_to_empty(/*intSelected*/ ctx[1] == /*i*/ ctx[5]
    			? "nav-link active p-2 ml-1"
    			: "p-2 ml-1 nav-link") + " svelte-py76r2"));

    			attr_dev(i0, "id", i0_id_value = /*i*/ ctx[5]);
    			attr_dev(i0, "role", "tab");
    			add_location(i0, file$8, 42, 4, 904);
    			attr_dev(i1, "class", "nav-item svelte-py76r2");
    			add_location(i1, file$8, 41, 3, 878);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i1, anchor);
    			append_dev(i1, i0);
    			append_dev(i0, t);

    			if (!mounted) {
    				dispose = listen_dev(i0, "click", /*changeComponent*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*intSelected*/ 2 && i0_class_value !== (i0_class_value = "" + (null_to_empty(/*intSelected*/ ctx[1] == /*i*/ ctx[5]
    			? "nav-link active p-2 ml-1"
    			: "p-2 ml-1 nav-link") + " svelte-py76r2"))) {
    				attr_dev(i0, "class", i0_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(41:3) {#each navOptions as option, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let section;
    	let nav;
    	let div2;
    	let div0;
    	let i0;
    	let t0;
    	let form;
    	let input;
    	let t1;
    	let div1;
    	let t2;
    	let div4;
    	let t3;
    	let div3;
    	let h1;
    	let t4_value = /*selected*/ ctx[0].page + "";
    	let t4;
    	let t5;
    	let t6;
    	let div12;
    	let div5;
    	let t8;
    	let div6;
    	let i1;
    	let t9;
    	let div8;
    	let i2;
    	let t10;
    	let div7;
    	let t12;
    	let div10;
    	let i3;
    	let t13;
    	let div9;
    	let t15;
    	let div11;
    	let i4;
    	let current;
    	let each_value = navOptions;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	var switch_value = /*selected*/ ctx[0].component;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			nav = element("nav");
    			div2 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			form = element("form");
    			input = element("input");
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			div4 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div3 = element("div");
    			h1 = element("h1");
    			t4 = text(t4_value);
    			t5 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t6 = space();
    			div12 = element("div");
    			div5 = element("div");
    			div5.textContent = "Stine";
    			t8 = space();
    			div6 = element("div");
    			i1 = element("i");
    			t9 = space();
    			div8 = element("div");
    			i2 = element("i");
    			t10 = space();
    			div7 = element("div");
    			div7.textContent = "1";
    			t12 = space();
    			div10 = element("div");
    			i3 = element("i");
    			t13 = space();
    			div9 = element("div");
    			div9.textContent = "5";
    			t15 = space();
    			div11 = element("div");
    			i4 = element("i");
    			attr_dev(i0, "class", "fab fa-cuttlefish");
    			add_location(i0, file$8, 29, 3, 643);
    			attr_dev(div0, "class", "logo svelte-py76r2");
    			add_location(div0, file$8, 28, 2, 620);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Search on CloneBook");
    			attr_dev(input, "class", "svelte-py76r2");
    			add_location(input, file$8, 32, 2, 700);
    			attr_dev(form, "class", "svelte-py76r2");
    			add_location(form, file$8, 31, 2, 690);
    			attr_dev(div1, "id", "searchResults");
    			attr_dev(div1, "class", "svelte-py76r2");
    			add_location(div1, file$8, 35, 2, 771);
    			attr_dev(div2, "class", "left svelte-py76r2");
    			add_location(div2, file$8, 27, 1, 598);
    			add_location(h1, file$8, 46, 5, 1094);
    			attr_dev(div3, "class", "p-2 svelte-py76r2");
    			add_location(div3, file$8, 45, 4, 1070);
    			attr_dev(div4, "class", "middle svelte-py76r2");
    			add_location(div4, file$8, 39, 1, 817);
    			attr_dev(div5, "class", "svelte-py76r2");
    			add_location(div5, file$8, 55, 2, 1277);
    			attr_dev(i1, "class", "fas fa-plus-circle");
    			add_location(i1, file$8, 60, 3, 1328);
    			attr_dev(div6, "class", "svelte-py76r2");
    			add_location(div6, file$8, 59, 2, 1318);
    			attr_dev(i2, "class", "far fa-comment-alt");
    			add_location(i2, file$8, 64, 3, 1388);
    			attr_dev(div7, "class", "chat-counter svelte-py76r2");
    			add_location(div7, file$8, 65, 3, 1427);
    			attr_dev(div8, "class", "svelte-py76r2");
    			add_location(div8, file$8, 63, 2, 1378);
    			attr_dev(i3, "class", "far fa-bell");
    			add_location(i3, file$8, 69, 3, 1493);
    			attr_dev(div9, "class", "notification-counter svelte-py76r2");
    			add_location(div9, file$8, 70, 3, 1526);
    			attr_dev(div10, "class", "svelte-py76r2");
    			add_location(div10, file$8, 68, 2, 1483);
    			attr_dev(i4, "class", "fas fa-user");
    			add_location(i4, file$8, 74, 3, 1602);
    			attr_dev(div11, "class", "svelte-py76r2");
    			add_location(div11, file$8, 73, 2, 1592);
    			attr_dev(div12, "class", "right svelte-py76r2");
    			add_location(div12, file$8, 54, 1, 1254);
    			attr_dev(nav, "class", "svelte-py76r2");
    			add_location(nav, file$8, 25, 0, 588);
    			add_location(section, file$8, 23, 0, 575);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, nav);
    			append_dev(nav, div2);
    			append_dev(div2, div0);
    			append_dev(div0, i0);
    			append_dev(div2, t0);
    			append_dev(div2, form);
    			append_dev(form, input);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(nav, t2);
    			append_dev(nav, div4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, h1);
    			append_dev(h1, t4);
    			append_dev(div3, t5);

    			if (switch_instance) {
    				mount_component(switch_instance, div3, null);
    			}

    			append_dev(nav, t6);
    			append_dev(nav, div12);
    			append_dev(div12, div5);
    			append_dev(div12, t8);
    			append_dev(div12, div6);
    			append_dev(div6, i1);
    			append_dev(div12, t9);
    			append_dev(div12, div8);
    			append_dev(div8, i2);
    			append_dev(div8, t10);
    			append_dev(div8, div7);
    			append_dev(div12, t12);
    			append_dev(div12, div10);
    			append_dev(div10, i3);
    			append_dev(div10, t13);
    			append_dev(div10, div9);
    			append_dev(div12, t15);
    			append_dev(div12, div11);
    			append_dev(div11, i4);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*intSelected, changeComponent, navOptions*/ 6) {
    				each_value = navOptions;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div4, t3);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if ((!current || dirty & /*selected*/ 1) && t4_value !== (t4_value = /*selected*/ ctx[0].page + "")) set_data_dev(t4, t4_value);

    			if (switch_value !== (switch_value = /*selected*/ ctx[0].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div3, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			if (switch_instance) destroy_component(switch_instance);
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
    	let selected = navOptions[0];
    	let intSelected = 0;

    	function changeComponent(event) {
    		$$invalidate(0, selected = navOptions[event.srcElement.id]);
    		$$invalidate(1, intSelected = event.srcElement.id);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		navOptions,
    		selected,
    		intSelected,
    		changeComponent
    	});

    	$$self.$inject_state = $$props => {
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    		if ("intSelected" in $$props) $$invalidate(1, intSelected = $$props.intSelected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, intSelected, changeComponent];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
