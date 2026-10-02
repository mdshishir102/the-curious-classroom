"use client";

import { useState } from "react";
import EditScheduleForm from "./EditScheduleForm";


export default function EditButton({item}:any){

const [open,setOpen]=useState(false);


return (

<div>

<button

type="button"

onClick={()=>setOpen(!open)}

className="
mt-5
bg-gray-900
text-white
px-5
py-2
rounded-lg
"

>

{
open
?
"Close"
:
"Edit Schedule"
}

</button>



{
open && (

<EditScheduleForm

schedule={item}

onSuccess={()=>setOpen(false)}

/>

)

}


</div>

)

}