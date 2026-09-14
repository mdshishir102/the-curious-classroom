"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PlayCircle } from "lucide-react";


export default function YoutubeClasses() {


const [videos,setVideos] = useState<any[]>([]);



useEffect(()=>{


fetch("/api/youtube")
.then(res=>res.json())
.then(data=>{


if(Array.isArray(data)){

setVideos(data);

}
else{

setVideos([]);

}


})
.catch(err=>{

console.log(err);
setVideos([]);

});


},[]);




return (

<section className="
bg-blue-50
px-6
py-20
md:px-8
">


<div className="
mx-auto
max-w-7xl
">


<div className="
text-center
">


<h2 className="
text-3xl
font-bold
text-gray-900
md:text-4xl
">

ফ্রি অনলাইন ক্লাস

</h2>


<p className="
mt-4
text-gray-600
">

আমাদের YouTube চ্যানেলে নিয়মিত শিক্ষামূলক ভিডিও,
অধ্যায়ভিত্তিক ক্লাস ও পরীক্ষার প্রস্তুতি সহায়তা।

</p>


</div>





<div className="
mt-12
grid
gap-8
md:grid-cols-3
">


{
videos.slice(0,3).map((video,index)=>(


<motion.div


key={video.id}


initial={{
opacity:0,
y:30
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
bg-white
shadow-sm
hover:shadow-xl
"


>


<div className="
relative
">


<img

src={video.thumbnail}

alt={video.title}

className="
h-52
w-full
object-cover
"

/>



<div className="
absolute
inset-0
flex
items-center
justify-center
">


<PlayCircle

size={60}

className="
text-white
drop-shadow-lg
"

/>


</div>


</div>





<div className="
p-6
">


<span className="
rounded-full
bg-blue-50
px-3
py-1
text-sm
text-blue-600
">

YouTube Class

</span>





<h3 className="
mt-5
text-xl
font-bold
text-gray-900
line-clamp-2
">

{video.title}

</h3>





<Link

href={video.url}

target="_blank"

className="
mt-5
inline-block
rounded-lg
bg-blue-600
px-5
py-2
text-white
hover:bg-blue-700
transition
"

>

ভিডিও দেখুন

</Link>



</div>



</motion.div>


))

}



</div>





<div className="
mt-12
text-center
">


<Link

href="https://www.youtube.com/@TheCuriousClassroom-s2s"

target="_blank"

className="
inline-flex
rounded-xl
bg-blue-600
px-8
py-3
font-semibold
text-white
shadow-lg
hover:bg-blue-700
transition
"

>

আরও ভিডিও দেখুন

</Link>


</div>




</div>


</section>

);

}