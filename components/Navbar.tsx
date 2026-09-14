"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";


export default function Navbar() {

const [open,setOpen] = useState(false);


const menu = [

{
name:"হোম",
link:"/"
},

{
name:"আমাদের সম্পর্কে",
link:"/about"
},

{
name:"কোর্সসমূহ",
link:"/courses"
},

{
name:"শিক্ষকবৃন্দ",
link:"/teachers"
},

{
name:"অনলাইন ক্লাস",
link:"https://www.youtube.com/@TheCuriousClassroom-s2s",
external:true
},

{
name:"ফলাফল",
link:"/result"
},

{
name:"যোগাযোগ",
link:"/contact"
}

];



return (

<nav className="
bg-white
px-6
py-4
shadow-sm
">


<div className="
flex
items-center
justify-between
">


{/* Logo */}

<Link href="/">

<Image
src="/logo.png"
alt="The Curious Classroom"
width={170}
height={60}
/>

</Link>





{/* Desktop Menu */}

<div className="
hidden
md:flex
items-center
gap-8
text-gray-700
font-medium
">


{
menu.map((item)=>(

item.external ? (

<a

key={item.name}

href={item.link}

target="_blank"

rel="noopener noreferrer"

className="
hover:text-blue-600
transition
"

>

{item.name}

</a>


) : (


<Link

key={item.name}

href={item.link}

className="
hover:text-blue-600
transition
"

>

{item.name}

</Link>


)

))

}


</div>





{/* Admission Button */}

<Link

href="/admission"

className="
hidden
md:block
rounded-lg
bg-blue-600
px-6
py-3
text-white
hover:bg-blue-700
"

>

ভর্তি করুন

</Link>






{/* Mobile Button */}

<button

className="
md:hidden
text-3xl
"

onClick={()=>setOpen(!open)}

>

☰

</button>


</div>








{/* Mobile Menu */}

{

open && (

<div className="
mt-5
flex
flex-col
gap-4
text-gray-700
md:hidden
">


{

menu.map((item)=>(


item.external ? (

<a

key={item.name}

href={item.link}

target="_blank"

rel="noopener noreferrer"

onClick={()=>setOpen(false)}

>

{item.name}

</a>


) : (


<Link

key={item.name}

href={item.link}

onClick={()=>setOpen(false)}

>

{item.name}

</Link>


)


))


}



<Link

href="/admission"

className="
rounded-lg
bg-blue-600
px-6
py-3
text-white
text-center
"

>

ভর্তি করুন

</Link>


</div>

)

}



</nav>


);


}