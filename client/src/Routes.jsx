import { useContext } from "react";
import { UserContext } from "./Usercontext";
import RegisterLogin from "./RegisterLogin";
import Chat from "./Chat";


export default function Routes(){
    const {username,id} = useContext(UserContext)

    if(username){
        return <Chat/>
    }
    return(
         
        <RegisterLogin/>
    )
}