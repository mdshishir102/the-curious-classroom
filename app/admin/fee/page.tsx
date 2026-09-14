"use client";


import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";



export default function AdminFeePage(){


const [students,setStudents] = useState<any[]>([]);


const [studentId,setStudentId] = useState("");

const [month,setMonth] = useState("");

const [amount,setAmount] = useState("");

const [status,setStatus] = useState("paid");


const [loading,setLoading] = useState(false);





useEffect(()=>{


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


loadStudents();


},[]);







async function saveFee(){



if(
!studentId ||
!month ||
!amount
){

alert("Fill all fields");

return;

}



setLoading(true);





// Duplicate Check


const {data:existingFee}=

await supabase

.from("fees")

.select("*")

.eq(
"student_id",
studentId
)

.eq(
"month",
month
)

.maybeSingle();





if(existingFee){


alert(
"This month fee already exists for this student"
);


setLoading(false);


return;


}







const {error}=await supabase

.from("fees")

.insert({

student_id:studentId,

month:month,

amount:Number(amount),

status:status

});





if(error){


alert(error.message);


setLoading(false);


return;


}






alert(
"Fee Added Successfully"
);





setStudentId("");

setMonth("");

setAmount("");

setStatus("paid");



setLoading(false);



}









return(


<main className="
min-h-screen
bg-gray-100
p-8
">


<div className="
mx-auto
max-w-xl
rounded-3xl
bg-white
p-8
shadow
">





<h1 className="
text-3xl
font-bold
">

Add Student Fee

</h1>







<select

className="
mt-6
w-full
rounded-lg
border
p-3
"

value={studentId}

onChange={
e=>setStudentId(e.target.value)
}

>


<option value="">

Select Student

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
mt-4
w-full
rounded-lg
border
p-3
"

value={month}

onChange={
e=>setMonth(e.target.value)
}

>


<option value="">

Select Month

</option>


<option value="January">
January
</option>


<option value="February">
February
</option>


<option value="March">
March
</option>


<option value="April">
April
</option>


<option value="May">
May
</option>


<option value="June">
June
</option>


<option value="July">
July
</option>


<option value="August">
August
</option>


<option value="September">
September
</option>


<option value="October">
October
</option>


<option value="November">
November
</option>


<option value="December">
December
</option>


</select>








<input

className="
mt-4
w-full
rounded-lg
border
p-3
"

placeholder="Amount"

type="number"

value={amount}

onChange={
e=>setAmount(e.target.value)
}

/>







<select

className="
mt-4
w-full
rounded-lg
border
p-3
"

value={status}

onChange={
e=>setStatus(e.target.value)
}

>


<option value="paid">

Paid

</option>


<option value="due">

Due

</option>


</select>








<button

onClick={saveFee}

disabled={loading}

className="
mt-6
w-full
rounded-lg
bg-blue-600
py-3
text-white
"

>


{

loading

?

"Saving..."

:

"Add Fee"

}



</button>







</div>


</main>


)


}