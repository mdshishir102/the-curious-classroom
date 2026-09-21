"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


export default function AdminFeePage(){


const [fees,setFees]=useState<any[]>([]);

const [students,setStudents]=useState<any[]>([]);

const [dueStudents,setDueStudents]=useState<any[]>([]);


const [loading,setLoading]=useState(true);


const [academicYear,setAcademicYear]=useState(2026);


const [selectedMonth,setSelectedMonth]=useState(
new Date().toLocaleString(
"en-US",
{
month:"long"
}
)
);



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









async function loadDueStudents(){



const {data:allStudents,error}=await supabase

.from("students")

.select("*")

.eq(
"status",
"approved"
);



if(error){

alert(error.message);

return;

}



const studentIds =
allStudents?.map(
student=>student.id
) || [];




const {data:payments}=await supabase

.from("payments")

.select("student_id")

.in(
"student_id",
studentIds
)

.eq(
"month",
selectedMonth
)

.eq(
"year",
academicYear
)

.eq(
"status",
"paid"
);





const paidIds = new Set(

payments?.map(
payment=>payment.student_id
)

);




const dueList = allStudents?.filter(student=>{


// Admission date check

const admissionDate = new Date(
student.admission_date
);



const selectedDate = new Date(
`${selectedMonth} 1, ${academicYear}`
);




// Admission এর আগের মাস হলে দেখাবে না

if(admissionDate > selectedDate){

return false;

}



// Payment check

return !paidIds.has(student.id);



});






setDueStudents(
dueList || []
);


}









useEffect(()=>{


loadFees();

loadStudents();

loadDueStudents();


},[
academicYear,
selectedMonth
]);








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




function sendWhatsApp(student:any){


const message =

`আসসালামু আলাইকুম।

সম্মানিত অভিভাবক,

আশা করি আপনারা ভালো আছেন।

শিক্ষার্থীদের নিয়মিত ক্লাস ও একাডেমিক কার্যক্রমের ধারাবাহিকতা বজায় রাখার স্বার্থে মাসিক ফি সংক্রান্ত একটি বিষয়ে আপনাদের অবগত করা যাচ্ছে।

আপনার সন্তান ${student.student_name}-এর ${selectedMonth} মাসের মাসিক ফি এখনো পরিশোধ করা হয়নি।

শিক্ষার্থী: ${student.student_name}
শ্রেণি: ${student.class}
বকেয়া মাস: ${selectedMonth} ${academicYear}

অনুগ্রহ করে আগামী ১৫ তারিখের মধ্যে বকেয়া মাসিক ফি পরিশোধ করে শিক্ষার্থীর নিয়মিত পড়াশোনার কার্যক্রম অব্যাহত রাখতে সহযোগিতা করবেন।

নির্ধারিত সময়ের মধ্যে ফি পরিশোধ না হলে প্রতিষ্ঠানের নিয়ম অনুযায়ী শিক্ষার্থীর ভর্তি সাময়িকভাবে স্থগিত হতে পারে। পরবর্তীতে পুনরায় ভর্তি কার্যক্রম চালু করতে নির্ধারিত পুনঃভর্তি ফি প্রযোজ্য হবে।

আপনাদের সহযোগিতা ও আন্তরিকতার জন্য আন্তরিক ধন্যবাদ।

শুভেচ্ছান্তে,

শিশির স্যার
Biology Teacher
The Curious Classroom`;




const phone =

student.whatsapp.replace(
/[^0-9]/g,
""
);



window.open(

`https://wa.me/88${phone}?text=${encodeURIComponent(message)}`,

"_blank"

);


}







return(

<main className="
min-h-screen
bg-slate-50
p-6
md:p-10
">


<div className="
max-w-7xl
mx-auto
">


{/* HEADER */}

<div className="
bg-white
rounded-3xl
shadow-lg
p-6
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

Manage fees, payments and pending collections

</p>


</div>





{/* FILTER */}


<div className="
mt-8
bg-white
rounded-3xl
shadow-lg
p-6
">


<div className="
grid
md:grid-cols-2
gap-6
">


<div>

<p className="
font-bold
mb-2
">

Academic Year

</p>


<select

className="
border
rounded-xl
p-3
w-full
"

value={academicYear}

onChange={
e=>setAcademicYear(
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






<div>

<p className="
font-bold
mb-2
">

Payment Month

</p>



<select

className="
border
rounded-xl
p-3
w-full
"

value={selectedMonth}

onChange={
e=>setSelectedMonth(
e.target.value
)
}

>


{

[
"January",
"February",
"March",
"April",
"May",
"June",
"July",
"August",
"September",
"October",
"November",
"December"

].map(month=>(

<option key={month}>

{month}

</option>

))

}


</select>


</div>


</div>


</div>









{/* FEE SETTINGS */}


<div className="
mt-8
grid
md:grid-cols-2
gap-6
">


{

loading ?


<div className="
bg-white
rounded-3xl
p-6
">

Loading...

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
items-center
">


<h2 className="
text-2xl
font-bold
text-blue-700
">

{fee.class_name}

</h2>


<span className="
bg-blue-100
text-blue-700
px-4
py-2
rounded-full
font-bold
">

{fee.academic_year}

</span>


</div>





<div className="
mt-5
bg-blue-50
rounded-2xl
p-5
">


<p className="
text-gray-500
">

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
mt-4
bg-orange-50
rounded-2xl
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








{/* PENDING SECTION */}


<div className="
mt-12
">


<div className="
flex
justify-between
items-center
mb-6
">


<h2 className="
text-3xl
font-bold
text-gray-800
">

⚠️ Pending Fee Collection

</h2>


<span className="
bg-red-100
text-red-700
px-4
py-2
rounded-full
font-bold
">

{selectedMonth} {academicYear}

</span>


</div>





{
["Class 9","Class 10","Class 11","Class 12"]

.map(className=>{


const classStudents =
dueStudents.filter(
student=>student.class===className
);



if(classStudents.length===0)
return null;



return(

<div

key={className}

className="
bg-white
rounded-3xl
shadow-lg
p-6
mb-6
"

>


<h3 className="
text-2xl
font-bold
text-blue-700
mb-5
">

🎓 {className}

</h3>



<div className="
grid
md:grid-cols-2
gap-5
">


{

classStudents.map(student=>(


<div

key={student.id}

className="
border
rounded-2xl
p-5
"

>


<div className="
flex
justify-between
">


<div>


<h4 className="
font-bold
text-xl
">

{student.student_name}

</h4>


<p>
ID: {student.student_id}
</p>


</div>



<span className="
bg-red-100
text-red-700
px-3
py-1
rounded-full
font-bold
">

DUE

</span>


</div>




<div className="
mt-4
bg-orange-50
rounded-xl
p-4
">


<p>
Due Month
</p>


<p className="
font-bold
text-orange-700
">

{selectedMonth} {academicYear}

</p>


</div>





<button

onClick={()=>sendWhatsApp(student)}

className="
mt-4
w-full
bg-green-600
text-white
rounded-xl
py-3
font-bold
"

>

💬 WhatsApp Reminder

</button>


</div>


))


}


</div>


</div>


)


})


}


</div>


{/* DISCOUNT SECTION */}


<div className="
mt-12
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
e=>setSelectedStudent(
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
e=>setDiscountFee(
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
e=>setReason(
e.target.value
)
}

/>







<button

onClick={saveDiscount}

className="
w-full
bg-green-600
hover:bg-green-700
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