"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";


export default function StudentSuccess() {


const reviews=[


{
name:"শিক্ষার্থীর নাম",

class:"HSC শিক্ষার্থী",

text:
"The Curious Classroom এর সহজবোধ্য পড়ানোর পদ্ধতি এবং নিয়মিত গাইডলাইন আমাকে আত্মবিশ্বাসের সাথে পরীক্ষার প্রস্তুতি নিতে সাহায্য করেছে।"

},



{
name:"শিক্ষার্থীর নাম",

class:"SSC শিক্ষার্থী",

text:
"নিয়মিত পরীক্ষা, মূল্যায়ন এবং শিক্ষকদের সহযোগিতার মাধ্যমে আমার পড়াশোনার উন্নতি হয়েছে।"

},



{
name:"শিক্ষার্থীর নাম",

class:"HSC শিক্ষার্থী",

text:
"কঠিন বিষয়গুলো সহজভাবে বোঝানোর কারণে পড়াশোনার প্রতি আগ্রহ ও আত্মবিশ্বাস দুটোই বেড়েছে।"

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
text-3xl
font-bold
text-gray-900
md:text-4xl
">

শিক্ষার্থীদের সাফল্যের গল্প

</h2>





<p className="
mt-4
text-gray-600
">

আমাদের শিক্ষার্থীদের শেখার অভিজ্ঞতা,
আত্মবিশ্বাস এবং সফলতার কিছু গল্প।

</p>



</motion.div>








<div className="
mt-12
grid
gap-8
md:grid-cols-3
">





{

reviews.map((review,index)=>(


<motion.div


key={index}


initial={{
opacity:0,
y:40
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
rounded-3xl
border
bg-white
p-8
shadow-sm
hover:shadow-xl
"



>






<Quote

size={40}

className="
text-blue-600
"

/>







<p className="
mt-5
leading-relaxed
text-gray-600
">

"{review.text}"

</p>








<div className="
mt-6
flex
items-center
gap-4
">





<div className="
flex
h-12
w-12
items-center
justify-center
rounded-full
bg-blue-50
font-bold
text-blue-600
">

S

</div>







<div>


<h3 className="
font-bold
text-gray-900
">

{review.name}

</h3>




<p className="
text-sm
text-blue-600
">

{review.class}

</p>



</div>





</div>







</motion.div>


))


}





</div>






</div>


</section>


);


}