import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// Ensures cross-platform compatibility across Expo Go, Web, and Native standalone builds.
registerRootComponent(App);
