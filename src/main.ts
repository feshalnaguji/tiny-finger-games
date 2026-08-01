import './style.css';
import { App } from './app';

const root = document.getElementById('app');
if (!root) throw new Error('missing #app root');

new App(root).start();
