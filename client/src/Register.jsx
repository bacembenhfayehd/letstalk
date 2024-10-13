import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./Usercontext";


export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const {setUsername:setLoggedinUsername,setId} = useContext(UserContext)

  async function register(ev) {
    ev.preventDefault();
    try {
      const {data} = await axios.post("/register", { username, password });
      setLoggedinUsername(username);
      setId(data.id)
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={register}>
        <input
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          type="text"
          className=" block w-full rounded-sm p-2 mb-2 border"
          placeholder="username"
        />
        <input
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          type="password"
          className="block w-full rounded-sm p-2 mb-2 border"
          placeholder="password"
        />
        <button className="bg-blue-500 text-white w-full block rounded-sm p-2">
          Register
        </button>
      </form>
    </div>
  );
}
