import Image from "next/image";
import Link from "next/link";


export default function Hero() {


return (


<section className="
bg-blue-50
px-6
py-16
md:py-20
">


<div className="
mx-auto
grid
max-w-7xl
items-center
gap-10
md:grid-cols-2
">



{/* Left Content */}


<div>


<h1 className="
text-4xl
font-bold
leading-tight
text-blue-600
md:text-6xl
">

কৌতূহল থেকে শুরু হোক

<br />

সফলতার যাত্রা

</h1>





<p className="
mt-5
max-w-xl
text-lg
leading-relaxed
text-gray-600
">

নবম-দশম ও একাদশ-দ্বাদশ শ্রেণির বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য
আধুনিক অনলাইন ও অফলাইন শিক্ষার সমন্বিত শিক্ষা প্ল্যাটফর্ম।
অভিজ্ঞ শিক্ষকের গাইডলাইন, নিয়মিত পরীক্ষা ও ব্যক্তিগত যত্নের মাধ্যমে
সফল ভবিষ্যৎ গড়ার একটি নির্ভরযোগ্য প্রতিষ্ঠান।

</p>







<div className="
mt-7
flex
flex-wrap
gap-4
">


<Link

href="/admission"

className="
rounded-lg
bg-blue-600
px-7
py-3
text-white
hover:bg-blue-700
"

>

ভর্তি করুন

</Link>






<Link

href="/student/login"

className="
rounded-lg
border
border-blue-600
px-7
py-3
text-blue-600
hover:bg-blue-100
"

>

শিক্ষার্থী লগইন

</Link>



</div>








<div className="
mt-10
flex
gap-10
">



<div>

<h3 className="
text-3xl
font-bold
text-blue-600
">

200+

</h3>


<p className="
text-gray-600
">

শিক্ষার্থী

</p>


</div>







<div>

<h3 className="
text-2xl
font-bold
text-blue-600
">

Offline + Online

</h3>


<p className="
text-gray-600
">

সমন্বিত শিক্ষা ব্যবস্থা

</p>


</div>





</div>



</div>








{/* Founder Image */}


<div className="
flex
flex-col
items-center
">



<div className="
relative
h-[430px]
w-[330px]
overflow-hidden
rounded-3xl
bg-white
shadow-xl
">


<Image

src="/teacher.png"

alt="MD. Mahfuz Shaharia Shishir"

fill

className="
object-cover
object-top
"

priority

/>


</div>







<div className="
mt-5
text-center
">


<h3 className="
text-xl
font-bold
text-gray-800
">

MD. Mahfuz Shaharia Shishir

</h3>



<p className="
text-blue-600
">

CEO & Founder, The Curious Classroom

</p>



</div>



</div>





</div>


</section>


);


}