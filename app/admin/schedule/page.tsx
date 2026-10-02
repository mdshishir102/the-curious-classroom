import { supabase } from "@/lib/supabase";
import AddScheduleForm from "./AddScheduleForm";
import EditButton from "./EditButton";
import { unstable_noStore as noStore } from "next/cache";
import WhatsappButton from "./WhatsappButton";


export default async function SchedulePage(){


noStore();



const dayOrder = [
"Saturday",
"Sunday",
"Monday",
"Tuesday",
"Wednesday",
"Thursday",
"Friday"
];





function formatTime(time:string){


return new Date(
`1970-01-01T${time}`
)

.toLocaleTimeString(
"en-US",
{
hour:"2-digit",
minute:"2-digit",
hour12:true
}
);


}







const {data:schedules,error}=await supabase

.from("class_schedules")

.select("*")

.order(
"created_at",
{
ascending:false
}
);





if(error){

console.log(error);

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
mb-8
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

Class Time Management

</p>


</div>



</div>









{/* ADD FORM */}


<div className="
bg-white
rounded-3xl
shadow-xl
border
border-gray-100
p-6
">


<h2 className="
text-2xl
font-bold
text-gray-800
mb-5
">

Add New Class Schedule

</h2>


<AddScheduleForm />


</div>









{/* LIST */}



<h2 className="
text-3xl
font-bold
text-gray-800
mt-10
mb-6
">

Upcoming Class Schedule

</h2>






<div className="
grid
md:grid-cols-2
gap-6
">



{

schedules && schedules.length>0

?


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
hover:-translate-y-1
transition
"

>



<div className="
flex
justify-between
items-start
">


<div>


<h3 className="
text-2xl
font-bold
text-gray-800
">

{item.class_name}

</h3>



<p className="
text-blue-600
font-semibold
mt-1
">

{item.subject}

</p>



</div>





<span className="
bg-green-100
text-green-700
px-3
py-1
rounded-full
text-sm
font-bold
">

{item.status}

</span>



</div>









<div className="
mt-5
space-y-3
text-gray-600
">





<p>

<b>Date:</b>

<span className="ml-2">

{

item.schedule_date

?

new Date(
item.schedule_date
)

.toLocaleDateString(
"en-GB",
{
day:"2-digit",
month:"long",
year:"numeric"
}
)

:

"Not Set"

}


</span>


</p>







<p>

<b>Day:</b>

<span className="ml-2">

{

item.days

?

item.days.join(", ")

:

"Not Set"

}


</span>


</p>









<p>

<b>Time:</b>

<span className="ml-2">


{

item.start_time && item.end_time

?

`${formatTime(item.start_time)} - ${formatTime(item.end_time)}`

:

"Not Set"

}


</span>


</p>








{

item.topic &&


<p>

<b>Topic:</b>

<span className="ml-2">

{item.topic}

</span>


</p>


}




</div>







{
item.whatsapp_group &&

<WhatsappButton
item={item}
/>

}











<EditButton

item={item}

/>





</div>



))


:




<div className="
bg-white
rounded-3xl
shadow
p-10
text-center
text-gray-500
">

No schedule added yet

</div>



}




</div>





</div>


</main>


)

}