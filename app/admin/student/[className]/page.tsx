"use client";


import { useEffect,useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";



export default function ClassStudentPage(){


const params = useParams();


const className =
decodeURIComponent(
params.className as string
);



const [students,setStudents]=useState<any[]>([]);

const [search,setSearch]=useState("");

const [loading,setLoading]=useState(true);






async function loadStudents(){


const {data,error}=await supabase

.from("students")

.select("*")

.eq(
"class",
className
)

.eq(
"status",
"approved"
)

.order(
"created_at",
{
ascending:false
}
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








const filteredStudents =
students.filter(student=>{


if(!search)

return true;



return(

student.student_name
.toLowerCase()
.includes(
search.toLowerCase()
)


||

student.student_id
.toLowerCase()
.includes(
search.toLowerCase()
)


||

student.whatsapp
.includes(search)


);



});








if(loading){


return(

<div className="
min-h-screen
flex
items-center
justify-center
font-bold
">

Loading...

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
max-w-6xl
mx-auto
">





<div className="
mb-8
flex
justify-between
items-center
">


<div>


<h1 className="
text-4xl
font-bold
text-gray-800
">

{className}

</h1>


<p className="
mt-2
text-gray-500
">

Student List

</p>


</div>



<Link

href="/admin/student"

className="
rounded-xl
bg-gray-800
px-5
py-3
text-white
"

>

← Back

</Link>


</div>







<input

placeholder="
Search Name / Student ID / Phone
"

value={search}

onChange={
e=>setSearch(e.target.value)
}

className="
mb-8
w-full
rounded-2xl
border
bg-white
p-4
shadow
"

/>









<div className="
grid
gap-6
md:grid-cols-2
">





{

filteredStudents.map(student=>(


<div

key={student.id}

className="
rounded-3xl
bg-white
p-6
shadow-lg
border
hover:shadow-xl
transition
"


>



<div className="
flex
gap-5
items-center
">


<img

src={
student.student_photo
||
"/logo.png"
}

className="
h-24
w-24
rounded-full
object-cover
border-4
border-blue-100
"

/>




<div>


<h2 className="
text-xl
font-bold
">

{student.student_name}

</h2>



<p>

ID:
<b>
{student.student_id}
</b>

</p>



<p>

Batch:
{student.batch}

</p>



<p>

📱 {student.whatsapp}

</p>


</div>


</div>







<Link

href={`/admin/student/profile/${student.id}`}

className="
mt-6
block
rounded-xl
bg-blue-600
py-3
text-center
font-bold
text-white
"

>

View Full Profile →

</Link>





</div>



))


}



</div>




</div>


</main>


)


}