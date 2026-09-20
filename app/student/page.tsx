"use client";


import {useEffect} from "react";
import {useRouter} from "next/navigation";



export default function StudentPage(){


const router = useRouter();



useEffect(()=>{


const student = localStorage.getItem("student");


if(student){

router.push("/student/dashboard");

}

else{

router.push("/student/login");

}



},[]);





return(

<main className="
min-h-screen
flex
items-center
justify-center
bg-blue-50
">


<h1 className="
text-3xl
font-bold
text-blue-600
">

Loading Student Portal...

</h1>


</main>


);


}