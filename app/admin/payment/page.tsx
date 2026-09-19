"use client";

import Link from "next/link";


const classes = [
  {
    name: "Class 9",
    slug: "Class 9",
    icon: "📘",
  },
  {
    name: "Class 10",
    slug: "Class 10",
    icon: "📗",
  },
  {
    name: "Class 11",
    slug: "Class 11",
    icon: "📙",
  },
  {
    name: "Class 12",
    slug: "Class 12",
    icon: "📕",
  },
];



export default function MonthlyPaymentPage(){


return(

<main className="
min-h-screen
bg-gradient-to-br
from-blue-50
via-white
to-indigo-100
p-8
">


<div className="
max-w-6xl
mx-auto
">


<h1 className="
text-4xl
font-bold
text-gray-800
mb-3
">

💳 Monthly Payment Management

</h1>


<p className="
text-gray-500
mb-10
">

Class wise student payment history manage করুন

</p>





<div className="
grid
md:grid-cols-2
gap-8
">



{

classes.map((item)=>(


<Link

key={item.slug}

href={`/admin/payment/${encodeURIComponent(item.slug)}`}

className="
bg-white
rounded-3xl
p-8
shadow-lg
hover:shadow-2xl
transition
border
border-gray-100
"


>


<div className="
text-5xl
mb-5
">

{item.icon}

</div>



<h2 className="
text-2xl
font-bold
text-blue-700
">

{item.name}

</h2>



<p className="
mt-3
text-gray-500
">

View Students Payment History

</p>



<div className="
mt-6
text-blue-600
font-bold
">

Open →

</div>



</Link>


))


}



</div>



</div>


</main>

)


}