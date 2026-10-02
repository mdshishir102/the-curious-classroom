"use client";

import { useRouter } from "next/navigation";


export default function ManageResultPage() {


const router = useRouter();


const classes = [
  {
    name:"Class 9",
    icon:"📘",
    color:"from-blue-500 to-cyan-400",
    shadow:"shadow-blue-200"
  },
  {
    name:"Class 10",
    icon:"📗",
    color:"from-green-500 to-emerald-400",
    shadow:"shadow-green-200"
  },
  {
    name:"Class 11",
    icon:"📕",
    color:"from-purple-500 to-violet-400",
    shadow:"shadow-purple-200"
  },
  {
    name:"Class 12",
    icon:"📙",
    color:"from-orange-500 to-amber-400",
    shadow:"shadow-orange-200"
  }
];




return (

<main className="
min-h-screen
bg-gradient-to-br
from-slate-100
via-blue-50
to-white
p-8
">


<div className="
mx-auto
max-w-7xl
">


{/* Header */}

<div className="
mb-12
">


<h1 className="
text-4xl
font-extrabold
tracking-tight
text-gray-800
">

📊 Manage Result

</h1>


<p className="
mt-3
text-gray-500
text-lg
">

Select a class to manage student examination results

</p>


</div>





{/* Cards */}

<div className="
grid
gap-8
sm:grid-cols-2
lg:grid-cols-4
">



{

classes.map((item)=>(


<div

key={item.name}

onClick={()=>router.push(
`/admin/result/manage/${item.name.replace(" ","-")}`
)}

className={`
group
relative
cursor-pointer
overflow-hidden
rounded-3xl
bg-white
p-7
shadow-xl
${item.shadow}
transition-all
duration-300
hover:-translate-y-2
hover:shadow-2xl
`}


>


{/* Gradient Top */}

<div className={`
absolute
left-0
top-0
h-2
w-full
bg-gradient-to-r
${item.color}
`}>
</div>





<div className="
relative
">


{/* Icon */}

<div className={`
mb-6
flex
h-20
w-20
items-center
justify-center
rounded-3xl
bg-gradient-to-br
${item.color}
text-4xl
shadow-lg
transition
duration-300
group-hover:scale-110
`}>

{item.icon}

</div>





<h2 className="
text-2xl
font-bold
text-gray-800
">

{item.name}

</h2>



<p className="
mt-3
text-sm
leading-6
text-gray-500
">

Manage {item.name} students result, marks and performance.

</p>





<div className="
mt-8
flex
items-center
font-semibold
text-blue-600
">


Open Result


<span className="
ml-2
transition
duration-300
group-hover:translate-x-2
">

→

</span>


</div>



</div>



</div>


))


}



</div>



</div>



</main>

)

}