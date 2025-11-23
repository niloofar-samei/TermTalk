import { useState } from "react";
import Login from "./Login";
import ChatApp from "./ChatApp";

/**
 * Main App component
 * 
 * Handles:
 *  - JWT token state management (keep track of JWT token)
 *  - Route protection. Rendering Login or ChatApp (renders Login if no token)
 *  - Passing the token as a prop to the ChatApp component once logged in
 */
function App() {

	// React state to store JWT token
	// Initialize from localStorage if user has already logged in previously
	const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

	/**
	 * Route protection:
	 * If no token is present, render the Login component.
	 * Pass the setToken function as a prop so that Login can update the token on successful login.
	 */
	if (!token) {
		return <Login setToken={ setToken } />;
	}

	/**
	 * If a token exists:
	 * Render the ChatApp component and pass the JWT token as a prop
	 * ChatApp uses this token to fetch messages and perform authenticated actions.
	 */
	return <ChatApp token={ token } />;
}

// Export the App component so it can be used in index.tsx
export default App;
