"use client";


import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";



export default function AdminStudentPage(){


const [students,setStudents] = useState<any[]>([]);

const [filteredStudents,setFilteredStudents] = useState<any[]>([]);


const [search,setSearch] = useState("");


const [loading,setLoading] = useState(true);








async function loadStudents(){


const {data,error}=await supabase

.from("students")

.select("*")

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





if(!error){

setStudents(data || []);

setFilteredStudents(data || []);

}



setLoading(false);



}







useEffect(()=>{


loadStudents();


},[]);









useEffect(()=>{


let data=[...students];



if(search){


data=data.filter(student=>


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


}



setFilteredStudents(data);



},[
search,
students
]);









async function toggleLogin(
student:any
){



const {error}=await supabase

.from("students")

.update({

login_enabled:
!student.login_enabled

})

.eq(
"id",
student.id
);





if(error){

alert(error.message);

return;

}



loadStudents();



}




async function resetPassword(student:any){


const newPassword =
Math.random()
.toString(36)
.substring(2,10)
.toUpperCase();



const response = await fetch(
"/api/reset-student-password",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

userId:student.auth_user_id,

studentDbId:student.id,

password:newPassword

})

}

);



const result = await response.json();



if(result.error){

alert(result.error);

return;

}



alert(
`New Password: ${newPassword}`
);


}













return(


<main className="
min-h-screen
bg-gray-100
p-8
">



<div className="
mx-auto
max-w-6xl
">



<h1 className="
mb-8
text-3xl
font-bold
">

Student Management

</h1>







<input

className="
mb-8
w-full
rounded-lg
border
p-3
"

placeholder="Search Name / Student ID / Phone"

value={search}

onChange={
e=>setSearch(e.target.value)
}

/>








{

loading ?


<p>
Loading...
</p>



:


filteredStudents.length===0 ?


<div className="
rounded-xl
bg-white
p-6
">

No Student Found

</div>



:



<div className="
space-y-5
">



{

filteredStudents.map(student=>(



<div

key={student.id}

className="
rounded-2xl
bg-white
p-6
shadow
"

>


<div className="
flex
justify-between
items-center
">





<div>


<h2 className="
text-xl
font-bold
">

{student.student_name}

</h2>



<p>

{student.student_id}

</p>



<p>

Class: {student.class}

</p>



<p>

Batch: {student.batch}

</p>



<p>

Phone: {student.whatsapp}

</p>



</div>






<div className="
text-right
">


<p className="
font-bold
">

{

student.login_enabled

?

"Login Active"

:

"Login Disabled"

}


</p>


</div>





</div>








<div className="
mt-5
flex
gap-4
">





<button

onClick={()=>
toggleLogin(student)
}

className="
rounded-lg
bg-blue-600
px-5
py-2
text-white
"

>

{

student.login_enabled

?

"Disable Login"

:

"Enable Login"

}


</button>







<button

onClick={()=>
resetPassword(student)
}

className="
rounded-lg
bg-yellow-500
px-5
py-2
text-white
"

>

Reset Password

</button>






</div>




</div>


))


}



</div>



}



</div>


</main>


)


}