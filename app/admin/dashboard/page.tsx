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

.select("*",{

count:"exact",

head:true

});







const {count:approvedStudents}=

await supabase

.from("students")

.select("*",{

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

.select("*",{

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

.select("*",{

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

<div className="p-10">

Loading...

</div>

)


}








return(


<main className="
min-h-screen
bg-gray-100
p-8
">



<div className="
mx-auto
max-w-6xl
">



<div className="
mb-8
flex
justify-between
items-center
">


<h1 className="
text-3xl
font-bold
">

Admin Dashboard

</h1>



<button

onClick={logout}

className="
rounded-lg
bg-red-600
px-5
py-2
text-white
"

>

Logout

</button>



</div>








<div className="
grid
gap-6
md:grid-cols-4
">





<Card

title="Total Students"

value={stats.totalStudents}

/>





<Card

title="Approved Students"

value={stats.approvedStudents}

/>





<Card

title="Pending Admission"

value={stats.pendingStudents}

/>





<Card

title="Total Results"

value={stats.totalResults}

/>





</div>









<h2 className="
mt-10
mb-5
text-xl
font-bold
">

Quick Actions

</h2>








<div className="
grid
gap-5
md:grid-cols-3
">





<Action

title="Pending Admission"

link="/admin"

/>






<Action

title="Add Result"

link="/admin/result"

/>






<Action

title="Manage Result"

link="/admin/result/manage"

/>


<Action

title="Student Management"

link="/admin/student"

/>

<Action

title="Admission Management"

link="/admin/admission"

/>

</div>








</div>


</main>


)


}








function Card({

title,

value

}:{

title:string;

value:number;

}){


return(


<div className="
rounded-2xl
bg-white
p-6
shadow
">


<p className="
text-gray-500
">

{title}

</p>


<p className="
mt-3
text-4xl
font-bold
text-blue-600
">

{value}

</p>


</div>


)


}









function Action({

title,

link

}:{

title:string;

link:string;

}){


return(


<Link

href={link}

className="
rounded-xl
bg-white
p-6
shadow
hover:bg-blue-50
"

>

<h3 className="
font-bold
">

{title}

</h3>


</Link>


)


}