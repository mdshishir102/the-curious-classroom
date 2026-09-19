"use client";


import {useState} from "react";
import {supabase} from "@/lib/supabase";
import {useRouter} from "next/navigation";



export default function StudentLogin(){


const router = useRouter();


const [studentID,setStudentID] = useState("");

const [password,setPassword] = useState("");

const [loading,setLoading] = useState(false);





async function login(){


if(!studentID || !password){

alert("Please enter Student ID and Password");

return;

}



try{


setLoading(true);




// Check student from database

const {data:studentData,error}=await supabase

.from("students")

.select("*")

.eq(
"student_id",
studentID.trim()
)

.ilike(
"student_id",
studentID.trim()
)

.single();






if(error || !studentData){


alert(
"Invalid Student ID or Password"
);


return;


}






if(!studentData.login_enabled){


alert(
"Login disabled"
);


return;


}







// Save login session


localStorage.setItem(

"student",

JSON.stringify(studentData)

);







// Go student dashboard


router.push(

"/student/dashboard"

);





}



catch(error){


console.log(error);


alert(
"Something went wrong"
);


}



finally{


setLoading(false);


}



}









return(



<main className="
min-h-screen
bg-gray-100
flex
items-center
justify-center
p-6
">



<div className="
bg-white
rounded-3xl
p-8
shadow-xl
max-w-md
w-full
">



<h1 className="
text-3xl
font-bold
text-gray-900
">

Student Login

</h1>





<p className="
mt-2
text-gray-600
">

The Curious Classroom

</p>







<input


className="
mt-6
w-full
rounded-lg
border
p-3
text-gray-900
"


placeholder="Student ID"


value={studentID}


onChange={

e=>setStudentID(e.target.value)

}


/>







<input


className="
mt-4
w-full
rounded-lg
border
p-3
text-gray-900
"


placeholder="Password"


type="password"


value={password}


onChange={

e=>setPassword(e.target.value)

}


/>







<button


onClick={login}


disabled={loading}


className="
mt-6
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

"Logging in..."

:

"Login"

}


</button>






</div>



</main>


);


}