"use client";

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


const {name,value}=e.target;



if(name==="class"){


let batch="";


const currentYear=new Date().getFullYear();




if(
value==="Class 9" ||
value==="Class 10"
){


const sscYear =

value==="Class 9"

?

currentYear+2

:

currentYear+1;



batch=`SSC ${String(sscYear).slice(-2)}`;


}






if(
value==="Class 11" ||
value==="Class 12"
){


const hscYear =

value==="Class 11"

?

currentYear+2

:

currentYear+1;



batch=`HSC ${String(hscYear).slice(-2)}`;


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






const {error}=await supabase

.storage

.from("student-photos")

.upload(

fileName,

photo

);





if(error)

throw error;






const {data}=

supabase

.storage

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






// Duplicate Check


const {data:existingStudent,error:checkError}=await supabase

.from("students")

.select(

"id,student_name,whatsapp"

)

.or(

`whatsapp.eq.${form.whatsapp},and(student_name.eq.${form.student_name},whatsapp.eq.${form.whatsapp})`

)

.maybeSingle();






if(checkError){

throw checkError;

}






if(existingStudent){


alert(

"এই শিক্ষার্থীর তথ্য দিয়ে ইতিমধ্যে আবেদন করা হয়েছে।"

);


return;


}







// Upload Photo


const photoURL=

await uploadPhoto();







const admissionDate=

new Date()

.toISOString()

.split("T")[0];







const {error}=await supabase

.from("students")

.insert({


student_id:null,


student_name:form.student_name,


student_photo:photoURL,


status:"pending",


guardian_name:form.guardian_name,


whatsapp:form.whatsapp,


facebook_link:form.facebook_link,


email:form.email,


admission_date:admissionDate,


date_of_birth:form.date_of_birth,


class:form.class,


batch:form.batch,


present_address:form.present_address,


permanent_address:form.permanent_address,


school:form.school,


college:form.college



});







if(error){



if(error.code==="23505"){


alert(

"এই WhatsApp নম্বর দিয়ে ইতিমধ্যে আবেদন করা হয়েছে।"

);


return;


}



throw error;


}







setSubmitted(true);



alert(

"Admission Submitted Successfully"

);



}




catch(error:any){


alert(error.message);


}




finally{


setLoading(false);


}



}

return(

<div className="
min-h-screen
bg-gray-50
px-5
py-10
">


<div className="
mx-auto
max-w-4xl
rounded-3xl
bg-white
p-8
shadow-xl
">


<div className="
mb-8
text-center
">


<h1 className="
text-3xl
font-bold
text-gray-900
">

The Curious Classroom

</h1>


<p className="
mt-2
text-gray-600
">

ভর্তি আবেদন ফরম

</p>


</div>





<form

onSubmit={submitAdmission}

className="
space-y-6
"

>





{/* Student Information */}

<div>


<h2 className="
mb-4
text-xl
font-bold
text-blue-600
">

শিক্ষার্থীর তথ্য

</h2>




<input

required

name="student_name"

value={form.student_name}

onChange={handleChange}

placeholder="শিক্ষার্থীর নাম"

className="
mb-3
w-full
rounded-lg
border
p-3
"

/>






<label className="
mb-2
block
text-gray-700
">

শিক্ষার্থীর ছবি *

</label>



<input

required

type="file"

accept="image/*"

onChange={(e)=>{


const file=e.target.files?.[0];


if(file){

setPhoto(file);

setPhotoPreview(
URL.createObjectURL(file)
);

}


}}

className="
w-full
rounded-lg
border
p-3
"

/>






{

photoPreview &&

<img

src={photoPreview}

alt="preview"

className="
mt-4
h-32
w-32
rounded-xl
object-cover
"

/>

}






<label className="
mt-4
mb-2
block
text-gray-700
">

জন্ম তারিখ *

</label>




<input

required

type="date"

name="date_of_birth"

value={form.date_of_birth}

onChange={handleChange}

className="
w-full
rounded-lg
border
p-3
"

/>


</div>








{/* Guardian Information */}

<div>


<h2 className="
mb-4
text-xl
font-bold
text-blue-600
">

অভিভাবকের তথ্য

</h2>





<input

required

name="guardian_name"

value={form.guardian_name}

onChange={handleChange}

placeholder="অভিভাবকের নাম"

className="
mb-3
w-full
rounded-lg
border
p-3
"

/>





<label className="
mb-2
block
text-gray-700
">

WhatsApp নম্বর *

</label>



<input

required

type="tel"

name="whatsapp"

value={form.whatsapp}

onChange={handleChange}

placeholder="WhatsApp নম্বর (যেমন: 017XXXXXXXX)"

className="
w-full
rounded-lg
border
p-3
"

/>



</div>







{/* Contact Information */}

<div>


<h2 className="
mb-4
text-xl
font-bold
text-blue-600
">

যোগাযোগের তথ্য

</h2>





<input

name="email"

value={form.email}

onChange={handleChange}

placeholder="ই-মেইল"

className="
mb-3
w-full
rounded-lg
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
rounded-lg
border
p-3
"

/>


</div>

{/* Academic Information */}

<div>


<h2 className="
mb-4
text-xl
font-bold
text-blue-600
">

শিক্ষাগত তথ্য

</h2>





<select

required

name="class"

value={form.class}

onChange={handleChange}

className="
mb-3
w-full
rounded-lg
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
rounded-lg
bg-blue-50
p-3
text-blue-700
">


ব্যাচ:

<b>

{" "}

{form.batch}

</b>


</div>


}







<input

name="school"

value={form.school}

onChange={handleChange}

placeholder="পূর্ববর্তী স্কুলের নাম"

className="
mt-3
w-full
rounded-lg
border
p-3
"

/>







<input

name="college"

value={form.college}

onChange={handleChange}

placeholder="পূর্ববর্তী কলেজের নাম"

className="
mt-3
w-full
rounded-lg
border
p-3
"

/>



</div>









{/* Address Information */}


<div>


<h2 className="
mb-4
text-xl
font-bold
text-blue-600
">

ঠিকানার তথ্য

</h2>






<textarea

required

name="present_address"

value={form.present_address}

onChange={handleChange}

placeholder="বর্তমান ঠিকানা"

className="
mb-3
h-28
w-full
rounded-lg
border
p-3
"

/>








<textarea

required

name="permanent_address"

value={form.permanent_address}

onChange={handleChange}

placeholder="স্থায়ী ঠিকানা"

className="
h-28
w-full
rounded-lg
border
p-3
"

/>



</div>









{/* Submit Button */}



<button

disabled={loading}

className="
w-full
rounded-xl
bg-blue-600
py-4
font-bold
text-white
hover:bg-blue-700
disabled:bg-gray-400
"

>


{

loading

?

"জমা হচ্ছে..."

:

"ভর্তি আবেদন জমা দিন"

}



</button>






</form>








{

submitted &&


<div className="
mt-8
rounded-xl
bg-green-50
p-5
text-center
">


<h3 className="
text-xl
font-bold
text-green-700
">

আবেদন সফলভাবে জমা হয়েছে

</h3>




<p className="
mt-3
text-gray-700
">

Admin approval এর পরে

<br />

Student ID এবং Login details প্রদান করা হবে।

</p>



</div>


}



</div>


</div>


);


}