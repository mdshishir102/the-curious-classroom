"use client";


import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";



export default function ManageFeePage(){


const [students,setStudents] = useState<any[]>([]);

const [fees,setFees] = useState<any[]>([]);

const [filteredFees,setFilteredFees] = useState<any[]>([]);



const [selectedStudent,setSelectedStudent] = useState("");

const [month,setMonth] = useState("");

const [status,setStatus] = useState("");



const [loading,setLoading] = useState(true);







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







async function loadFees(){



const {data,error}=await supabase

.from("fees")

.select("*")

.order(
"created_at",
{
ascending:false
}
);



if(!error){

setFees(data || []);

setFilteredFees(data || []);

}



setLoading(false);


}







useEffect(()=>{


loadStudents();

loadFees();


},[]);








useEffect(()=>{


let data=[...fees];




if(selectedStudent){


data=data.filter(

item=>

item.student_id===selectedStudent

);


}





if(month){


data=data.filter(

item=>

item.month===month

);


}





if(status){


data=data.filter(

item=>

item.status===status

);


}




setFilteredFees(data);



},[
selectedStudent,
month,
status,
fees
]);








async function deleteFee(id:number){


const confirmDelete =

confirm(
"Delete this fee?"
);



if(!confirmDelete)
return;





const {error}=await supabase

.from("fees")

.delete()

.eq(
"id",
id
);





if(error){

alert(error.message);

return;

}





alert("Fee Deleted");


loadFees();


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

Fee Management

</h1>







{/* Filters */}


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

All Months

</option>


<option>
January
</option>


<option>
February
</option>


<option>
March
</option>


<option>
April
</option>


<option>
May
</option>


<option>
June
</option>


<option>
July
</option>


<option>
August
</option>


<option>
September
</option>


<option>
October
</option>


<option>
November
</option>


<option>
December
</option>


</select>








<select

className="
rounded-lg
border
p-3
"

value={status}

onChange={
e=>setStatus(e.target.value)
}

>


<option value="">

All Status

</option>



<option value="paid">

Paid

</option>



<option value="due">

Due

</option>



</select>






</div>








{

loading ?


<p>

Loading...

</p>


:


filteredFees.length===0 ?


<div className="
rounded-xl
bg-white
p-6
">

No Fee Found

</div>


:



<div className="
space-y-5
">





{

filteredFees.map((fee)=>(


<div

key={fee.id}

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

student.student_id===fee.student_id

)?.student_name

}


</h2>




<p className="text-gray-500">

{fee.student_id}

</p>



<p className="
mt-2
font-semibold
">

{fee.month}

</p>




<p>

৳ {fee.amount}

</p>




</div>







<span

className={`
rounded-full
px-4
py-1

${
fee.status==="paid"

?

"bg-green-100 text-green-700"

:

"bg-yellow-100 text-yellow-700"

}

`}

>

{fee.status}

</span>






</div>







<div className="
mt-5
flex
gap-4
">





<button

onClick={()=>
window.location.href =
`/admin/fee/manage/edit/${fee.id}`
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

onClick={()=>
deleteFee(fee.id)
}

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