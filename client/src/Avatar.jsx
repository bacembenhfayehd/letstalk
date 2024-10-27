import React from 'react'

function Avatar({username , userId}) {

    const colors = [ 'bg-blue-200' , 'bg-red-200' ,
         'bg-green-200' , 'bg-yellow-200' ,
        'bg-purple-200' , 'bg-teal-200'];

        const idUser10 = parseInt(userId,16)
        const colorIndice = idUser10 % colors.length
        const color = colors[colorIndice];
  return (
    <div className={" w-8 h-8 rounded-full flex items-center " + color} >
       <div className='text-center w-full opacity-70'>{username[0]}</div>
    </div>
  )
}

export default Avatar