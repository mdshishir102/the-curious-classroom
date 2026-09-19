"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


export default function AdmissionPage(){

const [students,setStudents] = useState<any[]>([]);

const [activeTab,setActiveTab] = useState("pending");

const [loading,setLoading] = useState(true);

const [selectedStudent,setSelectedStudent] = useState<any>(null);




// ======================
// LOAD STUDENTS
// ======================

async function loadStudents(){

setLoading(true);


const {data,error}=await supabase
.from("students")
.select("*")
.order("created_at",{ascending:false});


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





// ======================
// MARK PAYMENT PAID
// ======================

async function markAsPaid(id:number){


const {error}=await supabase
.from("students")
.update({

payment_status:"paid"

})
.eq("id",id);



if(error){

alert(error.message);

return;

}



alert("Payment Verified");

loadStudents();



}






// ======================
// SEND WHATSAPP
// ======================


function sendWhatsApp(student:any){


const message =

`Assalamu Alaikum ${student.student_name},

আপনার ভর্তি আবেদন অনুমোদিত হয়েছে।

Student ID:
${student.student_id}

Password:
${student.password}

Login Link:
https://thecuriousclassroom.vercel.app/student/login

ধন্যবাদ।

The Curious Classroom`;



const url =

`https://wa.me/88${student.whatsapp}?text=${encodeURIComponent(message)}`;



window.open(url,"_blank");



}





// ======================
// APPROVE / REJECT
// ======================


async function updateStatus(
id:number,
status:string
){


const student =
students.find(
item=>item.id===id
);



if(!student) return;



if(status==="rejected"){


const {error}=await supabase
.from("students")
.update({

status:"rejected"

})
.eq("id",id);



if(error){

alert(error.message);

return;

}



alert("Rejected");

loadStudents();

return;


}






if(status==="approved"){



if(student.payment_status!=="paid"){

alert("Payment clear না হলে approve করা যাবে না");

return;

}




const prefix =
student.batch?.startsWith("SSC")
?
"TCCS"
:
"TCCH";



const batchYear =
student.batch.replace(/\D/g,"");



const {
count
}=await supabase
.from("students")
.select("*",
{
count:"exact",
head:true
})
.like(
"student_id",
`${prefix}${batchYear}%`
);



const studentID =
prefix+
batchYear+
String((count||0)+1)
.padStart(3,"0");



const password =
Math.random()
.toString(36)
.substring(2,10)
.toUpperCase();



const {error}=await supabase
.from("students")
.update({

status:"approved",

student_id:studentID,

password:password,

login_enabled:true

})
.eq("id",id);




if(error){

alert(error.message);

return;

}



alert(
`Approved\n\nID: ${studentID}\nPassword: ${password}`
);



loadStudents();


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






return (

<main className="
min-h-screen
bg-gradient-to-br
from-gray-100
to-blue-50
p-6
">


<div className="
mx-auto
max-w-7xl
">


<h1 className="
mb-8
text-4xl
font-bold
text-gray-800
">

Admission Management

</h1>





{/* Tabs */}


<div className="
mb-8
flex
gap-4
flex-wrap
">


<button

onClick={()=>setActiveTab("pending")}

className="
rounded-xl
bg-yellow-500
px-6
py-3
font-bold
text-white
"

>

Pending

</button>




<button

onClick={()=>setActiveTab("approved")}

className="
rounded-xl
bg-green-600
px-6
py-3
font-bold
text-white
"

>

Approved

</button>





<button

onClick={()=>setActiveTab("rejected")}

className="
rounded-xl
bg-red-600
px-6
py-3
font-bold
text-white
"

>

Rejected

</button>



</div>






{

loading ?


<div className="
rounded-xl
bg-white
p-10
text-center
">

Loading...

</div>



:


filteredStudents.length===0 ?


<div className="
rounded-xl
bg-white
p-10
text-center
">

No Student Found

</div>




:


<div className="
space-y-6
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
transition
hover:shadow-xl
"

>



<div className="
flex
flex-col
md:flex-row
gap-6
">



{/* INFORMATION LEFT */}


<div className="
flex-1
">


<h2 className="
text-2xl
font-bold
text-blue-700
">

{student.student_name}

</h2>



<div className="
mt-4
space-y-2
text-gray-700
">


<p>
🎓 Class:
<b>
{student.class}
</b>
</p>


<p>
📚 Batch:
<b>
{student.batch}
</b>
</p>


<p>
👨‍👩‍👦 Guardian:
{student.guardian_name}
</p>


<p>
📱 WhatsApp:
{student.whatsapp}
</p>


<p>
🏫 School:
{student.school}
</p>


</div>





<hr className="
my-5
"/>





<h3 className="
text-lg
font-bold
text-blue-700
">

💳 Payment Information

</h3>



<div className="
mt-3
space-y-2
">


<p>

Method:

<b>

{

student.payment_method==="bkash"

?

" bKash"

:

" Offline"

}

</b>

</p>





<p>

Status:


{

student.payment_status==="paid"


?


<span className="
ml-2
rounded-full
bg-green-100
px-3
py-1
text-green-700
font-bold
">

PAID

</span>


:


<span className="
ml-2
rounded-full
bg-yellow-100
px-3
py-1
text-yellow-700
font-bold
">

PENDING

</span>


}



</p>





{

student.payment_method==="bkash"

&&

<>

<p>

bKash Number:

{student.bkash_number}

</p>



<p>

Transaction ID:

{student.transaction_id}

</p>


</>


}



</div>



</div>





{/* PHOTO RIGHT */}


<div className="
md:w-56
flex
justify-center
">


<img

src={student.student_photo}

alt={student.student_name}

className="
h-52
w-52
rounded-3xl
object-cover
border-4
border-blue-100
shadow
"

/>


</div>



</div>


<button

onClick={()=>setSelectedStudent(student)}

className="
mt-5
rounded-xl
bg-blue-600
px-5
py-3
font-bold
text-white
"

>

👁 View Full Details

</button>


{/* ======================
ACTION BUTTONS
====================== */}

{
activeTab==="pending"
&&


<div className="
mt-6
flex
gap-4
flex-wrap
">


<button

onClick={()=>markAsPaid(student.id)}

disabled={
student.payment_status==="paid"
}

className="
rounded-xl
bg-yellow-500
px-5
py-3
font-bold
text-white
disabled:bg-gray-300
"

>

{

student.payment_status==="paid"

?

"Payment Verified"

:

"Mark as Paid"

}


</button>





<button

onClick={()=>updateStatus(
student.id,
"approved"
)}

disabled={
student.payment_status!=="paid"
}

className="
rounded-xl
bg-green-600
px-5
py-3
font-bold
text-white
disabled:bg-gray-300
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
rounded-xl
bg-red-600
px-5
py-3
font-bold
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
mt-5
rounded-2xl
bg-green-50
p-5
border
border-green-200
">


<h3 className="
font-bold
text-green-700
text-lg
">

✅ Student Approved

</h3>



<p className="
mt-3
">

Student ID:

<b>

{student.student_id}

</b>

</p>




<p className="
mt-2
">

Password:

<b>

{student.password}

</b>

</p>



<p className="
mt-2
">

Login Status:

<span className="
ml-2
font-bold
text-green-700
">

Active

</span>


</p>


</div>


}





{

activeTab==="rejected"

&&


<div className="
mt-5
rounded-xl
bg-red-50
p-4
text-red-700
font-bold
">

❌ Admission Rejected

</div>


}





</div>


))


}



</div>


}


</div>




{/* ==============================
        STUDENT DETAILS MODAL
================================ */}


{

selectedStudent &&


<div

className="
fixed
inset-0
z-50
flex
items-center
justify-center
bg-black/60
p-5
"

>


<div

className="
max-h-[90vh]
w-full
max-w-5xl
overflow-y-auto
rounded-3xl
bg-white
p-8
shadow-2xl
"

>


{/* HEADER */}

<div className="
mb-8
flex
items-center
justify-between
border-b
pb-5
">


<h2 className="
text-3xl
font-bold
text-blue-700
">

🎓 Student Full Information

</h2>



<button

onClick={()=>setSelectedStudent(null)}

className="
rounded-full
bg-red-100
px-4
py-2
font-bold
text-red-600
"

>

✕

</button>


</div>





{/* TOP SECTION */}

<div className="
grid
gap-8
md:grid-cols-3
">


{/* PHOTO */}


<div className="
flex
justify-center
">


<img

src={selectedStudent.student_photo}

alt={selectedStudent.student_name}

className="
h-64
w-64
rounded-3xl
border-4
border-blue-100
object-cover
shadow-xl
"

/>


</div>





{/* BASIC INFO */}

<div className="
md:col-span-2
grid
gap-3
md:grid-cols-2
">


<div className="rounded-xl bg-gray-50 p-4">

<p className="text-gray-500">
Name
</p>

<b>
{selectedStudent.student_name}
</b>

</div>



<div className="rounded-xl bg-gray-50 p-4">

<p className="text-gray-500">
Student ID
</p>

<b>
{
selectedStudent.student_id || "Not Generated"
}
</b>

</div>




<div className="rounded-xl bg-gray-50 p-4">

<p className="text-gray-500">
Class
</p>

<b>
{selectedStudent.class}
</b>

</div>




<div className="rounded-xl bg-gray-50 p-4">

<p className="text-gray-500">
Batch
</p>

<b>
{selectedStudent.batch}
</b>

</div>




<div className="rounded-xl bg-gray-50 p-4">

<p className="text-gray-500">
Guardian
</p>

<b>
{selectedStudent.guardian_name}
</b>

</div>




<div className="rounded-xl bg-gray-50 p-4">

<p className="text-gray-500">
WhatsApp
</p>

<b>
{selectedStudent.whatsapp}
</b>

</div>



<div className="rounded-xl bg-gray-50 p-4">

<p className="text-gray-500">
Date of Birth
</p>

<b>
{selectedStudent.date_of_birth}
</b>

</div>



<div className="rounded-xl bg-gray-50 p-4">

<p className="text-gray-500">
School
</p>

<b>
{selectedStudent.school}
</b>

</div>



</div>


</div>






{/* CONTACT */}

<div className="
mt-8
rounded-2xl
bg-blue-50
p-6
">


<h3 className="
mb-4
text-xl
font-bold
text-blue-700
">

📞 Contact Information

</h3>



<p>
<b>Email:</b> {selectedStudent.email || "N/A"}
</p>



<p className="mt-2">
<b>Facebook:</b> {selectedStudent.facebook_link || "N/A"}
</p>


</div>






{/* ADDRESS */}


<div className="
mt-6
grid
gap-5
md:grid-cols-2
">


<div className="
rounded-2xl
border
p-5
">


<h3 className="
font-bold
text-blue-700
">

🏠 Present Address

</h3>


<p className="mt-3">

{
selectedStudent.present_address || "N/A"
}

</p>


</div>




<div className="
rounded-2xl
border
p-5
">


<h3 className="
font-bold
text-blue-700
">

🏠 Permanent Address

</h3>


<p className="mt-3">

{
selectedStudent.permanent_address || "N/A"
}

</p>


</div>


</div>







{/* PAYMENT */}



<div className="
mt-6
rounded-2xl
border
bg-yellow-50
p-6
">


<h3 className="
mb-4
text-xl
font-bold
text-yellow-700
">

💳 Payment Information

</h3>



<p>

Method:

<b className="ml-2">

{
selectedStudent.payment_method==="bkash"
?
"bKash"
:
"Offline"
}

</b>

</p>




<p className="mt-3">

Status:


<b className="ml-2">


{
selectedStudent.payment_status==="paid"

?

<span className="text-green-600">
PAID
</span>

:

<span className="text-yellow-600">
PENDING
</span>

}


</b>


</p>






{

selectedStudent.payment_method==="bkash"

&&

<>


<p className="mt-3">

bKash Number:

<b>
{selectedStudent.bkash_number}
</b>

</p>



<p className="mt-3">

Transaction ID:

<b>
{selectedStudent.transaction_id}
</b>

</p>


</>


}



</div>





{/* LOGIN INFO */}


{

selectedStudent.status==="approved"

&&


<div className="
mt-6
rounded-2xl
bg-green-50
p-6
">


<h3 className="
text-xl
font-bold
text-green-700
">

✅ Login Information

</h3>


<p className="mt-3">

Student ID:

<b>
{selectedStudent.student_id}
</b>

</p>


<p className="mt-3">

Password:

<b>
{selectedStudent.password}
</b>

</p>



<button

onClick={()=>sendWhatsApp(selectedStudent)}

className="
mt-5
rounded-xl
bg-green-600
px-6
py-3
font-bold
text-white
hover:bg-green-700
"

>

📱 Send Login Info WhatsApp

</button>


</div>


}





</div>


</div>


}





</main>


);


}