import { useState } from "react";
import Login from "./Login";
import ChatApp from "./ChatApp";

// Main React component
function App() {

  // React state variabless
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  if (!token) {
    return <Login setToken={ setToken } />;
  }

  return <ChatApp token={ token } />;
}

export default App;
