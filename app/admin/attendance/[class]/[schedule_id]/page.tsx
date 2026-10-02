"use client";


import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";



export default function ClassAttendancePage(){


const params = useParams();


const className = String(params.class)
.replaceAll("-", " ");


const scheduleIdParam = String(params.schedule_id);



const [scheduleId,setScheduleId] = useState<string | null>(null);


const [students,setStudents] = useState<any[]>([]);


const [attendance,setAttendance] = useState<any>({});


const [saving,setSaving] = useState(false);





const presentCount =
Object.values(attendance)
.filter(
(status:any)=>status==="present"
).length;



const lateCount =
Object.values(attendance)
.filter(
(status:any)=>status==="late"
).length;



const absentCount =
Object.values(attendance)
.filter(
(status:any)=>status==="absent"
).length;







useEffect(()=>{


async function loadStudents(){


const {data,error}=await supabase

.from("students")

.select(
`
id,
student_id,
student_name,
student_photo,
class,
batch,
school,
college,
guardian_name,
status
`
)

.eq(
"class",
className
);



if(error){

console.log(error);

return;

}





const today = new Date()

.toLocaleDateString(
"en-CA",
{
timeZone:"Asia/Dhaka"
}
);





const {data:schedule}=await supabase

.from("class_schedules")

.select("id")

.eq(
"id",
scheduleIdParam
)

.single();





if(!schedule){

setStudents(data || []);

return;

}




setScheduleId(schedule.id);





const {data:attendanceData}=await supabase

.from("attendance")

.select("*")

.eq(
"attendance_date",
today
)

.eq(
"class",
className
)

.eq(
"schedule_id",
schedule.id
);





const oldAttendance:any={};




attendanceData?.forEach((item:any)=>{


const student=data?.find(
(s:any)=>s.student_id===item.student_id
);



if(student){

oldAttendance[student.id]=item.status;

}


});





setAttendance(oldAttendance);


setStudents(data || []);



}



loadStudents();



},[
className,
scheduleIdParam
]);






function markAttendance(
id:number,
status:string
){


setAttendance({

...attendance,

[id]:status

});


}


async function saveAttendance(){


if(Object.keys(attendance).length !== students.length){


alert(
"Please mark attendance for all students"
);


return;


}



setSaving(true);



const currentScheduleId = 
scheduleId || scheduleIdParam;




if(!currentScheduleId){


alert(
"Schedule ID missing"
);


setSaving(false);


return;


}





const {
data:{
session
}

}=await supabase.auth.getSession();





if(!session){


alert(
"Admin session expired"
);


setSaving(false);


return;


}







const today = new Date()

.toLocaleDateString(
"en-CA",
{
timeZone:"Asia/Dhaka"
}
);







const time = new Date()

.toLocaleTimeString(
"en-US",
{
timeZone:"Asia/Dhaka",
hour:"numeric",
minute:"2-digit",
hour12:true
}
);






for(const student of students){



const status = attendance[student.id];





const {data:existing}=await supabase

.from("attendance")

.select("id")

.eq(
"student_id",
student.student_id
)

.eq(
"attendance_date",
today
)

.eq(
"schedule_id",
currentScheduleId
)

.maybeSingle();







if(existing){



const {error}=await supabase

.from("attendance")

.update({

status:status,

attendance_time:time,

taken_by:session.user.id

})

.eq(
"id",
existing.id
);





if(error){

console.log(error);

alert(error.message);

setSaving(false);

return;

}




}

else{



const {error}=await supabase

.from("attendance")

.insert({

student_id:student.student_id,

schedule_id:currentScheduleId,

attendance_date:today,

attendance_time:time,

status:status,

class:student.class,

batch:student.batch,

taken_by:session.user.id

});





if(error){

console.log(error);

alert(error.message);

setSaving(false);

return;

}



}



}





alert(
"Attendance saved successfully"
);



setSaving(false);



}


return (

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


{/* HEADER */}

<div className="
bg-white
rounded-3xl
shadow-xl
border
border-gray-100
p-6
mb-8
">


<div className="
flex
items-center
gap-5
">


<img

src="/logo.png"

className="
h-20
w-auto
object-contain
"

/>


<div>

<h1 className="
text-3xl
font-bold
text-blue-700
">

The Curious Classroom

</h1>


<p className="
text-gray-500
">

{className} Attendance

</p>


</div>


</div>


</div>





{/* SUMMARY */}

<div className="
grid
md:grid-cols-4
gap-5
mb-8
">


<div className="
bg-white
rounded-2xl
shadow-lg
p-5
">

<p className="text-gray-500">
Total Students
</p>

<h2 className="
text-3xl
font-bold
text-blue-700
mt-2
">

{students.length}

</h2>

</div>




<div className="
bg-green-50
rounded-2xl
p-5
">

<p className="text-gray-600">
Present
</p>

<h2 className="
text-3xl
font-bold
text-green-700
mt-2
">

{presentCount}

</h2>

</div>




<div className="
bg-yellow-50
rounded-2xl
p-5
">

<p className="text-gray-600">
Late
</p>

<h2 className="
text-3xl
font-bold
text-yellow-700
mt-2
">

{lateCount}

</h2>

</div>




<div className="
bg-red-50
rounded-2xl
p-5
">

<p className="text-gray-600">
Absent
</p>

<h2 className="
text-3xl
font-bold
text-red-700
mt-2
">

{absentCount}

</h2>

</div>


</div>





<h2 className="
text-3xl
font-bold
text-gray-800
mb-6
">

Student List

</h2>





<div className="
space-y-5
">


{

students.map((student)=>(


<div

key={student.id}

className="
bg-white
rounded-3xl
shadow-lg
border
border-gray-100
p-5
flex
items-center
justify-between
gap-5
"


>


<div className="
flex
items-center
gap-5
">


<img

src={student.student_photo}

className="
w-20
h-20
rounded-2xl
object-cover
"

/>


<div>


<h3 className="
text-xl
font-bold
text-gray-800
">

{student.student_name}

</h3>


<p className="text-gray-500">
ID: {student.student_id}
</p>


<p className="text-gray-500">
Class: {student.class}
</p>



{

student.class==="Class 9" ||
student.class==="Class 10"

?

<p className="text-gray-500">
School: {student.school}
</p>


:

<p className="text-gray-500">
College: {student.college}
</p>


}


<p className="text-gray-500">
Batch: {student.batch}
</p>


<p className="text-gray-500">
Guardian: {student.guardian_name}
</p>


</div>


</div>





<div className="
flex
gap-2
">


<button

onClick={()=>markAttendance(student.id,"present")}

className={`
px-5
py-3
rounded-xl
font-bold

${
attendance[student.id]==="present"

?
"bg-green-600 text-white"

:

"bg-green-100 text-green-700"

}

`}

>

Present

</button>




<button

onClick={()=>markAttendance(student.id,"late")}

className={`
px-5
py-3
rounded-xl
font-bold

${
attendance[student.id]==="late"

?
"bg-yellow-500 text-white"

:

"bg-yellow-100 text-yellow-700"

}

`}

>

Late

</button>





<button

onClick={()=>markAttendance(student.id,"absent")}

className={`
px-5
py-3
rounded-xl
font-bold

${
attendance[student.id]==="absent"

?
"bg-red-600 text-white"

:

"bg-red-100 text-red-700"

}

`}

>

Absent

</button>



</div>


</div>


))

}


</div>






<button

onClick={saveAttendance}

disabled={saving}

className="
mt-8
w-full
bg-blue-600
text-white
py-4
rounded-2xl
font-bold
text-lg
hover:bg-blue-700
disabled:bg-gray-400
"

>

{

saving

?

"Saving..."

:

"Save Attendance"

}


</button>




</div>


</main>


)

}