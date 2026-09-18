"use client";

import Image from "next/image";
import { useState } from "react";
import { supabase } from "@/lib/supabase";


export default function AdmissionForm(){

const [loading,setLoading]=useState(false);

const [photoPreview,setPhotoPreview]=useState("");

const [photo,setPhoto]=useState<File|null>(null);

const [submitted,setSubmitted]=useState(false);


const [form,setForm]=useState({

student_name:"",

guardian_name:"",

whatsapp:"",

facebook_link:"",

email:"",

date_of_birth:"",

class:"",

batch:"",

present_address:"",

permanent_address:"",

school:"",

college:""

});



function handleChange(e:any){

const {
name,
value
}=e.target;



if(name==="class"){


let batch="";

const year=new Date().getFullYear();



if(
value==="Class 9" ||
value==="Class 10"
){

const sscYear =
value==="Class 9"
?
year+2
:
year+1;


batch=
`SSC ${String(sscYear).slice(-2)}`;


}



if(
value==="Class 11" ||
value==="Class 12"
){


const hscYear =
value==="Class 11"
?
year+2
:
year+1;


batch=
`HSC ${String(hscYear).slice(-2)}`;

}



setForm(prev=>({

...prev,

class:value,

batch

}));


return;


}




setForm(prev=>({

...prev,

[name]:value

}));


}






async function uploadPhoto(){


if(!photo){

throw new Error(
"Student photo required"
);

}



const fileName =
`${Date.now()}-${photo.name}`;



const {
error
}
=
await supabase.storage
.from("student-photos")
.upload(
fileName,
photo
);



if(error)
throw error;




const {
data
}
=
supabase.storage
.from("student-photos")
.getPublicUrl(
fileName
);



return data.publicUrl;


}







async function submitAdmission(e:any){


e.preventDefault();


try{


setLoading(true);



const {
data:existing
}
=
await supabase
.from("students")
.select("id")
.eq(
"whatsapp",
form.whatsapp
)
.maybeSingle();



if(existing){

alert(
"এই WhatsApp নম্বর দিয়ে ইতিমধ্যে আবেদন করা হয়েছে।"
);

return;

}




const photoURL =
await uploadPhoto();




const today =
new Date()
.toISOString()
.split("T")[0];



const {
error
}
=
await supabase
.from("students")
.insert({

student_name:
form.student_name,


student_photo:
photoURL,


guardian_name:
form.guardian_name,


whatsapp:
form.whatsapp,


email:
form.email,


facebook_link:
form.facebook_link,


date_of_birth:
form.date_of_birth,


class:
form.class,


batch:
form.batch,


school:
form.school,


college:
form.college,


present_address:
form.present_address,


permanent_address:
form.permanent_address,


status:
"pending",


payment_status:
"pending",


payment_method:
"offline",


admission_date:
today


});



if(error)
throw error;



setSubmitted(true);



}

catch(err:any){

alert(err.message);

}

finally{

setLoading(false);

}


}





return (

<div className="
min-h-screen
bg-gradient-to-br
from-blue-50
to-white
px-5
py-10
">


<div className="
mx-auto
max-w-4xl
rounded-3xl
bg-white
p-6
shadow-xl
md:p-10
">



{/* Banner */}


<div className="
mb-10
rounded-3xl
bg-gradient-to-br
from-blue-700
via-blue-600
to-cyan-500
p-8
text-center
text-white
">


<Image

src="/logo.png"

width={150}

height={150}

alt="The Curious Classroom"

className="
mx-auto
rounded-2xl
bg-white
p-3
"

/>



<h1 className="
mt-5
text-4xl
font-bold
">

ভর্তি আবেদন

</h1>



<p className="
mt-3
text-blue-100
">

The Curious Classroom এর সাথে
<br/>
আপনার শিক্ষার নতুন যাত্রা শুরু করুন

</p>



<div className="
mt-6
flex
flex-wrap
justify-center
gap-3
">


<span className="
rounded-full
bg-white/20
px-4
py-2
">

✓ Online Learning

</span>


<span className="
rounded-full
bg-white/20
px-4
py-2
">

✓ Regular Exam

</span>


<span className="
rounded-full
bg-white/20
px-4
py-2
">

✓ Student Dashboard

</span>



</div>


</div>

{/* FORM START */}

<form
onSubmit={submitAdmission}
className="
space-y-8
"
>


{/* Student Information */}

<div className="
rounded-2xl
border
bg-white
p-6
shadow-sm
">


<h2 className="
mb-5
text-xl
font-bold
text-blue-700
">

🎓 শিক্ষার্থীর তথ্য

</h2>



<input

required

name="student_name"

value={form.student_name}

onChange={handleChange}

placeholder="শিক্ষার্থীর নাম"

className="
mb-4
w-full
rounded-xl
border
p-3
outline-none
focus:border-blue-500
"

/>



<label className="
mb-2
block
font-medium
text-gray-700
">

শিক্ষার্থীর ছবি *

</label>



<input

required

type="file"

accept="image/*"

onChange={(e)=>{


const file =
e.target.files?.[0];


if(file){

setPhoto(file);

setPhotoPreview(
URL.createObjectURL(file)
);

}


}}

className="
w-full
rounded-xl
border
p-3
"

/>



{

photoPreview &&

<div className="
mt-4
flex
justify-center
">


<img

src={photoPreview}

alt="preview"

className="
h-32
w-32
rounded-2xl
object-cover
shadow
"

/>


</div>

}



<label className="
mt-5
mb-2
block
font-medium
text-gray-700
">

জন্ম তারিখ

</label>



<input

required

type="date"

name="date_of_birth"

value={form.date_of_birth}

onChange={handleChange}

className="
w-full
rounded-xl
border
p-3
"

/>



</div>






{/* Guardian Information */}


<div className="
rounded-2xl
border
bg-white
p-6
shadow-sm
">


<h2 className="
mb-5
text-xl
font-bold
text-blue-700
">

👨‍👩‍👦 অভিভাবকের তথ্য

</h2>



<input

required

name="guardian_name"

value={form.guardian_name}

onChange={handleChange}

placeholder="অভিভাবকের নাম"

className="
mb-4
w-full
rounded-xl
border
p-3
"

/>




<input

required

type="tel"

name="whatsapp"

value={form.whatsapp}

onChange={handleChange}

placeholder="WhatsApp নম্বর"

className="
w-full
rounded-xl
border
p-3
"

/>



</div>







{/* Contact Information */}


<div className="
rounded-2xl
border
bg-white
p-6
shadow-sm
">


<h2 className="
mb-5
text-xl
font-bold
text-blue-700
">

📞 যোগাযোগের তথ্য

</h2>




<input

name="email"

value={form.email}

onChange={handleChange}

placeholder="Email Address"

className="
mb-4
w-full
rounded-xl
border
p-3
"

/>




<input

name="facebook_link"

value={form.facebook_link}

onChange={handleChange}

placeholder="Facebook Profile Link"

className="
w-full
rounded-xl
border
p-3
"

/>


</div>







{/* Academic Information */}



<div className="
rounded-2xl
border
bg-white
p-6
shadow-sm
">


<h2 className="
mb-5
text-xl
font-bold
text-blue-700
">

📚 শিক্ষাগত তথ্য

</h2>



<select

required

name="class"

value={form.class}

onChange={handleChange}

className="
mb-4
w-full
rounded-xl
border
p-3
"

>


<option value="">

শ্রেণি নির্বাচন করুন

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

form.batch &&

<div className="
mb-4
rounded-xl
bg-blue-50
p-4
text-blue-700
">

আপনার ব্যাচ:

<b>
{form.batch}
</b>


</div>


}




<input

name="school"

value={form.school}

onChange={handleChange}

placeholder="স্কুলের নাম"

className="
mb-4
w-full
rounded-xl
border
p-3
"

/>





<input

name="college"

value={form.college}

onChange={handleChange}

placeholder="কলেজের নাম"

className="
w-full
rounded-xl
border
p-3
"

/>



</div>

