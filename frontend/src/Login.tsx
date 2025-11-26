import { useState } from "react";

interface LoginProps {
	setToken: (t: string) => void;
}

/**
 * Login component allows users to enter their username and password,
 * sends a login request to the backend, and stores the JWT token on success.
 * 
 * @param setToken - Function provided by the parent component to store
 *   the JWT token after successful login.
 */
function Login({ setToken }: LoginProps) {
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
			console.log("the token is: ", data.token);
			localStorage.setItem("token", data.token);

			// Save username so ChatApp can use it
			console.log("the username is: ", data.user.username)
			localStorage.setItem("username", username);

			// Inform parent component about the new token
			setToken(data.token);
		} else {
			alert("Login failed");
		}
	};

	return (
		<div className="p-4 text-white">
			<form className="max-w-sm mx-auto p-4">
				<div className="flex items-center border-b border-teal-500 py-2">

					<input
						className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
						type="text"
						placeholder="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>

				</div>
				<div className="flex items-center border-b border-teal-500 py-2">

					<input
						className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

				    <button
						className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded"
						type="button"
						onClick={handleLogin}
					>
      					Sign Up
    				</button>
				
				</div>
			</form>
		</div>
  );
}

// Export the Login component for use in other parts of the app
export default Login;