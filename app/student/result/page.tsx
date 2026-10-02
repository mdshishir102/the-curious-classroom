"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function StudentResultPage(){

const [results,setResults] = useState<any[]>([]);
const [loading,setLoading] = useState(true);
const [student,setStudent] = useState<any>(null);



useEffect(()=>{

loadResults();

},[]);


async function downloadResultPDF(item:any){
    

const doc = new jsPDF();



/* HEADER */

const img = new Image();

img.src = "/logo.png";

await new Promise((resolve)=>{
  img.onload = resolve;
});


const maxWidth = 35;
const maxHeight = 35;


let width = img.width;
let height = img.height;


const ratio = Math.min(
  maxWidth / width,
  maxHeight / height
);


width = width * ratio;
height = height * ratio;


doc.addImage(
"/logo.png",
"PNG",
15,
10,
width,
height
);



doc.setFontSize(20);

doc.text(
"The Curious Classroom",
105,
20,
{
align:"center"
}
);



doc.setFontSize(12);

doc.text(
"Academic Performance Report",
105,
28,
{
align:"center"
}
);





/* STUDENT INFO */


doc.setFontSize(11);


doc.text(
`Student Name: ${student.student_name}`,
15,
50
);


doc.text(
`Student ID: ${student.student_id}`,
15,
58
);


doc.text(
`Class: ${student.class}`,
15,
66
);


doc.text(
`Batch: ${student.batch}`,
15,
74
);







/* EXAM INFO */


doc.roundedRect(
15,
85,
180,
35,
3,
3
);



doc.text(
`Exam: ${item.exam_type}`,
25,
98
);


doc.text(
`Subject: ${item.subject}`,
25,
106
);


doc.text(
`Chapter: ${item.chapter}`,
25,
114
);







/* RESULT TABLE */


autoTable(doc,{

startY:130,


head:[

[
"Marks",
"Total Marks",
"Percentage",
"Grade",
"Position"
]

],


body:[

[

item.marks,

item.total_marks,

item.percentage+"%",

item.grade,

item.position

]

]

});








/* COMMENT */


if(item.comment){


doc.setFontSize(11);


doc.text(
"Teacher Comment:",
15,
180
);


doc.text(
item.comment,
15,
190
);


}






/* FOOTER */


doc.setFontSize(10);


doc.text(
"Prepared & Authorized By",
15,
250
);


doc.text(
"MD. Mahfuz Shaharia Shishir",
15,
258
);


doc.text(
"CEO & Founder",
15,
266
);


doc.text(
"The Curious Classroom",
15,
274
);




doc.save(

`Result_${student.student_name}_${item.exam_type}.pdf`

);


}













async function loadResults(){

const studentId = localStorage.getItem("student_id");

const studentInfo = localStorage.getItem("student");

if(studentInfo){
setStudent(JSON.parse(studentInfo));
}

console.log("LOGIN STUDENT ID:", studentId);


if(!studentId){
console.log("NO STUDENT ID FOUND");
setLoading(false);
return;
}



const {data,error}= await supabase
.from("results")
.select("*")
.eq("student_id",studentId)
.order("created_at",{ascending:false});



console.log("RESULT DATA:", data);
console.log("RESULT ERROR:", error);



if(data){
setResults(data);
}


setLoading(false);

}









if(loading){

return(

<div className="p-10 text-center text-xl">
Loading Result...
</div>

)

}




return(

<div className="min-h-screen bg-gray-50 p-6">


<h1 className="
text-3xl
font-bold
text-blue-600
mb-6
">
🏆 Academic Result
</h1>



{
results.length===0 ?


<div className="
bg-white
rounded-3xl
shadow
p-6
">
No result available
</div>



:


results.map((item,index)=>(


<div
key={index}
className="
bg-white
rounded-3xl
shadow-lg
p-6
mb-6
"
>



<div className="flex justify-between items-center">


<div>

<h2 className="
text-xl
font-bold
text-gray-800
">
{item.exam_type}
</h2>


<p className="text-gray-500">
{item.subject}
</p>

</div>



<div className="
bg-blue-100
text-blue-700
px-4
py-2
rounded-xl
">

Exam #{item.exam_number}

</div>


</div>



<div className="
mt-5
bg-gradient-to-r
from-blue-50
to-purple-50
rounded-2xl
p-5
">




<p>
📚 Chapter: <b>{item.chapter}</b>
</p>


<div className="
grid
grid-cols-2
gap-4
mt-4
">

<div className="bg-white rounded-xl p-4 shadow-sm">
📝 Marks
<br/>
<b className="text-xl">
{item.marks}/{item.total_marks}
</b>
</div>


<div className="bg-white rounded-xl p-4 shadow-sm">
📊 Percentage
<br/>
<b className="text-xl">
{item.percentage}%
</b>
</div>


<div className="bg-white rounded-xl p-4 shadow-sm">
🏅 Grade
<br/>
<b className="text-xl">
{item.grade}
</b>
</div>


<div className="bg-white rounded-xl p-4 shadow-sm">
🏆 Position
<br/>
<b className="text-xl">
{item.position}
</b>
</div>


</div>


</div>





{
item.comment &&

<div className="
mt-4
bg-green-50
p-4
rounded-xl
">

💬 Teacher Comment:

<br/>

<b>
{item.comment}
</b>

</div>

}

<button

onClick={()=>downloadResultPDF(item)}

className="
mt-5
bg-blue-600
text-white
px-5
py-2
rounded-xl
font-bold
"

>

📄 Download Result PDF

</button>






<p className="
text-sm
text-gray-400
mt-4
">

📅 
{
new Date(item.created_at)
.toLocaleDateString()
}

</p>



</div>


))


}



</div>


)


}