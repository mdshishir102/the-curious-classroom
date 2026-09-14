"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";


export default function ManageResultPage() {


const router = useRouter();


const [results,setResults] = useState<any[]>([]);

const [students,setStudents] = useState<any[]>([]);

const [filteredResults,setFilteredResults] = useState<any[]>([]);

const [selectedStudent,setSelectedStudent] = useState("");

const [subject,setSubject] = useState("");

const [examType,setExamType] = useState("");

const [loading,setLoading] = useState(true);





async function loadResults(){


const {data,error}=await supabase

.from("results")

.select("*")

.order(
"created_at",
{
ascending:false
}
);



if(!error){

setResults(data || []);

setFilteredResults(data || []);

}


setLoading(false);


}







async function loadStudents(){


const {data,error}=await supabase

.from("students")

.select("*")

.eq(
"status",
"approved"
);



if(!error){

setStudents(data || []);

}


}







useEffect(()=>{


loadResults();

loadStudents();


},[]);







function filterResults(){


let data=[...results];



if(selectedStudent){

data=data.filter(

item=>

item.student_id===selectedStudent

);

}



if(subject){

data=data.filter(

item=>

item.subject===subject

);

}



if(examType){

data=data.filter(

item=>

item.exam_type===examType

);

}



setFilteredResults(data);


}






useEffect(()=>{


filterResults();


},[
selectedStudent,
subject,
examType,
results
]);







const subjects=[

...new Set(
results.map(
item=>item.subject
)
)

];




const examTypes=[

...new Set(
results.map(
item=>item.exam_type
)
)

];







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

Result Management

</h1>





<div className="
mb-8
grid
gap-4
rounded-2xl
bg-white
p-6
md:grid-cols-3
">





<select

className="
rounded-lg
border
p-3
"

value={selectedStudent}

onChange={
e=>setSelectedStudent(e.target.value)
}

>

<option value="">

All Students

</option>


{

students.map(student=>(


<option

key={student.id}

value={student.student_id}

>

{student.student_name}

-
{student.student_id}

</option>


))

}


</select>








<select

className="
rounded-lg
border
p-3
"

value={subject}

onChange={
e=>setSubject(e.target.value)
}

>

<option value="">

All Subjects

</option>


{

subjects.map(item=>(


<option key={item}>

{item}

</option>


))

}


</select>







<select

className="
rounded-lg
border
p-3
"

value={examType}

onChange={
e=>setExamType(e.target.value)
}

>

<option value="">

All Exam Types

</option>



{

examTypes.map(item=>(


<option key={item}>

{item}

</option>


))

}



</select>



</div>








{

loading ?


<p>
Loading...
</p>


:


filteredResults.length===0 ?


<div className="
rounded-xl
bg-white
p-6
">

No Result Found

</div>


:


<div className="
space-y-5
">


{

filteredResults.map(result=>(


<div

key={result.id}

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

{

students.find(

student=>

student.student_id===result.student_id

)?.student_name

||

"Unknown Student"

}

</h2>



<p className="text-gray-500">

{result.student_id}

</p>



<p>

Subject: {result.subject}

</p>



<p>

Exam: {result.exam_type}

</p>


</div>





<div className="
text-right
">


<p className="
text-xl
font-bold
text-blue-600
">

{result.marks}/{result.total_marks}

</p>


<p className="
font-bold
text-green-600
">

{result.grade}

</p>


<p>

{result.percentage}%

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


router.push(

`/admin/result/manage/edit/${result.id}`

)

}

className="
rounded-lg
bg-yellow-500
px-5
py-2
text-white
"

>

Edit

</button>







<button

onClick={async()=>{


const ok=confirm(
"Delete this result?"
);



if(!ok)
return;



const {error}=await supabase

.from("results")

.delete()

.eq(
"id",
result.id
);



if(!error){

loadResults();

}



}}

className="
rounded-lg
bg-red-600
px-5
py-2
text-white
"

>

Delete

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