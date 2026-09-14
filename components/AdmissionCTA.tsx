"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";


export default function AdmissionCTA() {


return(


<section className="
px-6
py-20
md:px-8
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
mx-auto
max-w-6xl
rounded-3xl
bg-blue-600
px-8
py-16
text-center
text-white
"


>



<h2 className="
text-3xl
font-bold
md:text-4xl
">

আপনার সন্তানের সফলতার যাত্রা শুরু করুন

</h2>






<p className="
mx-auto
mt-5
max-w-2xl
text-blue-100
">

নবম-দশম ও একাদশ-দ্বাদশ শ্রেণির বিজ্ঞান বিভাগের জন্য
The Curious Classroom-এর সাথে যুক্ত হয়ে
মানসম্মত শিক্ষা ও সঠিক দিকনির্দেশনা পান।

</p>








<Link

href="/admission"

className="
mt-8
inline-flex
items-center
gap-2
rounded-xl
bg-white
px-8
py-3
font-semibold
text-blue-600
transition
hover:scale-105
"

>

ভর্তি করুন

<ArrowRight size={18}/>

</Link>






</motion.div>


</section>


);


}