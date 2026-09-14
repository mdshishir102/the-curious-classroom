"use client";

import {
  BookOpen,
  GraduationCap,
  ChartNoAxesCombined,
  Monitor
} from "lucide-react";

import { motion } from "framer-motion";


export default function WhyChooseUs() {


const features=[

{
title:"ধারণাভিত্তিক শিক্ষা",

description:
"মুখস্থ নির্ভরতা নয়, প্রতিটি বিষয় সহজভাবে বুঝে শেখার মাধ্যমে শক্ত ভিত্তি তৈরি করা।",

icon:BookOpen

},


{
title:"অভিজ্ঞ শিক্ষকের গাইডলাইন",

description:
"দক্ষ ও অভিজ্ঞ শিক্ষকদের নিয়মিত তত্ত্বাবধান এবং ব্যক্তিগত সহযোগিতা।",

icon:GraduationCap

},


{
title:"নিয়মিত পরীক্ষা ও মূল্যায়ন",

description:
"পরিকল্পিত পরীক্ষার মাধ্যমে শিক্ষার্থীর অগ্রগতি পর্যবেক্ষণ এবং দুর্বলতা উন্নয়ন।",

icon:ChartNoAxesCombined

},


{
title:"আধুনিক শিক্ষা ব্যবস্থা",

description:
"অফলাইন ক্লাসের পাশাপাশি অনলাইন সুবিধার মাধ্যমে যেকোনো সময় শেখার সুযোগ।",

icon:Monitor

}


];





return(


<section className="
bg-blue-50
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

কেন The Curious Classroom?

</h2>




<p className="
mt-4
text-gray-600
">

শিক্ষার্থীদের শেখার আগ্রহ, দক্ষতা এবং সফলতার জন্য
আমাদের বিশেষ শিক্ষা পদ্ধতি।

</p>



</motion.div>








<div className="
mt-12
grid
gap-8
md:grid-cols-2
">



{

features.map((item,index)=>{


const Icon=item.icon;



return(


<motion.div

key={item.title}

initial={{
opacity:0,
y:50
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

className="
rounded-3xl
bg-white
p-8
shadow-sm
transition
duration-300
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
bg-blue-100
">


<Icon

size={30}

className="
text-blue-600
"

/>


</div>






<h3 className="
mt-6
text-2xl
font-bold
text-gray-900
">

{item.title}

</h3>






<p className="
mt-3
text-gray-600
">

{item.description}

</p>





</motion.div>


)


})


}



</div>



</div>


</section>


)


}