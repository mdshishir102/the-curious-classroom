"use client";


import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";



export default function EditFeePage(){


const params = useParams();

const router = useRouter();


const id = params.id;



const [loading,setLoading] = useState(true);



const [form,setForm] = useState({

month:"",

amount:"",

status:"paid"

});







useEffect(()=>{


async function loadFee(){


const {data,error}=await supabase

.from("fees")

.select("*")

.eq(
"id",
id
)

.single();





if(!error && data){


setForm({

month:data.month,

amount:String(data.amount),

status:data.status

});


}



setLoading(false);



}



loadFee();



},[id]);








async function updateFee(){



const {error}=await supabase

.from("fees")

.update({

month:form.month,

amount:Number(form.amount),

status:form.status

})

.eq(
"id",
id
);





if(error){

alert(error.message);

return;

}



alert(
"Fee Updated Successfully"
);



router.push(
"/admin/fee/manage"
);



}








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
max-w-xl
rounded-3xl
bg-white
p-8
shadow
">



<h1 className="
text-3xl
font-bold
">

Edit Fee

</h1>







<select

className="
mt-6
w-full
rounded-lg
border
p-3
"

value={form.month}

onChange={
e=>setForm({

...form,

month:e.target.value

})
}

>


<option>
January
</option>


<option>
February
</option>


<option>
March
</option>


<option>
April
</option>


<option>
May
</option>


<option>
June
</option>


<option>
July
</option>


<option>
August
</option>


<option>
September
</option>


<option>
October
</option>


<option>
November
</option>


<option>
December
</option>



</select>







<input

className="
mt-4
w-full
rounded-lg
border
p-3
"

type="number"

placeholder="Amount"

value={form.amount}

onChange={
e=>setForm({

...form,

amount:e.target.value

})
}

/>







<select

className="
mt-4
w-full
rounded-lg
border
p-3
"

value={form.status}

onChange={
e=>setForm({

...form,

status:e.target.value

})
}

>


<option value="paid">

Paid

</option>



<option value="due">

Due

</option>



</select>







<button

onClick={updateFee}

className="
mt-6
w-full
rounded-lg
bg-blue-600
py-3
text-white
"

>

Update Fee

</button>





</div>


</main>


)


}