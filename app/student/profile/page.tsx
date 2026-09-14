"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";



export default function StudentProfile(){


const router = useRouter();


const [student,setStudent] = useState<any>(null);


const [password,setPassword] = useState("");

const [loading,setLoading] = useState(false);







useEffect(()=>{


async function loadProfile(){



const {

data:{
session

}

}=await supabase.auth.getSession();





if(!session){


router.push("/student/login");

return;


}







const data =

localStorage.getItem("student");





if(!data){


router.push("/student/login");

return;


}






setStudent(

JSON.parse(data)

);




}



loadProfile();



},[]);









async function changePassword(){



if(!password){


alert(
"Enter new password"
);


return;


}



if(password.length < 6){


alert(
"Password must be at least 6 characters"
);


return;


}




setLoading(true);







const {error}=

await supabase.auth.updateUser({

password:password

});






if(error){


alert(error.message);


setLoading(false);


return;


}







alert(
"Password Changed Successfully"
);



setPassword("");

setLoading(false);



}







async function logout(){


await supabase.auth.signOut();



localStorage.removeItem(
"student"
);



router.push(
"/student/login"
);



}









if(!student){


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

Student Profile

</h1>







<div className="
mt-6
space-y-4
">





<div className="
rounded-xl
bg-gray-50
p-4
">

<p className="text-gray-500">

Name

</p>


<p className="font-bold">

{student.student_name}

</p>


</div>







<div className="
rounded-xl
bg-gray-50
p-4
">

<p className="text-gray-500">

Student ID

</p>


<p className="font-bold">

{student.student_id}

</p>


</div>








<div className="
rounded-xl
bg-gray-50
p-4
">

<p className="text-gray-500">

Class

</p>


<p className="font-bold">

{student.class}

</p>


</div>







<div className="
rounded-xl
bg-gray-50
p-4
">

<p className="text-gray-500">

Batch

</p>


<p className="font-bold">

{student.batch}

</p>


</div>







</div>









<hr className="my-8"/>







<h2 className="
text-xl
font-bold
">

Change Password

</h2>







<input

className="
mt-4
w-full
rounded-lg
border
p-3
"

type="password"

placeholder="New Password"

value={password}

onChange={
e=>setPassword(e.target.value)
}

/>








<button

onClick={changePassword}

disabled={loading}

className="
mt-5
w-full
rounded-lg
bg-blue-600
py-3
text-white
disabled:bg-gray-400
"

>


{

loading

?

"Updating..."

:

"Change Password"

}



</button>







<button

onClick={logout}

className="
mt-4
w-full
rounded-lg
bg-red-600
py-3
text-white
"

>

Logout

</button>





</div>


</main>


)


}