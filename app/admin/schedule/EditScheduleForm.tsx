"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";


export default function EditScheduleForm({
  schedule,
  onSuccess
}:any){


const router = useRouter();



const [days,setDays]=useState<string[]>(
  schedule.days || []
);



const [startTime,setStartTime]=useState(
  schedule.start_time || ""
);



const [endTime,setEndTime]=useState(
  schedule.end_time || ""
);



const [loading,setLoading]=useState(false);




const dayList=[

"Saturday",
"Sunday",
"Monday",
"Tuesday",
"Wednesday",
"Thursday",
"Friday"

];





const toggleDay=(day:string)=>{


if(days.includes(day)){


setDays(
days.filter(
d=>d!==day
)
);


}

else{


setDays([
...days,
day
]);


}


};








    const updateSchedule=async()=>{

console.log("UPDATE BUTTON CLICKED");



setLoading(true);



const { data, error } = await supabase
.from("class_schedules")
.update({
  days: days,
  start_time: startTime,
  end_time: endTime,
  schedule: `${startTime} - ${endTime}`
})
.eq("id", schedule.id)
.select("*");


console.log("ROW ID:", schedule.id);
console.log("UPDATED RESPONSE:", data);
console.log("ERROR:", error);






setLoading(false);




console.log("UPDATED DATA:", data);
console.log("UPDATE ERROR:", error);



if(error){

console.log(error);

alert("Update failed");

return;

}

if(!data || data.length === 0){

  alert("No row updated");

  return;

}





alert("Schedule updated");

// close edit box
onSuccess();


// refresh data
router.refresh();

};






return (


<div className="
bg-gray-100
p-5
rounded-xl
mt-5
">



<h3 className="
font-bold
text-lg
mb-4
">

Edit Schedule

</h3>





<div className="
grid
grid-cols-2
gap-3
">


{

dayList.map(day=>(


<label

key={day}

className="
flex
gap-2
"

>


<input

type="checkbox"

checked={
days.includes(day)
}

onChange={()=>
toggleDay(day)
}

/>


{day}


</label>


))

}


</div>








<div className="
grid
md:grid-cols-2
gap-4
mt-5
">



<div>

<label>
Start Time
</label>


<input

type="time"

value={startTime}

onChange={
e=>setStartTime(e.target.value)
}

className="
border
p-3
rounded-xl
w-full
"

/>


</div>





<div>


<label>
End Time
</label>



<input

type="time"

value={endTime}

onChange={
e=>setEndTime(e.target.value)
}

className="
border
p-3
rounded-xl
w-full
"

/>


</div>



</div>



<button

type="button"

onClick={updateSchedule}

disabled={loading}

className="
mt-5
bg-blue-600
text-white
px-5
py-2
rounded-lg
"

>






{

loading

?

"Updating..."

:

"Save Changes"

}



</button>






</div>


)


}