"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


export default function AdmissionPage() {


const [students,setStudents] = useState<any[]>([]);

const [activeTab,setActiveTab] = useState("pending");

const [loading,setLoading] = useState(true);





async function loadStudents(){


setLoading(true);



const {data,error}=await supabase

.from("students")

.select("*")

.order(
"created_at",
{
ascending:false
}
);




console.log(
"STUDENTS DATA:",
data
);


console.log(
"STUDENTS ERROR:",
error
);




if(error){

alert(error.message);

setLoading(false);

return;

}



setStudents(data || []);

setLoading(false);



}






useEffect(()=>{

loadStudents();

},[]);




async function markAsPaid(id:number){


const {error}=await supabase

.from("students")

.update({

payment_status:"paid"

})

.eq(
"id",
id
);



if(error){

alert(error.message);

return;

}



alert("Payment marked as paid");


loadStudents();


}




async function updateStatus(
id:number,
status:string
){



const student = students.find(

item=>item.id===id

);



if(!student)

return;









// ======================
// REJECT
// ======================


if(status==="rejected"){



const {error}=await supabase

.from("students")

.update({

status:"rejected"

})

.eq(
"id",
id
);





if(error){

alert(error.message);

return;

}



alert("Student Rejected");


await loadStudents();


setActiveTab("rejected");


return;


}









// ======================
// APPROVE
// ======================


if(status==="approved"){


    if(student.payment_status !== "paid"){

alert("আগে Payment Clear করুন");

return;

}

if(student.payment_status !== "paid"){

alert("Payment not completed");

return;

}


const prefix =

student.batch.startsWith("SSC")

?

"TCCS"

:

"TCCH";






const batchYear =

student.batch.replace(/\D/g,"");







const {

count,

error:countError

}=await supabase

.from("students")

.select("*",{

count:"exact",

head:true

})

.like(

"student_id",

`${prefix}${batchYear}%`

);






if(countError){

alert(countError.message);

return;

}







const studentID =

prefix +

batchYear +

String(

(count || 0)+1

)

.padStart(

3,

"0"

);







const email =

`${studentID.toLowerCase()}@student.tcc.com`;






const password =

Math.random()

.toString(36)

.substring(2,10)

.toUpperCase();








const response = await fetch(

"/api/create-student-auth",

{

method:"POST",

headers:{

"Content-Type":

"application/json"

},

body:JSON.stringify({

email,

password

})


}

);






const result = await response.json();






if(result.error){

alert(result.error);

return;

}








const {error}=await supabase

.from("students")

.update({

status:"approved",

student_id:studentID,

password:password,

login_enabled:true,

auth_user_id:result.userId

})

.eq(

"id",

id

);







if(error){

alert(error.message);

return;

}







alert(

`Student Approved

Student ID: ${studentID}

Password: ${password}`

);







await loadStudents();


setActiveTab("approved");



}



}

// ======================
// FILTER STUDENTS
// ======================


const filteredStudents = students.filter(student=>{


if(activeTab==="pending")

return student.status==="pending";



if(activeTab==="approved")

return student.status==="approved";



if(activeTab==="rejected")

return student.status==="rejected";



return true;


});









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

Admission Management

</h1>








<div className="
mb-8
flex
gap-4
">






<button

onClick={()=>setActiveTab("pending")}

className="
rounded-lg
bg-blue-600
px-5
py-2
text-white
"

>

Pending

</button>







<button

onClick={()=>setActiveTab("approved")}

className="
rounded-lg
bg-green-600
px-5
py-2
text-white
"

>

Approved

</button>







<button

onClick={()=>setActiveTab("rejected")}

className="
rounded-lg
bg-red-600
px-5
py-2
text-white
"

>

Rejected

</button>





</div>









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


{
student.student_photo &&

<img

src={student.student_photo}

alt={student.student_name}

className="
mb-4
h-24
w-24
rounded-full
object-cover
border
"

/>

}



<h2 className="
text-xl
font-bold
">

{student.student_name}

</h2>






<p>

Class: {student.class}

</p>






<p>

Batch: {student.batch}

</p>






<p>

WhatsApp: {student.whatsapp}

</p>


<p>
Payment Method:
<b>
{student.payment_method}
</b>
</p>


<p>
Payment Status:
<b>
{student.payment_status}
</b>
</p>


<p>

Guardian:
{student.guardian_name}

</p>


<p>

School:
{student.school}

</p>




{
activeTab==="pending"

&&


<div className="
mt-5
flex
gap-4
">



<button

onClick={()=>markAsPaid(student.id)}

className="
rounded-lg
bg-yellow-500
px-5
py-2
text-white
"

>

Mark as Paid

</button>





<button

onClick={()=>updateStatus(

student.id,

"approved"

)}

className="
rounded-lg
bg-green-600
px-5
py-2
text-white
"

>

Approve

</button>







<button

onClick={()=>updateStatus(

student.id,

"rejected"

)}

className="
rounded-lg
bg-red-600
px-5
py-2
text-white
"

>

Reject

</button>






</div>


}







{

activeTab==="approved"

&&


<div className="
mt-4
rounded-xl
bg-green-50
p-4
">


<p>

Student ID:

<b>

{student.student_id}

</b>

</p>



<p className="mt-2">

Email:

{student.student_id?.toLowerCase()}@student.tcc.com

</p>


<p className="mt-2">

Login:

{

student.login_enabled

?

<span className="text-green-700 font-bold">

Active

</span>

:

<span className="text-red-700 font-bold">

Disabled

</span>

}


</p>



</div>


}






{

activeTab==="rejected"

&&


<div className="
mt-4
rounded-xl
bg-red-50
p-4
text-red-700
">


Student Application Rejected


</div>


}






</div>


))


}



</div>


}



</div>


</main>


);


}