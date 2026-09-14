"use client";


import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";



export default function AdminExamPage(){


const [exams,setExams] = useState<any[]>([]);


const [loading,setLoading] = useState(false);



const [form,setForm] = useState<any>({

subject:"",

exam_type:"",

exam_date:"",

exam_time:"",

class:"",

batch:""

});








async function loadExams(){


const {data,error}=await supabase

.from("exam_schedule")

.select("*")

.order(

"exam_date",

{

ascending:true

}

);





if(!error){

setExams(data || []);

}



}







useEffect(()=>{


loadExams();


},[]);









async function addExam(){



if(

!form.subject ||

!form.exam_type ||

!form.exam_date ||

!form.exam_time ||

!form.class ||

!form.batch

){


alert(
"Fill all fields"
);


return;


}




setLoading(true);





const {error}=await supabase

.from("exam_schedule")

.insert({

subject:form.subject,

exam_type:form.exam_type,

exam_date:form.exam_date,

exam_time:form.exam_time,

class:form.class,

batch:form.batch

});





setLoading(false);






if(error){


alert(error.message);


return;


}





alert(
"Exam Added Successfully"
);





setForm({

subject:"",

exam_type:"",

exam_date:"",

exam_time:"",

class:"",

batch:""

});




loadExams();



}









async function deleteExam(id:string){



const confirmDelete = confirm(

"Delete this exam?"

);



if(!confirmDelete)
return;







const {error}=await supabase

.from("exam_schedule")

.delete()

.eq(

"id",

id

);






if(error){

alert(error.message);

return;

}



loadExams();



}









return(


<main className="
min-h-screen
bg-gray-100
p-8
">


<div className="
mx-auto
max-w-5xl
">



<h1 className="
mb-8
text-3xl
font-bold
">

Exam Schedule Management

</h1>







<div className="
rounded-2xl
bg-white
p-6
shadow
">





<input

className="
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

type="date"

value={form.exam_date}

onChange={e=>

setForm({

...form,

exam_date:e.target.value

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

placeholder="Exam Time (Example: 10:00 AM)"

value={form.exam_time}

onChange={e=>

setForm({

...form,

exam_time:e.target.value

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

placeholder="Class"

value={form.class}

onChange={e=>

setForm({

...form,

class:e.target.value

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

placeholder="Batch"

value={form.batch}

onChange={e=>

setForm({

...form,

batch:e.target.value

})

}

/>








<button

onClick={addExam}

disabled={loading}

className="
mt-5
rounded-lg
bg-blue-600
px-6
py-3
text-white
"

>

{

loading

?

"Adding..."

:

"Add Exam"

}


</button>






</div>









<div className="
mt-8
space-y-4
">





{

exams.map(exam=>(


<div

key={exam.id}

className="
rounded-2xl
bg-white
p-6
shadow
"

>


<h2 className="
text-xl
font-bold
">

{exam.subject}

</h2>




<p>

{exam.exam_type}

</p>



<p>

Date: {exam.exam_date}

</p>



<p>

Time: {exam.exam_time}

</p>



<p>

{exam.class} - {exam.batch}

</p>






<button

onClick={()=>deleteExam(exam.id)}

className="
mt-4
rounded-lg
bg-red-600
px-4
py-2
text-white
"

>

Delete

</button>



</div>


))


}



</div>





</div>


</main>


)


}