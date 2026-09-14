"use client";

import { motion } from "framer-motion";
import { Atom, GraduationCap } from "lucide-react";


export default function Programs() {


const sscSubjects=[

"পদার্থবিজ্ঞান",

"রসায়ন",

"জীববিজ্ঞান",

"উচ্চতর গণিত",

"নিয়মিত পরীক্ষা ও মূল্যায়ন"

];



const hscSubjects=[

"পদার্থবিজ্ঞান",

"রসায়ন",

"জীববিজ্ঞান",

"উচ্চতর গণিত",

"বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি"

];





return(


<section className="
bg-white
px-8
py-20
">


<div className="
mx-auto
max-w-7xl
">





<motion.div

initial={{
opacity:0,
y:40
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
text-4xl
font-bold
text-gray-900
">

আমাদের শিক্ষা কার্যক্রম

</h2>



<p className="
mt-4
text-gray-600
">

SSC ও HSC বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য
পরিকল্পিত ও ফলাফলভিত্তিক শিক্ষা ব্যবস্থা।

</p>


</motion.div>









<div className="
mt-12
grid
gap-8
md:grid-cols-2
">








{/* SSC */}



<motion.div

initial={{
opacity:0,
x:-40
}}

whileInView={{
opacity:1,
x:0
}}

transition={{
duration:0.5
}}

viewport={{
once:true
}}

className="
rounded-3xl
bg-blue-50
p-8
transition
hover:-translate-y-2
hover:shadow-xl
"

>




<div className="
flex
h-14
w-14
items-center
justify-center
rounded-2xl
bg-white
">


<Atom

size={32}

className="
text-blue-600
"

/>


</div>






<h3 className="
mt-6
text-2xl
font-bold
text-blue-600
">

SSC বিজ্ঞান বিভাগ

</h3>




<p className="
mt-3
text-gray-600
">

নবম ও দশম শ্রেণির শিক্ষার্থীদের জন্য
বোর্ড পরীক্ষা উপযোগী সম্পূর্ণ প্রস্তুতি।

</p>






<ul className="
mt-6
space-y-3
text-gray-700
">


{

sscSubjects.map(item=>(


<li key={item}>

✓ {item}

</li>


))

}


</ul>





</motion.div>









{/* HSC */}



<motion.div

initial={{
opacity:0,
x:40
}}

whileInView={{
opacity:1,
x:0
}}

transition={{
duration:0.5
}}

viewport={{
once:true
}}

className="
rounded-3xl
border
bg-white
p-8
transition
hover:-translate-y-2
hover:shadow-xl
"

>




<div className="
flex
h-14
w-14
items-center
justify-center
rounded-2xl
bg-blue-50
">


<GraduationCap

size={32}

className="
text-blue-600
"

/>


</div>







<h3 className="
mt-6
text-2xl
font-bold
text-blue-600
">

HSC বিজ্ঞান বিভাগ

</h3>






<p className="
mt-3
text-gray-600
">

একাদশ ও দ্বাদশ শ্রেণির শিক্ষার্থীদের জন্য
বোর্ড পরীক্ষা এবং উচ্চশিক্ষার প্রস্তুতি।

</p>






<ul className="
mt-6
space-y-3
text-gray-700
">


{

hscSubjects.map(item=>(


<li key={item}>

✓ {item}

</li>


))

}


</ul>





</motion.div>








</div>




</div>


</section>


);


}