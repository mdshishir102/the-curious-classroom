"use client";


import {useEffect,useState} from "react";
import {supabase} from "@/lib/supabase";



export default function AdminFeePage(){


const [fees,setFees]=useState<any[]>([]);

const [students,setStudents]=useState<any[]>([]);

const [loading,setLoading]=useState(true);


const [academicYear,setAcademicYear]=useState(2026);


const [selectedStudent,setSelectedStudent]=useState("");

const [discountFee,setDiscountFee]=useState("");

const [reason,setReason]=useState("");







async function loadFees(){


setLoading(true);



const {data,error}=await supabase

.from("monthly_fee_settings")

.select("*")

.eq(
"academic_year",
academicYear
)

.order(
"id",
{
ascending:true
}

);




if(error){

alert(error.message);

setLoading(false);

return;

}



setFees(data || []);

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


loadFees();

loadStudents();


},[academicYear]);









async function saveDiscount(){



if(
!selectedStudent ||
!discountFee ||
!reason
){

alert("Fill all fields");

return;

}






const {error}=await supabase

.from("student_fee_settings")

.upsert({


student_id:selectedStudent,


academic_year:academicYear,


monthly_fee:Number(discountFee),


reason:reason,


created_by:"admin"



});







if(error){

alert(error.message);

return;

}




alert(
"Discount Saved Successfully"
);




setSelectedStudent("");

setDiscountFee("");

setReason("");



}









return(


<main className="
min-h-screen
bg-gradient-to-br
from-blue-50
via-white
to-indigo-100
p-8
">



<div className="
max-w-6xl
mx-auto
">





<h1 className="
text-4xl
font-bold
text-gray-800
">

💰 Fee Management

</h1>



<p className="
mt-2
text-gray-500
">

Manage academic year wise monthly fees

</p>







{/* YEAR */}



<div className="
mt-8
bg-white
rounded-3xl
shadow-lg
p-6
">


<h2 className="
font-bold
text-xl
mb-4
">

Academic Year

</h2>



<select

className="
border
rounded-xl
p-3
w-full
md:w-64
"

value={academicYear}

onChange={
e=>
setAcademicYear(
Number(e.target.value)
)
}

>


<option value={2026}>
2026
</option>


<option value={2027}>
2027
</option>


</select>



</div>








{/* FEE CARDS */}



<div className="
mt-8
grid
md:grid-cols-2
gap-6
">


{


loading ?


<p>
Loading...
</p>


:


fees.length===0 ?


<div className="
bg-white
rounded-xl
p-6
">

No Fee Setting Found

</div>



:


fees.map(fee=>(


<div

key={fee.id}

className="
bg-white
rounded-3xl
shadow-lg
p-6
"

>


<div className="
flex
justify-between
">


<h2 className="
text-2xl
font-bold
text-blue-700
">

{fee.class_name}

</h2>



<span className="
bg-green-100
text-green-700
px-4
py-1
rounded-full
">

{fee.academic_year}

</span>


</div>




<div className="
mt-5
bg-blue-50
rounded-xl
p-5
">


<p>
Monthly Fee
</p>


<h3 className="
text-3xl
font-bold
text-blue-700
">

৳ {fee.amount}

</h3>


</div>




<div className="
mt-3
bg-orange-50
rounded-xl
p-5
">


<p>
Payment Due Date
</p>


<p className="
font-bold
text-orange-700
">

Every month {fee.due_date}th

</p>


</div>



</div>


))


}


</div>









{/* DISCOUNT SECTION */}



<div className="
mt-10
bg-white
rounded-3xl
shadow-lg
p-8
">


<h2 className="
text-2xl
font-bold
mb-5
">

🎓 Student Fee Discount

</h2>






<select

className="
w-full
border
rounded-xl
p-3
mb-4
"

value={selectedStudent}

onChange={
e=>
setSelectedStudent(
e.target.value
)
}

>


<option value="">

Select Student

</option>


{


students.map(student=>(


<option

key={student.id}

value={student.id}

>


{student.student_name}

-

{student.student_id}



</option>


))


}



</select>







<input

className="
w-full
border
rounded-xl
p-3
mb-4
"

type="number"

placeholder="Discount Monthly Fee"

value={discountFee}

onChange={
e=>
setDiscountFee(
e.target.value
)
}


/>







<input

className="
w-full
border
rounded-xl
p-3
mb-4
"

placeholder="Reason"

value={reason}

onChange={
e=>
setReason(
e.target.value
)
}


/>







<button

onClick={saveDiscount}

className="
w-full
bg-green-600
text-white
rounded-xl
py-3
font-bold
"

>

💾 Save Discount

</button>





</div>









</div>


</main>


)


}