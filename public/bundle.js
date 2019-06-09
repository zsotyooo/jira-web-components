
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
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
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(component, store, callback) {
        const unsub = store.subscribe(callback);
        component.$$.on_destroy.push(unsub.unsubscribe
            ? () => unsub.unsubscribe()
            : unsub);
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
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
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_binding_callback(fn) {
        binding_callbacks.push(fn);
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
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
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                $$.fragment.l(children(options.target));
            }
            else {
                $$.fragment.c();
            }
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    let SvelteElement;
    if (typeof HTMLElement !== 'undefined') {
        SvelteElement = class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }
            connectedCallback() {
                // @ts-ignore todo: improve typings
                for (const key in this.$$.slotted) {
                    // @ts-ignore todo: improve typings
                    this.appendChild(this.$$.slotted[key]);
                }
            }
            attributeChangedCallback(attr$$1, oldValue, newValue) {
                this[attr$$1] = newValue;
            }
            $destroy() {
                destroy(this, true);
                this.$destroy = noop;
            }
            $on(type, callback) {
                // TODO should this delegate to addEventListener?
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
        };
    }

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
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
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
                }
            };
        }
        return { set, update, subscribe };
    }
    /**
     * Get the current value from a store by subscribing and immediately unsubscribing.
     * @param store readable
     */
    function get(store) {
        let value;
        store.subscribe((_) => value = _)();
        return value;
    }

    const storageKey = (key) => `__jira-${key}`;

    const readData = (key) => localStorage.getItem(storageKey(key));
    const hydrateData = (key, value) => localStorage.setItem(storageKey(key), value || '');

    const createSavedStoreFor = (key) => {
      const store = writable(readData(key));

      store.subscribe(v => {
        hydrateData(key, v);
      });

      return store;
    };

    /* src/global/Config.svelte generated by Svelte v3.4.4 */

    function create_fragment(ctx) {
    	return {
    		c: function create() {
    			this.c = noop;
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	

      let { cors } = $$props;

      onMount(async () => {
        await tick();
        hydrateData('cors', cors);
      });

    	const writable_props = ['cors'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<jira-global-config> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('cors' in $$props) $$invalidate('cors', cors = $$props.cors);
    	};

    	return { cors };
    }

    class Config extends SvelteElement {
    	constructor(options) {
    		super();

    		init(this, { target: this.shadowRoot }, instance, create_fragment, safe_not_equal, ["cors"]);

    		const { ctx } = this.$$;
    		const props = this.attributes;
    		if (ctx.cors === undefined && !('cors' in props)) {
    			console.warn("<jira-global-config> was created without expected prop 'cors'");
    		}

    		if (options) {
    			if (options.target) {
    				insert(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["cors"];
    	}

    	get cors() {
    		return this.$$.ctx.cors;
    	}

    	set cors(cors) {
    		this.$set({ cors });
    		flush();
    	}
    }

    customElements.define("jira-global-config", Config);

    /* src/global/Styles.svelte generated by Svelte v3.4.4 */

    const file = "src/global/Styles.svelte";

    function create_fragment$1(ctx) {
    	var link;

    	return {
    		c: function create() {
    			link = element("link");
    			this.c = noop;
    			link.rel = "stylesheet";
    			link.href = "https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.5/css/bulma.css";
    			add_location(link, file, 3, 2, 60);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			append(document.head, link);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			detach(link);
    		}
    	};
    }

    class Styles extends SvelteElement {
    	constructor(options) {
    		super();

    		init(this, { target: this.shadowRoot }, null, create_fragment$1, safe_not_equal, []);

    		if (options) {
    			if (options.target) {
    				insert(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("jira-blobal-styles", Styles);

    const getHeaders = () => ({
      'accept': 'application/json',
      'aontent-type': 'application/json',
      'authorization': `Basic ${btoa(readData('email')+':'+readData('apiKey'))}`,
    });

    const tick$1 = async (time) => (new Promise((resolve, reject) => { setTimeout(resolve, time); }));

    const fetchApi = async (url) => {
      const corsUrl = readData('cors');
      if (!corsUrl) {
        return Promise.reject('No CORS server URL specified!');
      }
      const baseUrl = readData('url');
      if (!baseUrl || !url) {
        return Promise.reject('No URL specified!');
      }
      try {
        const rawResponse = await fetch(`${corsUrl}/${baseUrl}${url}`, {
          method: 'GET',
          headers: getHeaders()
        });
        try {
          const content = await rawResponse.json();
          return content;
        } catch(error) {
          return Promise.reject(error);
        }
      } catch(error) {
        return Promise.reject(error);
      }
    };

    const fetchAuthUser = async () => {
      await tick$1(100);
      if (!get(authUserIsFetching)) {
        authUserIsFetching.set(true);
        try {
          const { accountId, key, name, emailAddress, displayName, avatarUrls } = await fetchApi('/rest/api/3/myself');
          authUser.set({ accountId, key, name, emailAddress, displayName, avatar: avatarUrls['48x48'] });
          authUserIsFetching.set(false);
        } catch(error) {
          authUser.set(emptyUser);
          authUserIsFetching.set(false);
        }
      }
    };

    const emptyUser = {
      accountId: '',
      key: '',
      name: '',
      emailAddress: '',
      avatar: '',
      displayName: '',
    };

    let authUserIsFetching = writable(false);

    let isAuthenticated = writable(false);

    const email = createSavedStoreFor('email');

    const apiKey = createSavedStoreFor('apiKey');

    const url = createSavedStoreFor('url');

    const authUser = writable(emptyUser);

    authUser.subscribe(v => {
      isAuthenticated.set(!!v.accountId);
    });

    email.subscribe(v => {
      fetchAuthUser();
    });

    apiKey.subscribe(v => {
      fetchAuthUser();
    });

    url.subscribe(v => {
      fetchAuthUser();
    });

    /* src/auth/Auth.svelte generated by Svelte v3.4.4 */

    function create_fragment$2(ctx) {
    	return {
    		c: function create() {
    			this.c = noop;
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $email, $apiKey, $url, $authUser;

    	validate_store(email, 'email');
    	subscribe($$self, email, $$value => { $email = $$value; $$invalidate('$email', $email); });
    	validate_store(apiKey, 'apiKey');
    	subscribe($$self, apiKey, $$value => { $apiKey = $$value; $$invalidate('$apiKey', $apiKey); });
    	validate_store(url, 'url');
    	subscribe($$self, url, $$value => { $url = $$value; $$invalidate('$url', $url); });
    	validate_store(authUser, 'authUser');
    	subscribe($$self, authUser, $$value => { $authUser = $$value; $$invalidate('$authUser', $authUser); });

    	

      const dispatch = createEventDispatcher();

      let { setEmail = (v) => email.set(v) } = $$props;
      let { setApiKey = (v) => apiKey.set(v) } = $$props;
      let { setUrl = (v) => url.set(v) } = $$props;
      let { getUserData = () => get(authUser) } = $$props;

      let { getEmail = () => $email } = $$props;
      let { getApiKey = () => $apiKey } = $$props;
      let { getUrl = () => $url } = $$props;

      let { isAuthenticated = () => !!$authUser.accountId } = $$props;

      authUser.subscribe(user => {
        dispatch('jira-auth-user-changed', user);
        dispatch('jira-auth-status-changed', !!user.accountId);
      });

      authUserIsFetching.subscribe(v => dispatch('jira-auth-user-fetching-changed', v));
      email.subscribe(v => dispatch('jira-auth-email-changed', v));
      apiKey.subscribe(v => dispatch('jira-auth-apikey-changed', v));
      url.subscribe(v => dispatch('jira-auth-url-changed', v));

      let { reset = () => {
        setEmail('');
        setApiKey('');
        setUrl('');
      } } = $$props;

    	const writable_props = ['setEmail', 'setApiKey', 'setUrl', 'getUserData', 'getEmail', 'getApiKey', 'getUrl', 'isAuthenticated', 'reset'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<jira-auth> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('setEmail' in $$props) $$invalidate('setEmail', setEmail = $$props.setEmail);
    		if ('setApiKey' in $$props) $$invalidate('setApiKey', setApiKey = $$props.setApiKey);
    		if ('setUrl' in $$props) $$invalidate('setUrl', setUrl = $$props.setUrl);
    		if ('getUserData' in $$props) $$invalidate('getUserData', getUserData = $$props.getUserData);
    		if ('getEmail' in $$props) $$invalidate('getEmail', getEmail = $$props.getEmail);
    		if ('getApiKey' in $$props) $$invalidate('getApiKey', getApiKey = $$props.getApiKey);
    		if ('getUrl' in $$props) $$invalidate('getUrl', getUrl = $$props.getUrl);
    		if ('isAuthenticated' in $$props) $$invalidate('isAuthenticated', isAuthenticated = $$props.isAuthenticated);
    		if ('reset' in $$props) $$invalidate('reset', reset = $$props.reset);
    	};

    	return {
    		setEmail,
    		setApiKey,
    		setUrl,
    		getUserData,
    		getEmail,
    		getApiKey,
    		getUrl,
    		isAuthenticated,
    		reset
    	};
    }

    class Auth extends SvelteElement {
    	constructor(options) {
    		super();

    		init(this, { target: this.shadowRoot }, instance$1, create_fragment$2, safe_not_equal, ["setEmail", "setApiKey", "setUrl", "getUserData", "getEmail", "getApiKey", "getUrl", "isAuthenticated", "reset"]);

    		if (options) {
    			if (options.target) {
    				insert(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["setEmail","setApiKey","setUrl","getUserData","getEmail","getApiKey","getUrl","isAuthenticated","reset"];
    	}

    	get setEmail() {
    		return this.$$.ctx.setEmail;
    	}

    	set setEmail(setEmail) {
    		this.$set({ setEmail });
    		flush();
    	}

    	get setApiKey() {
    		return this.$$.ctx.setApiKey;
    	}

    	set setApiKey(setApiKey) {
    		this.$set({ setApiKey });
    		flush();
    	}

    	get setUrl() {
    		return this.$$.ctx.setUrl;
    	}

    	set setUrl(setUrl) {
    		this.$set({ setUrl });
    		flush();
    	}

    	get getUserData() {
    		return this.$$.ctx.getUserData;
    	}

    	set getUserData(getUserData) {
    		this.$set({ getUserData });
    		flush();
    	}

    	get getEmail() {
    		return this.$$.ctx.getEmail;
    	}

    	set getEmail(getEmail) {
    		this.$set({ getEmail });
    		flush();
    	}

    	get getApiKey() {
    		return this.$$.ctx.getApiKey;
    	}

    	set getApiKey(getApiKey) {
    		this.$set({ getApiKey });
    		flush();
    	}

    	get getUrl() {
    		return this.$$.ctx.getUrl;
    	}

    	set getUrl(getUrl) {
    		this.$set({ getUrl });
    		flush();
    	}

    	get isAuthenticated() {
    		return this.$$.ctx.isAuthenticated;
    	}

    	set isAuthenticated(isAuthenticated) {
    		this.$set({ isAuthenticated });
    		flush();
    	}

    	get reset() {
    		return this.$$.ctx.reset;
    	}

    	set reset(reset) {
    		this.$set({ reset });
    		flush();
    	}
    }

    customElements.define("jira-auth", Auth);

    /* src/auth/AuthForm.svelte generated by Svelte v3.4.4 */

    const file$1 = "src/auth/AuthForm.svelte";

    // (87:6) {:else}
    function create_else_block(ctx) {
    	var div, t0, t1_value = ctx.user.name, t1, t2;

    	return {
    		c: function create() {
    			div = element("div");
    			t0 = text("You are authenticated as @");
    			t1 = text(t1_value);
    			t2 = text(".");
    			div.className = "notification is-success";
    			add_location(div, file$1, 87, 6, 1863);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t0);
    			append(div, t1);
    			append(div, t2);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.user) && t1_value !== (t1_value = ctx.user.name)) {
    				set_data(t1, t1_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    // (83:6) {#if !authenticated}
    function create_if_block(ctx) {
    	var div;

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Authentication error, please enter valid data.";
    			div.className = "notification is-warning";
    			add_location(div, file$1, 83, 6, 1737);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var t0, div9, header, p0, t2, div8, div7, t3, div6, fieldset, div1, label0, t5, div0, input0, t6, p1, t8, div3, label1, t10, div2, input1, t11, p2, t12, a, t14, t15, div5, label2, t17, div4, input2, t18, p3, t20, footer, span0, button0, t21_value = ctx.fetching ? 'Fetching user...' : 'Authenticate', t21, button0_disabled_value, t22, span1, button1, current, dispose;

    	let auth_props = {};
    	var auth = new Auth({ props: auth_props, $$inline: true });

    	add_binding_callback(() => ctx.auth_binding(auth));
    	auth.$on("jira-auth-user-changed", ctx.onUserChanged);
    	auth.$on("jira-auth-user-fetching-changed", ctx.onIsFechingChanged);
    	auth.$on("jira-auth-status-changed", ctx.onAuthStatusChanged);
    	auth.$on("jira-auth-email-changed", ctx.onEmailChanged);
    	auth.$on("jira-auth-api-key-changed", ctx.onApiKeyChanged);
    	auth.$on("jira-auth-url-changed", ctx.onUrlChanged);

    	function select_block_type(ctx) {
    		if (!ctx.authenticated) return create_if_block;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			auth.$$.fragment.c();
    			t0 = space();
    			div9 = element("div");
    			header = element("header");
    			p0 = element("p");
    			p0.textContent = "JiRa authentication";
    			t2 = space();
    			div8 = element("div");
    			div7 = element("div");
    			if_block.c();
    			t3 = space();
    			div6 = element("div");
    			fieldset = element("fieldset");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "E-mail";
    			t5 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "Your JiRa login E-mail.";
    			t8 = space();
    			div3 = element("div");
    			label1 = element("label");
    			label1.textContent = "Api key";
    			t10 = space();
    			div2 = element("div");
    			input1 = element("input");
    			t11 = space();
    			p2 = element("p");
    			t12 = text("Create an API token ");
    			a = element("a");
    			a.textContent = "here";
    			t14 = text(".");
    			t15 = space();
    			div5 = element("div");
    			label2 = element("label");
    			label2.textContent = "URL to JiRa";
    			t17 = space();
    			div4 = element("div");
    			input2 = element("input");
    			t18 = space();
    			p3 = element("p");
    			p3.textContent = "Use the URL to your company JiRa account (E.g: https://your-company.jira.net).";
    			t20 = space();
    			footer = element("footer");
    			span0 = element("span");
    			button0 = element("button");
    			t21 = text(t21_value);
    			t22 = space();
    			span1 = element("span");
    			button1 = element("button");
    			button1.textContent = "clear";
    			this.c = noop;
    			p0.className = "card-header-title";
    			add_location(p0, file$1, 76, 4, 1572);
    			header.className = "card-header";
    			add_location(header, file$1, 75, 2, 1539);
    			label0.className = "label";
    			label0.htmlFor = "jira-email";
    			add_location(label0, file$1, 94, 12, 2071);
    			input0.id = "jira-email";
    			input0.name = "jira-email";
    			attr(input0, "type", "text");
    			input0.placeholder = "E-mail";
    			input0.className = "input is-medium";
    			input0.required = "";
    			add_location(input0, file$1, 96, 14, 2172);
    			p1.className = "help";
    			add_location(p1, file$1, 97, 14, 2316);
    			div0.className = "control";
    			add_location(div0, file$1, 95, 12, 2136);
    			div1.className = "field";
    			add_location(div1, file$1, 93, 10, 2039);
    			label1.className = "label";
    			label1.htmlFor = "jira-api-key";
    			add_location(label1, file$1, 102, 12, 2439);
    			input1.id = "jira-api-key";
    			input1.name = "jira-api-key";
    			attr(input1, "type", "password");
    			input1.placeholder = "Api key";
    			input1.className = "input is-medium";
    			input1.required = "";
    			add_location(input1, file$1, 104, 14, 2543);
    			a.target = "_blank";
    			a.href = "https://id.atlassian.com/manage/api-tokens";
    			add_location(a, file$1, 105, 50, 2733);
    			p2.className = "help";
    			add_location(p2, file$1, 105, 14, 2697);
    			div2.className = "control";
    			add_location(div2, file$1, 103, 12, 2507);
    			div3.className = "field";
    			add_location(div3, file$1, 101, 10, 2407);
    			label2.className = "label";
    			label2.htmlFor = "jira-url";
    			add_location(label2, file$1, 110, 12, 2895);
    			input2.id = "jira-url";
    			input2.name = "jira-url";
    			attr(input2, "type", "text");
    			input2.placeholder = "URL to JiRa";
    			input2.className = "input is-medium";
    			input2.required = "";
    			add_location(input2, file$1, 112, 14, 2999);
    			p3.className = "help";
    			add_location(p3, file$1, 113, 14, 3142);
    			div4.className = "control";
    			add_location(div4, file$1, 111, 12, 2963);
    			div5.className = "field";
    			add_location(div5, file$1, 109, 10, 2863);
    			add_location(fieldset, file$1, 92, 8, 2018);
    			div6.className = "form-horizontal";
    			add_location(div6, file$1, 91, 6, 1979);
    			div7.className = "content";
    			add_location(div7, file$1, 81, 4, 1682);
    			div8.className = "card-content";
    			add_location(div8, file$1, 80, 2, 1651);
    			button0.className = "button is-primary";
    			button0.disabled = button0_disabled_value = ctx.fetching || !ctx.email || !ctx.apiKey || !ctx.url;
    			toggle_class(button0, "is-loading", ctx.fetching);
    			add_location(button0, file$1, 122, 6, 3403);
    			span0.className = "card-footer-item";
    			add_location(span0, file$1, 121, 4, 3365);
    			button1.className = "button is-white";
    			add_location(button1, file$1, 125, 6, 3642);
    			span1.className = "card-footer-item";
    			add_location(span1, file$1, 124, 4, 3604);
    			footer.className = "card-footer";
    			add_location(footer, file$1, 120, 2, 3332);
    			div9.className = "box card container is-fluid is-paddingless";
    			add_location(div9, file$1, 74, 0, 1480);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input1, "input", ctx.input1_input_handler),
    				listen(input2, "input", ctx.input2_input_handler),
    				listen(button0, "click", ctx.save),
    				listen(button1, "click", ctx.reset)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(auth, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div9, anchor);
    			append(div9, header);
    			append(header, p0);
    			append(div9, t2);
    			append(div9, div8);
    			append(div8, div7);
    			if_block.m(div7, null);
    			append(div7, t3);
    			append(div7, div6);
    			append(div6, fieldset);
    			append(fieldset, div1);
    			append(div1, label0);
    			append(div1, t5);
    			append(div1, div0);
    			append(div0, input0);

    			input0.value = ctx.email;

    			append(div0, t6);
    			append(div0, p1);
    			append(fieldset, t8);
    			append(fieldset, div3);
    			append(div3, label1);
    			append(div3, t10);
    			append(div3, div2);
    			append(div2, input1);

    			input1.value = ctx.apiKey;

    			append(div2, t11);
    			append(div2, p2);
    			append(p2, t12);
    			append(p2, a);
    			append(p2, t14);
    			append(fieldset, t15);
    			append(fieldset, div5);
    			append(div5, label2);
    			append(div5, t17);
    			append(div5, div4);
    			append(div4, input2);

    			input2.value = ctx.url;

    			append(div4, t18);
    			append(div4, p3);
    			append(div9, t20);
    			append(div9, footer);
    			append(footer, span0);
    			append(span0, button0);
    			append(button0, t21);
    			append(footer, t22);
    			append(footer, span1);
    			append(span1, button1);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var auth_changes = {};
    			auth.$set(auth_changes);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(div7, t3);
    				}
    			}

    			if (changed.email && (input0.value !== ctx.email)) input0.value = ctx.email;
    			if (changed.apiKey) input1.value = ctx.apiKey;
    			if (changed.url && (input2.value !== ctx.url)) input2.value = ctx.url;

    			if ((!current || changed.fetching) && t21_value !== (t21_value = ctx.fetching ? 'Fetching user...' : 'Authenticate')) {
    				set_data(t21, t21_value);
    			}

    			if ((!current || changed.fetching || changed.email || changed.apiKey || changed.url) && button0_disabled_value !== (button0_disabled_value = ctx.fetching || !ctx.email || !ctx.apiKey || !ctx.url)) {
    				button0.disabled = button0_disabled_value;
    			}

    			if (changed.fetching) {
    				toggle_class(button0, "is-loading", ctx.fetching);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			auth.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			auth.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			ctx.auth_binding(null);

    			auth.$destroy(detaching);

    			if (detaching) {
    				detach(t0);
    				detach(div9);
    			}

    			if_block.d();
    			run_all(dispose);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	

      let authComponent;
      let fetching = false;
      let user = emptyUser;
      let authenticated = false;

      let email = '';
      let apiKey = '';
      let url = '';

      function onIsFechingChanged(e) {
        $$invalidate('fetching', fetching = e.detail);
      }

      function onUserChanged(e) {
        $$invalidate('user', user = e.detail);
      }

      function onAuthStatusChanged(e) {
        $$invalidate('authenticated', authenticated = e.detail);
      }

      function onEmailChanged(e) {
        $$invalidate('email', email = e.detail);
      }

      function onApiKeyChanged(e) {
        $$invalidate('apiKey', apiKey = e.detail);
      }

      function onUrlChanged(e) {
        $$invalidate('url', url = e.detail);
      }

      function save() {
        authComponent.setEmail(email);
        authComponent.setApiKey(apiKey);
        authComponent.setUrl(url);
      }

      function reset() {
        authComponent.reset();
        $$invalidate('email', email = '');
        $$invalidate('apiKey', apiKey = '');
        $$invalidate('url', url = '');
      }

      onMount(() => {
        $$invalidate('email', email = authComponent.getEmail());
        $$invalidate('apiKey', apiKey = authComponent.getApiKey());
        $$invalidate('url', url = authComponent.getUrl());
        $$invalidate('authenticated', authenticated = authComponent.isAuthenticated());
      });

    	function auth_binding($$component) {
    		authComponent = $$component;
    		$$invalidate('authComponent', authComponent);
    	}

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate('email', email);
    	}

    	function input1_input_handler() {
    		apiKey = this.value;
    		$$invalidate('apiKey', apiKey);
    	}

    	function input2_input_handler() {
    		url = this.value;
    		$$invalidate('url', url);
    	}

    	return {
    		authComponent,
    		fetching,
    		user,
    		authenticated,
    		email,
    		apiKey,
    		url,
    		onIsFechingChanged,
    		onUserChanged,
    		onAuthStatusChanged,
    		onEmailChanged,
    		onApiKeyChanged,
    		onUrlChanged,
    		save,
    		reset,
    		auth_binding,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	};
    }

    class AuthForm extends SvelteElement {
    	constructor(options) {
    		super();

    		this.shadowRoot.innerHTML = `<style>@import "bulma.css";
		/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0aEZvcm0uc3ZlbHRlIiwic291cmNlcyI6WyJBdXRoRm9ybS5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgaW1wb3J0IHsgb25Nb3VudCB9IGZyb20gJ3N2ZWx0ZSc7XG4gIGltcG9ydCB7IGVtcHR5VXNlciB9IGZyb20gJy4vc3RvcmUuanMnO1xuICBpbXBvcnQgQXV0aCBmcm9tICcuL0F1dGguc3ZlbHRlJztcblxuICBsZXQgYXV0aENvbXBvbmVudDtcbiAgbGV0IGZldGNoaW5nID0gZmFsc2U7XG4gIGxldCB1c2VyID0gZW1wdHlVc2VyO1xuICBsZXQgYXV0aGVudGljYXRlZCA9IGZhbHNlO1xuXG4gIGxldCBlbWFpbCA9ICcnO1xuICBsZXQgYXBpS2V5ID0gJyc7XG4gIGxldCB1cmwgPSAnJztcblxuICBmdW5jdGlvbiBvbklzRmVjaGluZ0NoYW5nZWQoZSkge1xuICAgIGZldGNoaW5nID0gZS5kZXRhaWw7XG4gIH1cblxuICBmdW5jdGlvbiBvblVzZXJDaGFuZ2VkKGUpIHtcbiAgICB1c2VyID0gZS5kZXRhaWw7XG4gIH1cblxuICBmdW5jdGlvbiBvbkF1dGhTdGF0dXNDaGFuZ2VkKGUpIHtcbiAgICBhdXRoZW50aWNhdGVkID0gZS5kZXRhaWw7XG4gIH1cblxuICBmdW5jdGlvbiBvbkVtYWlsQ2hhbmdlZChlKSB7XG4gICAgZW1haWwgPSBlLmRldGFpbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uQXBpS2V5Q2hhbmdlZChlKSB7XG4gICAgYXBpS2V5ID0gZS5kZXRhaWw7XG4gIH1cblxuICBmdW5jdGlvbiBvblVybENoYW5nZWQoZSkge1xuICAgIHVybCA9IGUuZGV0YWlsO1xuICB9XG5cbiAgZnVuY3Rpb24gc2F2ZSgpIHtcbiAgICBhdXRoQ29tcG9uZW50LnNldEVtYWlsKGVtYWlsKTtcbiAgICBhdXRoQ29tcG9uZW50LnNldEFwaUtleShhcGlLZXkpO1xuICAgIGF1dGhDb21wb25lbnQuc2V0VXJsKHVybCk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICBhdXRoQ29tcG9uZW50LnJlc2V0KCk7XG4gICAgZW1haWwgPSAnJztcbiAgICBhcGlLZXkgPSAnJztcbiAgICB1cmwgPSAnJztcbiAgfVxuXG4gIG9uTW91bnQoKCkgPT4ge1xuICAgIGVtYWlsID0gYXV0aENvbXBvbmVudC5nZXRFbWFpbCgpO1xuICAgIGFwaUtleSA9IGF1dGhDb21wb25lbnQuZ2V0QXBpS2V5KCk7XG4gICAgdXJsID0gYXV0aENvbXBvbmVudC5nZXRVcmwoKTtcbiAgICBhdXRoZW50aWNhdGVkID0gYXV0aENvbXBvbmVudC5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgfSk7XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuICBAaW1wb3J0IFwiYnVsbWEuY3NzXCI7XG48L3N0eWxlPlxuXG48c3ZlbHRlOm9wdGlvbnMgdGFnPVwiamlyYS1hdXRoLWZvcm1cIiAvPlxuXG48QXV0aFxuICBiaW5kOnRoaXM9e2F1dGhDb21wb25lbnR9XG4gIG9uOmppcmEtYXV0aC11c2VyLWNoYW5nZWQ9e29uVXNlckNoYW5nZWR9XG4gIG9uOmppcmEtYXV0aC11c2VyLWZldGNoaW5nLWNoYW5nZWQ9e29uSXNGZWNoaW5nQ2hhbmdlZH1cbiAgb246amlyYS1hdXRoLXN0YXR1cy1jaGFuZ2VkPXtvbkF1dGhTdGF0dXNDaGFuZ2VkfVxuICBvbjpqaXJhLWF1dGgtZW1haWwtY2hhbmdlZD17b25FbWFpbENoYW5nZWR9XG4gIG9uOmppcmEtYXV0aC1hcGkta2V5LWNoYW5nZWQ9e29uQXBpS2V5Q2hhbmdlZH1cbiAgb246amlyYS1hdXRoLXVybC1jaGFuZ2VkPXtvblVybENoYW5nZWR9IC8+XG5cbjxkaXYgY2xhc3M9XCJib3ggY2FyZCBjb250YWluZXIgaXMtZmx1aWQgaXMtcGFkZGluZ2xlc3NcIj5cbiAgPGhlYWRlciBjbGFzcz1cImNhcmQtaGVhZGVyXCI+XG4gICAgPHAgY2xhc3M9XCJjYXJkLWhlYWRlci10aXRsZVwiPlxuICAgICAgSmlSYSBhdXRoZW50aWNhdGlvblxuICAgIDwvcD5cbiAgPC9oZWFkZXI+XG4gIDxkaXYgY2xhc3M9XCJjYXJkLWNvbnRlbnRcIj5cbiAgICA8ZGl2IGNsYXNzPVwiY29udGVudFwiPlxuICAgICAgeyNpZiAhYXV0aGVudGljYXRlZH1cbiAgICAgIDxkaXYgY2xhc3M9XCJub3RpZmljYXRpb24gaXMtd2FybmluZ1wiPlxuICAgICAgICBBdXRoZW50aWNhdGlvbiBlcnJvciwgcGxlYXNlIGVudGVyIHZhbGlkIGRhdGEuXG4gICAgICA8L2Rpdj5cbiAgICAgIHs6ZWxzZX1cbiAgICAgIDxkaXYgY2xhc3M9XCJub3RpZmljYXRpb24gaXMtc3VjY2Vzc1wiPlxuICAgICAgICBZb3UgYXJlIGF1dGhlbnRpY2F0ZWQgYXMgQHt1c2VyLm5hbWV9LlxuICAgICAgPC9kaXY+XG4gICAgICB7L2lmfVxuICAgICAgPGRpdiBjbGFzcz1cImZvcm0taG9yaXpvbnRhbFwiID5cbiAgICAgICAgPGZpZWxkc2V0PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZFwiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwibGFiZWxcIiBmb3I9XCJqaXJhLWVtYWlsXCI+RS1tYWlsPC9sYWJlbD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250cm9sXCI+XG4gICAgICAgICAgICAgIDxpbnB1dCBiaW5kOnZhbHVlPXtlbWFpbH0gaWQ9XCJqaXJhLWVtYWlsXCIgbmFtZT1cImppcmEtZW1haWxcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiRS1tYWlsXCIgY2xhc3M9XCJpbnB1dCBpcy1tZWRpdW1cIiByZXF1aXJlZD1cIlwiPlxuICAgICAgICAgICAgICA8cCBjbGFzcz1cImhlbHBcIj5Zb3VyIEppUmEgbG9naW4gRS1tYWlsLjwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJsYWJlbFwiIGZvcj1cImppcmEtYXBpLWtleVwiPkFwaSBrZXk8L2xhYmVsPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRyb2xcIj5cbiAgICAgICAgICAgICAgPGlucHV0IGJpbmQ6dmFsdWU9e2FwaUtleX0gaWQ9XCJqaXJhLWFwaS1rZXlcIiBuYW1lPVwiamlyYS1hcGkta2V5XCIgdHlwZT1cInBhc3N3b3JkXCIgcGxhY2Vob2xkZXI9XCJBcGkga2V5XCIgY2xhc3M9XCJpbnB1dCBpcy1tZWRpdW1cIiByZXF1aXJlZD1cIlwiPlxuICAgICAgICAgICAgICA8cCBjbGFzcz1cImhlbHBcIj5DcmVhdGUgYW4gQVBJIHRva2VuIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vbWFuYWdlL2FwaS10b2tlbnNcIj5oZXJlPC9hPi48L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZFwiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwibGFiZWxcIiBmb3I9XCJqaXJhLXVybFwiPlVSTCB0byBKaVJhPC9sYWJlbD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250cm9sXCI+XG4gICAgICAgICAgICAgIDxpbnB1dCBiaW5kOnZhbHVlPXt1cmx9IGlkPVwiamlyYS11cmxcIiBuYW1lPVwiamlyYS11cmxcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiVVJMIHRvIEppUmFcIiBjbGFzcz1cImlucHV0IGlzLW1lZGl1bVwiIHJlcXVpcmVkPVwiXCI+XG4gICAgICAgICAgICAgIDxwIGNsYXNzPVwiaGVscFwiPlVzZSB0aGUgVVJMIHRvIHlvdXIgY29tcGFueSBKaVJhIGFjY291bnQgKEUuZzogaHR0cHM6Ly95b3VyLWNvbXBhbnkuamlyYS5uZXQpLjwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2ZpZWxkc2V0PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuICA8Zm9vdGVyIGNsYXNzPVwiY2FyZC1mb290ZXJcIj5cbiAgICA8c3BhbiBjbGFzcz1cImNhcmQtZm9vdGVyLWl0ZW1cIj5cbiAgICAgIDxidXR0b24gb246Y2xpY2s9e3NhdmV9IGNsYXNzPVwiYnV0dG9uIGlzLXByaW1hcnlcIiBjbGFzczppcy1sb2FkaW5nPXtmZXRjaGluZ30gZGlzYWJsZWQ9e2ZldGNoaW5nIHx8ICFlbWFpbCB8fCAhYXBpS2V5IHx8ICF1cmx9PntmZXRjaGluZyA/ICdGZXRjaGluZyB1c2VyLi4uJyA6ICdBdXRoZW50aWNhdGUnfTwvYnV0dG9uPlxuICAgIDwvc3Bhbj5cbiAgICA8c3BhbiBjbGFzcz1cImNhcmQtZm9vdGVyLWl0ZW1cIj5cbiAgICAgIDxidXR0b24gb246Y2xpY2s9e3Jlc2V0fSBjbGFzcz1cImJ1dHRvbiBpcy13aGl0ZVwiPmNsZWFyPC9idXR0b24+XG4gICAgPC9zcGFuPlxuICA8L2Zvb3Rlcj5cbjwvZGl2PiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUE0REUsUUFBUSxXQUFXLENBQUMifQ== */</style>`;

    		init(this, { target: this.shadowRoot }, instance$2, create_fragment$3, safe_not_equal, []);

    		if (options) {
    			if (options.target) {
    				insert(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("jira-auth-form", AuthForm);

    /* src/auth/AuthUserCard.svelte generated by Svelte v3.4.4 */

    const file$2 = "src/auth/AuthUserCard.svelte";

    // (52:0) {:else}
    function create_else_block$1(ctx) {
    	var div;

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "You are not logged in!";
    			div.className = "notification is-warning";
    			add_location(div, file$2, 52, 2, 1204);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    // (33:26) 
    function create_if_block_1(ctx) {
    	var div3, article, div0, figure, img, img_src_value, t0, div2, div1, p, strong, t1_value = ctx.user.displayName, t1, t2, small0, t3, t4_value = ctx.user.name, t4, t5, br, t6, small1, t7_value = ctx.user.emailAddress, t7;

    	return {
    		c: function create() {
    			div3 = element("div");
    			article = element("article");
    			div0 = element("div");
    			figure = element("figure");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			p = element("p");
    			strong = element("strong");
    			t1 = text(t1_value);
    			t2 = space();
    			small0 = element("small");
    			t3 = text("@");
    			t4 = text(t4_value);
    			t5 = space();
    			br = element("br");
    			t6 = space();
    			small1 = element("small");
    			t7 = text(t7_value);
    			img.src = img_src_value = ctx.user.avatar;
    			img.alt = "Image";
    			add_location(img, file$2, 37, 10, 842);
    			figure.className = "image is-48x48";
    			add_location(figure, file$2, 36, 8, 800);
    			div0.className = "media-left";
    			add_location(div0, file$2, 35, 6, 767);
    			add_location(strong, file$2, 43, 12, 999);
    			add_location(small0, file$2, 43, 48, 1035);
    			add_location(br, file$2, 44, 12, 1075);
    			add_location(small1, file$2, 45, 12, 1092);
    			add_location(p, file$2, 42, 10, 983);
    			div1.className = "content";
    			add_location(div1, file$2, 41, 8, 951);
    			div2.className = "media-content";
    			add_location(div2, file$2, 40, 6, 915);
    			article.className = "media";
    			add_location(article, file$2, 34, 4, 737);
    			div3.className = "box container is-fluid";
    			add_location(div3, file$2, 33, 2, 696);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, article);
    			append(article, div0);
    			append(div0, figure);
    			append(figure, img);
    			append(article, t0);
    			append(article, div2);
    			append(div2, div1);
    			append(div1, p);
    			append(p, strong);
    			append(strong, t1);
    			append(p, t2);
    			append(p, small0);
    			append(small0, t3);
    			append(small0, t4);
    			append(p, t5);
    			append(p, br);
    			append(p, t6);
    			append(p, small1);
    			append(small1, t7);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.user) && img_src_value !== (img_src_value = ctx.user.avatar)) {
    				img.src = img_src_value;
    			}

    			if ((changed.user) && t1_value !== (t1_value = ctx.user.displayName)) {
    				set_data(t1, t1_value);
    			}

    			if ((changed.user) && t4_value !== (t4_value = ctx.user.name)) {
    				set_data(t4, t4_value);
    			}

    			if ((changed.user) && t7_value !== (t7_value = ctx.user.emailAddress)) {
    				set_data(t7, t7_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div3);
    			}
    		}
    	};
    }

    // (29:0) {#if fetching }
    function create_if_block$1(ctx) {
    	var p, button;

    	return {
    		c: function create() {
    			p = element("p");
    			button = element("button");
    			button.className = "button is-warning is-loading is-small";
    			add_location(button, file$2, 30, 4, 596);
    			p.className = "box container is-fluid notification is-warning";
    			add_location(p, file$2, 29, 2, 533);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    			append(p, button);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	var t, if_block_anchor, current;

    	let auth_props = {};
    	var auth = new Auth({ props: auth_props, $$inline: true });

    	add_binding_callback(() => ctx.auth_binding(auth));
    	auth.$on("jira-auth-user-changed", ctx.onUserChanged);
    	auth.$on("jira-auth-user-fetching-changed", ctx.onIsFechingChanged);

    	function select_block_type(ctx) {
    		if (ctx.fetching) return create_if_block$1;
    		if (ctx.user.accountId) return create_if_block_1;
    		return create_else_block$1;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			auth.$$.fragment.c();
    			t = space();
    			if_block.c();
    			if_block_anchor = empty();
    			this.c = noop;
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(auth, target, anchor);
    			insert(target, t, anchor);
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var auth_changes = {};
    			auth.$set(auth_changes);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			auth.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			auth.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			ctx.auth_binding(null);

    			auth.$destroy(detaching);

    			if (detaching) {
    				detach(t);
    			}

    			if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	

      let authComponent;
      let fetching = false;
      let user = emptyUser;

      function onIsFechingChanged(e) {
        $$invalidate('fetching', fetching = e.detail);
      }

      function onUserChanged(e) {
        $$invalidate('user', user = e.detail);
      }

    	function auth_binding($$component) {
    		authComponent = $$component;
    		$$invalidate('authComponent', authComponent);
    	}

    	return {
    		authComponent,
    		fetching,
    		user,
    		onIsFechingChanged,
    		onUserChanged,
    		auth_binding
    	};
    }

    class AuthUserCard extends SvelteElement {
    	constructor(options) {
    		super();

    		this.shadowRoot.innerHTML = `<style>@import "bulma.css";
		/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0aFVzZXJDYXJkLnN2ZWx0ZSIsInNvdXJjZXMiOlsiQXV0aFVzZXJDYXJkLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxuICBpbXBvcnQgeyBlbXB0eVVzZXIgfSBmcm9tICcuL3N0b3JlLmpzJztcbiAgaW1wb3J0IEF1dGggZnJvbSAnLi9BdXRoLnN2ZWx0ZSc7XG5cbiAgbGV0IGF1dGhDb21wb25lbnQ7XG4gIGxldCBmZXRjaGluZyA9IGZhbHNlO1xuICBsZXQgdXNlciA9IGVtcHR5VXNlcjtcblxuICBmdW5jdGlvbiBvbklzRmVjaGluZ0NoYW5nZWQoZSkge1xuICAgIGZldGNoaW5nID0gZS5kZXRhaWw7XG4gIH1cblxuICBmdW5jdGlvbiBvblVzZXJDaGFuZ2VkKGUpIHtcbiAgICB1c2VyID0gZS5kZXRhaWw7XG4gIH1cbjwvc2NyaXB0PlxuXG48c3R5bGU+XG4gIEBpbXBvcnQgXCJidWxtYS5jc3NcIjtcbjwvc3R5bGU+XG5cbjxzdmVsdGU6b3B0aW9ucyB0YWc9XCJqaXJhLWF1dGgtdXNlci1jYXJkXCIvPlxuXG48QXV0aFxuICBiaW5kOnRoaXM9e2F1dGhDb21wb25lbnR9XG4gIG9uOmppcmEtYXV0aC11c2VyLWNoYW5nZWQ9e29uVXNlckNoYW5nZWR9XG4gIG9uOmppcmEtYXV0aC11c2VyLWZldGNoaW5nLWNoYW5nZWQ9e29uSXNGZWNoaW5nQ2hhbmdlZH0gLz5cblxueyNpZiBmZXRjaGluZyB9XG4gIDxwIGNsYXNzPVwiYm94IGNvbnRhaW5lciBpcy1mbHVpZCBub3RpZmljYXRpb24gaXMtd2FybmluZ1wiPlxuICAgIDxidXR0b24gY2xhc3M9XCJidXR0b24gaXMtd2FybmluZyBpcy1sb2FkaW5nIGlzLXNtYWxsXCI+PC9idXR0b24+XG4gIDwvcD5cbns6ZWxzZSBpZiB1c2VyLmFjY291bnRJZCB9XG4gIDxkaXYgY2xhc3M9XCJib3ggY29udGFpbmVyIGlzLWZsdWlkXCI+XG4gICAgPGFydGljbGUgY2xhc3M9XCJtZWRpYVwiPlxuICAgICAgPGRpdiBjbGFzcz1cIm1lZGlhLWxlZnRcIj5cbiAgICAgICAgPGZpZ3VyZSBjbGFzcz1cImltYWdlIGlzLTQ4eDQ4XCI+XG4gICAgICAgICAgPGltZyBzcmM9e3VzZXIuYXZhdGFyfSBhbHQ9XCJJbWFnZVwiPlxuICAgICAgICA8L2ZpZ3VyZT5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIm1lZGlhLWNvbnRlbnRcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnRcIj5cbiAgICAgICAgICA8cD5cbiAgICAgICAgICAgIDxzdHJvbmc+e3VzZXIuZGlzcGxheU5hbWV9PC9zdHJvbmc+IDxzbWFsbD5Ae3VzZXIubmFtZX08L3NtYWxsPlxuICAgICAgICAgICAgPGJyPlxuICAgICAgICAgICAgPHNtYWxsPnt1c2VyLmVtYWlsQWRkcmVzc308L3NtYWxsPlxuICAgICAgICAgIDwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2FydGljbGU+XG4gIDwvZGl2PlxuezplbHNlfVxuICA8ZGl2IGNsYXNzPVwibm90aWZpY2F0aW9uIGlzLXdhcm5pbmdcIj5cbiAgICBZb3UgYXJlIG5vdCBsb2dnZWQgaW4hXG4gIDwvZGl2Plxuey9pZn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBa0JFLFFBQVEsV0FBVyxDQUFDIn0= */</style>`;

    		init(this, { target: this.shadowRoot }, instance$3, create_fragment$4, safe_not_equal, []);

    		if (options) {
    			if (options.target) {
    				insert(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("jira-auth-user-card", AuthUserCard);

    const fetchIssue = async (key) => {
      await tick$1(100);
      try {
        const data = await fetchApi(`/rest/api/3/issue/${key}`);
        if (data.id) {
          const issue = {
            id: data.id,
            key: data.key,
            summary: data.fields.summary,
            status: data.fields.status.name,
            fetching: false,
            url: data.self.replace(/\/rest\/(.*)/,'') + `/browse/${data.key}`,
            data,
          };
          issuePool.add(issue);
          return Promise.resolve(issue);
        }
        return Promise.reject(`Error while fetching ticket: ${JSON.stringify(data)}`);
      } catch(error) {
        return Promise.reject(`Error while fetching ticket: ${error}`);
      }
    };

    const emptyIssue = {
      id: '',
      key: '',
      summary: '',
      status: '',
      fetching: false,
      url: '#',
      data: null,
    };

    const addToPool = (pool, issue) => {
      const ret = [...pool];
      const foundIndex = ret.findIndex((_issue) => _issue.key === issue.key);
      if (foundIndex > -1) {
        ret[foundIndex] = issue;
      } else {
        ret.push(issue);
      }
      return ret;
    };

    const issuePool = (() => {
      const { subscribe, set, update } = writable([]);

      return {
        subscribe,
        addByKey: (key) => update(pool => {
          fetchIssue(key)
            .then(issue => issuePool.add(issue))
            .catch(error => console.log(error));
          return addToPool(pool, {...emptyIssue, key });
        }),
        add: (issue) => update(pool => {
          return addToPool(pool, issue);
        }),
        getByKey: (key) => get(issuePool).find(_issue => _issue.key === key),
      };
    })();

    /* src/issue/Issue.svelte generated by Svelte v3.4.4 */

    const file$3 = "src/issue/Issue.svelte";

    // (43:2) {#if issue && issue.summary }
    function create_if_block_1$1(ctx) {
    	var span, t0, t1_value = ctx.issue.summary, t1;

    	return {
    		c: function create() {
    			span = element("span");
    			t0 = text(": ");
    			t1 = text(t1_value);
    			add_location(span, file$3, 43, 4, 892);
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t0);
    			append(span, t1);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.issue) && t1_value !== (t1_value = ctx.issue.summary)) {
    				set_data(t1, t1_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}
    		}
    	};
    }

    // (46:2) {#if issue && issue.status }
    function create_if_block$2(ctx) {
    	var em, t0, t1_value = ctx.issue.status, t1, t2;

    	return {
    		c: function create() {
    			em = element("em");
    			t0 = text("(");
    			t1 = text(t1_value);
    			t2 = text(")");
    			add_location(em, file$3, 46, 4, 966);
    		},

    		m: function mount(target, anchor) {
    			insert(target, em, anchor);
    			append(em, t0);
    			append(em, t1);
    			append(em, t2);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.issue) && t1_value !== (t1_value = ctx.issue.status)) {
    				set_data(t1, t1_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(em);
    			}
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	var a, strong, t0, t1, t2, a_href_value;

    	var if_block0 = (ctx.issue && ctx.issue.summary) && create_if_block_1$1(ctx);

    	var if_block1 = (ctx.issue && ctx.issue.status) && create_if_block$2(ctx);

    	return {
    		c: function create() {
    			a = element("a");
    			strong = element("strong");
    			t0 = text(ctx.key);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			this.c = noop;
    			add_location(strong, file$3, 41, 2, 833);
    			a.href = a_href_value = ctx.issue ? ctx.issue.url : '#';
    			a.target = "_blank";
    			a.className = "tag is-rounded";
    			toggle_class(a, "is-warning", ctx.$isAuthenticated && ctx.issue && ctx.issue.id);
    			add_location(a, file$3, 36, 0, 692);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, a, anchor);
    			append(a, strong);
    			append(strong, t0);
    			append(a, t1);
    			if (if_block0) if_block0.m(a, null);
    			append(a, t2);
    			if (if_block1) if_block1.m(a, null);
    		},

    		p: function update(changed, ctx) {
    			if (changed.key) {
    				set_data(t0, ctx.key);
    			}

    			if (ctx.issue && ctx.issue.summary) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(a, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (ctx.issue && ctx.issue.status) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(a, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if ((changed.issue) && a_href_value !== (a_href_value = ctx.issue ? ctx.issue.url : '#')) {
    				a.href = a_href_value;
    			}

    			if ((changed.$isAuthenticated || changed.issue)) {
    				toggle_class(a, "is-warning", ctx.$isAuthenticated && ctx.issue && ctx.issue.id);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(a);
    			}

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $isAuthenticated;

    	validate_store(isAuthenticated, 'isAuthenticated');
    	subscribe($$self, isAuthenticated, $$value => { $isAuthenticated = $$value; $$invalidate('$isAuthenticated', $isAuthenticated); });

      let { key } = $$props;

      let issue = emptyIssue;

      issuePool.subscribe(pool => {
        $$invalidate('issue', issue = issuePool.getByKey(key));
      });

      isAuthenticated.subscribe(v => {
        if (v) {
          $$invalidate('issue', issue = issuePool.getByKey(key));
        } else {
          $$invalidate('issue', issue = emptyIssue);
        }
      });

      onMount(async () => {
        await tick();
        issuePool.addByKey(key);
      });

    	const writable_props = ['key'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<jira-issue> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('key' in $$props) $$invalidate('key', key = $$props.key);
    	};

    	return { key, issue, $isAuthenticated };
    }

    class Issue extends SvelteElement {
    	constructor(options) {
    		super();

    		this.shadowRoot.innerHTML = `<style>@import "bulma.css";
		/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXNzdWUuc3ZlbHRlIiwic291cmNlcyI6WyJJc3N1ZS5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgaW1wb3J0IHsgY3JlYXRlRXZlbnREaXNwYXRjaGVyLCBvbk1vdW50LCB0aWNrIH0gZnJvbSAnc3ZlbHRlJztcbiAgaW1wb3J0IHsgZ2V0IH0gZnJvbSAnc3ZlbHRlL3N0b3JlJztcbiAgaW1wb3J0IHsgaXNzdWVQb29sLCBlbXB0eUlzc3VlIH0gZnJvbSAnLi9zdG9yZS5qcyc7XG4gIGltcG9ydCB7IGlzQXV0aGVudGljYXRlZCB9IGZyb20gJy4uL2F1dGgvc3RvcmUuanMnO1xuXG4gIGNvbnN0IGRpc3BhdGNoID0gY3JlYXRlRXZlbnREaXNwYXRjaGVyKCk7XG5cbiAgZXhwb3J0IGxldCBrZXk7XG5cbiAgbGV0IGlzc3VlID0gZW1wdHlJc3N1ZTtcblxuICBpc3N1ZVBvb2wuc3Vic2NyaWJlKHBvb2wgPT4ge1xuICAgIGlzc3VlID0gaXNzdWVQb29sLmdldEJ5S2V5KGtleSk7XG4gIH0pO1xuXG4gIGlzQXV0aGVudGljYXRlZC5zdWJzY3JpYmUodiA9PiB7XG4gICAgaWYgKHYpIHtcbiAgICAgIGlzc3VlID0gaXNzdWVQb29sLmdldEJ5S2V5KGtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlzc3VlID0gZW1wdHlJc3N1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIG9uTW91bnQoYXN5bmMgKCkgPT4ge1xuICAgIGF3YWl0IHRpY2soKTtcbiAgICBpc3N1ZVBvb2wuYWRkQnlLZXkoa2V5KTtcbiAgfSk7XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuICBAaW1wb3J0IFwiYnVsbWEuY3NzXCI7XG48L3N0eWxlPlxuXG48c3ZlbHRlOm9wdGlvbnMgdGFnPVwiamlyYS1pc3N1ZVwiLz5cblxuPGFcbiAgaHJlZj17aXNzdWUgPyBpc3N1ZS51cmwgOiAnIyd9XG4gIHRhcmdldD1cIl9ibGFua1wiXG4gIGNsYXNzPVwidGFnIGlzLXJvdW5kZWRcIlxuICBjbGFzczppcy13YXJuaW5nPXskaXNBdXRoZW50aWNhdGVkICYmIGlzc3VlICYmIGlzc3VlLmlkfT5cbiAgPHN0cm9uZz57a2V5fTwvc3Ryb25nPlxuICB7I2lmIGlzc3VlICYmIGlzc3VlLnN1bW1hcnkgfVxuICAgIDxzcGFuPjoge2lzc3VlLnN1bW1hcnl9PC9zcGFuPlxuICB7L2lmfVxuICB7I2lmIGlzc3VlICYmIGlzc3VlLnN0YXR1cyB9XG4gICAgPGVtPih7aXNzdWUuc3RhdHVzfSk8L2VtPlxuICB7L2lmfVxuPC9hPiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUErQkUsUUFBUSxXQUFXLENBQUMifQ== */</style>`;

    		init(this, { target: this.shadowRoot }, instance$4, create_fragment$5, safe_not_equal, ["key"]);

    		const { ctx } = this.$$;
    		const props = this.attributes;
    		if (ctx.key === undefined && !('key' in props)) {
    			console.warn("<jira-issue> was created without expected prop 'key'");
    		}

    		if (options) {
    			if (options.target) {
    				insert(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["key"];
    	}

    	get key() {
    		return this.$$.ctx.key;
    	}

    	set key(key) {
    		this.$set({ key });
    		flush();
    	}
    }

    customElements.define("jira-issue", Issue);

    const processText = (text) => {
      const matches = /\[JIRA\:([A-Z]+\-[0-9]+)\]/gi.exec(text);
      if (!matches) {
        return text;
      } else {
        text = text.replace(matches[0], `<jira-issue key="${matches[1]}"></jira-issue>`);
      }
      return processText(text);
    };

    /* src/text/TextWrapper.svelte generated by Svelte v3.4.4 */

    const file$4 = "src/text/TextWrapper.svelte";

    function create_fragment$6(ctx) {
    	var div0, slot, t, div1, dispose;

    	return {
    		c: function create() {
    			div0 = element("div");
    			slot = element("slot");
    			t = space();
    			div1 = element("div");
    			this.c = noop;
    			add_location(slot, file$4, 28, 2, 636);
    			div0.className = "jira-text--original";
    			add_location(div0, file$4, 27, 0, 600);
    			div1.className = "jira--text";
    			add_location(div1, file$4, 30, 0, 685);
    			dispose = listen(slot, "slotchange", ctx.processSlot);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div0, anchor);
    			append(div0, slot);
    			insert(target, t, anchor);
    			insert(target, div1, anchor);
    			div1.innerHTML = ctx.processedText;
    		},

    		p: function update(changed, ctx) {
    			if (changed.processedText) {
    				div1.innerHTML = ctx.processedText;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div0);
    				detach(t);
    				detach(div1);
    			}

    			dispose();
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	

      let processedText = '';

      function processSlot(e) {
        e.target.assignedNodes().map(el => {
          if (el.nodeType === Node.TEXT_NODE) {
            $$invalidate('processedText', processedText += processText(el.textContent));
          } else if (el.nodeType === Node.ELEMENT_NODE) {
            $$invalidate('processedText', processedText += processText(el.outerHTML));
          } else {
            $$invalidate('processedText', processedText += el.outerHTML);
          }
        });
      }

    	return { processedText, processSlot };
    }

    class TextWrapper extends SvelteElement {
    	constructor(options) {
    		super();

    		this.shadowRoot.innerHTML = `<style>.jira-text--original{display:none}
		/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGV4dFdyYXBwZXIuc3ZlbHRlIiwic291cmNlcyI6WyJUZXh0V3JhcHBlci5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgaW1wb3J0IHsgb25Nb3VudCwgdGljayB9IGZyb20gJ3N2ZWx0ZSc7XG4gIGltcG9ydCB7IHByb2Nlc3NUZXh0IH0gZnJvbSAnLi4vdXRpbHMvaGVscGVycy5qcyc7XG5cbiAgbGV0IHByb2Nlc3NlZFRleHQgPSAnJztcblxuICBmdW5jdGlvbiBwcm9jZXNzU2xvdChlKSB7XG4gICAgZS50YXJnZXQuYXNzaWduZWROb2RlcygpLm1hcChlbCA9PiB7XG4gICAgICBpZiAoZWwubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFKSB7XG4gICAgICAgIHByb2Nlc3NlZFRleHQgKz0gcHJvY2Vzc1RleHQoZWwudGV4dENvbnRlbnQpO1xuICAgICAgfSBlbHNlIGlmIChlbC5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREUpIHtcbiAgICAgICAgcHJvY2Vzc2VkVGV4dCArPSBwcm9jZXNzVGV4dChlbC5vdXRlckhUTUwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvY2Vzc2VkVGV4dCArPSBlbC5vdXRlckhUTUw7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbjwvc2NyaXB0PlxuXG48c3R5bGU+XG4gIC5qaXJhLXRleHQtLW9yaWdpbmFsIHtcbiAgICBkaXNwbGF5OiBub25lO1xuICB9XG48L3N0eWxlPlxuXG48c3ZlbHRlOm9wdGlvbnMgdGFnPVwiamlyYS10ZXh0LXdyYXBwZXJcIiAvPlxuXG48ZGl2IGNsYXNzPVwiamlyYS10ZXh0LS1vcmlnaW5hbFwiPlxuICA8c2xvdCBvbjpzbG90Y2hhbmdlPXtwcm9jZXNzU2xvdH0+PC9zbG90PlxuPC9kaXY+XG48ZGl2IGNsYXNzPVwiamlyYS0tdGV4dFwiPlxuICB7QGh0bWwgcHJvY2Vzc2VkVGV4dH1cbjwvZGl2PiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFvQkUsb0JBQW9CLEFBQUMsQ0FBQyxBQUNwQixPQUFPLENBQUUsSUFBSSxBQUNmLENBQUMifQ== */</style>`;

    		init(this, { target: this.shadowRoot }, instance$5, create_fragment$6, safe_not_equal, []);

    		if (options) {
    			if (options.target) {
    				insert(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("jira-text-wrapper", TextWrapper);

    var main = {
      Auth,
      AuthForm,
      AuthUserCard,
      Issue,
      TextWrapper,
      Styles,
      Config,
    };
    // import App from './App.svelte';

    // const app = new App({
    // 	target: document.body,
    // 	props: {
    // 		name: 'world'
    // 	}
    // });

    // export default app;

    return main;

}());
//# sourceMappingURL=bundle.js.map
