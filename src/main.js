/**
 * Entry point of the application.
 * 
 * - Imports the global base CSS styles.
 * - Imports and initializes the router to handle hash-based navigation.
 */

import './styles/base.css';
import './styles/about.css';
import './styles/changePassword.css';
import './styles/dashboard.css';
import './styles/home.css';
import './styles/login.css';
import './styles/register.css';
import './styles/profile.css'
import './styles/recover.css';
import { initRouter } from './routes/route.js';

/**
 * Initialize the client-side router.
 * This sets up listeners and renders the correct view on app start.
 */
initRouter();
