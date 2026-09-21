"use client";

import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
import jsPDF from "jspdf";
import QRCode from "qrcode";



export default function StudentDashboard(){

const router = useRouter();


const [student,setStudent] = useState<any>(null);

const [notices,setNotices] = useState<any[]>([]);

const [exams,setExams] = useState<any[]>([]);

const [fees,setFees] = useState<any[]>([]);

const [results,setResults] = useState<any[]>([]);

const [discountFee,setDiscountFee] = useState<any>(null);

const [loading,setLoading] = useState(true);





useEffect(()=>{

const data = localStorage.getItem("student");


if(!data){

router.push("/student/login");

return;

}


const studentData = JSON.parse(data);

setStudent(studentData);


loadDashboard(studentData.id);



},[]);






async function loadDashboard(id:number){


setLoading(true);



const {data:noticeData}=await supabase

.from("notices")

.select("*")

.order(
"created_at",
{
ascending:false
}

);


setNotices(noticeData || []);





const {data:examData}=await supabase

.from("exams")

.select("*")

.order(
"exam_date",
{
ascending:true
}

);


setExams(examData || []);





const {data:paymentData}=await supabase

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



setFees(paymentData || []);


const {data:discountData}=await supabase

.from("student_fee_settings")

.select("*")

.eq(
"student_id",
id
)

.eq(
"academic_year",
new Date().getFullYear()
)

.maybeSingle();



setDiscountFee(discountData);




const {data:resultData}=await supabase

.from("results")

.select("*")

.eq(
"student_id",
id
);


setResults(resultData || []);



setLoading(false);


}



async function downloadReceipt(payment:any){


const doc = new jsPDF();



const verifyUrl =
`https://thecuriousclassroom.vercel.app/student/verify?receipt=${payment.receipt_id}`;


const qrImage = await QRCode.toDataURL(
verifyUrl
);




// HEADER

doc.setFontSize(22);

doc.text(
"The Curious Classroom",
20,
25
);



doc.setFontSize(15);

doc.text(
"OFFICIAL DIGITAL PAYMENT RECEIPT",
20,
40
);




// RECEIPT INFO


doc.setFontSize(12);


doc.text(
`Receipt ID: ${payment.receipt_id || "N/A"}`,
20,
60
);



doc.text(
`Generated: ${new Date().toLocaleString()}`,
20,
70
);





// STUDENT INFO


doc.text(
`Student Name: ${student.student_name}`,
20,
90
);



doc.text(
`Student ID: ${student.student_id}`,
20,
100
);



doc.text(
`Class: ${student.class}`,
20,
110
);



doc.text(
`Batch: ${student.batch}`,
20,
120
);





// PAYMENT INFO


doc.text(
`Month: ${payment.month} ${payment.year}`,
20,
140
);



doc.text(
`Amount: Tk ${payment.amount}`,
20,
150
);



doc.text(
`Payment Method: ${payment.payment_method}`,
20,
160
);



doc.text(
`Transaction ID: ${payment.transaction_id || "N/A"}`,
20,
170
);



doc.text(
`Payment Status: ${payment.status}`,
20,
180
);






// QR


doc.text(
"Scan To Verify Receipt",
20,
205
);



doc.addImage(
qrImage,
"PNG",
20,
215,
45,
45
);





doc.setFontSize(9);


doc.text(
verifyUrl,
20,
270
);





doc.save(

`TCCS_Receipt_${payment.receipt_id}.pdf`

);



}


function logout(){

localStorage.removeItem("student");

router.push("/student/login");

}






if(loading){


return (

<div className="
min-h-screen
flex
items-center
justify-center
bg-blue-50
">

Loading Dashboard...

</div>

)

}




return (

<main className="
min-h-screen
bg-gradient-to-br
from-blue-50
via-white
to-indigo-50
p-5
">


<div className="
max-w-6xl
mx-auto
">


{/* HEADER */}

<div className="
bg-white
rounded-3xl
shadow-lg
p-5
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
h-14
w-auto
"

/>


<div>

<h1 className="
text-xl
font-bold
text-blue-700
">

The Curious Classroom

</h1>


<p className="
text-gray-500
text-sm
">

Student Portal

</p>


</div>


</div>



<button

onClick={logout}

className="
rounded-xl
bg-red-500
px-5
py-2
text-white
font-bold
"

>

Logout

</button>


</div>



{/* PROFILE CARD */}

<div className="
mt-8
bg-white
rounded-3xl
shadow-xl
p-8
">


<div className="
flex
flex-col
md:flex-row
items-center
gap-8
">


<img

src={
student?.student_photo ||
"/logo.png"
}

className="
h-32
w-32
rounded-full
object-cover
border-4
border-blue-100
shadow-lg
"

/>



<div className="
text-center
md:text-left
">


<h2 className="
text-3xl
font-bold
text-gray-800
">

{student?.student_name}

</h2>


<p className="
mt-2
text-gray-500
">

The Curious Classroom Student Portal

</p>



<div className="
mt-5
grid
grid-cols-2
md:grid-cols-4
gap-4
">


<div className="
bg-blue-50
rounded-2xl
p-4
">

<p className="
text-sm
text-gray-500
">

Student ID

</p>


<p className="
font-bold
text-blue-700
">

{student?.student_id}

</p>


</div>




<div className="
bg-green-50
rounded-2xl
p-4
">

<p className="
text-sm
text-gray-500
">

Class

</p>


<p className="
font-bold
text-green-700
">

{student?.class}

</p>


</div>





<div className="
bg-purple-50
rounded-2xl
p-4
">

<p className="
text-sm
text-gray-500
">

Batch

</p>


<p className="
font-bold
text-purple-700
">

{student?.batch}

</p>


</div>





<div className="
bg-orange-50
rounded-2xl
p-4
">

<p className="
text-sm
text-gray-500
">

Phone

</p>


<p className="
font-bold
text-orange-700
">

{student?.whatsapp}

</p>


</div>



</div>


</div>


</div>


</div>





{/* QUICK ACCESS */}


<h2 className="
mt-10
mb-5
text-2xl
font-bold
text-gray-800
">

Quick Access

</h2>




<div className="
grid
grid-cols-2
md:grid-cols-4
gap-5
">



<div className="
bg-white
rounded-3xl
shadow
p-6
text-center
hover:shadow-xl
transition
">

<div className="
text-4xl
">

📚

</div>


<h3 className="
mt-3
font-bold
">

Classes

</h3>


</div>




<div className="
bg-white
rounded-3xl
shadow
p-6
text-center
hover:shadow-xl
transition
">

<div className="
text-4xl
">

📝

</div>


<h3 className="
mt-3
font-bold
">

Exam

</h3>


</div>




<div className="
bg-white
rounded-3xl
shadow
p-6
text-center
hover:shadow-xl
transition
">

<div className="
text-4xl
">

📊

</div>


<h3 className="
mt-3
font-bold
">

Result

</h3>


</div>






<div

onClick={()=>router.push("/student/payment")}

className="
bg-white
rounded-3xl
shadow
p-6
text-center
hover:shadow-xl
transition
cursor-pointer
hover:scale-105
"

>


<div className="
text-4xl
">

💳

</div>


<h3 className="
mt-3
font-bold
">

Payment

</h3>


<p className="
text-sm
text-gray-500
mt-2
">

View payment history

</p>


</div>







</div>


{/* NOTICE BOARD */}


<div className="
mt-10
bg-white
rounded-3xl
shadow-lg
p-6
">


<h2 className="
text-2xl
font-bold
text-blue-700
mb-5
">

📢 Notice Board

</h2>



{

notices.length===0 ?


<p className="
text-gray-500
">

No notice available

</p>


:


<div className="
space-y-4
">


{

notices.slice(0,3).map(notice=>(


<div

key={notice.id}

className="
rounded-2xl
bg-blue-50
p-5
"

>


<h3 className="
font-bold
text-lg
">

{notice.title}

</h3>


<p className="
mt-2
text-gray-600
">

{notice.description}

</p>


</div>


))


}



</div>


}



</div>







{/* EXAM SECTION */}



<div className="
mt-8
bg-white
rounded-3xl
shadow-lg
p-6
">


<h2 className="
text-2xl
font-bold
text-purple-700
mb-5
">

📅 Upcoming Exam

</h2>




{

exams.length===0 ?


<p className="
text-gray-500
">

No upcoming exam

</p>


:


<div className="
space-y-4
">


{

exams.slice(0,3).map(exam=>(


<div

key={exam.id}

className="
rounded-2xl
bg-purple-50
p-5
"


>


<h3 className="
font-bold
text-lg
">

{exam.subject}

</h3>



<p className="
mt-2
text-gray-600
">

{exam.exam_type}

</p>


<p className="
mt-2
">

📅 {exam.exam_date}

</p>


<p>

⏰ {exam.exam_time}

</p>



</div>


))


}



</div>


}



</div>


{/* SPECIAL DISCOUNT */}

{

discountFee && (

<div className="
mt-8
bg-white
rounded-3xl
shadow-lg
p-6
">


<h2 className="
text-2xl
font-bold
text-orange-700
mb-5
">

🎓 Special Fee Discount

</h2>



<div className="
rounded-2xl
bg-orange-50
p-5
">


<p className="
text-gray-600
">

Regular Monthly Fee

</p>


<p className="
text-xl
font-bold
text-gray-800
">

৳ {student.class === "Class 9" ? "1500" : "N/A"}

</p>





<p className="
mt-4
text-gray-600
">

Your Discounted Fee

</p>


<p className="
text-3xl
font-bold
text-green-700
">

৳ {discountFee.monthly_fee}

</p>




<p className="
mt-4
text-gray-600
">

Reason

</p>


<p className="
font-bold
text-orange-700
">

{discountFee.reason}

</p>



</div>



</div>

)

}


{/* MONTHLY PAYMENT OVERVIEW */}

<div className="
mt-8
bg-white
rounded-3xl
shadow-lg
p-6
">


<h2 className="
text-2xl
font-bold
text-green-700
mb-5
">

💳 Monthly Fee Overview

</h2>


{

fees.length===0 ?

<p className="
text-gray-500
">

No payment history available

</p>


:


<div className="
space-y-4
">


{

fees.map(payment=>(


<div

key={payment.id}

className="
rounded-2xl
bg-green-50
p-5
"


>


<h3 className="
font-bold
text-xl
text-green-700
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



<p>

Transaction:
{payment.transaction_id || "N/A"}

</p>



<p className="
text-gray-500
">

📅

{
new Date(payment.payment_date)
.toLocaleString()
}

</p>



<div className="
mt-3
text-green-600
font-bold
">

Paid ✅

</div>



<button

onClick={()=>downloadReceipt(payment)}

className="
mt-4
rounded-xl
bg-blue-600
px-5
py-2
text-white
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






{/* RESULT */}



<div className="
mt-8
bg-white
rounded-3xl
shadow-lg
p-6
">


<h2 className="
text-2xl
font-bold
text-indigo-700
mb-5
">

🏆 Academic Progress

</h2>



{

results.length===0 ?


<p className="
text-gray-500
">

No result available yet

</p>


:


<div className="
space-y-4
">


{

results.slice(0,3).map(result=>(


<div

key={result.id}

className="
rounded-2xl
bg-indigo-50
p-5
flex
justify-between
"


>


<div>

<h3 className="
font-bold
">

{result.subject}

</h3>


<p className="
text-gray-600
">

{result.exam_type}

</p>


</div>



<div className="
text-right
">


<p className="
text-2xl
font-bold
text-blue-700
">

{result.marks}

</p>


<p className="
font-bold
text-green-700
">

{result.grade}

</p>


</div>



</div>


))


}



</div>


}



</div>







</div>

</main>

);


}