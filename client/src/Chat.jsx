
export default function Chat(){
    return (
        <div className="flex h-screen">
            <div className="bg-blue-100 w-1/3 ">Contacts</div>
            <div className= " flex flex-col bg-blue-300 w-2/3 p-2">
            <div className="flex-grow">
                messages selected from person
            </div>
            <div className='flex mx-2 gap-2'>
             <input type="text" placeholder="type here ..."
              className="bg-white p-2 border flex-grow  rounded-s-xl  "/>
              <button className="bg-blue-500 p-2 text-white rounded-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
</svg>

              </button>
    
            </div>
                </div>

        </div>
    )
}