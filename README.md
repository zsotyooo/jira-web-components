# Jira web component library

Web component library for JIRA.

Currently under development. Please keep in mind that it will change later.

## Teaser
![Screen capture](https://raw.githubusercontent.com/zsotyooo/jira-web-components/master/public/screencapture.png)

## Get started

Install package...

```bash
npm install jira-web-components --save
```

Or use it from CDN...
```html
<script src="https://unpkg.com/jira-web-components@0.4.0/public/bundle.js"></script>
```

In order to be able to communicate with JIRA you need a CORS proxy server.
Please go to [cors-anywhere](https://www.npmjs.com/package/cors-anywhere) for more information.

Example which can be hosted on heroku:
```js
// server.js
const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 4444;
const originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
const originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);

function parseEnvList(env) {
  if (!env) {
    return [];
  }
  return env.split(',');
}

const corsAnywhere = require('cors-anywhere');
corsAnywhere.createServer({
  originBlacklist,
  originWhitelist,
  removeHeaders: [
    'cookie',
    'cookie2',
    // Strip Heroku-specific headers
    'x-heroku-queue-wait-time',
    'x-heroku-queue-depth',
    'x-heroku-dynos-in-use',
    'x-request-start',
  ],
  redirectSameOrigin: true,
  httpProxyOptions: {
    xfwd: false,
  },
}).listen(port, host, function() {
  console.log('Running CORS proxy on ' + host + ':' + port);
});
```
## Usage

### Config

You have to have it somewhere on the top of the HTML code.

You also have to specify your CORS proxy server URL by setting the `cors` param.

```html
<jira-global-config cors="http://localhost:4444"></jira-global-config>
```

### Visual Components

These components render actual content (see functional components later).

#### Authentication form

```html
<jira-auth-form></jira-auth-form>
```

#### Auth user card

```html
<jira-auth-user-card></jira-auth-user-card>
```

#### Inline issue ticket

```html
<jira-issue key="EX-123"></jira-issue>
```

#### Text wrapper

Replaces the `[JIRA:EX-123]` issue ticket codes with `<jira-issue>` components.
```html
<jira-text-wrapper>
    <p>Lorem ipsum [JIRA:EX-123] dolor sit [JIRA:EX-456] amet.</p>
    Lorem ipsum [JIRA:EX-123] dolor sit [JIRA:EX-456] amet.
    <p>Lorem ipsum [JIRA:EX-123] dolor sit [JIRA:EX-456] amet.</p>
</jira-text-wrapper>
```

### Functional Components

These components only serve functional purpose by exposing public methods and emitting events. You can use them for you own componment implementations.

Example:
```html
<!-- index.html -->
<jira-auth id="jira-auth"></jira-auth>
<!-- ... -->
<script>
  var auth = document.getElementById('jira-auth');
  auth.addEventListener('jira-auth-status-changed', function(e){
    console.log(e.detail === true ? 'You are logged in.' : 'You are logged out');
  });
  auth.setEmail('me@my-company.com');
  auth.setApiKey('[MY_API_KEY_FOR_JIRA]');
  auth.setUrl('https://my-company.atlassian.net');
</script>
```

### Auth

You can handle the authentication vith this component.

```html
<jira-auth></jira-auth>
```

Methods:
* `setEmail` = (v: `string`) => `void`;
* `setApiKey` = (v: `string`) => `void`;
* `setUrl` = (v: `string`) => `void`;
* `getUserData` = () => `object`;
* `getEmail` = () => `string`;
* `getApiKey` = () => `string`;
* `getUrl` = () => `string`;
* `isAuthenticated` = () => `boolean`;
* `reset` = () => `void`;

Events:
* `'jira-auth-user-changed'`: {detail: `object`}
* `'jira-auth-user-fetching-changed'`: {detail: `boolean`} - It's true when the data is being fetched from the API.
* `'jira-auth-status-changed'`: {detail: `boolean`}
* `'jira-auth-email-changed'`: {detail: `string`}
* `'jira-auth-apikey-changed'`: {detail: `string`}
* `'jira-auth-url-changed'`: {detail: `string`}

Made with Love and [svelte](https://svelte.dev/)

## License

[MIT](https://opensource.org/licenses/MIT)
