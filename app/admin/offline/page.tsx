"use client";


import {useEffect,useState} from "react";
import {supabase} from "@/lib/supabase";



export default function AdminOfflinePage(){



const [loading,setLoading]=useState(true);



const [info,setInfo]=useState<any>({

teacher_name:"",

teacher_image:"",

teacher_description:"",

phone:"",

location_name:"",

location_address:"",

location_video:""

});






async function loadInfo(){



const {data,error}=await supabase

.from("offline_class_info")

.select("*")

.limit(1)

.single();




if(data){

setInfo(data);

}



setLoading(false);



}







useEffect(()=>{


loadInfo();


},[]);








async function saveInfo(){



const {data:existing}=await supabase

.from("offline_class_info")

.select("id")

.limit(1);






let result;



if(existing && existing.length>0){



result = await supabase

.from("offline_class_info")

.update({

teacher_name:info.teacher_name,

teacher_image:info.teacher_image,

teacher_description:info.teacher_description,

phone:info.phone,

location_name:info.location_name,

location_address:info.location_address,

location_video:info.location_video

})

.eq(
"id",
existing[0].id
);



}

else{



result = await supabase

.from("offline_class_info")

.insert({

teacher_name:info.teacher_name,

teacher_image:info.teacher_image,

teacher_description:info.teacher_description,

phone:info.phone,

location_name:info.location_name,

location_address:info.location_address,

location_video:info.location_video

});



}





if(result.error){

alert(result.error.message);

return;

}



alert("Offline Class Info Saved Successfully");



}






function updateField(

key:string,

value:string

){


setInfo({

...info,

[key]:value

});


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
">


<h1 className="
text-3xl
font-bold
text-blue-700
">

📚 Offline Class Management

</h1>


<p className="
mt-2
text-gray-500
">

Manage teacher profile and coaching location

</p>


</div>







{/* TEACHER INFORMATION */}


<div className="
mt-8
bg-white
rounded-3xl
shadow-lg
p-8
">


<h2 className="
text-2xl
font-bold
text-gray-800
mb-6
">

👨‍🏫 Teacher Information

</h2>




<input

className="
w-full
border
rounded-xl
p-3
mb-4
"

placeholder="Teacher Name"

value={info.teacher_name}

onChange={(e)=>

updateField(
"teacher_name",
e.target.value
)

}

/>






<input

className="
w-full
border
rounded-xl
p-3
mb-4
"

placeholder="Profile Image URL"

value={info.teacher_image}

onChange={(e)=>

updateField(
"teacher_image",
e.target.value
)

}

/>







<textarea

className="
w-full
border
rounded-xl
p-3
mb-4
"

placeholder="Teacher Description"

rows={4}

value={info.teacher_description}

onChange={(e)=>

updateField(
"teacher_description",
e.target.value
)

}

/>







<input

className="
w-full
border
rounded-xl
p-3
"

placeholder="Mobile Number"

value={info.phone}

onChange={(e)=>

updateField(
"phone",
e.target.value
)

}

/>




</div>









{/* LOCATION INFORMATION */}


<div className="
mt-8
bg-white
rounded-3xl
shadow-lg
p-8
">


<h2 className="
text-2xl
font-bold
text-gray-800
mb-6
">

📍 Coaching Location

</h2>







<input

className="
w-full
border
rounded-xl
p-3
mb-4
"

placeholder="Coaching Name"

value={info.location_name}

onChange={(e)=>

updateField(
"location_name",
e.target.value
)

}

/>







<textarea

className="
w-full
border
rounded-xl
p-3
mb-4
"

placeholder="Full Address"

rows={3}

value={info.location_address}

onChange={(e)=>

updateField(
"location_address",
e.target.value
)

}

/>







<input

className="
w-full
border
rounded-xl
p-3
"

placeholder="Google Drive Location Video Link"

value={info.location_video}

onChange={(e)=>

updateField(
"location_video",
e.target.value
)

}

/>




</div>




{/* PREVIEW */}


<div className="
mt-8
bg-white
rounded-3xl
shadow-lg
p-8
">


<h2 className="
text-2xl
font-bold
text-gray-800
mb-6
">

👀 Student View Preview

</h2>



<div className="
grid
md:grid-cols-2
gap-6
">


{/* TEACHER PREVIEW */}

<div className="
rounded-2xl
border
border-gray-100
bg-gradient-to-br
from-blue-50
to-white
p-6
">


<div className="
flex
items-center
gap-4
">


{

info.teacher_image ? (

<img

src={info.teacher_image}

alt="Teacher"

className="
w-20
h-20
rounded-2xl
object-cover
border-4
border-white
shadow-md
"

/>

) : (

<div className="
w-20
h-20
rounded-2xl
bg-blue-100
flex
items-center
justify-center
text-3xl
">

👨‍🏫

</div>

)

}



<div>


<h3 className="
text-xl
font-bold
text-blue-700
">

{info.teacher_name || "Teacher Name"}

</h3>


<p className="
text-gray-500
text-sm
">

Biology Teacher

</p>


</div>


</div>



{

info.teacher_description && (

<p className="
mt-5
text-gray-600
leading-7
">

{info.teacher_description}

</p>

)

}



{

info.phone && (

<a

href={`tel:${info.phone}`}

className="
inline-flex
mt-5
items-center
gap-2
bg-blue-600
hover:bg-blue-700
text-white
px-5
py-3
rounded-xl
font-bold
"

>

📞 {info.phone}

</a>

)

}


</div>





{/* LOCATION PREVIEW */}

<div className="
rounded-2xl
border
border-gray-100
bg-gradient-to-br
from-indigo-50
to-white
p-6
">


<h3 className="
text-xl
font-bold
text-indigo-700
">

📍 {info.location_name || "Coaching Location"}

</h3>


<p className="
mt-4
text-gray-600
leading-7
">

{info.location_address || "Location address will appear here."}

</p>



{

info.location_video && (

<a

href={info.location_video}

target="_blank"

rel="noopener noreferrer"

className="
inline-flex
mt-5
items-center
gap-2
bg-red-600
hover:bg-red-700
text-white
px-5
py-3
rounded-xl
font-bold
"

>

▶ Watch Location Guide

</a>

)

}


</div>


</div>


</div>





{/* SAVE BUTTON */}


<button

onClick={saveInfo}

className="
mt-8
w-full
bg-gradient-to-r
from-blue-600
to-indigo-600
hover:from-blue-700
hover:to-indigo-700
text-white
rounded-2xl
py-4
font-bold
text-lg
shadow-lg
transition
"

>

💾 Save Offline Class Information

</button>



</div>


</main>

)


}