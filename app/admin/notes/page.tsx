"use client";


import {useEffect,useState} from "react";
import {supabase} from "@/lib/supabase";



export default function AdminNotesPage(){


const [notes,setNotes]=useState<any[]>([]);

const [loading,setLoading]=useState(true);



const [className,setClassName]=useState("Class 9");

const [subject,setSubject]=useState("Biology");

const [chapter,setChapter]=useState("");

const [title,setTitle]=useState("");

const [chapterNumber,setChapterNumber] = useState("");

const [classNoteLink,setClassNoteLink]=useState("");

const [markedBookLink,setMarkedBookLink]=useState("");

const [editNote,setEditNote]=useState<any>(null);








const classes=[

"Class 9",
"Class 10",
"Class 11",
"Class 12"

];






function getSubjects(){


if(
className==="Class 11" ||
className==="Class 12"
){


return [

"Biology 1st Paper",
"Biology 2nd Paper"

];


}


return [

"Biology"

];


}







async function loadNotes(){


const {data,error}=await supabase

.from("class_notes")

.select("*")

.order("subject", {
  ascending:true
})
.order("chapter_number", {
  ascending:true
})

;



if(error){

alert(error.message);

return;

}



setNotes(data || []);

setLoading(false);


}






useEffect(()=>{


loadNotes();


},[]);









async function addNote(){


if(
!chapter ||
!title
){

alert(
"Chapter and Title required"
);

return;

}





const {error}=await supabase
.from("class_notes")
.insert({

class_name: className,

subject: subject,

chapter_number: Number(chapterNumber),

chapter: chapter,

title: title,

class_note_link: classNoteLink,

marked_book_link: markedBookLink

})

;





if(error){

alert(error.message);

return;

}



alert(
"Note Added"
);



setChapter("");

setTitle("");

setClassNoteLink("");

setMarkedBookLink("");



loadNotes();



}










async function toggleRelease(note:any){

console.log("clicked", note);
const {error}=await supabase

.from("class_notes")

.update({

is_released:
!note.is_released

})

.eq(
"id",
note.id
);




if(error){

alert(error.message);

return;

}



loadNotes();


}



async function updateNote(){

if(!editNote) return;


const {error}=await supabase
.from("class_notes")
.update({

chapter_number:Number(editNote.chapter_number),

chapter:editNote.chapter,

title:editNote.title,

class_note_link:editNote.class_note_link,

marked_book_link:editNote.marked_book_link

})
.eq("id",editNote.id);


if(error){

alert(error.message);
return;

}


alert("Updated Successfully");

setEditNote(null);

loadNotes();


}







const groupedNotes = notes.reduce((acc:any,note)=>{

if(!acc[note.class_name]){
acc[note.class_name]={};
}

if(!acc[note.class_name][note.subject]){
acc[note.class_name][note.subject]=[];
}

acc[note.class_name][note.subject].push(note);

return acc;

},{});




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
max-w-6xl
mx-auto
">


<h1 className="
text-4xl
font-bold
text-gray-800
mb-8
">

📚 Class Notes Management

</h1>








<div className="
bg-white
rounded-3xl
shadow-xl
p-8
">



<h2 className="
text-2xl
font-bold
mb-6
text-blue-700
">

Add New Note

</h2>






<select

value={className}

onChange={
e=>{

setClassName(e.target.value);

setSubject(
e.target.value==="Class 11" ||
e.target.value==="Class 12"
?
"Biology 1st Paper"
:
"Biology"
);

}
}

className="
w-full
rounded-xl
border
p-3
mb-4
"

>


{

classes.map(item=>(

<option key={item}>

{item}

</option>

))

}


</select>







<select

value={subject}

onChange={
e=>setSubject(e.target.value)
}

className="
w-full
rounded-xl
border
p-3
mb-4
"

>


{

getSubjects().map(item=>(

<option key={item}>

{item}

</option>

))

}


</select>




<input
type="number"
placeholder="Chapter Number"
value={chapterNumber}
onChange={(e)=>setChapterNumber(e.target.value)}
className="..."
/>


<input

placeholder="Chapter"

value={chapter}

onChange={
e=>setChapter(e.target.value)
}

className="
w-full
rounded-xl
border
p-3
mb-4
"

/>







<input

placeholder="Title"

value={title}

onChange={
e=>setTitle(e.target.value)
}

className="
w-full
rounded-xl
border
p-3
mb-4
"

/>







<input

placeholder="📒 Class Note Drive Link (optional)"

value={classNoteLink}

onChange={
e=>setClassNoteLink(e.target.value)
}

className="
w-full
rounded-xl
border
p-3
mb-4
"

/>








<input

placeholder="📖 দাগানো বই Drive Link (optional)"

value={markedBookLink}

onChange={
e=>setMarkedBookLink(e.target.value)
}

className="
w-full
rounded-xl
border
p-3
mb-6
"

/>








<button

onClick={addNote}

className="
rounded-xl
bg-blue-600
px-6
py-3
text-white
font-bold
"

>

Add Note

</button>



</div>









<div className="
mt-10
space-y-8
">

{
Object.entries(groupedNotes).map(([className,subjects]:any)=>(

<div
key={className}
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
text-blue-700
mb-5
">

📘 {className}

</h2>


{

Object.entries(subjects).map(([subject,items]:any)=>(


<div
key={subject}
className="mb-8"
>


<h3 className="
text-xl
font-bold
text-gray-800
mb-4
">

🧬 {subject}

</h3>



<div className="
space-y-4
">


{

items
.sort((a:any,b:any)=>
(Number(a.chapter_number)||999)
-
(Number(b.chapter_number)||999)
)
.map((note:any)=>(


<div
key={note.id}
className="
border
rounded-2xl
p-5
bg-gray-50
"
>


<h4 className="
font-bold
text-lg
">

{note.chapter}

</h4>


<p className="
text-gray-600
">

{note.title}

</p>



<div className="
flex
gap-3
mt-3
">


{
note.class_note_link &&

<span className="
bg-blue-100
text-blue-700
px-3
py-1
rounded-full
">

📒 Note Available

</span>

}



{
note.marked_book_link &&

<span className="
bg-green-100
text-green-700
px-3
py-1
rounded-full
">

📖 Book Available

</span>

}



</div>


<button

onClick={()=>toggleRelease(note)}

className={`
px-5
py-2
rounded-xl
text-white
font-bold

${
note.is_released
?
"bg-red-500"
:
"bg-green-600"
}

`}

>

{
note.is_released
?
"Lock"
:
"Release"
}


</button>



<div className="
flex
gap-3
mt-4
">

<button

onClick={()=>setEditNote(note)}

className="
px-5
py-2
rounded-xl
bg-blue-600
text-white
font-bold
"

>

✏️ Edit

</button>
</div>





</div>


))

}


</div>


</div>


))


}


</div>


))

}

</div>



{
editNote && (

<div className="
fixed
inset-0
bg-black/40
flex
items-center
justify-center
z-50
">


<div className="
bg-white
rounded-3xl
p-8
w-[500px]
">


<h2 className="
text-2xl
font-bold
mb-5
">

✏️ Edit Note

</h2>




<p className="
text-gray-500
mb-5
">

{editNote.class_name} 
-
{editNote.subject}

</p>








<input

value={editNote.chapter_number}

onChange={
e=>setEditNote({
...editNote,
chapter_number:e.target.value
})
}

className="
w-full
border
p-3
mb-3
"

/>



<input

value={editNote.chapter}

onChange={
e=>setEditNote({
...editNote,
chapter:e.target.value
})
}

className="
w-full
border
p-3
mb-3
"

/>



<input

value={editNote.title}

onChange={
e=>setEditNote({
...editNote,
title:e.target.value
})
}

className="
w-full
border
p-3
mb-3
"

/>



<input

value={editNote.class_note_link || ""}

onChange={
e=>setEditNote({
...editNote,
class_note_link:e.target.value
})
}

placeholder="Class Note Link"

className="
w-full
border
p-3
mb-3
"

/>



<input

value={editNote.marked_book_link || ""}

onChange={
e=>setEditNote({
...editNote,
marked_book_link:e.target.value
})
}

placeholder="Marked Book Link"

className="
w-full
border
p-3
mb-5
"

/>




<button

onClick={updateNote}

className="
bg-green-600
text-white
px-6
py-3
rounded-xl
font-bold
"

>

Save

</button>


<button

onClick={()=>setEditNote(null)}

className="
ml-3
bg-gray-400
text-white
px-6
py-3
rounded-xl
"

>

Cancel

</button>


</div>


</div>

)
}








</div>

</main>


)


}