"use client";


import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";



export default function PaymentHistoryPage(){


const params = useParams();


const id = params.id;



const [student,setStudent] = useState<any>(null);

const [payments,setPayments] = useState<any[]>([]);

const [loading,setLoading] = useState(true);







async function loadHistory(){



const {data:studentData,error:studentError}=await supabase

.from("students")

.select("*")

.eq(
"id",
id
)

.single();




if(studentError){

alert(studentError.message);

return;

}





const {data:paymentData,error:paymentError}=await supabase

.from("payments")

.select("*")

.eq(
"student_id",
id
)

.order(
"payment_date",
{
ascending:false
}
);





if(paymentError){

alert(paymentError.message);

return;

}




setStudent(studentData);

setPayments(paymentData || []);

setLoading(false);



}





useEffect(()=>{


loadHistory();


},[]);








if(loading){

return(

<div className="
min-h-screen
flex
items-center
justify-center
font-bold
">

Loading...

</div>

)

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
max-w-5xl
mx-auto
">





<div className="
bg-white
rounded-3xl
shadow-xl
p-8
">





<h1 className="
text-3xl
font-bold
text-gray-800
">

💳 Payment History

</h1>




<div className="
mt-6
bg-blue-50
rounded-2xl
p-5
">


<h2 className="
text-xl
font-bold
text-blue-700
">

{student.student_name}

</h2>


<p>

Student ID:
{student.student_id}

</p>


<p>

Class:
{student.class}

</p>


<p>

Batch:
{student.batch}

</p>



</div>








<h2 className="
mt-10
mb-5
text-2xl
font-bold
">

Monthly Payments

</h2>







{

payments.length===0 ?


<div className="
bg-gray-100
rounded-xl
p-5
">

No payment history found

</div>



:


<div className="
space-y-5
">



{

payments.map(payment=>(


<div

key={payment.id}

className="
bg-white
border
rounded-2xl
p-6
shadow
"


>


<div className="
flex
justify-between
">


<div>


<h3 className="
text-xl
font-bold
text-green-600
">

{payment.month} {payment.year}

</h3>


<p>

Amount:
৳{payment.amount}

</p>


<p>

Method:
{payment.payment_method}

</p>



{

payment.transaction_id &&

<p>

Transaction:
{payment.transaction_id}

</p>

}


</div>





<div className="
text-right
">


<p className="
font-bold
text-blue-600
">

Paid ✅

</p>



<p className="
text-gray-500
">

{

new Date(
payment.payment_date
)
.toLocaleString()

}

</p>



</div>



</div>



</div>


))


}



</div>


}



</div>



</div>


</main>


)


}