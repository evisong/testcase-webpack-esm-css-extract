import { createAppA } from './app-a.js';
import { createAppB } from './app-b.js';

const a = createAppA();
const b = createAppB();
const MyApp = `${a} ${b}`;

export default MyApp;
