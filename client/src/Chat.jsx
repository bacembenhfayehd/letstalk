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
      if (messageData.sender === selectedUser){
        setNewMessages(prev => ([...prev ,{...messageData}]))
      }  
    }
  }

  function logout(){
    axios.post('/logout')
    .then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
  
    })
  }
 

  const sendMessage = (ev , file = null) => {
    if(ev) ev.preventDefault()
    //console.log('sending')
    ws.send(JSON.stringify({
       destinataire : selectedUser,
       messageEnvoyee : newmessage,
       file  
    }))
    if(file){
      axios.get('/msjs/' + selectedUser).then(res => {
        setNewMessage(res.data)
      })
    }else{
      setNewMessage('');
    setNewMessages(prev => ([...prev ,{messageEnvoyee:newmessage,
      sender:id,
      destinataire:selectedUser,
      _id:Date.now()  //random id to get all messages
    }]))
    } 
  }

 /* function sendFolder(ev){
    console.log(ev.target.files);
  }*/

    function sendFolder(ev) {
      const reader = new FileReader();
      reader.readAsDataURL(ev.target.files[0]);
      reader.onload = () => {
        sendMessage(null, {
          name: ev.target.files[0].name,
          data: reader.result,
        });
      };
    }


useEffect(() => {

  const div = underMsjs.current;
  if (div){
    div.scrollIntoView({behavior:'smooth' , block:'end'})
  }

},[messages])





useEffect(() => {
  axios.get('/users')
  .then(res => {
    const offlineUsersTab = res.data.filter(p => p._id !== id).filter(p => !Object.keys(onlineusers).includes(p._id))
    const offlineUsersObject = {};
    offlineUsersTab.forEach(p => {
      offlineUsersObject[p._id] = p;
    })
    setOfflineUsers(offlineUsersObject);
    
  })

},[onlineusers])



useEffect(() => {
  if(selectedUser){
    axios.get('/msjs/' + selectedUser)
    .then(res => {
      setNewMessages(res.data);
    })
  }
},[selectedUser])

const onlinePeopleExceptMe = { ...onlineusers };
delete onlinePeopleExceptMe[id];

const messagesWithoutRepaeat = uniqBy(messages,'_id')

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
          {messagesWithoutRepaeat.map(message => (
                  <div key={message._id} className={(message.sender === id ? 'text-right': 'text-left')}>
                    <div className={"text-left inline-block p-2 my-2 rounded-md text-sm " +(message.sender === id ? 'bg-blue-500 text-white':'bg-white text-gray-500')}>
                      {message.messageEnvoyee}
                      {message.file && (
                        <div className="">
                          <a target="_blank" className="flex items-center gap-1 border-b" href={axios.defaults.baseURL + '/uploads/' + message.file}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
                            </svg>
                            {message.file}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            <div ref={underMsjs}></div>
          </div>
          </div>
          
        )}
        </div>

        {!!selectedUser && (

<form className="flex mx-2 gap-2" onSubmit={sendMessage}>
<input
  type="text"
  value={newmessage}
  onChange={ev => setNewMessage(ev.target.value)}
  placeholder="type here ..."
  className="bg-white p-2 border flex-grow  rounded-s-xl  "
/>
<label className="bg-gray-200 p-2 text-gray-500 cursor-pointer rounded-sm border border-gray-300" onChange={sendFolder}>
  <input type="file" className="hidden" />
<svg xmlns="http://www.w3.org/2000/svg"
 fill="none"
  viewBox="0 0 24 24"
   strokeWidth={1.5}
    stroke="currentColor"
     className="size-6">
  <path strokeLinecap="round"
   strokeLinejoin="round"
    d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
</svg>


</label>
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
