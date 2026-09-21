"use client";


import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
import jsPDF from "jspdf";
import QRCode from "qrcode";




export default function StudentPaymentPage(){


const router = useRouter();



const [student,setStudent]=useState<any>(null);


const [payments,setPayments]=useState<any[]>([]);


const [loading,setLoading]=useState(true);

const [currentFee,setCurrentFee]=useState<any>(null);







useEffect(()=>{


const data = localStorage.getItem("student");



if(!data){

router.push("/student/login");

return;

}



const studentData = JSON.parse(data);



setStudent(studentData);



loadPayments(studentData.id);



},[]);








async function loadPayments(id:number){



const {data,error}=await supabase

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




if(error){

console.log(error);

}



const currentMonth = new Date().toLocaleString(
"en-US",
{
month:"long"
}
);


const currentYear = new Date().getFullYear();



const paid = data?.find(

item =>

item.month === currentMonth &&

item.year === currentYear

);




setCurrentFee({

month: currentMonth,

year: currentYear,

paid: !!paid,

payment: paid || null

});






setPayments(data || []);



setLoading(false);



}









async function downloadReceipt(payment:any){



const doc = new jsPDF();




const verifyUrl =

`https://thecuriousclassroom.vercel.app/student/verify?receipt=${payment.receipt_id}`;




const qrImage = await QRCode.toDataURL(

verifyUrl

);






doc.setFontSize(22);


doc.text(

"The Curious Classroom",

20,

25

);






doc.setFontSize(15);


doc.text(

"OFFICIAL PAYMENT RECEIPT",

20,

40

);







doc.setFontSize(12);



doc.text(

`Receipt ID: ${payment.receipt_id || "N/A"}`,

20,

60

);





doc.text(

`Student: ${student.student_name}`,

20,

80

);





doc.text(

`Student ID: ${student.student_id}`,

20,

90

);





doc.text(

`Class: ${student.class}`,

20,

100

);





doc.text(

`Month: ${payment.month} ${payment.year}`,

20,

120

);





doc.text(

`Amount: Tk ${payment.amount}`,

20,

130

);





doc.text(

`Method: ${payment.payment_method}`,

20,

140

);





doc.addImage(

qrImage,

"PNG",

20,

170,

45,

45

);





doc.save(

`Receipt-${payment.receipt_id}.pdf`

);



}


if(loading){


return(

<div className="
min-h-screen
flex
items-center
justify-center
bg-blue-50
font-bold
">

Loading Payment Portal...

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
max-w-5xl
mx-auto
">






{/* HEADER */}


<div className="
bg-white
rounded-3xl
shadow-xl
p-6
flex
items-center
justify-between
">


<div className="
flex
items-center
gap-4
">


<img

src="/logo.png"

className="
h-16
w-16
object-contain
"

alt="logo"

/>



<div>


<h1 className="
text-3xl
font-bold
text-blue-700
">

The Curious Classroom

</h1>


<p className="
text-gray-500
">

Student Payment Portal

</p>


</div>


</div>





<div className="
bg-green-100
text-green-700
px-4
py-2
rounded-full
font-bold
">

Active Student

</div>



</div>









{/* STUDENT PROFILE */}


<div className="
mt-8
bg-white
rounded-3xl
shadow-xl
p-8
">


<h2 className="
text-2xl
font-bold
text-gray-800
">

👤 Student Profile

</h2>





<div className="
mt-5
grid
md:grid-cols-3
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

Name

</p>


<h3 className="
text-xl
font-bold
text-blue-700
">

{student.student_name}

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

Class

</p>


<h3 className="
text-xl
font-bold
text-green-700
">

{student.class}

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

Batch

</p>


<h3 className="
text-xl
font-bold
text-purple-700
">

{student.batch}

</h3>


</div>




</div>


</div>





{/* CURRENT MONTH STATUS */}


<div className="
mt-8
bg-white
rounded-3xl
shadow-xl
p-8
">


<h2 className="
text-2xl
font-bold
text-gray-800
">

📅 Current Month Fee Status

</h2>



<div className="
mt-5
rounded-2xl
bg-gradient-to-r
from-blue-50
to-indigo-50
p-6
">


<p className="
text-gray-500
">

{currentFee.month} {currentFee.year}

</p>




{

currentFee.paid ?


<>

<h3 className="
mt-3
text-3xl
font-bold
text-green-600
">

✅ Paid

</h3>


<p className="
mt-3
text-gray-700
font-semibold
">

Amount:
৳ {currentFee.payment.amount}

</p>



<p className="
mt-2
text-sm
text-gray-500
">

Thank you for your timely payment.

</p>


</>


:


<>




<h3 className="
mt-3
text-3xl
font-bold
text-red-600
">

⚠️ Payment Due

</h3>


<p className="
mt-3
text-gray-600
">

Your monthly fee payment is pending.

</p>



<a

href="tel:+881346071073"

className="
inline-block
mt-5
bg-blue-600
hover:bg-blue-700
text-white
px-5
py-3
rounded-xl
font-bold
"

>

📞 Contact Office

</a>





<div className="
mt-6
bg-pink-50
border
border-pink-100
rounded-2xl
p-5
">


<h4 className="
font-bold
text-pink-700
text-lg
">

💳 Pay via bKash

</h4>



<p className="
mt-3
text-gray-600
">

Send Money Number

</p>



<h3 className="
text-2xl
font-bold
text-pink-700
mt-1
">

01540388217

</h3>



<span className="
inline-block
mt-2
bg-pink-100
text-pink-700
px-3
py-1
rounded-full
font-bold
text-sm
">

Send Money

</span>



<p className="
mt-4
text-sm
text-gray-600
">

Payment করার পর Transaction ID সংরক্ষণ করুন এবং প্রয়োজন হলে অফিসে প্রদান করুন।

</p>



</div>


</>


}



</div>


</div>








{/* PAYMENT HISTORY */}


<div className="
mt-8
bg-white
rounded-3xl
shadow-xl
p-8
">


<div className="
flex
justify-between
items-center
">

<h2 className="
text-2xl
font-bold
text-green-700
">

💳 Payment History

</h2>


<span className="
bg-green-100
text-green-700
px-4
py-2
rounded-full
font-bold
">

{payments.length} Payments

</span>


</div>





{

payments.length===0 ?


<div className="
mt-6
bg-gray-50
rounded-2xl
p-6
text-center
text-gray-500
">

No payment history available

</div>



:


<div className="
mt-6
space-y-5
">


{

payments.map(payment=>(


<div

key={payment.id}

className="
border
rounded-2xl
p-5
flex
justify-between
items-center
hover:shadow-lg
transition
"


>


<div>


<div className="
flex
items-center
gap-3
">


<h3 className="
text-xl
font-bold
text-blue-700
">

{payment.month} {payment.year}

</h3>



<span className="
bg-green-100
text-green-700
px-3
py-1
rounded-full
text-sm
font-bold
">

Paid ✓

</span>



</div>




<div className="
mt-3
space-y-1
text-gray-600
">


<p>

💰 Amount:
৳ {payment.amount}

</p>



<p>

💳 Method:
{payment.payment_method}

</p>




<p>

🧾 Receipt:
{payment.receipt_id}

</p>



</div>



</div>








<button

onClick={()=>downloadReceipt(payment)}

className="
bg-blue-600
hover:bg-blue-700
text-white
rounded-xl
px-5
py-3
font-bold
"

>

📄 Download Receipt

</button>




</div>


))


}



</div>


}



</div>









<button

onClick={()=>router.back()}

className="
mt-8
bg-gray-800
hover:bg-gray-900
text-white
rounded-xl
px-6
py-3
font-bold
"

>

← Back To Dashboard

</button>







</div>


</main>


)


}