
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

    /* src\Login.svelte generated by Svelte v3.23.0 */

    const file = "src\\Login.svelte";

    function create_fragment(ctx) {
    	let section;
    	let form;
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let button0;
    	let t3;
    	let a;
    	let t5;
    	let div;
    	let t6;
    	let button1;

    	const block = {
    		c: function create() {
    			section = element("section");
    			form = element("form");
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "Login";
    			t3 = space();
    			a = element("a");
    			a.textContent = "Forgot password?";
    			t5 = space();
    			div = element("div");
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "Signup";
    			attr_dev(input0, "placeholder", "E-mail");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-jpqy53");
    			add_location(input0, file, 10, 4, 97);
    			attr_dev(input1, "placeholder", "Password");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "class", "svelte-jpqy53");
    			add_location(input1, file, 15, 4, 167);
    			attr_dev(button0, "class", "svelte-jpqy53");
    			add_location(button0, file, 20, 4, 239);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "svelte-jpqy53");
    			add_location(a, file, 22, 4, 269);
    			attr_dev(div, "id", "border");
    			attr_dev(div, "class", "svelte-jpqy53");
    			add_location(div, file, 24, 4, 309);
    			attr_dev(button1, "class", "svelte-jpqy53");
    			add_location(button1, file, 26, 4, 340);
    			attr_dev(form, "class", "svelte-jpqy53");
    			add_location(form, file, 9, 0, 85);
    			attr_dev(section, "class", "svelte-jpqy53");
    			add_location(section, file, 7, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, form);
    			append_dev(form, input0);
    			append_dev(form, t0);
    			append_dev(form, input1);
    			append_dev(form, t1);
    			append_dev(form, button0);
    			append_dev(form, t3);
    			append_dev(form, a);
    			append_dev(form, t5);
    			append_dev(form, div);
    			append_dev(form, t6);
    			append_dev(form, button1);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Login", $$slots, []);
    	return [];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\Signup.svelte generated by Svelte v3.23.0 */

    const file$1 = "src\\Signup.svelte";

    function create_fragment$1(ctx) {
    	let section;
    	let form;
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let input2;
    	let t2;
    	let input3;
    	let t3;
    	let input4;
    	let t4;
    	let button;

    	const block = {
    		c: function create() {
    			section = element("section");
    			form = element("form");
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			input2 = element("input");
    			t2 = space();
    			input3 = element("input");
    			t3 = space();
    			input4 = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Signup";
    			attr_dev(input0, "placeholder", "E-mail");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "email");
    			attr_dev(input0, "class", "svelte-7hgrp7");
    			add_location(input0, file$1, 9, 4, 97);
    			attr_dev(input1, "placeholder", "Password");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "name", "password");
    			attr_dev(input1, "class", "svelte-7hgrp7");
    			add_location(input1, file$1, 15, 4, 185);
    			attr_dev(input2, "placeholder", "First name");
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "firstName");
    			attr_dev(input2, "class", "svelte-7hgrp7");
    			add_location(input2, file$1, 27, 4, 368);
    			attr_dev(input3, "placeholder", "Last name");
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "name", "lastName");
    			attr_dev(input3, "class", "svelte-7hgrp7");
    			add_location(input3, file$1, 33, 4, 460);
    			attr_dev(input4, "name", "profileimg");
    			attr_dev(input4, "type", "file");
    			attr_dev(input4, "id", "img");
    			attr_dev(input4, "accept", "image/*");
    			attr_dev(input4, "class", "svelte-7hgrp7");
    			add_location(input4, file$1, 39, 4, 550);
    			attr_dev(button, "class", "svelte-7hgrp7");
    			add_location(button, file$1, 41, 4, 621);
    			attr_dev(form, "class", "svelte-7hgrp7");
    			add_location(form, file$1, 8, 0, 85);
    			attr_dev(section, "class", "svelte-7hgrp7");
    			add_location(section, file$1, 6, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, form);
    			append_dev(form, input0);
    			append_dev(form, t0);
    			append_dev(form, input1);
    			append_dev(form, t1);
    			append_dev(form, input2);
    			append_dev(form, t2);
    			append_dev(form, input3);
    			append_dev(form, t3);
    			append_dev(form, input4);
    			append_dev(form, t4);
    			append_dev(form, button);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Signup> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Signup", $$slots, []);
    	return [];
    }

    class Signup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Signup",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\Homepage.svelte generated by Svelte v3.23.0 */
    const file$2 = "src\\Homepage.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let t;
    	let current;
    	const login = new Login({ $$inline: true });
    	const signup = new Signup({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(login.$$.fragment);
    			t = space();
    			create_component(signup.$$.fragment);
    			attr_dev(section, "class", "svelte-cs5i41");
    			add_location(section, file$2, 9, 0, 167);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(login, section, null);
    			append_dev(section, t);
    			mount_component(signup, section, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			transition_in(signup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			transition_out(signup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(login);
    			destroy_component(signup);
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Homepage> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Homepage", $$slots, []);
    	$$self.$capture_state = () => ({ Login, Signup });
    	return [];
    }

    class Homepage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Homepage",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Nav.svelte generated by Svelte v3.23.0 */

    const file$3 = "src\\Nav.svelte";

    function create_fragment$3(ctx) {
    	let nav;
    	let div0;
    	let t1;
    	let div3;
    	let form;
    	let input;
    	let t2;
    	let div1;
    	let t3;
    	let div2;
    	let a0;
    	let t5;
    	let a1;
    	let t7;
    	let a2;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div0 = element("div");
    			div0.textContent = "Clonebook";
    			t1 = space();
    			div3 = element("div");
    			form = element("form");
    			input = element("input");
    			t2 = space();
    			div1 = element("div");
    			t3 = space();
    			div2 = element("div");
    			a0 = element("a");
    			a0.textContent = "1";
    			t5 = space();
    			a1 = element("a");
    			a1.textContent = "2";
    			t7 = space();
    			a2 = element("a");
    			a2.textContent = "3";
    			add_location(div0, file$3, 9, 2, 75);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Search on CloneBook");
    			attr_dev(input, "class", "svelte-jqgy9a");
    			add_location(input, file$3, 14, 6, 149);
    			add_location(form, file$3, 13, 4, 135);
    			attr_dev(div1, "id", "searchResults");
    			attr_dev(div1, "class", "svelte-jqgy9a");
    			add_location(div1, file$3, 20, 4, 252);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "svelte-jqgy9a");
    			add_location(a0, file$3, 25, 6, 326);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "svelte-jqgy9a");
    			add_location(a1, file$3, 26, 6, 353);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "svelte-jqgy9a");
    			add_location(a2, file$3, 27, 6, 380);
    			attr_dev(div2, "id", "icons");
    			attr_dev(div2, "class", "svelte-jqgy9a");
    			add_location(div2, file$3, 24, 4, 302);
    			attr_dev(div3, "id", "searchContainer");
    			attr_dev(div3, "class", "svelte-jqgy9a");
    			add_location(div3, file$3, 11, 2, 101);
    			attr_dev(nav, "class", "svelte-jqgy9a");
    			add_location(nav, file$3, 8, 0, 66);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div0);
    			append_dev(nav, t1);
    			append_dev(nav, div3);
    			append_dev(div3, form);
    			append_dev(form, input);
    			append_dev(div3, t2);
    			append_dev(div3, div1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, a0);
    			append_dev(div2, t5);
    			append_dev(div2, a1);
    			append_dev(div2, t7);
    			append_dev(div2, a2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
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

    function instance$3($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Nav", $$slots, []);
    	return [];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Right.svelte generated by Svelte v3.23.0 */

    const file$4 = "src\\Right.svelte";

    function create_fragment$4(ctx) {
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
    			attr_dev(h3, "class", "svelte-1vk61uw");
    			add_location(h3, file$4, 11, 4, 132);
    			if (img.src !== (img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "user");
    			attr_dev(img, "class", "svelte-1vk61uw");
    			add_location(img, file$4, 14, 8, 190);
    			attr_dev(p, "class", "svelte-1vk61uw");
    			add_location(p, file$4, 15, 8, 223);
    			attr_dev(div, "class", "friend svelte-1vk61uw");
    			add_location(div, file$4, 13, 7, 160);
    			attr_dev(section, "id", "contacts");
    			attr_dev(section, "class", "svelte-1vk61uw");
    			add_location(section, file$4, 10, 1, 103);
    			add_location(main, file$4, 8, 0, 92);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Right",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\ChatContainer.svelte generated by Svelte v3.23.0 */

    const file$5 = "src\\ChatContainer.svelte";

    function create_fragment$5(ctx) {
    	let section;

    	const block = {
    		c: function create() {
    			section = element("section");
    			attr_dev(section, "class", "svelte-1w8q08t");
    			add_location(section, file$5, 7, 0, 80);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ChatContainer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ChatContainer", $$slots, []);
    	return [];
    }

    class ChatContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChatContainer",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\Left.svelte generated by Svelte v3.23.0 */

    const file$6 = "src\\Left.svelte";

    function create_fragment$6(ctx) {
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
    			add_location(h30, file$6, 9, 7, 99);
    			if (img0.src !== (img0_src_value = "./images/point.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "point");
    			attr_dev(img0, "class", "svelte-tad157");
    			add_location(img0, file$6, 12, 8, 140);
    			attr_dev(h40, "class", "svelte-tad157");
    			add_location(h40, file$6, 13, 8, 192);
    			attr_dev(div0, "class", "svelte-tad157");
    			add_location(div0, file$6, 11, 8, 125);
    			if (img1.src !== (img1_src_value = "./images/building.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "point");
    			attr_dev(img1, "class", "svelte-tad157");
    			add_location(img1, file$6, 17, 8, 251);
    			attr_dev(h41, "class", "svelte-tad157");
    			add_location(h41, file$6, 18, 8, 306);
    			attr_dev(div1, "class", "svelte-tad157");
    			add_location(div1, file$6, 16, 8, 236);
    			if (img2.src !== (img2_src_value = "./images/virus.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "point");
    			attr_dev(img2, "class", "svelte-tad157");
    			add_location(img2, file$6, 22, 8, 367);
    			attr_dev(h42, "class", "svelte-tad157");
    			add_location(h42, file$6, 23, 8, 419);
    			attr_dev(div2, "class", "svelte-tad157");
    			add_location(div2, file$6, 21, 8, 352);
    			attr_dev(section0, "id", "sites");
    			attr_dev(section0, "class", "svelte-tad157");
    			add_location(section0, file$6, 8, 1, 70);
    			attr_dev(h31, "class", "svelte-tad157");
    			add_location(h31, file$6, 29, 7, 528);
    			if (img3.src !== (img3_src_value = "./images/nodejs.jpg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "point");
    			attr_dev(img3, "class", "svelte-tad157");
    			add_location(img3, file$6, 32, 8, 570);
    			attr_dev(h43, "class", "svelte-tad157");
    			add_location(h43, file$6, 33, 8, 623);
    			attr_dev(div3, "class", "svelte-tad157");
    			add_location(div3, file$6, 31, 8, 555);
    			if (img4.src !== (img4_src_value = "./images/webdev.jpg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "point");
    			attr_dev(img4, "class", "svelte-tad157");
    			add_location(img4, file$6, 37, 8, 693);
    			attr_dev(h44, "class", "svelte-tad157");
    			add_location(h44, file$6, 38, 8, 746);
    			attr_dev(div4, "class", "svelte-tad157");
    			add_location(div4, file$6, 36, 8, 678);
    			if (img5.src !== (img5_src_value = "./images/dat.jpg")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "point");
    			attr_dev(img5, "class", "svelte-tad157");
    			add_location(img5, file$6, 42, 8, 813);
    			attr_dev(h45, "class", "svelte-tad157");
    			add_location(h45, file$6, 43, 8, 863);
    			attr_dev(div5, "class", "svelte-tad157");
    			add_location(div5, file$6, 41, 8, 798);
    			attr_dev(section1, "id", "groups");
    			attr_dev(section1, "class", "svelte-tad157");
    			add_location(section1, file$6, 28, 4, 498);
    			attr_dev(main, "class", "svelte-tad157");
    			add_location(main, file$6, 6, 0, 59);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Left",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\Posts.svelte generated by Svelte v3.23.0 */

    const file$7 = "src\\Posts.svelte";

    function create_fragment$7(ctx) {
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
    			add_location(img, file$7, 11, 4, 153);
    			attr_dev(input, "placeholder", "What's on your mind?");
    			attr_dev(input, "class", "svelte-s2ux91");
    			add_location(input, file$7, 14, 12, 219);
    			attr_dev(button0, "class", "svelte-s2ux91");
    			add_location(button0, file$7, 17, 12, 308);
    			attr_dev(form, "action", "");
    			add_location(form, file$7, 13, 8, 189);
    			attr_dev(button1, "class", "svelte-s2ux91");
    			add_location(button1, file$7, 20, 12, 362);
    			attr_dev(button2, "class", "svelte-s2ux91");
    			add_location(button2, file$7, 21, 12, 406);
    			attr_dev(button3, "class", "svelte-s2ux91");
    			add_location(button3, file$7, 22, 12, 449);
    			attr_dev(div, "id", "post-container");
    			attr_dev(div, "class", "svelte-s2ux91");
    			add_location(div, file$7, 9, 4, 116);
    			add_location(section, file$7, 8, 0, 101);
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Posts",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\Userposts.svelte generated by Svelte v3.23.0 */

    const file$8 = "src\\Userposts.svelte";

    function create_fragment$8(ctx) {
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
    			add_location(img0, file$8, 12, 12, 183);
    			attr_dev(p0, "class", "svelte-ci1ur9");
    			add_location(p0, file$8, 13, 12, 221);
    			attr_dev(div0, "id", "post");
    			attr_dev(div0, "class", "svelte-ci1ur9");
    			add_location(div0, file$8, 14, 12, 251);
    			attr_dev(div1, "id", "mypost");
    			attr_dev(div1, "class", "svelte-ci1ur9");
    			add_location(div1, file$8, 11, 8, 152);
    			attr_dev(button0, "class", "svelte-ci1ur9");
    			add_location(button0, file$8, 20, 12, 503);
    			attr_dev(button1, "class", "svelte-ci1ur9");
    			add_location(button1, file$8, 21, 12, 538);
    			attr_dev(div2, "id", "like");
    			attr_dev(div2, "class", "svelte-ci1ur9");
    			add_location(div2, file$8, 19, 8, 474);
    			if (img1.src !== (img1_src_value = /*src*/ ctx[0])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "user");
    			attr_dev(img1, "class", "svelte-ci1ur9");
    			add_location(img1, file$8, 25, 8, 617);
    			attr_dev(p1, "class", "svelte-ci1ur9");
    			add_location(p1, file$8, 26, 8, 651);
    			attr_dev(div3, "id", "comments");
    			attr_dev(div3, "class", "svelte-ci1ur9");
    			add_location(div3, file$8, 24, 6, 588);
    			if (img2.src !== (img2_src_value = /*src*/ ctx[0])) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "user");
    			attr_dev(img2, "class", "svelte-ci1ur9");
    			add_location(img2, file$8, 30, 12, 732);
    			attr_dev(input, "placeholder", "Your comment....");
    			attr_dev(input, "class", "svelte-ci1ur9");
    			add_location(input, file$8, 31, 12, 770);
    			attr_dev(button2, "class", "svelte-ci1ur9");
    			add_location(button2, file$8, 33, 12, 837);
    			attr_dev(div4, "id", "comment-post");
    			attr_dev(div4, "class", "svelte-ci1ur9");
    			add_location(div4, file$8, 29, 7, 695);
    			attr_dev(div5, "class", "user-posts svelte-ci1ur9");
    			add_location(div5, file$8, 10, 4, 118);
    			add_location(section, file$8, 8, 0, 101);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let src = "./images/me.jpg";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Userposts> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Userposts", $$slots, []);
    	$$self.$capture_state = () => ({ src });

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src];
    }

    class Userposts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Userposts",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\OpenChatContainer.svelte generated by Svelte v3.23.0 */

    const file$9 = "src\\OpenChatContainer.svelte";

    function create_fragment$9(ctx) {
    	let section;
    	let div3;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let p;
    	let t2;
    	let a0;
    	let t4;
    	let a1;
    	let t6;
    	let div1;
    	let t7;
    	let div2;
    	let input;
    	let t8;
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
    			a0 = element("a");
    			a0.textContent = "X";
    			t4 = space();
    			a1 = element("a");
    			a1.textContent = "-";
    			t6 = space();
    			div1 = element("div");
    			t7 = space();
    			div2 = element("div");
    			input = element("input");
    			t8 = space();
    			button = element("button");
    			button.textContent = ">";
    			if (img.src !== (img_src_value = src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "user");
    			attr_dev(img, "class", "svelte-gsaa6r");
    			add_location(img, file$9, 13, 8, 189);
    			attr_dev(p, "class", "svelte-gsaa6r");
    			add_location(p, file$9, 14, 8, 222);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-gsaa6r");
    			add_location(a0, file$9, 15, 8, 250);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "svelte-gsaa6r");
    			add_location(a1, file$9, 16, 8, 277);
    			attr_dev(div0, "id", "top-container");
    			attr_dev(div0, "class", "svelte-gsaa6r");
    			add_location(div0, file$9, 12, 4, 155);
    			attr_dev(div1, "id", "chat");
    			attr_dev(div1, "class", "svelte-gsaa6r");
    			add_location(div1, file$9, 20, 4, 316);
    			attr_dev(input, "placeholder", "Aa");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-gsaa6r");
    			add_location(input, file$9, 25, 8, 387);
    			attr_dev(button, "class", "svelte-gsaa6r");
    			add_location(button, file$9, 28, 8, 452);
    			attr_dev(div2, "id", "bot-container");
    			attr_dev(div2, "class", "svelte-gsaa6r");
    			add_location(div2, file$9, 24, 4, 353);
    			attr_dev(div3, "id", "chat-container");
    			add_location(div3, file$9, 11, 0, 124);
    			attr_dev(section, "class", "svelte-gsaa6r");
    			add_location(section, file$9, 9, 0, 111);
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
    			append_dev(div0, a0);
    			append_dev(div0, t4);
    			append_dev(div0, a1);
    			append_dev(div3, t6);
    			append_dev(div3, div1);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, input);
    			append_dev(div2, t8);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let src = "./images/me.jpg";

    function instance$9($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OpenChatContainer",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.23.0 */
    const file$a = "src\\App.svelte";

    function create_fragment$a(ctx) {
    	let section;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let current;
    	const nav = new Nav({ $$inline: true });
    	const left = new Left({ $$inline: true });
    	const posts = new Posts({ $$inline: true });
    	const right = new Right({ $$inline: true });
    	const chatcontainer = new ChatContainer({ $$inline: true });
    	const openchatcontainer = new OpenChatContainer({ $$inline: true });
    	const userposts = new Userposts({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(nav.$$.fragment);
    			t0 = space();
    			create_component(left.$$.fragment);
    			t1 = space();
    			create_component(posts.$$.fragment);
    			t2 = space();
    			create_component(right.$$.fragment);
    			t3 = space();
    			create_component(chatcontainer.$$.fragment);
    			t4 = space();
    			create_component(openchatcontainer.$$.fragment);
    			t5 = space();
    			create_component(userposts.$$.fragment);
    			add_location(section, file$a, 13, 0, 408);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(nav, section, null);
    			append_dev(section, t0);
    			mount_component(left, section, null);
    			append_dev(section, t1);
    			mount_component(posts, section, null);
    			append_dev(section, t2);
    			mount_component(right, section, null);
    			append_dev(section, t3);
    			mount_component(chatcontainer, section, null);
    			append_dev(section, t4);
    			mount_component(openchatcontainer, section, null);
    			append_dev(section, t5);
    			mount_component(userposts, section, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(left.$$.fragment, local);
    			transition_in(posts.$$.fragment, local);
    			transition_in(right.$$.fragment, local);
    			transition_in(chatcontainer.$$.fragment, local);
    			transition_in(openchatcontainer.$$.fragment, local);
    			transition_in(userposts.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(left.$$.fragment, local);
    			transition_out(posts.$$.fragment, local);
    			transition_out(right.$$.fragment, local);
    			transition_out(chatcontainer.$$.fragment, local);
    			transition_out(openchatcontainer.$$.fragment, local);
    			transition_out(userposts.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(nav);
    			destroy_component(left);
    			destroy_component(posts);
    			destroy_component(right);
    			destroy_component(chatcontainer);
    			destroy_component(openchatcontainer);
    			destroy_component(userposts);
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

    function instance$a($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Home: Homepage,
    		Nav,
    		Right,
    		ChatContainer,
    		Left,
    		Posts,
    		UserPosts: Userposts,
    		OpenChatContainer
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
