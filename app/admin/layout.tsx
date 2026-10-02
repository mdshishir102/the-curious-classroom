"use client";

import { useEffect } from "react";
import { syncOfflineAttendance } from "@/lib/syncAttendance";


export default function AdminLayout({
children
}:{
children: React.ReactNode
}){


useEffect(()=>{

syncOfflineAttendance();

},[]);



return (

<>
{children}
</>

);

}