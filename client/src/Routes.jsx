import { useContext } from "react";
import Register from "./Register";
import { UserContext } from "./Usercontext";


export default function Routes(){
    const {username,id} = useContext(UserContext)

    if(username){
        return 'loggedin' + username;
    }
    return(

        <Register/>
    )
}