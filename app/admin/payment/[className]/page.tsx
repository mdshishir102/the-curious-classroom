"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";



export default function ClassPaymentPage(){


const params = useParams();


const className = decodeURIComponent(
params.className as string
);



const [students,setStudents] = useState<any[]>([]);

const [loading,setLoading] = useState(true);


const [selectedStudent,setSelectedStudent] = useState<any>(null);

const [showModal,setShowModal] = useState(false);



const [payment,setPayment] = useState({

month:"",
year:new Date().getFullYear(),

amount:"",

payment_method:"",

transaction_id:""

});








async function loadStudents(){


const {data,error}=await supabase

.from("students")

.select("*")

.eq(
"class",
className
)

.eq(
"status",
"approved"
)

.order(
"student_name",
{
ascending:true
}
);




if(error){

alert(error.message);

return;

}



setStudents(data || []);

setLoading(false);


}









useEffect(()=>{


loadStudents();


},[]);









async function addPayment(){


if(

!selectedStudent ||

!payment.month ||

!payment.amount ||

!payment.payment_method

){


alert("Please fill all required fields");

return;


}





const monthNumber =
String(
new Date(`${payment.month} 1`).getMonth()+1
).padStart(2,"0");


const receiptNumber =
Math.floor(
100000 + Math.random()*900000
);


const receiptId =
`TCC-${payment.year}-${monthNumber}-${receiptNumber}`;




const {error}=await supabase

.from("payments")



.insert({

student_id:selectedStudent.id,

month:payment.month,

year:Number(payment.year),

amount:Number(payment.amount),

payment_method:payment.payment_method,

transaction_id:payment.transaction_id,

status:"paid",

receipt_id:receiptId,

receipt_status:"active",

generated_at:new Date()

});




if(error){


alert(error.message);

return;


}






alert("Payment Added Successfully");



setShowModal(false);



setSelectedStudent(null);



setPayment({

month:"",

year:new Date().getFullYear(),

amount:"",

payment_method:"",

transaction_id:""

});



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

💳 {className} Payment Management

</h1>



<p className="
mt-2
mb-8
text-gray-500
">

Monthly payment collection & history

</p>





{
loading ?


<div>

Loading...

</div>


:


<div className="
space-y-5
">


{
students.map(student=>(


<div

key={student.id}

className="
bg-white
rounded-3xl
p-6
shadow-lg
flex
justify-between
items-center
"


>


<div>


<h2 className="
text-xl
font-bold
text-blue-700
">

{student.student_name}

</h2>


<p>

ID:
{student.student_id}

</p>


<p>

📱 {student.whatsapp}

</p>


<p>

Batch:
{student.batch}

</p>


</div>





<div className="
flex
gap-3
">


<button

onClick={()=>{

setSelectedStudent(student);

setShowModal(true);

}}

className="
rounded-xl
bg-green-600
px-5
py-3
text-white
font-bold
"

>

➕ Add Payment

</button>





<Link

href={`/admin/payment/history/${student.id}`}

className="
rounded-xl
bg-blue-600
px-5
py-3
text-white
font-bold
"

>

📄 History

</Link>



</div>




</div>


))


}



</div>



}


{/* PAYMENT MODAL */}

{

showModal && (


<div className="
fixed
inset-0
bg-black/40
flex
items-center
justify-center
z-50
">


<div className="
bg-white
rounded-3xl
p-8
w-full
max-w-md
shadow-2xl
">


<h2 className="
text-2xl
font-bold
text-gray-800
mb-5
">

Add Monthly Payment

</h2>



<p className="
mb-5
text-blue-700
font-bold
">

Student:
{selectedStudent?.student_name}

</p>





<select

className="
w-full
border
rounded-xl
p-3
mb-4
"

value={payment.month}

onChange={(e)=>setPayment({

...payment,

month:e.target.value

})}

>


<option value="">

Select Month

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







<input

className="
w-full
border
rounded-xl
p-3
mb-4
"

type="number"

placeholder="Amount"

value={payment.amount}

onChange={(e)=>setPayment({

...payment,

amount:e.target.value

})}

/>







<select

className="
w-full
border
rounded-xl
p-3
mb-4
"


value={payment.payment_method}


onChange={(e)=>setPayment({

...payment,

payment_method:e.target.value

})}


>


<option value="">

Payment Method

</option>


<option value="bKash">

bKash

</option>


<option value="Offline">

Offline

</option>


</select>







{

payment.payment_method==="bKash"

&&


<input

className="
w-full
border
rounded-xl
p-3
mb-4
"

placeholder="Transaction ID"

value={payment.transaction_id}

onChange={(e)=>setPayment({

...payment,

transaction_id:e.target.value

})}

/>


}







<div className="
flex
gap-4
">


<button

onClick={()=>setShowModal(false)}

className="
flex-1
rounded-xl
bg-gray-300
py-3
font-bold
"

>

Cancel

</button>





<button

onClick={addPayment}

className="
flex-1
rounded-xl
bg-blue-600
py-3
text-white
font-bold
"

>

Save Payment

</button>



</div>





</div>


</div>


)


}






</div>


</main>


)

}