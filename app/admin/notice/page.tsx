"use client";


import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";



export default function AdminNoticePage(){


const [notices,setNotices] = useState<any[]>([]);


const [title,setTitle] = useState("");

const [description,setDescription] = useState("");

const [loading,setLoading] = useState(false);







async function loadNotices(){


const {data,error}=await supabase

.from("notices")

.select("*")

.order(

"created_at",

{

ascending:false

}

);



if(!error){

setNotices(data || []);

}


}







useEffect(()=>{


loadNotices();


},[]);








async function addNotice(){



if(!title || !description){


alert(
"Fill all fields"
);


return;


}




setLoading(true);





const {error}=await supabase

.from("notices")

.insert({

title:title,

description:description

});





setLoading(false);





if(error){


alert(error.message);


return;


}





alert(
"Notice Added"
);




setTitle("");

setDescription("");



loadNotices();



}









async function deleteNotice(id:string){



const confirmDelete = confirm(

"Delete this notice?"

);



if(!confirmDelete)
return;





const {error}=await supabase

.from("notices")

.delete()

.eq(

"id",

id

);






if(error){


alert(error.message);

return;


}



loadNotices();



}








return(


<main className="
min-h-screen
bg-gray-100
p-8
">



<div className="
mx-auto
max-w-4xl
">





<h1 className="
text-3xl
font-bold
mb-8
">

Notice Management

</h1>







<div className="
rounded-2xl
bg-white
p-6
shadow
">





<input

className="
w-full
rounded-lg
border
p-3
"

placeholder="Notice Title"

value={title}

onChange={
e=>setTitle(e.target.value)
}

/>







<textarea

className="
mt-4
w-full
rounded-lg
border
p-3
"

placeholder="Notice Description"

rows={4}

value={description}

onChange={
e=>setDescription(e.target.value)
}

/>








<button

onClick={addNotice}

disabled={loading}

className="
mt-4
rounded-lg
bg-blue-600
px-6
py-3
text-white
"

>

{

loading

?

"Adding..."

:

"Add Notice"

}


</button>





</div>









<div className="
mt-8
space-y-4
">





{

notices.map(notice=>(


<div

key={notice.id}

className="
rounded-2xl
bg-white
p-6
shadow
"

>


<h2 className="
text-xl
font-bold
">

{notice.title}

</h2>



<p className="
mt-2
text-gray-600
">

{notice.description}

</p>






<button

onClick={()=>deleteNotice(notice.id)}

className="
mt-4
rounded-lg
bg-red-600
px-4
py-2
text-white
"

>

Delete

</button>





</div>


))


}



</div>





</div>


</main>


)


}