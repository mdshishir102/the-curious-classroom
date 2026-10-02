"use client";

import {useEffect,useState} from "react";
import {supabase} from "@/lib/supabase";


export default function AIGeneratorPage(){


const [chapters,setChapters]=useState<any[]>([]);

const [selectedChapter,setSelectedChapter]=useState("");

const [questionType,setQuestionType]=useState("MCQ");

const [count,setCount]=useState("20");

const [difficulty,setDifficulty]=useState("মাঝারি");



useEffect(()=>{

loadChapters();

},[]);



async function loadChapters(){


const {data}=await supabase

.from("biology_chapters")

.select("*")

.order("created_at",{ascending:false});


if(data){

setChapters(data);

}

}




async function generateQuestions(){


if(!selectedChapter){

alert("Select chapter");

return;

}



const chapter = chapters.find(
(item)=>item.id===selectedChapter
);



if(!chapter){

alert("Chapter not found");

return;

}



const res = await fetch(
"/api/generate-question",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

chapterContent:chapter.chapter_content,

questionType,

count,

difficulty

})

}

);



const data = await res.json();



console.log(data);



if(data.success){

alert(
`${data.questions.length} questions generated`
);

console.log(data.questions);

}
else{

alert(data.error);

}



}





return(

<div className="
min-h-screen
bg-gray-50
p-6
">


<h1 className="
text-3xl
font-bold
text-blue-700
mb-8
">

🤖 AI Biology Question Generator

</h1>




<div className="
bg-white
rounded-3xl
shadow-xl
p-6
max-w-3xl
">


<h2 className="
text-xl
font-bold
mb-5
">

Generate Question

</h2>





<select

className="
border
p-3
rounded-xl
w-full
"

value={selectedChapter}

onChange={(e)=>setSelectedChapter(e.target.value)}

>


<option value="">
Select Chapter
</option>


{

chapters.map((item)=>(

<option

key={item.id}

value={item.id}

>

{item.class} - {item.subject} - {item.chapter_name}

</option>

))

}


</select>





<select

className="
border
p-3
rounded-xl
w-full
mt-4
"

value={questionType}

onChange={(e)=>setQuestionType(e.target.value)}

>


<option>
MCQ
</option>

<option>
SAQ
</option>

<option>
CQ
</option>


</select>





<select

className="
border
p-3
rounded-xl
w-full
mt-4
"

value={count}

onChange={(e)=>setCount(e.target.value)}

>

<option value="random">
Random
</option>


<option value="10">
10 Questions
</option>


<option value="20">
20 Questions
</option>


<option value="30">
30 Questions
</option>


<option value="50">
50 Questions
</option>


</select>







<select

className="
border
p-3
rounded-xl
w-full
mt-4
"

value={difficulty}

onChange={(e)=>setDifficulty(e.target.value)}

>


<option>
সহজ
</option>

<option>
মাঝারি
</option>

<option>
কঠিন
</option>


</select>






<button

onClick={generateQuestions}

className="
mt-6
bg-blue-600
text-white
px-6
py-3
rounded-xl
font-bold
"

>

🚀 Generate Questions

</button>



</div>


</div>

)

}