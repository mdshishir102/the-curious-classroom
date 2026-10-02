// app/admin/attendance/page.tsx

import Link from "next/link";
import { supabase } from "@/lib/supabase";


export default async function AttendancePage() {


const today = new Date()

.toLocaleDateString(
"en-CA",
{
timeZone:"Asia/Dhaka"
}
);



const {data:schedules,error}=await supabase

.from("class_schedules")

.select("*")

.eq(
"schedule_date",
today
)

.order(
"start_time",
{
ascending:true
}
);



return (

<main className="
min-h-screen
bg-gradient-to-br
from-blue-50
via-white
to-indigo-100
p-6
">


<div className="
max-w-7xl
mx-auto
">



{/* HEADER */}

<div className="
bg-white
rounded-3xl
shadow-xl
border
border-gray-100
p-6
mb-10
flex
items-center
gap-5
">


<img

src="/logo.png"

className="
h-20
w-auto
object-contain
"

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
mt-1
">

Attendance Management Portal

</p>


</div>


</div>





<h2 className="
text-3xl
font-bold
text-gray-800
mb-6
">

Today's Active Classes

</h2>





{

!schedules || schedules.length===0

?


<div className="
bg-white
rounded-3xl
shadow-lg
p-8
text-center
text-gray-500
">

No class schedule available today

</div>


:


<div className="
grid
md:grid-cols-2
lg:grid-cols-3
gap-8
">


{

schedules.map((item:any)=>(


<div

key={item.id}

className="
bg-white
rounded-3xl
shadow-xl
border
border-gray-100
p-6
hover:-translate-y-2
transition
"

>


<div className="
w-16
h-16
rounded-2xl
bg-green-100
flex
items-center
justify-center
text-4xl
">

🟢

</div>




<h3 className="
text-2xl
font-bold
text-gray-800
mt-6
">

{item.class_name}

</h3>



<p className="
text-blue-600
font-bold
text-lg
mt-2
">

{item.subject}

</p>




<div className="
mt-5
bg-gray-50
rounded-2xl
p-4
">


<p>

📅 {item.schedule_date}

</p>



<p className="
mt-2
">

⏰ 
{new Date(`2000-01-01T${item.start_time}`)
.toLocaleTimeString(
"en-US",
{
hour:"numeric",
minute:"2-digit",
hour12:true
}
)}

-

{new Date(`2000-01-01T${item.end_time}`)
.toLocaleTimeString(
"en-US",
{
hour:"numeric",
minute:"2-digit",
hour12:true
}
)}

</p>



<p className="
mt-2
text-gray-600
">

📖 {item.topic}

</p>



</div>





<Link

href={
`/admin/attendance/${item.class_name.replace(" ","-")}/${item.id}`
}

className="
block
mt-6
text-center
bg-blue-600
text-white
py-3
rounded-xl
font-bold
hover:bg-blue-700
transition
"

>

Take Attendance →

</Link>



</div>


))

}


</div>


}




</div>


</main>

);

}