"use client";

import {useEffect,useState} from "react";
import {supabase} from "@/lib/supabase";


export default function StudentNotesPage(){


const [student,setStudent]=useState<any>(null);

const [notes,setNotes]=useState<any[]>([]);

const [loading,setLoading]=useState(true);



useEffect(()=>{

loadStudentNotes();

},[]);





async function loadStudentNotes(){


const data = localStorage.getItem("student");


if(!data){

setLoading(false);
return;

}


const studentData = JSON.parse(data);


setStudent(studentData);





const {data:noteData,error}=await supabase

.from("class_notes")

.select("*")

.eq(
"class_name",
studentData.class
)







.order(
"subject",
{
ascending:true
}

)

.order(
"chapter_number",
{
ascending:true
}

);



if(error){

console.log(error.message);

return;

}


setNotes(noteData || []);

setLoading(false);


}







if(loading){

return(

<div className="
min-h-screen
flex
items-center
justify-center
">

Loading Notes...

</div>

)

}


const groupedNotes = notes.reduce((acc:any,note)=>{

if(!acc[note.subject]){
acc[note.subject]=[];
}

acc[note.subject].push(note);

return acc;

},{});



return(

<main className="
min-h-screen
bg-gradient-to-br
from-blue-50
via-white
to-indigo-50
p-6
">


<div className="
max-w-5xl
mx-auto
">


<h1 className="
text-3xl
font-bold
text-blue-700
mb-8
">

📚 Class Notes

</h1>



<div className="
bg-white
rounded-3xl
shadow-lg
p-6
mb-8
">


<h2 className="
text-xl
font-bold
">

{student?.class}

</h2>


<p className="
text-gray-500
">

Biology Notes

</p>


</div>






{

notes.length===0 ?


<div className="
bg-white
rounded-3xl
p-6
shadow
text-gray-500
">

No released notes available

</div>


:



<div className="
space-y-8
">


{

Object.entries(groupedNotes).map(
([subject,items]:any)=>(


<div
key={subject}
className="
bg-white
rounded-3xl
shadow-lg
p-6
"
>


<h2 className="
text-2xl
font-bold
text-gray-800
mb-5
">

🧬 {subject}

</h2>



<div className="
space-y-4
">


{

items.map((note:any)=>(


<div

key={note.id}

className="
border
rounded-2xl
p-5
bg-gray-50
"


>


<h3 className="
text-lg
font-bold
text-gray-800
">

{"📖 " + note.chapter
.replace("অধ্যায়-","অধ্যায় ")
.replace("অধ্যায় :","অধ্যায় ")
}

</h3>



<p className="
text-gray-600
mt-1
">

{note.title}

</p>


{

note.is_released ? (

<div className="
mt-4
flex
flex-col
gap-3
">


<div className="
text-green-600
font-bold
mb-3
">
✅ Available
</div>




{
note.class_note_link &&

<a
href={note.class_note_link}
target="_blank"
className="
bg-blue-600
text-white
px-5
py-2
rounded-xl
font-bold
"
>

📒 Class Note

</a>

}



{
note.marked_book_link &&

<a
href={note.marked_book_link}
target="_blank"
className="
bg-green-600
text-white
px-5
py-2
rounded-xl
font-bold
"
>

📖 দাগানো বই

</a>

}


</div>


)

:

(

<div className="
mt-4
bg-gray-200
text-gray-600
px-4
py-3
rounded-xl
font-bold
">

🔒 Locked

<br/>

এই অধ্যায়ের নোট এখনো প্রকাশ করা হয়নি

</div>

)

}



</div>


))

}


</div>


</div>


)


)


}


</div>







}



</div>


</main>


)


}