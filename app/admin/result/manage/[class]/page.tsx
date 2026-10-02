"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { generateResultPDF } from "@/utils/generateResultPDF";


export default function ClassResultPage(){


const params = useParams();

const className = String(params.class)
.replace("-"," ");



const isHigherClass =
className==="Class 11" ||
className==="Class 12";


const [showModal,setShowModal] = useState(false);
const [students,setStudents] = useState<any[]>([]);
const [marks,setMarks] = useState<any[]>([]);
const [generatedResults,setGeneratedResults] = useState<any[]>([]);
const [form,setForm]=useState({

subject:
isHigherClass
?
""
:
"Biology",

examType:"",

examNumber:"",

topic:"",

date:"",

cq:"",

saq:"",

mcq:""

});





const subjects =
isHigherClass
?
[
"Biology 1st Paper",
"Biology 2nd Paper"
]
:
[
"Biology"
];





const examTypes =
isHigherClass
?
[
"Weekly Exam",
"Chapter Final Exam",
"Half Century Exam",
"Paper Final Exam",
"Subject Final Exam"

]
:
[
"Weekly Exam",
"Chapter Final Exam",
"Half Century Exam",
"Subject Final Exam"
];






const totalMark =
Number(form.cq || 0)
+
Number(form.saq || 0)
+
Number(form.mcq || 0);






function handleChange(
e:any
){

setForm({

...form,

[e.target.name]:
e.target.value

});


}


async function loadStudents(){

const {data,error}=await supabase

.from("students")

.select("*")

.eq("class",className)

.eq("status","approved");


if(!error){

setStudents(data || []);

}

}





function updateMark(
studentId:string,
field:string,
value:string
)







{


setMarks(prev=>{


const old = prev.find(
item=>item.student_id===studentId
);


if(old){

return prev.map(item=>

item.student_id===studentId

?

{
...item,
[field]:Number(value)
}

:

item

);


}










return [

...prev,

{

student_id:studentId,

[field]:Number(value)

}

];


});


}




function getGrade(percentage:number){

if(percentage>=80)
return "A+";

if(percentage>=70)
return "A";

if(percentage>=60)
return "A-";

if(percentage>=50)
return "B";

if(percentage>=40)
return "C";

if(percentage>=33)
return "D";

return "F";

}






function getPosition(studentId: string) {

  const rankedStudents = students
    .map((student) => {

      const studentMark =
        marks.find(
          (item) => item.student_id === student.student_id
        ) || {};

      const total =
        Number(studentMark.cq || 0) +
        Number(studentMark.saq || 0) +
        Number(studentMark.mcq || 0);

      return {
        student_id: student.student_id,
        total,
      };

    })
    .sort((a, b) => b.total - a.total);


  const currentStudent = rankedStudents.find(
    (item) => item.student_id === studentId
  );

  if (!currentStudent) return "-";


  const position =
    rankedStudents.findIndex(
      (item) => item.total === currentStudent.total
    ) + 1;


  if (position === 1) return "1st";
  if (position === 2) return "2nd";
  if (position === 3) return "3rd";

  return `${position}th`;
}





return (

<main className="
min-h-screen
bg-gradient-to-br
from-slate-100
via-blue-50
to-white
p-8
">


<div className="
mx-auto
max-w-5xl
">





{/* Header */}

<div className="
mb-10
">


<h1 className="
text-4xl
font-extrabold
text-gray-800
">

📊 {className} Result Management

</h1>


<p className="
mt-3
text-gray-500
">

Create examination and generate student results

</p>


</div>







{/* Exam Information */}


<div className="
rounded-3xl
bg-white
p-8
shadow-xl
border
mb-8
">


<h2 className="
mb-6
text-2xl
font-bold
text-blue-700
">

📝 Exam Information

</h2>





<div className="
grid
gap-5
md:grid-cols-2
">





<div>

<label className="font-semibold">
Subject
</label>


<select

name="subject"

value={form.subject}

onChange={handleChange}

className="
mt-2
w-full
rounded-xl
border
p-3
"

>


<option value="">
Select Subject
</option>


{

subjects.map(item=>(

<option
key={item}
value={item}
>

{item}

</option>

))

}


</select>


</div>








<div>

<label className="font-semibold">
Exam Type
</label>


<select

name="examType"

value={form.examType}

onChange={handleChange}

className="
mt-2
w-full
rounded-xl
border
p-3
"

>


<option value="">
Select Exam Type
</option>


{

examTypes.map(item=>(

<option
key={item}
value={item}
>

{item}

</option>

))

}


</select>


</div>








<div>

<label className="font-semibold">
Exam Number
</label>


<input

name="examNumber"

value={form.examNumber}

onChange={handleChange}

placeholder="Example: 01"

className="
mt-2
w-full
rounded-xl
border
p-3
"

/>


</div>








<div>

<label className="font-semibold">
Exam Date
</label>


<input

type="date"

name="date"

value={form.date}

onChange={handleChange}

className="
mt-2
w-full
rounded-xl
border
p-3
"

/>


</div>







</div>





<div className="mt-5">


<label className="font-semibold">
Topic
</label>


<textarea

name="topic"

value={form.topic}

onChange={handleChange}

placeholder="Write exam topic"

className="
mt-2
h-28
w-full
rounded-xl
border
p-3
"

/>


</div>



</div>










{/* Marks Setup */}



<div className="
rounded-3xl
bg-white
p-8
shadow-xl
border
mb-8
">


<h2 className="
mb-6
text-2xl
font-bold
text-green-700
">

🎯 Marks Configuration

</h2>





<div className="
grid
gap-5
md:grid-cols-3
">





<div>

<label className="font-semibold">
CQ Mark
</label>


<input

type="number"

name="cq"

value={form.cq}

onChange={handleChange}

className="
mt-2
w-full
rounded-xl
border
p-3
"

/>

</div>







{

!isHigherClass &&

<div>

<label className="font-semibold">
SAQ Mark
</label>


<input

type="number"

name="saq"

value={form.saq}

onChange={handleChange}

className="
mt-2
w-full
rounded-xl
border
p-3
"

/>

</div>

}








<div>

<label className="font-semibold">
MCQ Mark
</label>


<input

type="number"

name="mcq"

value={form.mcq}

onChange={handleChange}

className="
mt-2
w-full
rounded-xl
border
p-3
"

/>

</div>



</div>







<div className="
mt-6
rounded-2xl
bg-blue-50
p-5
">


<p className="
text-lg
font-bold
text-blue-700
">

Total Mark:
<span className="ml-2">
{totalMark}
</span>

</p>


</div>



</div>




<button

disabled={!generatedResults.length}

onClick={()=>{



    const incomplete = students.some((student:any)=>{

const mark = marks.find(
(item:any)=>item.student_id===student.student_id
);


if(!mark){
return true;
}


if(
mark.cq === undefined ||
mark.mcq === undefined
){

return true;

}


if(
!isHigherClass &&
mark.saq === undefined
){

return true;

}


return false;


});


if(incomplete){

alert(
"⚠️ Please enter all student marks before generating PDF"
);

return;

}



generateResultPDF({

    logo:"/logo.png",

className: className,

subject: form.subject,

examType: form.examType,

topic: form.topic,

date: form.date,

students: generatedResults

});







}}

className="
mb-4
w-full
rounded-xl
bg-blue-600
py-3
font-bold
text-white
"

>

📄 Download Result PDF

</button>



<button
className="mt-3 w-full bg-green-600 text-white py-3 rounded-xl"
onClick={async()=>{

  const pdfUrl = "/generated-result.pdf"; // পরে dynamic করবো

  

window.open(
  "https://chat.whatsapp.com/J2wrLbfjzrX8OARBIxdKdz?mode=gi_t",
  "_blank"
);




  
  
  


}}
>
📱 Share Result
</button>




<button

onClick={()=>{

setShowModal(true);

loadStudents();

}}

className="
w-full
rounded-2xl
bg-gradient-to-r
from-blue-600
to-cyan-500
py-4
text-lg
font-bold
text-white
shadow-lg
transition
hover:scale-[1.02]
"

>

🚀 Generate Result

</button>





</div>



{

showModal && (

<div className="
fixed
inset-0
z-50
flex
items-center
justify-center
bg-black/50
p-5
">


<div className="
w-full
max-w-3xl
rounded-3xl
bg-white
p-8
shadow-2xl
">


<div className="
flex
justify-between
items-center
mb-6
">


<h2 className="
text-2xl
font-bold
text-blue-700
">

🚀 Generate Result

</h2>


<button

onClick={()=>setShowModal(false)}

className="
text-xl
font-bold
text-red-500
"

>

✕

</button>


</div>



<div className="
rounded-xl
bg-blue-50
p-5
">


<p>
Class:
<b className="ml-2">
{className}
</b>
</p>


<p>
Subject:
<b className="ml-2">
{form.subject || "Not Selected"}
</b>
</p>


<p>
Exam:
<b className="ml-2">
{form.examType || "Not Selected"}
</b>
</p>


</div>



<div className="
mt-6
text-center
text-gray-500
">

<div className="
mt-6
overflow-x-auto
">


<div className="
mt-6
overflow-x-auto
">


<table className="
w-full
border-collapse
">


<thead>

<tr className="
bg-gray-100
text-left
">


<th className="p-3">
Student ID
</th>


<th className="p-3">
Student Name
</th>



<th className="p-3">
CQ
</th>



{

!isHigherClass &&

<th className="p-3">
SAQ
</th>

}




<th className="p-3">
MCQ
</th>



<th className="p-3">
Total
</th>


<th className="p-3">
Percentage
</th>


<th className="p-3">
Grade
</th>


<th className="p-3">
Position
</th>

</tr>

</thead>





<tbody>


{

students.map(student=>{


const studentMark =
marks.find(
item=>item.student_id===student.student_id
)
|| {};



const total =

Number(studentMark.cq || 0)

+

Number(
studentMark.saq || 0
)

+

Number(
studentMark.mcq || 0
);



return (


<tr

key={student.id}

className="
border-b
hover:bg-blue-50
transition
"

>


<td className="p-3 font-semibold">

{student.student_id}

</td>



<td className="p-3">

{student.student_name}

</td>





<td className="p-3">

<input

type="number"

className="
w-20
rounded-lg
border
p-2
"

onChange={e=>

updateMark(

student.student_id,

"cq",

e.target.value

)

}

/>

</td>







{

!isHigherClass &&

<td className="p-3">

<input

type="number"

className="
w-20
rounded-lg
border
p-2
"

onChange={e=>

updateMark(

student.student_id,

"saq",

e.target.value

)

}

/>

</td>

}







<td className="p-3">

<input

type="number"

className="
w-20
rounded-lg
border
p-2
"

onChange={e=>

updateMark(

student.student_id,

"mcq",

e.target.value

)

}

/>

</td>







<td className="
p-3
font-bold
text-blue-700
">

{total}

</td>


<td className="p-3 font-semibold">

{

(
(total / totalMark) * 100
).toFixed(2)

}%

</td>




<td className="
p-3
font-bold
text-green-600
">

{

getGrade(
(total / totalMark) * 100
)

}

</td>


<td className="
p-3
font-bold
text-purple-600
">

{getPosition(student.student_id)}

</td>







</tr>


)


})


}



</tbody>


</table>


<button

onClick={async()=>{


const resultData = students.map((student:any)=>{


const studentMark =
marks.find(
(item:any)=>item.student_id===student.student_id
) || {};



const total =

Number(studentMark.cq || 0)

+

Number(studentMark.saq || 0)

+

Number(studentMark.mcq || 0);



const percentage =

(total / totalMark) * 100;



return {

student_id: student.student_id,

student_name: student.student_name,

cq: studentMark.cq || 0,

saq: studentMark.saq || 0,

mcq: studentMark.mcq || 0,

total: total,

percentage: percentage.toFixed(2),

grade: getGrade(percentage),


};


});





const sorted = [...resultData].sort(

(a,b)=>b.total-a.total

);



const finalResult = sorted.map(

(item,index)=>({


...item,

position:

index===0
?
"1st"
:
index===1
?
"2nd"
:
index===2
?
"3rd"
:
`${index+1}th`


})


);




const { error } = await supabase
.from("results")
.insert(
  finalResult.map((item:any)=>({

    student_id: item.student_id,

    exam_name: form.topic,

    subject: form.subject,

    marks: item.total,

    total_marks: totalMark,

    percentage: item.percentage,

    grade: item.grade,

    position: item.position,

    exam_type: form.examType,

    exam_number: form.examNumber,

    chapter: form.topic,

    batch: students.find(
      s=>s.student_id===item.student_id
    )?.batch,

    class: className,

    comment: ""

  }))
);


if(error){

alert(error.message);

return;

}


alert("✅ Result saved successfully");



setGeneratedResults(finalResult);



setShowModal(false);


}}

className="
mt-6
w-full
rounded-xl
bg-gradient-to-r
from-blue-600
to-cyan-500
py-3
font-bold
text-white
"

>
✅ Save Result

</button>



</div>


</div>

</div>



</div>


</div>

)

}



</main>

)


}