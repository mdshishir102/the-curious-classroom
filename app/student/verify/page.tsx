"use client";

import {useEffect,useState} from "react";
import {supabase} from "@/lib/supabase";



export default function VerifyReceiptPage(){


const [payment,setPayment]=useState<any>(null);

const [loading,setLoading]=useState(true);






useEffect(()=>{

loadReceipt();

},[]);







async function loadReceipt(){


const params = new URLSearchParams(
window.location.search
);


const receipt =
params.get("receipt");



if(!receipt){

setLoading(false);

return;

}





// GET PAYMENT DATA

const {data:paymentData,error:paymentError}=await supabase

.from("payments")

.select("*")

.eq(
"receipt_id",
receipt
)

.single();





if(paymentError){

console.log(paymentError);

setLoading(false);

return;

}







// GET STUDENT DATA

const {data:studentData,error:studentError}=await supabase

.from("students")

.select(
`
student_name,
student_id,
class,
batch
`
)

.eq(
"id",
paymentData.student_id
)

.single();






if(studentError){

console.log(studentError);

}







setPayment({

...paymentData,

student_name:
studentData?.student_name || "N/A",

student_id:
studentData?.student_id || "N/A",

class:
studentData?.class || "N/A",

batch:
studentData?.batch || "N/A"

});



setLoading(false);


}









if(loading){

return(

<div className="
min-h-screen
flex
items-center
justify-center
bg-gradient-to-br
from-blue-50
via-white
to-indigo-100
">

<div className="
bg-white
rounded-3xl
shadow-xl
px-8
py-6
text-xl
font-bold
text-blue-700
">

Verifying Receipt...

</div>

</div>

)

}







if(!payment){

return(

<div className="
min-h-screen
flex
items-center
justify-center
bg-red-50
p-6
">

<div className="
bg-white
rounded-3xl
shadow-xl
p-10
text-center
">

<h1 className="
text-3xl
font-bold
text-red-600
">

Invalid Receipt

</h1>


<p className="
mt-3
text-gray-500
">

This payment receipt could not be verified.

</p>


</div>

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
p-6
">


<div className="
max-w-3xl
mx-auto
">





{/* HEADER */}


<div className="
bg-white
rounded-3xl
shadow-xl
p-8
text-center
">


<img

src="/logo.png"

className="
w-24
h-24
object-contain
mx-auto
"

alt="logo"

/>





<h1 className="
mt-4
text-3xl
font-bold
text-blue-700
">

The Curious Classroom

</h1>



<p className="
text-gray-500
mt-2
">

Official Payment Verification Portal

</p>






<div className="
mt-6
inline-flex
items-center
bg-green-100
text-green-700
px-6
py-3
rounded-full
font-bold
text-lg
">

✓ Payment Verified

</div>



</div>









{/* RECEIPT INFORMATION */}



<div className="
mt-8
bg-white
rounded-3xl
shadow-xl
p-8
">


<h2 className="
text-xl
font-bold
text-gray-800
mb-6
">

🧾 Receipt Information

</h2>





<div className="
grid
md:grid-cols-2
gap-5
">





<div className="
bg-blue-50
rounded-2xl
p-5
">

<p className="
text-gray-500
text-sm
">

Receipt ID

</p>


<h3 className="
font-bold
text-blue-700
">

{payment.receipt_id}

</h3>


</div>






<div className="
bg-green-50
rounded-2xl
p-5
">

<p className="
text-gray-500
text-sm
">

Status

</p>


<h3 className="
font-bold
text-green-700
">

PAID ✓

</h3>


</div>






<div className="
bg-purple-50
rounded-2xl
p-5
">

<p className="
text-gray-500
text-sm
">

Payment Month

</p>


<h3 className="
font-bold
">

{payment.month} {payment.year}

</h3>


</div>






<div className="
bg-yellow-50
rounded-2xl
p-5
">

<p className="
text-gray-500
text-sm
">

Amount

</p>


<h3 className="
font-bold
text-xl
text-blue-700
">

৳ {payment.amount}

</h3>


</div>




</div>





<div className="
mt-5
bg-gray-50
rounded-2xl
p-5
">


<p>

<b>Payment Method:</b> {payment.payment_method}

</p>


<p className="
mt-2
">

<b>Payment Date:</b>

{" "}

{
new Date(payment.payment_date)
.toLocaleDateString()
}

</p>


</div>




</div>









{/* STUDENT INFORMATION */}


<div className="
mt-8
bg-white
rounded-3xl
shadow-xl
p-8
">



<h2 className="
text-xl
font-bold
text-gray-800
mb-6
">

👤 Student Information

</h2>





<div className="
grid
md:grid-cols-2
gap-5
">





<div className="
bg-blue-50
rounded-2xl
p-5
">

<p className="
text-gray-500
">

Student Name

</p>


<h3 className="
font-bold
text-blue-700
">

{payment.student_name}

</h3>


</div>







<div className="
bg-green-50
rounded-2xl
p-5
">

<p className="
text-gray-500
">

Student ID

</p>


<h3 className="
font-bold
text-green-700
">

{payment.student_id}

</h3>


</div>







<div className="
bg-purple-50
rounded-2xl
p-5
">

<p className="
text-gray-500
">

Class

</p>


<h3 className="
font-bold
text-purple-700
">

{payment.class}

</h3>


</div>







<div className="
bg-yellow-50
rounded-2xl
p-5
">

<p className="
text-gray-500
">

Batch

</p>


<h3 className="
font-bold
text-yellow-700
">

{payment.batch}

</h3>


</div>





</div>



</div>









{/* FOOTER */}


<div className="
mt-8
text-center
text-gray-500
text-sm
">


<p>
This receipt is digitally verified by
</p>


<p className="
font-bold
text-gray-700
mt-1
">

The Curious Classroom

</p>



</div>





</div>

</main>


)


}