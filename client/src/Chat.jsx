import { useContext, useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "./Usercontext";
import {uniqBy} from 'lodash'
import axios from "axios";
import Users from "./Users";

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlineusers, setOnlineUsers] = useState({});
  const [onfflineusers, setOfflineUsers] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const { id, username , setId,setUsername } = useContext(UserContext);
  const [newmessage,setNewMessage] = useState('');
  const [messages,setNewMessages] = useState([]);
  const underMsjs = useRef();
  useEffect(() => {
    connectToWs()
    
  }, []);

  function connectToWs(){
    const ws = new WebSocket("ws://localhost:4040");
    setWs(ws);
    ws.addEventListener("message", handelMessage);
    ws.addEventListener("close" , () => {
      setTimeout(() => {
        console.log('oups we re trying to reconnect ...')
        connectToWs();
      },1000) 
    })

  }
  

  

  function onlinePeople(peopleTab) {
    const people = {};

    peopleTab.forEach(({ userId, username }) => {
      people[userId] = username;
    });

    setOnlineUsers(people);
  }

  function handelMessage(ev) {
    const messageData = JSON.parse(ev.data);
    if ("online" in messageData) {
      onlinePeople(messageData.online);
    }else if ("messageEnvoyee" in messageData) {
      setNewMessages(prev => ([...prev ,{...messageData}]))
    }
  }

  const onlinePeopleExceptMe = { ...onlineusers };
  delete onlinePeopleExceptMe[id];

  const messagesWithoutRepaeat = uniqBy(messages,'_id')

  const senMessage = (ev) => {
    ev.preventDefault();
    console.log('sending')
    ws.send(JSON.stringify({
       destinataire : selectedUser,
       messageEnvoyee : newmessage
      
    }))

    setNewMessage('');
    setNewMessages(prev => ([...prev ,{messageEnvoyee:newmessage, isOur:true,
      sender:id,
      destinataire:selectedUser,
      _id:Date.now()  //random id to get all messages
    }]))
  }


useEffect(() => {

  const div = underMsjs.current;
  if (div){
    div.scrollIntoView({behavior:'smooth' , block:'end'})
  }

},[messages])


useEffect(() => {
  if(selectedUser){
    axios.get('/msjs/' + selectedUser)
    .then(res => {
      setNewMessages(res.data);
    })
  }
},[selectedUser])


useEffect(() => {
  axios.get('/users')
  .then(res => {
    const offlineUsersTab = res.data.filter(p => p._id !== id).filter(p => !Object.keys(onlineusers).includes(p._id))
    const offlineUsersObject = {};
    offlineUsersTab.forEach(p => {
      offlineUsersObject[p._id] = p;
    })
    setOfflineUsers(offlineUsersObject);
    //console.log({offlineUsersTab,offlineUsersObject});
  })

},[onlineusers])

function logout(){
  axios.post('/logout')
  .then(() => {
    setWs(null);
    setId(null);
    setUsername(null);

  })
}

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 flex flex-col  ">
        <div className="flex-grow">
        <Logo />

{Object.keys(onlinePeopleExceptMe).map((userId) => (
  <Users  key={userId}
  id={userId}
  online={true}
  username={onlinePeopleExceptMe[userId]}
  onClick={() => {setSelectedUser(userId);console.log({userId})}}
  selected={userId === selectedUser} />
))}
{Object.keys(onfflineusers).map((userId) => (
  <Users  key={userId}
  id={userId}
  online={false}
  username={onfflineusers[userId].username}
  onClick={() => {setSelectedUser(userId);console.log({userId})}}
  selected={userId === selectedUser} />
))}
        </div>
        <div className="p-2 text-center flex items-center justify-center">
          <span className="text-sm mr-2 text-gray-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
            {username}</span>
          <button onClick={logout} className="text-gray-700 text-sm bg-blue-300 px-2 py-1 border rounded-sm">logout</button>
        </div>
      </div>
      <div className=" flex flex-col bg-blue-300 w-2/3 p-2">
        <div className="flex-grow">{!selectedUser && (
          <div className="flex h-full flex-grow items-center justify-center">
            <div className="text-gray-700">&larr;please select a person from the sidebar</div>
            </div>
        )}

        {!!selectedUser && (
          <div className="relative h-full">
          <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
            {messagesWithoutRepaeat.map((message) => (
              <div key={message._id} className={(message.sender === id ? 'text-right' : 'text-left')}>
              <div className={" text-left inline-block p-2 my-2 rounded-sm text-sm " +(message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-700')}>
              {message.messageEnvoyee}
              </div>
              </div>
             
            ))}
            <div ref={underMsjs}></div>
          </div>
          </div>
          
        )}
        </div>

        {!!selectedUser && (

<form className="flex mx-2 gap-2" onSubmit={senMessage}>
<input
  type="text"
  value={newmessage}
  onChange={ev => setNewMessage(ev.target.value)}
  placeholder="type here ..."
  className="bg-white p-2 border flex-grow  rounded-s-xl  "
/>
<button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
    />
  </svg>
</button>
</form>

        )}
        
      </div>
    </div>
  );
}
