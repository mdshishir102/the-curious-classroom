import { supabase } from "@/lib/supabase";


export async function syncOfflineAttendance(){

const saved =
localStorage.getItem("pendingAttendance");


if(!saved){
return;
}


const data = JSON.parse(saved);



for(const student of data.students){


const {error}=await supabase

.from("attendance")

.insert({

student_id:student.student_id,

schedule_id:data.scheduleId,

attendance_date:data.date,

attendance_time:new Date()
.toLocaleTimeString(
"en-US",
{
timeZone:"Asia/Dhaka",
hour:"numeric",
minute:"2-digit",
hour12:true
}
),

status:student.status,

class:student.class,

batch:student.batch

});


if(error){

console.log(
"Sync failed",
error
);

return;

}


}



localStorage.removeItem(
"pendingAttendance"
);


console.log(
"Attendance synced successfully"
);


}