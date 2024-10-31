import React from 'react'

function Avatar({username , userId , online}) {

    const colors = [ 'bg-blue-200' , 'bg-red-200' ,
         'bg-green-200' , 'bg-yellow-200' ,
        'bg-purple-200' , 'bg-teal-200'];

        const idUser10 = parseInt(userId,16)
        const colorIndice = idUser10 % colors.length
        const color = colors[colorIndice];
  return (
    <div className={" w-8 h-8 relative rounded-full flex items-center " + color} >
       <div className='text-center w-full opacity-70'>{username[0]}</div>
       {online && (

<div className='absolute bg-green-500 rounded-full h-3 w-3 bottom-0 right-0 border border-white'></div>

       )}
       {!online && (
        <div className="absolute w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-white"></div>
       )}
       
    </div>
  )
}

export default Avatar