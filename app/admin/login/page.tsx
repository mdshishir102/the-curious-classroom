"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";



export default function AdminLogin(){


const router = useRouter();


const [email,setEmail] = useState("");

const [password,setPassword] = useState("");

const [showPassword,setShowPassword] = useState(false);

const [loading,setLoading] = useState(false);








async function login(){



if(!email || !password){


alert(
"Enter email and password"
);


return;


}




try{


setLoading(true);





const {

data:authData,

error:authError

}=await supabase.auth.signInWithPassword({

email:email.trim(),

password:password.trim()

});







if(authError || !authData.user){


alert(
"Invalid email or password"
);


return;


}







const {

data:admin,

error:adminError

}=await supabase

.from("admins")

.select("*")

.eq(

"auth_user_id",

authData.user.id

)

.single();







if(adminError || !admin){


await supabase.auth.signOut();


alert(
"Admin access denied"
);


return;


}







if(admin.role !== "admin"){


await supabase.auth.signOut();


alert(
"Unauthorized access"
);


return;


}







localStorage.setItem(

"admin",

JSON.stringify(admin)

);







router.push(

"/admin/dashboard"

);





}

catch(error){


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
max-w-md
w-full
rounded-3xl
bg-white
p-8
shadow-xl
">





<h1 className="
text-3xl
font-bold
">

Admin Login

</h1>






<p className="
mt-2
text-gray-500
">

The Curious Classroom Admin Panel

</p>







<input

className="
mt-6
w-full
rounded-lg
border
p-3
"

placeholder="Admin Email"

value={email}

onChange={
e=>setEmail(e.target.value)
}

/>







<div className="relative mt-4">

<input

className="
w-full
rounded-lg
border
p-3
pr-12
"

type={showPassword ? "text" : "password"}

placeholder="Password"

value={password}

onChange={
e=>setPassword(e.target.value)
}

/>


<button

type="button"

onClick={() => setShowPassword(!showPassword)}

className="
absolute
right-3
top-1/2
-translate-y-1/2
text-gray-500
"

>

{
showPassword
?
<EyeOff size={20}/>
:
<Eye size={20}/>
}

</button>


</div>







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


)


}