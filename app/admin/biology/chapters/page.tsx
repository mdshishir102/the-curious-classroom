"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


export default function BiologyChapterPage(){


const [className,setClassName]=useState("");
const [subject,setSubject]=useState("");

const [chapterNumber,setChapterNumber]=useState("");
const [chapterName,setChapterName]=useState("");
const [chapterContent,setChapterContent]=useState("");
const [driveLink,setDriveLink]=useState("");

const [chapters,setChapters]=useState<any[]>([]);

const [loading,setLoading]=useState(false);

const [pdfFile,setPdfFile]=useState<File | null>(null);
const [uploading,setUploading]=useState(false);



const subjects:any={

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



// load chapters

useEffect(()=>{

loadChapters();

},[]);



async function loadChapters(){


const {data,error}=await supabase

.from("biology_chapters")

.select("*")

.order("created_at",{ascending:false});


if(data){

setChapters(data);

}


}





async function uploadPDF(){

if(!pdfFile) return null;


setUploading(true);


const fileName =
`${Date.now()}-${pdfFile.name}`;


const {data,error}=await supabase.storage

.from("biology-content")

.upload(
fileName,
pdfFile
);



if(error){

alert(error.message);

setUploading(false);

return null;

}



const {data:urlData}=supabase.storage

.from("biology-content")

.getPublicUrl(
fileName
);


setUploading(false);


return urlData.publicUrl;


}







// save chapter

async function saveChapter(){


if(
!className ||
!subject ||
!chapterName ||
!chapterContent
){

alert("Please fill all fields");

return;

}


setLoading(true);


const pdfUrl = await uploadPDF();
const {error}=await supabase

.from("biology_chapters")

.insert({

class:className,

subject:subject,

chapter_number:Number(chapterNumber),

chapter_name:chapterName,

chapter_content:chapterContent,

chapter_pdf: pdfUrl,

drive_link:driveLink

});




if(error){

alert(error.message);

setLoading(false);

return;

}



alert("Chapter Saved");



setChapterNumber("");

setChapterName("");

setChapterContent("");

setPdfFile(null);
setDriveLink("");

loadChapters();


setLoading(false);


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

🧬 Biology Chapter Management

</h1>




<div className="
bg-white
rounded-3xl
shadow-xl
p-6
max-w-4xl
">


<h2 className="
text-xl
font-bold
mb-5
">

Add New Chapter

</h2>



<select

className="
border
rounded-xl
p-3
w-full
"

value={className}

onChange={(e)=>{

setClassName(e.target.value);

setSubject("");

}}

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






{
className &&

<select

className="
border
rounded-xl
p-3
w-full
mt-4
"

value={subject}

onChange={(e)=>setSubject(e.target.value)}

>


<option value="">
Select Subject
</option>


{

subjects[className].map((item:string)=>(

<option key={item}>
{item}
</option>

))

}


</select>

}





<input

className="
border
rounded-xl
p-3
w-full
mt-4
"

placeholder="Chapter Number"

value={chapterNumber}

onChange={(e)=>setChapterNumber(e.target.value)}

/>





<input

className="
border
rounded-xl
p-3
w-full
mt-4
"

placeholder="Chapter Name"

value={chapterName}

onChange={(e)=>setChapterName(e.target.value)}

/>






<textarea

className="
border
rounded-xl
p-3
w-full
mt-4
h-64
"

placeholder="Chapter Content (NCTB text / Notes)"

value={chapterContent}

onChange={(e)=>setChapterContent(e.target.value)}

/>


<input

type="url"

placeholder="Google Drive Link (Optional)"

className="
mt-4
border
p-3
rounded-xl
w-full
"

value={driveLink}

onChange={(e)=>setDriveLink(e.target.value)}

/>



<input

type="file"

accept="application/pdf"

className="
mt-4
border
p-3
rounded-xl
w-full
"

onChange={(e)=>{

if(e.target.files){

setPdfFile(e.target.files[0]);

}

}}

/>



<button

onClick={saveChapter}

disabled={loading}

className="
mt-5
bg-blue-600
text-white
px-6
py-3
rounded-xl
font-bold
"

>

{
loading
?
"Saving..."
:
"Save Chapter"
}

</button>



</div>






{/* CHAPTER LIST */}



<div className="
mt-10
bg-white
rounded-3xl
shadow-xl
p-6
">


<h2 className="
text-xl
font-bold
mb-5
">

Saved Chapters

</h2>



{
chapters.map((item)=>(

<div

key={item.id}

className="
border
rounded-2xl
p-5
mb-4
flex
justify-between
items-center
"

>


<div>


<h3 className="
font-bold
text-lg
text-gray-800
">

Chapter {item.chapter_number}: {item.chapter_name}

</h3>


<p className="
text-gray-500
mt-1
">

{item.class} • {item.subject}

</p>


<div className="
flex
gap-3
mt-4
">

{
item.chapter_pdf &&

<a

href={item.chapter_pdf}

target="_blank"

className="
bg-red-100
text-red-600
px-4
py-2
rounded-xl
font-bold
"

>
📄 PDF
</a>

}



{
item.drive_link &&

<a

href={item.drive_link}

target="_blank"

className="
bg-green-100
text-green-700
px-4
py-2
rounded-xl
font-bold
"

>
🔗 Drive
</a>

}


</div>






</div>



<div className="flex gap-3">


<button

className="
bg-blue-100
text-blue-700
px-4
py-2
rounded-xl
font-bold
"

>

Edit

</button>



<button

onClick={async()=>{


const confirmDelete = confirm(
"Delete this chapter?"
);


if(!confirmDelete) return;



await supabase

.from("biology_chapters")

.delete()

.eq(
"id",
item.id
);



loadChapters();


}}

className="
bg-red-100
text-red-600
px-4
py-2
rounded-xl
font-bold
"

>

Delete

</button>


</div>


</div>


))
}



</div>




</div>

)

}