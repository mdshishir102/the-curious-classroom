"use client";


import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";



export default function AddScheduleForm(){


const router = useRouter();



const today = new Date();


const defaultDate =
today.toLocaleDateString(
"en-CA",
{
timeZone:"Asia/Dhaka"
}
);



const defaultDay =
today.toLocaleDateString(
"en-US",
{
weekday:"long",
timeZone:"Asia/Dhaka"
}
);




const [className,setClassName] = useState("");

const [subject,setSubject] = useState("");

const [scheduleDate,setScheduleDate] = useState(defaultDate);

const [day,setDay] = useState(defaultDay);

const [startTime,setStartTime] = useState("");

const [endTime,setEndTime] = useState("");

const [topic,setTopic] = useState("");

const [whatsappGroup,setWhatsappGroup] = useState("");

const [loadingGroup,setLoadingGroup] = useState(false);

const [loading,setLoading] = useState(false);





const subjects = {


"Class 9":[
"Biology"
],


"Class 10":[
"Biology"
],


"Class 11":[
"Biology 1st Paper",
"Biology 2nd Paper"
],


"Class 12":[
"Biology 1st Paper",
"Biology 2nd Paper"
]


};






function changeDate(value:string){


setScheduleDate(value);



const newDay =
new Date(value)

.toLocaleDateString(
"en-US",
{
weekday:"long",
timeZone:"Asia/Dhaka"
}
);


setDay(newDay);



}





async function loadWhatsappGroup(className:string){

  if(!className){

    setWhatsappGroup("");

    return;

  }


  setLoadingGroup(true);



  const {data,error}=await supabase

  .from("class_whatsapp_groups")

  .select("whatsapp_link")

  .ilike(
"class_name",
className.trim()
  );



  console.log("CLASS:",className);

  console.log("WHATSAPP DATA:",data);

  console.log("WHATSAPP ERROR:",error);



  if(error){

    console.log(error);

    setWhatsappGroup("");

    setLoadingGroup(false);

    return;

  }



  if(data && data.length > 0){

    setWhatsappGroup(
      data[0].whatsapp_link
    );

  }

  else{

    setWhatsappGroup("");

  }



  setLoadingGroup(false);


}








  

















async function saveSchedule(){



if(
!className ||
!subject ||
!scheduleDate ||
!startTime ||
!endTime ||
!topic
){


alert(
"Please fill all required fields"
);


return;


}



setLoading(true);





const {error}=await supabase

.from("class_schedules")

.insert({

class_name:className,

subject:subject,

schedule_date:scheduleDate,

days:[day],

start_time:startTime,

end_time:endTime,

topic:topic,

whatsapp_group:whatsappGroup,

schedule:
`${startTime} - ${endTime}`,

status:"active"

});





setLoading(false);





if(error){


console.log(error);


alert(error.message);


return;


}



alert(
"Schedule added successfully"
);


router.refresh();



}







return(


<div className="
space-y-5
">





{/* CLASS */}


<div>

<label className="font-medium">
Class
</label>


<select

value={className}



onChange={(e)=>{


const value=e.target.value;


setClassName(value);


setSubject("");


loadWhatsappGroup(value);


}}





className="
w-full
border
rounded-xl
p-3
mt-1
"

>


<option value="">
Select Class
</option>


<option>
Class 9
</option>


<option>
Class 10
</option>


<option>
Class 11
</option>


<option>
Class 12
</option>



</select>


</div>








{/* SUBJECT */}


<div>


<label className="font-medium">
Subject
</label>



<select

value={subject}

onChange={(e)=>setSubject(e.target.value)}

disabled={!className}

className="
w-full
border
rounded-xl
p-3
mt-1
"

>


<option>
Select Subject
</option>


{

className &&

subjects[
className as keyof typeof subjects
]

.map((item)=>(


<option key={item}>
{item}
</option>


))


}



</select>


</div>









{/* DATE DAY */}


<div className="
grid
md:grid-cols-2
gap-4
">


<div>


<label className="font-medium">
Class Date
</label>


<input

type="date"

value={scheduleDate}

onChange={(e)=>
changeDate(e.target.value)
}

className="
w-full
border
rounded-xl
p-3
mt-1
"

/>


</div>






<div>


<label className="font-medium">
Day
</label>


<input

value={day}

readOnly

className="
w-full
border
rounded-xl
p-3
mt-1
bg-gray-100
"

/>


</div>



</div>









{/* TIME */}


<div className="
grid
md:grid-cols-2
gap-4
">


<div>


<label>
Start Time
</label>


<input

type="time"

value={startTime}

onChange={(e)=>
setStartTime(e.target.value)
}

className="
w-full
border
rounded-xl
p-3
mt-1
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

onChange={(e)=>
setEndTime(e.target.value)
}

className="
w-full
border
rounded-xl
p-3
mt-1
"

/>


</div>



</div>









{/* TOPIC */}


<div>


<label className="font-medium">
Class Topic
</label>


<input

value={topic}

onChange={(e)=>
setTopic(e.target.value)
}

placeholder="Example: Genetics Chapter 5"

className="
w-full
border
rounded-xl
p-3
mt-1
"

/>


</div>








{/* WHATSAPP */}


<div>


<label className="font-medium">
WhatsApp Group
</label>



<div className="
w-full
border
rounded-xl
p-3
mt-1
bg-gray-100
text-gray-700
">


{

loadingGroup

?

"Loading group..."

:

whatsappGroup

?

"Connected ✅"

:

"Select class first"

}



</div>


</div>









<button

onClick={saveSchedule}

disabled={loading}

className="
w-full
bg-blue-600
text-white
py-3
rounded-xl
font-bold
hover:bg-blue-700
disabled:bg-gray-400
"

>


{

loading

?

"Saving..."

:

"Save Schedule"

}


</button>





</div>


);


}