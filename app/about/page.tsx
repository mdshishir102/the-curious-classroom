"use client";

import Image from "next/image";
import { motion } from "framer-motion";


export default function AboutPage(){


const sections = [

{
title:"আমাদের গল্প",
subtitle:"Our Story",

text:
"The Curious Classroom একটি আধুনিক শিক্ষা প্রতিষ্ঠান যেখানে শিক্ষার্থীদের জন্য সহজ, মানসম্মত ও প্রযুক্তিনির্ভর শিক্ষা প্রদান করা হয়। অভিজ্ঞ শিক্ষক, আধুনিক শিক্ষাপদ্ধতি এবং নিয়মিত অনুশীলনের মাধ্যমে আমরা শিক্ষার্থীদের সফলতার পথে এগিয়ে নিয়ে যাচ্ছি।",

image:"/about/story.jpg"

},


{
title:"আমাদের লক্ষ্য",
subtitle:"Our Mission",

text:
"আমাদের লক্ষ্য হলো প্রতিটি শিক্ষার্থীর মাঝে আত্মবিশ্বাস তৈরি করা এবং তাদের একাডেমিক ও বাস্তব জীবনের জন্য প্রস্তুত করা। প্রযুক্তির মাধ্যমে শিক্ষাকে আরও সহজ, সুন্দর ও কার্যকর করা আমাদের প্রধান উদ্দেশ্য।",

image:"/about/mission.jpg"

},


{
title:"আমাদের ভিশন",
subtitle:"Our Vision",

text:
"বাংলাদেশের অন্যতম বিশ্বস্ত ও আধুনিক শিক্ষা প্ল্যাটফর্ম হিসেবে প্রতিষ্ঠিত হওয়া, যেখানে প্রত্যেক শিক্ষার্থী মানসম্মত শিক্ষা গ্রহণ করে নিজের স্বপ্ন পূরণ করতে পারে।",

image:"/about/online.jpg"

}

];





return(

<main className="bg-white overflow-hidden">



{/* Hero Section */}

<section className="
bg-blue-50
px-6
py-20
">


<div className="
mx-auto
max-w-6xl
text-center
">


<motion.h1

initial={{
opacity:0,
y:-40
}}

animate={{
opacity:1,
y:0
}}

transition={{
duration:0.7
}}

className="
text-4xl
font-bold
text-gray-900
md:text-6xl
"

>

আমাদের সম্পর্কে

</motion.h1>




<motion.p

initial={{
opacity:0,
y:30
}}

animate={{
opacity:1,
y:0
}}

transition={{
duration:0.7,
delay:0.2
}}

className="
mx-auto
mt-6
max-w-3xl
text-lg
leading-8
text-gray-600
"

>

The Curious Classroom শিক্ষার্থীদের জন্য
আধুনিক প্রযুক্তি, অভিজ্ঞ শিক্ষক এবং
সঠিক নির্দেশনার মাধ্যমে একটি সম্পূর্ণ শিক্ষা ব্যবস্থা তৈরি করছে।

</motion.p>


</div>


</section>









{/* Story Mission Vision */}

<section className="
mx-auto
max-w-7xl
px-6
py-24
space-y-32
">


{

sections.map((item,index)=>(


<motion.div

key={item.title}


initial={{
opacity:0,
x:index % 2 === 0 ? -80 : 80
}}


whileInView={{
opacity:1,
x:0
}}


transition={{
duration:0.8
}}


viewport={{
once:true
}}


className="
grid
items-center
gap-12
md:grid-cols-2
"

>





{/* Image */}


<motion.div

whileHover={{
scale:1.05
}}


className={`
overflow-hidden
rounded-3xl
shadow-xl
${index % 2 !== 0 ? "md:order-2":""}
`}

>


<Image

src={item.image}

alt={item.title}

width={700}

height={500}

className="
h-[400px]
w-full
object-cover
"

/>


</motion.div>








{/* Text */}


<div>


<span className="
text-blue-600
font-semibold
tracking-wider
uppercase
">

{item.subtitle}

</span>




<h2 className="
mt-4
text-3xl
font-bold
text-gray-900
md:text-4xl
">

{item.title}

</h2>



<p className="
mt-6
text-lg
leading-9
text-gray-600
">

{item.text}

</p>



</div>



</motion.div>


))


}


</section>









{/* Teacher Section */}


<section className="
bg-blue-50
px-6
py-20
">


<div className="
mx-auto
max-w-6xl
grid
items-center
gap-10
md:grid-cols-2
">


<motion.div

initial={{
opacity:0,
x:-60
}}

whileInView={{
opacity:1,
x:0
}}

viewport={{
once:true
}}

>


<Image

src="/about/teacher.jpg"

alt="Teacher"

width={500}

height={500}

className="
rounded-3xl
shadow-xl
"

/>


</motion.div>






<div>


<h2 className="
text-3xl
font-bold
text-gray-900
">

আমাদের শিক্ষকবৃন্দ

</h2>


<p className="
mt-5
text-lg
leading-8
text-gray-600
">

অভিজ্ঞ ও দক্ষ শিক্ষকবৃন্দের মাধ্যমে
শিক্ষার্থীদের জন্য সহজবোধ্য,
মানসম্মত এবং ফলাফলভিত্তিক শিক্ষা প্রদান করা হয়।

</p>


</div>


</div>


</section>








{/* Statistics */}


<section className="
px-6
py-20
">


<div className="
mx-auto
max-w-6xl
grid
gap-8
md:grid-cols-3
">


{

[
{
number:"200+",
text:"শিক্ষার্থী"
},

{
number:"10+",
text:"অভিজ্ঞ শিক্ষক"
},

{
number:"100%",
text:"মানসম্মত শিক্ষা"
}

].map(item=>(


<motion.div

key={item.text}

whileHover={{
y:-10
}}

className="
rounded-3xl
bg-white
p-8
text-center
shadow-lg
border
"

>


<h3 className="
text-4xl
font-bold
text-blue-600
">

{item.number}

</h3>


<p className="
mt-3
text-gray-600
text-lg
">

{item.text}

</p>


</motion.div>


))


}


</div>


</section>





</main>


);


}