"use client";


import {useEffect,useState} from "react";
import {useParams,useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";



export default function StudentProfile(){


const params = useParams();

const router = useRouter();


const id = params.id;



const [student,setStudent]=useState<any>(null);

const [loading,setLoading]=useState(true);







async function loadStudent(){


const {data,error}=await supabase

.from("students")

.select("*")

.eq(
"id",
id
)

.single();





if(error){

alert(error.message);

return;

}



setStudent(data);

setLoading(false);


}





useEffect(()=>{


loadStudent();


},[]);









async function toggleLogin(){


const {error}=await supabase

.from("students")

.update({

login_enabled:
!student.login_enabled

})

.eq(
"id",
student.id
);




if(error){

alert(error.message);

return;

}



loadStudent();


}








if(loading){


return(

<div className="
min-h-screen
flex
items-center
justify-center
font-bold
">

Loading Profile...

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







<div className="
bg-white
rounded-3xl
shadow-xl
p-8
">





{/* PROFILE HEADER */}


<div className="
flex
flex-col
md:flex-row
items-center
gap-8
border-b
pb-8
">



<img

src={
student.student_photo ||
"/logo.png"
}

className="
h-40
w-40
rounded-full
object-cover
border-4
border-blue-100
shadow
"

/>



<div>


<h1 className="
text-3xl
font-bold
text-gray-800
">

{student.student_name}

</h1>



<p className="
mt-2
text-blue-600
font-bold
">

{student.student_id}

</p>



<p className="
mt-2
text-gray-500
">

{student.class} • {student.batch}

</p>



</div>



</div>









{/* STUDENT INFORMATION */}



<Section title="🎓 Student Information">


<Item
label="Student Name"
value={student.student_name}
/>


<Item
label="Student ID"
value={student.student_id}
/>


<Item
label="Date of Birth"
value={student.date_of_birth}
/>


<Item
label="Admission Date"
value={
student.admission_date
?
new Date(student.admission_date).toLocaleDateString("en-GB")
:
"N/A"
}
/>


<Item
label="Class"
value={student.class}
/>


<Item
label="Batch"
value={student.batch}
/>



</Section>









{/* GUARDIAN */}


<Section title="👨‍👩‍👦 Guardian Information">


<Item

label="Guardian Name"

value={student.guardian_name}

/>



<Item

label="WhatsApp"

value={student.whatsapp}

/>



</Section>









{/* ACADEMIC */}



<Section title="📚 Academic Information">


<Item

label="School"

value={student.school}

/>



<Item

label="College"

value={student.college}

/>



</Section>









{/* ADDRESS */}



<Section title="🏠 Address">


<Item

label="Present Address"

value={student.present_address}

/>



<Item

label="Permanent Address"

value={student.permanent_address}

/>



</Section>









{/* PAYMENT */}


<Section title="💳 Payment Information">


<Item

label="Payment Method"

value={student.payment_method}

/>



<Item

label="Payment Status"

value={student.payment_status}

/>



<Item

label="Transaction ID"

value={student.transaction_id}

/>



</Section>









{/* LOGIN */}



<Section title="🔐 Login Information">


<Item

label="Login Status"

value={
student.login_enabled
?
"Active"
:
"Disabled"
}

/>



<button

onClick={toggleLogin}

className="
mt-5
rounded-xl
bg-blue-600
px-6
py-3
text-white
font-bold
"

>


{

student.login_enabled

?

"Disable Login"

:

"Enable Login"

}


</button>



</Section>






<button

onClick={()=>router.back()}

className="
mt-8
rounded-xl
bg-gray-800
px-6
py-3
text-white
font-bold
"

>

← Back

</button>




</div>




</div>


</main>


)


}







function Section({

title,

children

}:any){


return(

<div className="
mt-8
rounded-2xl
bg-gray-50
p-6
">


<h2 className="
text-xl
font-bold
text-blue-700
mb-4
">

{title}

</h2>


<div className="
space-y-3
">

{children}

</div>


</div>

)


}







function Item({

label,

value

}:any){


return(

<div className="
flex
justify-between
border-b
pb-2
">


<span className="
text-gray-500
">

{label}

</span>



<span className="
font-bold
text-gray-800
text-right
">

{value || "N/A"}

</span>



</div>

)


}