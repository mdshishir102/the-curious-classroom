"use client";


import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";



export default function PaymentDashboard(){



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




const [selectedMonth,setSelectedMonth] =
useState(currentMonth);


const [selectedYear,setSelectedYear] =
useState(currentYear);




const [stats,setStats]=useState({

total:0,

bkash:0,

offline:0,

students:0

});




const [classStats,setClassStats]=useState<any[]>([]);



const [loading,setLoading]=useState(true);







function getMonths(){


return [

"January",

"February",

"March",

"April",

"May",

"June",

"July",

"August",

"September",

"October",

"November",

"December"

];


}







function getYears(){


const year = new Date().getFullYear();


return [

year-1,

year,

year+1,

year+2

];


}








async function loadPaymentStats(){



setLoading(true);





const {data:payments,error}=await supabase

.from("payments")

.select("*")

.eq(
"month",
selectedMonth
)

.eq(
"year",
selectedYear
)

.eq(
"status",
"paid"
);





if(error){

alert(error.message);

setLoading(false);

return;

}








const total =

payments?.reduce(

(sum,item)=>

sum + Number(item.amount),

0

) || 0;







const bkash =

payments?.filter(

item=>

item.payment_method==="bKash"

)

.reduce(

(sum,item)=>

sum + Number(item.amount),

0

) || 0;







const offline =

payments?.filter(

item=>

item.payment_method==="Offline"

)

.reduce(

(sum,item)=>

sum + Number(item.amount),

0

) || 0;







const uniqueStudents =

new Set(

payments?.map(

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






loadClassStats();

}






async function loadClassStats(){


const classes=[

"Class 9",

"Class 10",

"Class 11",

"Class 12"

];


let result:any[]=[];



for(const className of classes){


const {data:students}=await supabase

.from("students")

.select("id")

.eq(
"class",
className
)

.eq(
"status",
"approved"
);



const totalStudents =
students?.length || 0;



const studentIds =
students?.map(
item=>item.id
) || [];




const {data:payments}=await supabase

.from("payments")

.select("student_id")

.in(
"student_id",
studentIds
)

.eq(
"month",
selectedMonth
)

.eq(
"year",
selectedYear
)

.eq(
"status",
"paid"
);




const paid =

new Set(

payments?.map(
item=>item.student_id
)

).size;




result.push({

className,

total:totalStudents,

paid,

unpaid:
totalStudents-paid

});


}



setClassStats(result);

setLoading(false);


}






useEffect(()=>{


loadPaymentStats();


},[selectedMonth,selectedYear]);






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


if(loading){


return(

<div className="
min-h-screen
flex
items-center
justify-center
bg-slate-50
font-bold
text-blue-700
">

Loading Dashboard...

</div>

)


}





return(

<main className="
min-h-screen
bg-slate-50
p-6
md:p-10
">


<div className="
max-w-7xl
mx-auto
">





{/* HEADER */}

<div className="
bg-white
rounded-3xl
shadow-sm
p-6
border
border-gray-100
">


<div className="
flex
flex-col
md:flex-row
justify-between
gap-5
">


<div>


<h1 className="
text-4xl
font-bold
text-gray-800
">

💳 Monthly Collection

</h1>


<p className="
mt-2
text-gray-500
">

Track student payments, collection and class performance

</p>


</div>





<div className="
bg-blue-50
rounded-2xl
px-5
py-3
font-bold
text-blue-700
">

📅 {selectedMonth} {selectedYear}

</div>



</div>




</div>







{/* FILTER */}

<div className="
mt-6
bg-white
rounded-3xl
shadow-sm
p-6
border
border-gray-100
">


<h2 className="
font-bold
text-gray-700
mb-4
">

Select Month

</h2>



<div className="
flex
gap-4
flex-col
md:flex-row
">


<select

className="
border
rounded-xl
p-3
w-full
md:w-60
bg-white
"

value={selectedMonth}

onChange={e=>
setSelectedMonth(e.target.value)
}

>

{

getMonths().map(month=>(

<option key={month}>

{month}

</option>

))

}

</select>





<select

className="
border
rounded-xl
p-3
w-full
md:w-40
bg-white
"

value={selectedYear}

onChange={e=>
setSelectedYear(
Number(e.target.value)
)
}

>


{

getYears().map(year=>(

<option key={year}>

{year}

</option>

))

}


</select>



</div>


</div>








{/* COLLECTION CARDS */}



<div className="
mt-8
grid
md:grid-cols-4
gap-6
">



<Card

icon="💰"

title="Total Collection"

value={`৳ ${stats.total}`}

color="blue"

/>



<Card

icon="👨‍🎓"

title="Paid Students"

value={stats.students}

color="green"

/>



<Card

icon="📱"

title="bKash Collection"

value={`৳ ${stats.bkash}`}

color="purple"

/>



<Card

icon="💵"

title="Offline Collection"

value={`৳ ${stats.offline}`}

color="orange"

/>



</div>








{/* CLASS STATUS */}



<div className="
mt-12
">


<h2 className="
text-3xl
font-bold
text-gray-800
mb-6
">

📚 Class Wise Payment Status

</h2>






<div className="
grid
md:grid-cols-4
gap-6
">


{

classStats.map(item=>(


<div

key={item.className}

className="
bg-white
rounded-3xl
shadow-sm
border
border-gray-100
p-6
hover:shadow-xl
transition
"


>


<h3 className="
text-xl
font-bold
text-blue-700
">

🎓 {item.className}

</h3>



<div className="
mt-5
space-y-3
">


<div className="
bg-gray-50
rounded-xl
p-3
font-bold
">

Total Students:
<span className="
text-gray-800
">

{" "}{item.total}

</span>

</div>





<div className="
bg-green-100
text-green-700
rounded-xl
p-3
font-bold
">

🟢 Paid:
{" "}
{item.paid}

</div>





<div className="
bg-red-100
text-red-700
rounded-xl
p-3
font-bold
">

🔴 Unpaid:
{" "}
{item.unpaid}

</div>



</div>



</div>



))

}



</div>


</div>







</div>


</main>


)

}





function Card({

icon,

title,

value,

color

}:{

icon:string;

title:string;

value:any;

color:string;

}){


const colors:any={

blue:"from-blue-500 to-blue-700",

green:"from-green-500 to-green-700",

purple:"from-purple-500 to-purple-700",

orange:"from-orange-500 to-orange-700"

};



return(

<div className={`
bg-gradient-to-br
${colors[color]}
rounded-3xl
p-6
text-white
shadow-lg
hover:scale-105
transition
`}>



<div className="
text-4xl
">

{icon}

</div>



<p className="
mt-5
opacity-90
">

{title}

</p>



<h2 className="
text-3xl
font-bold
mt-2
">

{value}

</h2>



</div>

)

}