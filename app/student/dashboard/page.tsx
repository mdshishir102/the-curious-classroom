"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
import jsPDF from "jspdf";
import QRCode from "qrcode";
export default function StudentDashboard(){
const router = useRouter();
const [student,setStudent] = useState<any>(null);
const [notices,setNotices] = useState<any[]>([]);
const [exams,setExams] = useState<any[]>([]);
const [fees,setFees] = useState<any[]>([]);







const currentMonthPayment = fees.find((payment:any)=>{

const now = new Date();

const currentMonth = now.toLocaleString(
"en-US",
{
month:"long"
}
);

const currentYear = now.getFullYear();


return (
payment.month === currentMonth &&
payment.year === currentYear
);

});








const [feeDue,setFeeDue] = useState<any>(null);
const [schedules,setSchedules] = useState<any[]>([]);
const [attendanceData,setAttendanceData] = useState<any[]>([]);
const [results,setResults] = useState<any[]>([]);
const [attendance,setAttendance] = useState<any[]>([]);
const [todayAttendance,setTodayAttendance] = useState<any[]>([]);


const [attendanceMonth,setAttendanceMonth] = useState(
new Date().toLocaleString(
"en-US",
{
month:"long",
year:"numeric"
}
)
);



const totalClass = attendance.length;

const presentCount = attendance.filter(
(item:any)=>item.status==="present"
).length;

const absentCount = attendance.filter(
(item:any)=>item.status==="absent"
).length;

const lateCount = attendance.filter(
(item:any)=>item.status==="late"
).length;




const totalAttendance = attendance.length;
const presentAttendance = attendance.filter(
(item:any)=>item.status==="present"
).length;
const absentAttendance = attendance.filter(
(item:any)=>item.status==="absent"
).length;
const lateAttendance = attendance.filter(
(item:any)=>item.status==="late"
).length;
const attendancePercentage = totalAttendance > 0
?
Math.round((presentAttendance / totalAttendance) * 100)
:
0;
const [attendanceReport,setAttendanceReport] = useState<any[]>([]);
const [discountFee,setDiscountFee] = useState<any>(null);
const [loading,setLoading] = useState(true);
useEffect(()=>{
async function checkStudent(){
const data = localStorage.getItem("student");
if(!data){
router.replace("/student/login");
return;
}
const studentData = JSON.parse(data);
const {data:currentStudent}=await supabase
.from("students")
.select("login_enabled")
.eq(
"id",
studentData.id
)
.single();
if(
!currentStudent ||
!currentStudent.login_enabled
){
localStorage.removeItem("student");
router.replace("/student/login");
return;
}
setStudent(studentData);
loadDashboard(studentData);
checkPayment(studentData);
}
// run check
checkStudent();
// prevent browser cache after logout
checkStudent();
const preventBack = () => {
window.history.pushState(
null,
"",
window.location.href
);
};
window.history.pushState(
null,
"",
window.location.href
);
window.addEventListener(
"popstate",
preventBack
);
return()=>{
window.removeEventListener(
"popstate",
preventBack
);
};
},[]);
async function checkPayment(student:any){
const currentDate = new Date();
const month = currentDate.toLocaleString(
"en-US",
{
month:"long"
}
);
const year = currentDate.getFullYear();
const {data,error}=await supabase
.from("payments")
.select("*")
.eq(
"student_id",
student.id
)
.eq(
"month",
month
)
.eq(
"year",
year
)
.maybeSingle();
console.log("PAYMENT CHECK:",data);
if(!data){
setFeeDue({
month,
year
});
return;
}
if(data.status !== "paid"){
setFeeDue(data);
}
else{
setFeeDue(null);
}
}
async function loadDashboard(student:any){
setLoading(true);
const today = new Date();
const todayDate =
today.toLocaleDateString(
"en-CA",
{
timeZone:"Asia/Dhaka"
}
);
const currentTime =
today.toLocaleTimeString(
"en-GB",
{
timeZone:"Asia/Dhaka",
hour12:false
}
);
const {data:scheduleData,error:scheduleError}=await supabase
.from("class_schedules")
.select("*")
.ilike(
"class_name",
`%${student.class.trim()}%`
)
.order(
"schedule_date",
{
ascending:true
}
);
console.log("SCHEDULE ERROR:",scheduleError);
console.log("RAW SCHEDULE:",scheduleData);
console.log("STUDENT CLASS:", student.class);
console.log("TODAY DATE:", todayDate);
console.log("SCHEDULE DATA:", scheduleData);
console.log("CURRENT TIME:", currentTime);
console.log("FINAL SCHEDULE:", scheduleData);
const upcomingSchedules =
(scheduleData || [])
.filter((item:any)=>{
if(item.schedule_date > todayDate){
    return true;
}
if(item.schedule_date === todayDate){
    const end =
    item.end_time.substring(0,5);
    const now =
    currentTime.substring(0,5);
    return end > now;
}
return false;
});
setSchedules(
upcomingSchedules
);
const {data:noticeData}=await supabase
.from("notices")
.select("*")
.order(
"created_at",
{
ascending:false
}
);
setNotices(noticeData || []);
const {data:examData}=await supabase
.from("exams")
.select("*")
.order(
"exam_date",
{
ascending:true
}
);
setExams(examData || []);
const {data:paymentData}=await supabase
.from("payments")
.select("*")
.eq(
"student_id",
student.id
)
.order(
"payment_date",
{
ascending:false
}
);
setFees(paymentData || []);
const {data:discountData}=await supabase
.from("student_fee_settings")
.select("*")
.eq(
"student_id",
student.id
)
.eq(
"academic_year",
new Date().getFullYear()
)
.maybeSingle();
setDiscountFee(discountData);
const {data:resultData}=await supabase
.from("results")
.select("*")
.eq(
"student_id",
student.id
);
setResults(resultData || []);
console.log(
"LOGIN STUDENT ID:",
student.student_id
);
console.log(
"LOGIN STUDENT OBJECT:",
student
);
const currentDate = new Date();
const firstDay = new Date(
currentDate.getFullYear(),
currentDate.getMonth(),
1
)
.toISOString()
.split("T")[0];
const lastDay = new Date(
currentDate.getFullYear(),
currentDate.getMonth()+1,
0
)
.toISOString()
.split("T")[0];



const {data:attendanceResult,error:attendanceError}=await supabase
.from("attendance")
.select("*")
.eq(
"student_id",
student.student_id
)
.gte(
"attendance_date",
firstDay
)
.lte(
"attendance_date",
lastDay
)
.order(
"attendance_date",
{
ascending:false
}
);

















console.log(
"NEW ATTENDANCE:",
attendanceResult
);


console.log(
"STUDENT ID FOR ATTENDANCE:",
student.student_id
);


console.log(
"ATTENDANCE ERROR:",
attendanceError
);





setAttendanceData(
attendanceResult || []
);


const todayData = (attendanceResult || []).filter((item:any)=>
  item.attendance_date === today
);

setTodayAttendance(todayData);





const filteredAttendance = (attendanceResult || []).filter(
(item:any)=>{

const itemDate = new Date(
item.attendance_date
);


const monthName = itemDate.toLocaleString(
"en-US",
{
month:"long",
year:"numeric"
}
);


return monthName === attendanceMonth;

}
);






setAttendance(
filteredAttendance
);

const todayAttendanceData = (attendanceResult || []).filter(
(item:any)=>
item.attendance_date === todayDate
);


setTodayAttendance(todayAttendanceData);




const totalClass = attendanceResult?.length || 0;
const presentClass = attendanceResult?.filter(
(item:any)=>item.status==="present"
).length || 0;
const absentClass = attendanceResult?.filter(
(item:any)=>item.status==="absent"
).length || 0;
const lateClass = attendanceResult?.filter(
(item:any)=>item.status==="late"
).length || 0;
const attendancePercentage = totalClass
?
Math.round(
((presentClass + lateClass) / totalClass) * 100
)
:
0;
if(attendanceError){
console.log(
"ATTENDANCE ERROR:",
attendanceError
);
}
console.log("ATTENDANCE:",attendanceData);
console.log(
"CHECK ATTENDANCE DATA:",
attendanceData
);
console.log("SCHEDULE DATA", scheduleData);
console.log(
"ATTENDANCE FULL",
JSON.stringify(attendanceData,null,2)
);
console.log(
"SCHEDULE FULL",
JSON.stringify(scheduleData,null,2)
);
const report = (scheduleData || []).map((schedule:any)=>{
const records = (attendanceData || []).filter(
(item:any)=>
String(item.schedule_id) === String(schedule.id)
);
return {
date:schedule.schedule_date,
subject:schedule.subject,
topic:schedule.topic,
start_time:schedule.start_time,
end_time:schedule.end_time,
status:
records.length > 0
?
"taken"
:
"not_taken"
};
});
setAttendanceReport(report);
setLoading(false);
}



async function downloadReceipt(payment:any){
const doc = new jsPDF();
const verifyUrl =
`https://thecuriousclassroom.vercel.app/student/verify?receipt=${payment.receipt_id}`;
const qrImage = await QRCode.toDataURL(
verifyUrl
);
// HEADER
doc.setFontSize(22);
doc.text(
"The Curious Classroom",
20,
25
);
doc.setFontSize(15);
doc.text(
"OFFICIAL DIGITAL PAYMENT RECEIPT",
20,
40
);
// RECEIPT INFO
doc.setFontSize(12);
doc.text(
`Receipt ID: ${payment.receipt_id || "N/A"}`,
20,
60
);
doc.text(
`Generated: ${new Date().toLocaleString()}`,
20,
70
);




// STUDENT INFO
doc.text(
`Student Name: ${payment.student_name}`,
20,
90
);
doc.text(
`Student ID: ${payment.student_id}`,
20,
100
);
doc.text(
`Class: ${payment.class}`,
20,
110
);
doc.text(
`Batch: ${payment.batch}`,
20,
120
);
// PAYMENT INFO
doc.text(
`Month: ${payment.month} ${payment.year}`,
20,
140
);
doc.text(
`Amount: Tk ${payment.amount}`,
20,
150
);
doc.text(
`Payment Method: ${payment.payment_method}`,
20,
160
);
doc.text(
`Transaction ID: ${payment.transaction_id || "N/A"}`,
20,
170
);
doc.text(
`Payment Status: ${payment.status}`,
20,
180
);
// QR
doc.text(
"Scan To Verify Receipt",
20,
205
);
doc.addImage(
qrImage,
"PNG",
20,
215,
45,
45
);
doc.setFontSize(9);
doc.text(
verifyUrl,
20,
270
);
doc.save(
`TCCS_Receipt_${payment.receipt_id}.pdf`
);
}




function logout(){
localStorage.removeItem("student");
window.history.replaceState(
null,
"",
"/student/login"
);
router.replace("/student/login");
}
if(loading){
return (
<div className="
min-h-screen
flex
items-center
justify-center
bg-blue-50
">
Loading Dashboard...
</div>
)
}
return (
<main className="
min-h-screen
bg-gradient-to-br
from-blue-50
via-white
to-indigo-50
p-5
">



<div className="
max-w-6xl
mx-auto
">

</div>
    
{/* HEADER */}
<div className="
bg-white
rounded-3xl
shadow-lg
p-5
flex
items-center
justify-between
">
<div className="
flex
items-center
gap-4
">
<img
src="/logo.png"
className="
h-14
w-auto
"
/>
<div>
<h1 className="
text-xl
font-bold
text-blue-700
">
The Curious Classroom
</h1>
<p className="
text-gray-500
text-sm
">
Student Portal
</p>
</div>
</div>
<button
onClick={logout}
className="
rounded-xl
bg-red-500
px-5
py-2
text-white
font-bold
"
>
Logout
</button>
</div>
{/* PROFILE CARD */}
<div className="
mt-8
bg-white
rounded-3xl
shadow-xl
p-8
">
<div className="
flex
flex-col
md:flex-row
items-center
gap-8
">
<img
src={
student?.student_photo ||
"/logo.png"
}
className="
h-32
w-32
rounded-full
object-cover
border-4
border-blue-100
shadow-lg
"
/>
<div className="
text-center
md:text-left
">
<h2 className="
text-3xl
font-bold
text-gray-800
">
{student?.student_name}
</h2>
<p className="
mt-2
text-gray-500
">
The Curious Classroom Student Portal
</p>
<div className="
mt-5
grid
grid-cols-2
md:grid-cols-4
gap-4
">
<div className="
bg-blue-50
rounded-2xl
p-4
">
<p className="
text-sm
text-gray-500
">
Student ID
</p>
<p className="
font-bold
text-blue-700
">
{student?.student_id}
</p>
</div>
<div className="
bg-green-50
rounded-2xl
p-4
">
<p className="
text-sm
text-gray-500
">
Class
</p>
<p className="
font-bold
text-green-700
">
{student?.class}
</p>
</div>
<div className="
bg-purple-50
rounded-2xl
p-4
">
<p className="
text-sm
text-gray-500
">
Batch
</p>
<p className="
font-bold
text-purple-700
">
{student?.batch}
</p>
</div>
<div className="
bg-orange-50
rounded-2xl
p-4
">
<p className="
text-sm
text-gray-500
">
Phone
</p>
<p className="
font-bold
text-orange-700
">
{student?.whatsapp}
</p>
</div>
</div>
</div>
</div>
</div>
{/* PAYMENT ALERT */}
{
feeDue && (
<div className="
mt-6
relative overflow-hidden
rounded-3xl
bg-red-50
border
border-red-200
shadow-lg
p-6
">
<h2 className="
text-xl
font-bold
text-red-600
">
🔔 গুরুত্বপূর্ণ নোটিশ: মাসিক ফি বকেয়া
</h2>
<p className="
mt-3
text-gray-700
">
{feeDue.month} মাসের মাসিক ফি এখনো পরিশোধ করা হয়নি।
</p>
<p className="
mt-1
text-sm
text-gray-500
">
অনুগ্রহ করে ১৫ তারিখের মধ্যে মাসিক ফি পরিশোধ করুন।
</p>
</div>
)
}
{/* COACHING GUIDELINES */}
<div className="
mt-10
relative
overflow-hidden
rounded-3xl
bg-gradient-to-br
from-blue-50
via-white
to-indigo-50
border
border-blue-100
shadow-lg
p-7
">
{/* Decorative */}
<div className="
absolute
top-0
right-0
h-32
w-32
bg-blue-100
rounded-full
blur-3xl
opacity-40
">
</div>
<div className="
relative
">
<div className="
flex
items-center
gap-4
mb-6
">
<div className="
h-12
w-12
rounded-2xl
bg-blue-600
flex
items-center
justify-center
text-2xl
shadow-md
">
📌
</div>
<div>
<h2 className="
text-2xl
font-bold
text-gray-800
">
গুরুত্বপূর্ণ নিয়মাবলি
</h2>
<p className="
text-sm
text-gray-500
mt-1
">
The Curious Classroom
</p>
</div>
</div>
<div className="
space-y-4
">
<div className="
bg-white
rounded-2xl
p-5
shadow-sm
border
border-gray-100
">
<h3 className="
font-bold
text-blue-700
mb-2
">
১. নিয়মিত উপস্থিতির নিয়ম
</h3>
<p className="
text-gray-600
leading-relaxed
">
প্রত্যেক শিক্ষার্থীর নিয়মিত ক্লাসে উপস্থিত থাকা বাধ্যতামূলক।
টানা ৩ (তিন) দিনের বেশি অনুপস্থিত থাকলে কর্তৃপক্ষ প্রয়োজন অনুযায়ী ব্যবস্থা গ্রহণ করতে পারবে।
</p>
</div>
<div className="
bg-white
rounded-2xl
p-5
shadow-sm
border
border-gray-100
">
<h3 className="
font-bold
text-blue-700
mb-2
">
২. অনুপস্থিতির ক্ষেত্রে করণীয়
</h3>
<p className="
text-gray-600
leading-relaxed
">
কোনো অনিবার্য কারণে ক্লাসে উপস্থিত হতে না পারলে অবশ্যই পূর্বেই শিক্ষক বা কর্তৃপক্ষকে অবহিত করতে হবে।
</p>
</div>
<div className="
bg-white
rounded-2xl
p-5
shadow-sm
border
border-gray-100
">
<h3 className="
font-bold
text-blue-700
mb-2
">
৩. পরীক্ষায় অনুপস্থিতির নিয়ম
</h3>
<p className="
text-gray-600
leading-relaxed
">
কোনো পরীক্ষায় অনুপস্থিত থাকলে নির্ধারিত ১০০ টাকা জরিমানা প্রদান করতে হবে।
জরিমানা পরিশোধ না করা পর্যন্ত পরবর্তী ক্লাস বা পরীক্ষায় অংশগ্রহণের অনুমতি দেওয়া হবে না।
</p>
</div>
<div className="
bg-white
rounded-2xl
p-5
shadow-sm
border
border-gray-100
">
<h3 className="
font-bold
text-blue-700
mb-2
">
৪. দীর্ঘ অনুপস্থিতির নিয়ম
</h3>
<p className="
text-gray-600
leading-relaxed
">
কোনো শিক্ষার্থী টানা ৬ (ছয়) দিন অনুপস্থিত থাকলে তার ভর্তি বাতিল হতে পারে।
পুনরায় ক্লাসে অংশগ্রহণের জন্য নতুন করে ভর্তি প্রক্রিয়া সম্পন্ন করতে হবে।
</p>
</div>
<div className="
bg-white
rounded-2xl
p-5
shadow-sm
border
border-gray-100
">
<h3 className="
font-bold
text-blue-700
mb-2
">
৫. মাসিক ফি পরিশোধের নিয়ম
</h3>
<p className="
text-gray-600
leading-relaxed
">
প্রতি মাসের ১৫ তারিখের মধ্যে নির্ধারিত মাসিক ফি পরিশোধ করতে হবে।
কোনো বিশেষ সমস্যা থাকলে নির্ধারিত সময়ের পূর্বেই কর্তৃপক্ষকে জানাতে হবে।
</p>
</div>
<div className="
bg-white
rounded-2xl
p-5
shadow-sm
border
border-gray-100
">
<h3 className="
font-bold
text-blue-700
mb-2
">
৬. শৃঙ্খলা ও আচরণবিধি
</h3>
<p className="
text-gray-600
leading-relaxed
">
The Curious Classroom-এর শিক্ষার পরিবেশ, নিয়ম-কানুন ও শৃঙ্খলা বজায় রাখা প্রত্যেক শিক্ষার্থীর দায়িত্ব।
সকল শিক্ষার্থীকে প্রতিষ্ঠানের নিয়মাবলি যথাযথভাবে মেনে চলতে হবে।
</p>
</div>
</div>
</div>
</div>












{/* UPCOMING CLASS */}
<div className="
mt-10
bg-white
rounded-3xl
shadow-lg
p-6
">
<h2 className="
text-2xl
font-bold
text-blue-700
mb-5
">
📚 Upcoming Class Schedule
</h2>
{
schedules.length===0
?
<p className="
text-gray-500
">
No upcoming class available
</p>
:
<div className="
space-y-4
">
{
schedules.map((item:any)=>(
<div
key={item.id}
className="
bg-blue-50
rounded-2xl
p-5
"
>
<h3 className="
text-xl
font-bold
text-gray-800
">
{item.class_name}
</h3>
<p className="
text-blue-600
font-semibold
">
{item.subject}
</p>
<p>
{new Date(item.schedule_date).toLocaleDateString(
"en-GB",
{
day:"2-digit",
month:"long",
year:"numeric"
}
)}</p>
<p>
{new Date(`2000-01-01T${item.start_time}`)
.toLocaleTimeString(
"en-US",
{
hour:"numeric",
minute:"2-digit",
hour12:true
}
)}
-
{new Date(`2000-01-01T${item.end_time}`)
.toLocaleTimeString(
"en-US",
{
hour:"numeric",
minute:"2-digit",
hour12:true
}
)}
</p>
<p>
📖 {item.topic}
</p>
</div>
))
}
</div>
}
</div>




{/* TODAY ATTENDANCE UPDATE */}

<div className="mt-10 bg-white rounded-3xl shadow-lg p-6">

<h2 className="text-2xl font-bold text-blue-700 mb-5">
📅 Today's Attendance Update
</h2>


{
todayAttendance.length === 0 ?

<p className="text-gray-500">
No attendance update today
</p>

:

todayAttendance.map((item:any)=>(

<div
key={item.id}
className="bg-blue-50 rounded-2xl p-5 flex justify-between items-center"
>

<div>

<p className="font-bold">
{
new Date(item.attendance_date)
.toLocaleDateString(
"en-GB"
)
}
</p>

<p className="text-gray-500">
{item.class_schedules?.subject}
</p>

</div>


<div>

{
item.status==="present"?

<span className="bg-green-600 text-white px-4 py-2 rounded-full">
✅ Present
</span>

:

item.status==="late"?

<span className="bg-yellow-500 text-white px-4 py-2 rounded-full">
⏰ Late
</span>

:

<span className="bg-red-500 text-white px-4 py-2 rounded-full">
❌ Absent
</span>

}

</div>


</div>

))

}


</div>








{/* ATTENDANCE RECORD */}


<div className="
mt-10
bg-white
rounded-3xl
shadow-lg
p-6
">
<h2 className="
text-2xl
font-bold
text-green-700
mb-5
">
📊 Attendance Record
</h2>


<div className="
grid
grid-cols-2
md:grid-cols-4
gap-4
mb-6
">


<div className="
bg-blue-50
rounded-xl
p-4
">

<p className="text-gray-500">
Total Class
</p>

<h3 className="
text-2xl
font-bold
text-blue-700
">
{totalClass}
</h3>

</div>



<div className="
bg-green-50
rounded-xl
p-4
">

<p className="text-gray-500">
Present
</p>

<h3 className="
text-2xl
font-bold
text-green-700
">
{presentCount}
</h3>

</div>



<div className="
bg-yellow-50
rounded-xl
p-4
">

<p className="text-gray-500">
Late
</p>

<h3 className="
text-2xl
font-bold
text-yellow-700
">
{lateCount}
</h3>

</div>



<div className="
bg-red-50
rounded-xl
p-4
">

<p className="text-gray-500">
Absent
</p>

<h3 className="
text-2xl
font-bold
text-red-700
">
{absentCount}
</h3>

</div>


</div>





<div className="
mb-5
">

<select

value={attendanceMonth}

onChange={(e)=>
setAttendanceMonth(e.target.value)
}

className="
border
rounded-xl
px-4
py-2
bg-white
font-semibold
"

>



{
[
"October 2026",
"November 2026",
"December 2026"
].map((month)=>(
<option
key={month}
value={month}
>
{month}
</option>
))
}






</select>

</div>










{
attendance.length === 0 ?
<p className="text-gray-500">
No attendance record available
</p>
:
<div className="space-y-4">
{




attendance
.filter((item:any)=>{

const selectedDate = new Date(
attendanceMonth
);

const itemDate = new Date(
item.attendance_date
);


return (
itemDate.getMonth() === selectedDate.getMonth()
&&
itemDate.getFullYear() === selectedDate.getFullYear()
);

})





.map((item:any)=>(
<div
key={item.id}
className="
bg-green-50
rounded-2xl
p-5
flex
justify-between
items-center
"
>
<div>
<p className="
font-bold
text-gray-800
">
{
new Date(item.attendance_date)
.toLocaleDateString(
"en-GB",
{
day:"2-digit",
month:"long",
year:"numeric"
}
)
}
</p>
<p className="
text-gray-500
mt-1
">
{item.class_schedules?.subject}
</p>
<p className="
text-gray-500
mt-1
">



    
Subject: {item.class_schedules?.subject}




</p>
</div>
<div>
{
item.status==="present"
?
<span className="
bg-green-600
text-white
px-4
py-2
rounded-full
font-bold
">
✅ Present
</span>
:
item.status==="late"
?
<span className="
bg-yellow-500
text-white
px-4
py-2
rounded-full
font-bold
">
⏰ Late
</span>
:
<span className="
bg-red-500
text-white
px-4
py-2
rounded-full
font-bold
">
❌ Absent
</span>
}
</div>
</div>
))
}
</div>
}
</div>







{/* QUICK ACCESS */}
<h2 className="
mt-10
mb-5
text-2xl
font-bold
text-gray-800
">
Quick Access
</h2>




<div className="
grid
grid-cols-2
md:grid-cols-4
gap-5
">
<div
onClick={()=>router.push("/student/notes")}
className="
bg-white
rounded-3xl
shadow
p-6
text-center
cursor-pointer
hover:shadow-xl
transition
hover:scale-105
"
>
<div className="
text-4xl
">
📚
</div>
<h3 className="
mt-3
font-bold
">
Class Notes
</h3>
<p className="
text-sm
text-gray-500
mt-2
">
Biology Notes & Books
</p>
</div>







<div
onClick={()=>router.push("/student/exams")}
className="
bg-white
rounded-3xl
shadow
p-6
text-center
cursor-pointer
hover:shadow-xl
transition
hover:scale-105
"
>






<div className="
text-4xl
">
📝
</div>
<h3 className="
mt-3
font-bold
">
Online Exams
</h3>
<p className="
text-sm
text-gray-500
mt-2
">
Coming Soon
</p>
</div>





<div
onClick={()=>router.push("/student/result")}

className="
bg-white
rounded-3xl
shadow
p-6
text-center
cursor-pointer
hover:shadow-xl
transition
hover:scale-105
"
>







<div className="
text-4xl
">
📈
</div>
<h3 className="
mt-3
font-bold
">
Result
</h3>
<p className="
text-sm
text-gray-500
mt-2
">
View progress report 
</p>
</div>






<div
onClick={()=>router.push("/student/payment")}
className="
bg-white
rounded-3xl
shadow
p-6
text-center
hover:shadow-xl
transition
cursor-pointer
hover:scale-105
"
>







<div className="
text-4xl
">
💳
</div>
<h3 className="
mt-3
font-bold
">
Payment
</h3>
<p className="
text-sm
text-gray-500
mt-2
">
View payment history
</p>
</div>
</div>







{/* NOTICE BOARD */}
<div className="
mt-10
bg-white
rounded-3xl
shadow-lg
p-6
">
<h2 className="
text-2xl
font-bold
text-blue-700
mb-5
">
📢 Notice Board
</h2>
{
notices.length===0 ?
<p className="
text-gray-500
">
No notice available
</p>
:
<div className="
space-y-4
">
{
notices.slice(0,3).map(notice=>(
<div
key={notice.id}
className="
rounded-2xl
bg-blue-50
p-5
"
>
<h3 className="
font-bold
text-lg
">
{notice.title}
</h3>
<p className="
mt-2
text-gray-600
">
{notice.description}
</p>
</div>
))
}
</div>
}
</div>
{/* EXAM SECTION */}
<div className="
mt-8
bg-white
rounded-3xl
shadow-lg
p-6
">
<h2 className="
text-2xl
font-bold
text-purple-700
mb-5
">
📅 Upcoming Exam
</h2>
{
exams.length===0 ?
<p className="
text-gray-500
">
No upcoming exam
</p>
:
<div className="
space-y-4
">
{
exams.slice(0,3).map(exam=>(
<div
key={exam.id}
className="
rounded-2xl
bg-purple-50
p-5
"
>
<h3 className="
font-bold
text-lg
">
{exam.subject}
</h3>
<p className="
mt-2
text-gray-600
">
{exam.exam_type}
</p>
<p className="
mt-2
">
📅 {exam.exam_date}
</p>
<p>
⏰ {exam.exam_time}
</p>
</div>
))
}
</div>
}
</div>
{/* SPECIAL DISCOUNT */}
{
discountFee && (
<div className="
mt-8
bg-white
rounded-3xl
shadow-lg
p-6
">
<h2 className="
text-2xl
font-bold
text-orange-700
mb-5
">
🎓 Special Fee Discount
</h2>
<div className="
rounded-2xl
bg-orange-50
p-5
">
<p className="
text-gray-600
">
Regular Monthly Fee
</p>
<p className="
text-xl
font-bold
text-gray-800
">
৳ {student.class === "Class 9" ? "1500" : "N/A"}
</p>
<p className="
mt-4
text-gray-600
">
Your Discounted Fee
</p>
<p className="
text-3xl
font-bold
text-green-700
">
৳ {discountFee.monthly_fee}
</p>
<p className="
mt-4
text-gray-600
">
Reason
</p>
<p className="
font-bold
text-orange-700
">
{discountFee.reason}
</p>
</div>
</div>
)
}







{/* MONTHLY PAYMENT OVERVIEW */}

<div className="
mt-8
bg-white
rounded-3xl
shadow-lg
p-6
">

<h2 className="
text-2xl
font-bold
text-green-700
mb-5
">
💳 Monthly Fee Overview
</h2>


{
currentMonthPayment ? (

<div className="
bg-green-50
border
border-green-200
rounded-2xl
p-6
flex
flex-col
md:flex-row
justify-between
items-start
md:items-center
gap-5
">


<div>

<h3 className="
text-xl
font-bold
text-green-700
">
{currentMonthPayment.month} {currentMonthPayment.year}
</h3>


<div className="
mt-3
space-y-2
text-gray-700
">

<p>
💰 Amount: ৳ {currentMonthPayment.amount}
</p>

<p>
💳 Method: {currentMonthPayment.payment_method}
</p>

<p>
🔖 Transaction: {currentMonthPayment.transaction_id || "N/A"}
</p>


<p>
📅 Date: {
new Date(currentMonthPayment.payment_date)
.toLocaleDateString()
}
</p>


</div>


<div className="
mt-4
inline-flex
bg-green-600
text-white
px-4
py-2
rounded-full
font-bold
">

✓ Paid

</div>


</div>


<button
onClick={() => router.push("/student/payment")}
className="
bg-blue-600
text-white
px-6
py-3
rounded-xl
font-bold
hover:bg-blue-700
"
>
View Payment
</button>






</div>


)

:(


<div className="
bg-red-50
border
border-red-200
rounded-2xl
p-6
text-center
">


<h3 className="
text-xl
font-bold
text-red-600
">

⚠️ Payment Due

</h3>


<p className="
mt-2
text-gray-600
">

Current month fee payment is pending.

</p>


</div>


)

}


</div>





{/* RESULT */}
<div className="
mt-8
bg-white
rounded-3xl
shadow-lg
p-6
">
<h2 className="
text-2xl
font-bold
text-indigo-700
mb-5
">
🏆 Academic Progress
</h2>
<button
onClick={()=>router.push("/student/result")}
className="
mb-5
bg-indigo-600
text-white
px-5
py-2
rounded-xl
font-bold
hover:bg-indigo-700
"
>
View All Results →
</button>
{
results.length===0 ?
<p className="
text-gray-500
">
No result available yet
</p>
:
<div className="
space-y-4
">
{
results.slice(0,3).map(result=>(
<div
key={result.id}
className="
rounded-2xl
bg-indigo-50
p-5
flex
justify-between
"
>
<div>
<h3 className="
font-bold
">
{result.subject}
</h3>
<p className="
text-gray-600
">
{result.exam_type}
</p>
</div>
<div className="
text-right
">
<p className="
text-2xl
font-bold
text-blue-700
">
{result.marks}
</p>
<p className="
font-bold
text-green-700
">
{result.grade}
</p>




</div>
</div>
))
}
</div>
}

</div>
</main>
);
}