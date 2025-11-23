import { useState } from "react";

/**
 * Login component allows users to enter their username and password,
 * sends a login request to the backend, and stores the JWT token on success.
 * 
 * @param setToken - Function provided by the parent component to store
 *   the JWT token after successful login.
 */
function Login({ setToken }: { setToken: (t: string) => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

	/**
   * Handles login when user clicks the button:
   * 1. Sends POST request to backend with username and password
   * 2. If successful, saves JWT token in localStorage
   * 3. Calls setToken to inform parent component
   * 4. Alerts user if login fails
   */
    const handleLogin = async () => {
        const res = await fetch("http://localhost:4000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json",},
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (data.token) {
			// Save token in localStorage
            localStorage.setItem("token", data.token);
			// Inform parent component about the new token
            setToken(data.token);
        } else {
            alert("Login failed");
        }
    };


    return (
    <div className="p-4 text-white">
    <h1 className="text-xl mb-4">Login</h1>
    
    <input
        className="block mb-2 text-black"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        />

    <input
        className="block mb-2 text-black"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
    />

    <button onClick={handleLogin} className="bg-blue-600 px-4 py-2 rounded">
        Login
    </button>
    </div>
  );
}

// Export the Login component for use in other parts of the app
export default Login;