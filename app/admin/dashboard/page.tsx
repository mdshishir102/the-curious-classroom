"use client";


import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";



export default function AdminDashboard(){


const [stats,setStats] = useState({

totalStudents:0,

approvedStudents:0,

pendingStudents:0,

totalResults:0

});



const [loading,setLoading] = useState(true);





async function logout(){


await supabase.auth.signOut();


localStorage.removeItem(
"admin"
);


window.location.href="/admin/login";


}






useEffect(()=>{


async function loadStats(){


const {

data:{
session

}

}=await supabase.auth.getSession();





if(!session){

window.location.href="/admin/login";

return;

}







const {data:admin,error}=await supabase

.from("admins")

.select("*")

.eq(
"auth_user_id",
session.user.id
)

.single();







if(error || !admin || admin.role!=="admin"){


await supabase.auth.signOut();


window.location.href="/admin/login";


return;


}








const {count:totalStudents}=

await supabase

.from("students")

.select("*",
{
count:"exact",
head:true
});








const {count:approvedStudents}=

await supabase

.from("students")

.select("*",
{
count:"exact",
head:true
})

.eq(
"status",
"approved"
);







const {count:pendingStudents}=

await supabase

.from("students")

.select("*",
{
count:"exact",
head:true
})

.eq(
"status",
"pending"
);








const {count:totalResults}=

await supabase

.from("results")

.select("*",
{
count:"exact",
head:true
});







setStats({

totalStudents:totalStudents || 0,

approvedStudents:approvedStudents || 0,

pendingStudents:pendingStudents || 0,

totalResults:totalResults || 0

});




setLoading(false);


}




loadStats();


},[]);






if(loading){


return(

<div className="
min-h-screen
flex
items-center
justify-center
bg-blue-50
font-bold
">

Loading Admin Panel...

</div>

)

}







return(


<main className="
min-h-screen
bg-gradient-to-br
from-blue-50
via-white
to-indigo-100
p-6
">



<div className="
max-w-7xl
mx-auto
">





{/* HEADER */}



<div className="
bg-white
rounded-3xl
shadow-xl
border
border-gray-100
p-5
flex
items-center
justify-between
mb-8
">



<div className="
flex
items-center
gap-4
">


<img

src="/logo.png"

className="
h-20
w-auto
object-contain
"

/>



<div>


<h1 className="
text-2xl
font-bold
text-blue-700
">

The Curious Classroom

</h1>



<p className="
text-gray-500
">

Admin Portal

</p>


</div>



</div>





<button

onClick={logout}

className="
rounded-xl
bg-red-500
px-6
py-3
text-white
font-bold
hover:bg-red-600
transition
"

>

Logout

</button>



</div>






{/* TITLE */}



<h1 className="
text-4xl
font-bold
text-gray-800
mb-8
">

Dashboard Overview

</h1>






{/* STATS */}

<div className="
grid
gap-6
md:grid-cols-4
">



<StatCard

icon="👨‍🎓"

title="Total Students"

value={stats.totalStudents}

color="blue"

/>



<StatCard

icon="✅"

title="Approved Students"

value={stats.approvedStudents}

color="green"

/>




<StatCard

icon="⏳"

title="Pending Admission"

value={stats.pendingStudents}

color="yellow"

/>




<StatCard

icon="📊"

title="Total Results"

value={stats.totalResults}

color="purple"

/>



</div>


{/* =====================
    QUICK ACTIONS
===================== */}


<h2 className="
mt-12
mb-6
text-2xl
font-bold
text-gray-800
">

Quick Actions

</h2>





<div className="
grid
gap-6
md:grid-cols-3
">



<ActionCard

icon="📥"

title="Pending Admission"

desc="Manage new admissions"

link="/admin"

/>





<ActionCard

icon="📝"

title="Add Result"

desc="Create student result"

link="/admin/result"

/>





<ActionCard

icon="📊"

title="Manage Result"

desc="Update results"

link="/admin/result/manage"

/>






<ActionCard

icon="👨‍🎓"

title="Student Management"

desc="Manage students"

link="/admin/student"

/>





<ActionCard

icon="🏫"

title="Admission Management"

desc="Control admission"

link="/admin/admission"

/>





</div>



</div>


</main>


)

}




// =====================
// STAT CARD
// =====================


function StatCard({

icon,

title,

value,

color

}:{

icon:string;

title:string;

value:number;

color:string;

}){


const colors:any={


blue:"bg-blue-50 text-blue-700",

green:"bg-green-50 text-green-700",

yellow:"bg-yellow-50 text-yellow-700",

purple:"bg-purple-50 text-purple-700"


};



return(


<div className="
bg-white
rounded-3xl
shadow-xl
border
border-gray-100
p-6
hover:shadow-xl
transition
">


<div className={`
h-14
w-14
rounded-2xl
flex
items-center
justify-center
text-3xl
${colors[color]}
`}>

{icon}

</div>



<p className="
mt-5
text-gray-500
font-medium
">

{title}

</p>



<h2 className="
mt-2
text-4xl
font-bold
text-gray-800
">

{value}

</h2>


</div>


)

}







// =====================
// ACTION CARD
// =====================


function ActionCard({

icon,

title,

desc,

link

}:{

icon:string;

title:string;

desc:string;

link:string;

}){


return(


<Link

href={link}

className="
bg-white
rounded-3xl
shadow-xl
border
border-gray-100
p-6
hover:shadow-2xl
hover:-translate-y-1
transition
block
"


>


<div className="
text-4xl
">

{icon}

</div>



<h3 className="
mt-5
text-xl
font-bold
text-gray-800
">

{title}

</h3>



<p className="
mt-2
text-gray-500
">

{desc}

</p>



<div className="
mt-5
text-blue-600
font-bold
">

Open →

</div>


</Link>


)

}