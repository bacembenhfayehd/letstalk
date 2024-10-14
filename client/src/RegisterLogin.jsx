import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./Usercontext";


export default function RegisterLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const[loggingOrregister,setLoggingOrRegister] = useState('register')
  const {setUsername:setLoggedinUsername,setId} = useContext(UserContext)

  async function register(ev) {
    ev.preventDefault();
    const url = loggingOrregister === 'register' ? 'http://localhost:4040/register' : 'http://localhost:4040/login'
      const {data} = await axios.post(url, { username, password });
      setLoggedinUsername(username);
      setId(data.id)
   
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
          {loggingOrregister === 'register' ? 'Register' : 'Login'}
        </button>
        <div className="mt-2 text-center">
          {loggingOrregister === 'register' && (
            <div>
              Already a member?
             <button onClick={() => setLoggingOrRegister('login')}>Login here</button>
              </div>
          )}
          {loggingOrregister === 'login' && (
            <div>
              Dont have an acoount?
             <button onClick={() => setLoggingOrRegister('register')} >Register</button>
             
              </div>
          )}
         </div>
      </form>
    </div>
  );
}
