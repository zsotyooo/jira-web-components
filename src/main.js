import Config from './global/Config.svelte';
import Styles from './global/Styles.svelte';
import Auth from './auth/Auth.svelte';
import AuthForm from './auth/AuthForm.svelte';
import AuthUserCard from './auth/AuthUserCard.svelte';
import Issue from './issue/Issue.svelte';
import TextWrapper from './text/TextWrapper.svelte';

export default {
  Auth,
  AuthForm,
  AuthUserCard,
  Issue,
  TextWrapper,
  Styles,
  Config,
}
// import App from './App.svelte';

// const app = new App({
// 	target: document.body,
// 	props: {
// 		name: 'world'
// 	}
// });

// export default app;