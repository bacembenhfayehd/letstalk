import { useEffect, useState } from "react";

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlineusers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4040");
    setWs(ws);
    ws.addEventListener("message", handelMessage);
  }, []);

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
    }
  }

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 p-2 ">
        <div
          className="text-blue-600 font-bold flex gap-2
            "
        >
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
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
            />
          </svg>
          Telliq
        </div>

        {Object.keys(onlineusers).map((userId) => (
          <div key={userId} className="border-b border-gray-100 p-2">
            {onlineusers[userId]}
          </div>
        ))}
      </div>
      <div className=" flex flex-col bg-blue-300 w-2/3 p-2">
        <div className="flex-grow">messages selected from person</div>
        <div className="flex mx-2 gap-2">
          <input
            type="text"
            placeholder="type here ..."
            className="bg-white p-2 border flex-grow  rounded-s-xl  "
          />
          <button className="bg-blue-500 p-2 text-white rounded-sm">
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
        </div>
      </div>
    </div>
  );
}
