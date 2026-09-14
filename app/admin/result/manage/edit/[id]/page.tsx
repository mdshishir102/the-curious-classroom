"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";


export default function EditResultPage(){

const params = useParams();

const router = useRouter();

const id = params.id;



const [loading,setLoading] = useState(true);



const [form,setForm] = useState<any>({

subject:"",
exam_type:"",
exam_number:"",
chapter:"",
marks:"",
total_marks:"",
comment:""

});





useEffect(()=>{


async function loadResult(){


const {data,error}=await supabase

.from("results")

.select("*")

.eq(
"id",
id
)

.single();





if(!error && data){


setForm({

subject:data.subject || "",

exam_type:data.exam_type || "",

exam_number:data.exam_number || "",

chapter:data.chapter || "",

marks:data.marks || "",

total_marks:data.total_marks || "",

comment:data.comment || ""

});


}


setLoading(false);


}



loadResult();


},[id]);









function getPercentage(){


const marks = Number(form.marks);

const total = Number(form.total_marks);



if(!marks || !total)

return 0;



return Number(

((marks/total)*100)

.toFixed(2)

);


}








function calculateGrade(
percentage:number
){


if(percentage>=80)

return "A+";


if(percentage>=70)

return "A";


if(percentage>=60)

return "A-";


if(percentage>=50)

return "B";


if(percentage>=40)

return "C";


if(percentage>=33)

return "D";


return "F";


}









async function updateResult(){



const marks = Number(form.marks);

const total = Number(form.total_marks);



const percentage = Number(

((marks/total)*100)

.toFixed(2)

);



const grade = calculateGrade(
percentage
);






const {error}=await supabase

.from("results")

.update({

subject:form.subject,

exam_type:form.exam_type,

exam_number:
form.exam_number
?
Number(form.exam_number)
:
null,


chapter:
form.chapter || null,


marks:marks,

total_marks:total,


percentage:percentage,

grade:grade,


comment:form.comment


})

.eq(
"id",
id
);






if(error){

alert(error.message);

return;

}





alert(
"Result Updated Successfully"
);



router.push(
"/admin/result/manage"
);



}







if(loading){

return(

<div className="p-10">

Loading...

</div>

)

}








return(


<main className="
min-h-screen
bg-gray-100
p-8
">



<div className="
mx-auto
max-w-3xl
rounded-3xl
bg-white
p-8
shadow
">





<h1 className="
text-3xl
font-bold
">

Edit Result

</h1>







<input

className="
mt-6
w-full
rounded-lg
border
p-3
"

placeholder="Subject"

value={form.subject}

onChange={e=>

setForm({

...form,

subject:e.target.value

})

}

/>








<input

className="
mt-4
w-full
rounded-lg
border
p-3
"

placeholder="Exam Type"

value={form.exam_type}

onChange={e=>

setForm({

...form,

exam_type:e.target.value

})

}

/>








<input

className="
mt-4
w-full
rounded-lg
border
p-3
"

placeholder="Exam Number"

type="number"

value={form.exam_number}

onChange={e=>

setForm({

...form,

exam_number:e.target.value

})

}

/>









<input

className="
mt-4
w-full
rounded-lg
border
p-3
"

placeholder="Chapter"

value={form.chapter}

onChange={e=>

setForm({

...form,

chapter:e.target.value

})

}

/>








<input

className="
mt-4
w-full
rounded-lg
border
p-3
"

placeholder="Marks"

type="number"

value={form.marks}

onChange={e=>

setForm({

...form,

marks:e.target.value

})

}

/>








<input

className="
mt-4
w-full
rounded-lg
border
p-3
"

placeholder="Total Marks"

type="number"

value={form.total_marks}

onChange={e=>

setForm({

...form,

total_marks:e.target.value

})

}

/>








<div className="
mt-5
rounded-xl
bg-blue-50
p-4
">


<p>

Percentage:

<b>

{getPercentage()}%

</b>

</p>




<p>

Grade:

<b>

{calculateGrade(getPercentage())}

</b>

</p>


</div>








<textarea

className="
mt-4
w-full
rounded-lg
border
p-3
"

placeholder="Comment"

value={form.comment}

onChange={e=>

setForm({

...form,

comment:e.target.value

})

}

/>









<button

onClick={updateResult}

className="
mt-6
w-full
rounded-lg
bg-blue-600
py-3
text-white
"

>

Update Result

</button>







</div>


</main>


)


}