"use client";


import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";



export default function AdminStudentPage(){


const [students,setStudents] = useState<any[]>([]);

const [loading,setLoading] = useState(true);





async function loadStudents(){


const {data,error}=await supabase

.from("students")

.select("*")

.eq(
"status",
"approved"
);



if(error){

alert(error.message);

return;

}



setStudents(data || []);

setLoading(false);


}





useEffect(()=>{


loadStudents();


},[]);







const classes=[

"Class 9",

"Class 10",

"Class 11",

"Class 12"

];







function getClassCount(className:string){


return students.filter(

student=>student.class===className

).length;


}







if(loading){


return(

<div className="
min-h-screen
flex
items-center
justify-center
font-bold
">

Loading Students...

</div>

)

}







return(


<main className="
min-h-screen
bg-gradient-to-br
from-blue-50
via-white
to-indigo-100
p-6
">



<div className="
max-w-7xl
mx-auto
">





<h1 className="
text-4xl
font-bold
text-gray-800
mb-8
">

Student Management

</h1>







<div className="
grid
gap-6
md:grid-cols-2
lg:grid-cols-4
">





{

classes.map((item,index)=>(


<Link

key={item}

href={`/admin/student/${encodeURIComponent(item)}`}

className="
bg-white
rounded-3xl
shadow-lg
p-8
hover:shadow-2xl
hover:-translate-y-1
transition
border
border-gray-100
"


>


<div className="
text-5xl
mb-5
">

{

index===0
?
"📘"
:
index===1
?
"📗"
:
index===2
?
"📙"
:
"📕"

}

</div>



<h2 className="
text-2xl
font-bold
text-blue-700
">

{item}

</h2>



<p className="
mt-3
text-gray-500
">

Total Students

</p>



<p className="
text-4xl
font-bold
mt-2
">

{getClassCount(item)}

</p>




<div className="
mt-5
text-blue-600
font-bold
">

View Students →

</div>



</Link>



))


}





</div>





</div>


</main>


)


}