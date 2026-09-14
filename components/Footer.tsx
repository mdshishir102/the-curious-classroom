import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Play,
} from "lucide-react";


export default function Footer() {


return(


<footer className="
bg-slate-950
px-6
pb-8
pt-16
text-white
md:px-8
">


<div className="
mx-auto
grid
max-w-7xl
gap-12
md:grid-cols-4
">





{/* Brand */}


<div className="
md:col-span-2
">


<div className="
inline-block
rounded-2xl
bg-white
p-3
">


<Image

src="/logo.png"

alt="The Curious Classroom"

width={170}

height={60}

/>


</div>







<p className="
mt-5
max-w-md
leading-relaxed
text-slate-400
">

নবম-দশম ও একাদশ-দ্বাদশ শ্রেণির বিজ্ঞান বিভাগের
শিক্ষার্থীদের জন্য অফলাইন ক্লাস ও ডিজিটাল শেখার সমন্বিত
আধুনিক শিক্ষা প্ল্যাটফর্ম।

</p>






<div className="
mt-6
flex
gap-3
">


<a

href="#"

className="
flex
h-11
w-11
items-center
justify-center
rounded-xl
bg-slate-800
transition
hover:bg-blue-600
"

>

<ExternalLink size={20}/>

</a>






<a

href="#"

className="
flex
h-11
w-11
items-center
justify-center
rounded-xl
bg-slate-800
transition
hover:bg-blue-600
"

>

<Play size={20}/>

</a>





</div>



</div>








{/* Links */}



<div>


<h3 className="
text-lg
font-semibold
">

গুরুত্বপূর্ণ লিংক

</h3>





<div className="
mt-5
flex
flex-col
gap-3
text-slate-400
">


<Link

href="/about"

className="
hover:text-white
"

>

আমাদের সম্পর্কে

</Link>




<Link

href="/courses"

className="
hover:text-white
"

>

কোর্সসমূহ

</Link>





<Link

href="/teachers"

className="
hover:text-white
"

>

শিক্ষকবৃন্দ

</Link>





<Link

href="/admission"

className="
hover:text-white
"

>

ভর্তি করুন

</Link>





<Link

href="/student/login"

className="
hover:text-white
"

>

শিক্ষার্থী লগইন

</Link>



</div>



</div>








{/* Contact */}



<div>


<h3 className="
text-lg
font-semibold
">

যোগাযোগ

</h3>






<div className="
mt-5
space-y-4
text-slate-400
">





<div className="
flex
items-start
gap-3
">


<MapPin

size={19}

className="
mt-1
text-blue-400
"

/>


<span>

ঠিকানা পরে যুক্ত করা হবে

</span>


</div>







<div className="
flex
items-center
gap-3
">


<Phone

size={19}

className="
text-blue-400
"

/>


<span>

ফোন নম্বর

</span>


</div>







<div className="
flex
items-center
gap-3
">


<Mail

size={19}

className="
text-blue-400
"

/>


<span>

ই-মেইল ঠিকানা

</span>


</div>





</div>




</div>







</div>








<div className="
mx-auto
mt-14
max-w-7xl
border-t
border-slate-800
pt-7
text-center
text-sm
text-slate-500
">

© 2026 The Curious Classroom. সর্বস্বত্ব সংরক্ষিত।

</div>




</footer>


);


}