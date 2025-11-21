import { useState } from "react";

function Login({ setToken }: { setToken: (t: strnig) => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        const res = await fetch("http://localhost:4000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json",},
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (data.token) {
			// Save token here
            localStorage.setItem("token", data.token);
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

export default Login;