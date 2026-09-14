"use client";

import { motion } from "framer-motion";
import { UserRound, BookOpen } from "lucide-react";


export default function Teachers() {


const teachers=[


{
name:"মো.মাহফুজ শাহারিয়া শিশির",

subject:"জীববিজ্ঞান",

qualification:
"অভিজ্ঞ শিক্ষক ও The Curious Classroom এর প্রতিষ্ঠাতা।"
},



{
name:"শিক্ষকের নাম",

subject:"পদার্থবিজ্ঞান",

qualification:
"বিষয়ভিত্তিক দক্ষতা ও নিয়মিত শিক্ষার্থী গাইডলাইন।"
},



{
name:"শিক্ষকের নাম",

subject:"রসায়ন",

qualification:
"সহজ পদ্ধতিতে বিষয় বোঝানো এবং পরীক্ষাভিত্তিক প্রস্তুতি।"
}



];





return(


<section className="
bg-white
px-6
py-20
md:px-8
">


<div className="
mx-auto
max-w-7xl
">






<motion.div

initial={{
opacity:0,
y:35
}}

whileInView={{
opacity:1,
y:0
}}

transition={{
duration:0.6
}}

viewport={{
once:true
}}

className="
text-center
"

>


<h2 className="
text-3xl
font-bold
text-gray-900
md:text-4xl
">

আমাদের শিক্ষকবৃন্দ

</h2>





<p className="
mx-auto
mt-4
max-w-2xl
leading-relaxed
text-gray-600
">

অভিজ্ঞ শিক্ষকবৃন্দের তত্ত্বাবধানে
বিষয়ভিত্তিক শিক্ষা, নিয়মিত মূল্যায়ন
এবং ব্যক্তিগত দিকনির্দেশনা।

</p>



</motion.div>








<div className="
mt-12
grid
gap-8
md:grid-cols-3
">





{

teachers.map((teacher,index)=>(


<motion.div


key={`${teacher.subject}-${index}`}


initial={{
opacity:0,
y:45
}}


whileInView={{
opacity:1,
y:0
}}


transition={{

duration:0.5,

delay:index*0.1

}}


viewport={{
once:true
}}


whileHover={{
y:-8
}}



className="
overflow-hidden
rounded-3xl
border
border-gray-100
bg-white
shadow-sm
transition
hover:shadow-xl
"

>




{/* Teacher Image */}



<div className="
flex
h-56
items-center
justify-center
bg-blue-50
">


<div className="
flex
h-24
w-24
items-center
justify-center
rounded-full
bg-white
shadow
">


<UserRound

size={44}

strokeWidth={1.6}

className="
text-blue-600
"

/>


</div>


</div>








<div className="
p-7
">





<div className="
mb-4
inline-flex
items-center
gap-2
rounded-full
bg-blue-50
px-3
py-1.5
text-sm
font-medium
text-blue-600
">


<BookOpen size={16}/>


{teacher.subject}


</div>







<h3 className="
text-xl
font-bold
text-gray-900
">

{teacher.name}

</h3>







<p className="
mt-2
text-sm
leading-relaxed
text-gray-600
">

{teacher.qualification}

</p>





</div>




</motion.div>



))


}



</div>





</div>


</section>


);


}