"use client";


import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";



export default function PaymentDashboard(){



const [stats,setStats]=useState({

total:0,

bkash:0,

offline:0,

students:0

});


const [loading,setLoading]=useState(true);






async function loadPaymentStats(){


const now = new Date();


const currentMonth =
now.toLocaleString(
"en-US",
{
month:"long"
}
);



const currentYear =
now.getFullYear();






const {data,error}=await supabase

.from("payments")

.select("*")

.eq(
"month",
currentMonth
)

.eq(
"year",
currentYear
)

.eq(
"status",
"paid"
);





if(error){

alert(error.message);

return;

}







const total =
data?.reduce(

(sum,item)=>

sum + Number(item.amount),

0

) || 0;






const bkash =
data?.filter(

item=>

item.payment_method==="bKash"

)

.reduce(

(sum,item)=>

sum+Number(item.amount),

0

) || 0;






const offline =
data?.filter(

item=>

item.payment_method==="Offline"

)

.reduce(

(sum,item)=>

sum+Number(item.amount),

0

) || 0;







const uniqueStudents = new Set(

data?.map(
item=>item.student_id
)

);







setStats({

total,

bkash,

offline,

students:
uniqueStudents.size

});



setLoading(false);



}







useEffect(()=>{


loadPaymentStats();


},[]);









if(loading){


return(

<div className="
min-h-screen
flex
items-center
justify-center
font-bold
">

Loading...

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
mb-8
">

💳 Monthly Collection Dashboard

</h1>







<div className="
grid
md:grid-cols-4
gap-6
">





<Card

title="Total Collection"

value={`৳ ${stats.total}`}

/>




<Card

title="Paid Students"

value={stats.students}

/>




<Card

title="bKash Collection"

value={`৳ ${stats.bkash}`}

/>




<Card

title="Offline Collection"

value={`৳ ${stats.offline}`}

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

value:any;

}){


return(

<div className="
bg-white
rounded-3xl
shadow-lg
p-6
">


<p className="
text-gray-500
">

{title}

</p>



<h2 className="
mt-3
text-3xl
font-bold
text-blue-700
">

{value}

</h2>



</div>

)


}