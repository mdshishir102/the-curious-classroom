"use client";


import { supabase } from "@/lib/supabase";
import { useEffect, useRef, useState } from "react";
import "./admission-dark.css";

export default function AdmissionPage(){

const [students,setStudents] = useState<any[]>([]);

const [activeTab,setActiveTab] = useState("approved");

const [loading,setLoading] = useState(true);

const [selectedStudent,setSelectedStudent] = useState<any>(null);

const statusUpdatingRef = useRef(false);





const [actionDialog, setActionDialog] = useState<{
  type: "recover" | "delete";
  student: any;
} | null>(null);

const [recoverTarget, setRecoverTarget] = useState<
  "pending" | "approved"
>("pending");

const [deleteConfirmText, setDeleteConfirmText] =
  useState("");

const [actionBusy, setActionBusy] = useState(false);

const actionBusyRef = useRef(false);




const [approvedDeleteStudent, setApprovedDeleteStudent] =
  useState<any | null>(null);

const [approvedDeleteID, setApprovedDeleteID] =
  useState("");

const [approvedDeleteKeyword, setApprovedDeleteKeyword] =
  useState("");

const [
  approvedDeleteAcknowledged,
  setApprovedDeleteAcknowledged,
] = useState(false);


const [actionError, setActionError] = useState("");

const [actionNotice, setActionNotice] = useState<{
  type: "success" | "warning";
  message: string;
} | null>(null);



// ======================
// LOAD STUDENTS
// ======================

async function loadStudents(){

setLoading(true);


const {data,error}=await supabase
.from("students")
.select("*")
.order("created_at",{ascending:false});


if(error){

alert(error.message);

setLoading(false);

return;

}


setStudents(data || []);

setLoading(false);

}




useEffect(()=>{

loadStudents();

},[]);





// ======================
// MARK PAYMENT PAID
// ======================

async function markAsPaid(id:number){


const {error}=await supabase
.from("students")
.update({

payment_status:"paid"

})
.eq("id",id);



if(error){

alert(error.message);

return;

}



alert("Payment Verified");

loadStudents();



}






// ======================
// SEND WHATSAPP
// ======================


function sendWhatsApp(student:any){


const message =

`Assalamu Alaikum ${student.student_name},

আপনার ভর্তি আবেদন অনুমোদিত হয়েছে।

Student ID:
${student.student_id}

Password:
${student.password}

Login Link:
https://thecuriousclassroom.vercel.app/student/login

ধন্যবাদ।

The Curious Classroom`;



const url =

`https://wa.me/88${student.whatsapp}?text=${encodeURIComponent(message)}`;



window.open(url,"_blank");



}





// ======================
// APPROVE / REJECT
// ======================


async function updateStatus(id: number, status: string) {
  if (statusUpdatingRef.current) return;

  if (status !== "approved" && status !== "rejected") return;

  statusUpdatingRef.current = true;

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      alert("আবার Admin Login করুন।");
      return;
    }

    if (status === "rejected") {
      const { data, error } = await supabase
        .from("students")
        .update({
          status: "rejected",
          login_enabled: false,
        })
        .eq("id", id)
        .eq("status", "pending")
        .select("id");

      if (error) {
        alert(error.message);
        return;
      }

      if (!data?.length) {
        alert(
          "Reject করা হয়নি। শিক্ষার্থীর status বা আপনার access পরিবর্তিত হতে পারে।"
        );
        await loadStudents();
        return;
      }

      setSelectedStudent(null);
      alert("ভর্তির আবেদন বাতিল করা হয়েছে।");
      await loadStudents();
      return;
    }

    // The server verifies admin access and payment,
    // creates the Auth account, then enables login.
    const response = await fetch("/api/admin/students/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
      body: JSON.stringify({ id }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || result?.success !== true) {
      alert(
        result?.error ||
          `Approve করা যায়নি। Server response: ${response.status}`
      );

      await loadStudents();
      return;
    }

    setSelectedStudent(null);

    if (result.alreadyApproved) {
      alert(
        `এই শিক্ষার্থী আগেই approved হয়েছে।\n\nStudent ID: ${result.studentID}`
      );
    } else {
      alert(
        `ভর্তি অনুমোদিত হয়েছে।\n\nStudent ID: ${result.studentID}\nPassword: ${result.password}`
      );
    }

    await loadStudents();
  } catch {
    alert(
      "Server-এর সঙ্গে যোগাযোগ সম্পূর্ণ হয়নি। তালিকা refresh করে status দেখুন। Pending থাকলে আবার চেষ্টা করুন।"
    );
  } finally {
    statusUpdatingRef.current = false;
  }
}






  // =====================================
  // REJECTED ADMISSION ACTIONS
  // =====================================

  function openRejectedAction(
    type: "recover" | "delete",
    student: any
  ) {
    if (
      actionBusyRef.current ||
      statusUpdatingRef.current
    ) {
      return;
    }

    setSelectedStudent(null);
    setActionDialog({ type, student });
    setRecoverTarget("pending");
    setDeleteConfirmText("");
    setActionError("");
  }

  function closeRejectedAction() {
    if (actionBusyRef.current) return;

    setActionDialog(null);
    setActionError("");
  }

  // Calls the secured backend API.
  async function callAdminStudentAPI(
    endpoint: string,
    payload: Record<string, unknown>
  ) {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error(
        "Admin session expired. Please login again."
      );
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          `Bearer ${session.access_token}`,
      },
      cache: "no-store",
      body: JSON.stringify(payload),
    });

    const result = await response
      .json()
      .catch(() => null);

    if (!response.ok || result?.success !== true) {
      throw new Error(
        result?.error ||
        `Request failed (${response.status})`
      );
    }

    return result;
  }

  // =====================================
  // CONFIRM RECOVERY
  // =====================================

  async function confirmRecovery() {
    const dialog = actionDialog;

    if (
      !dialog ||
      dialog.type !== "recover" ||
      actionBusyRef.current ||
      statusUpdatingRef.current
    ) {
      return;
    }

    if (
      recoverTarget === "approved" &&
      dialog.student.payment_status !== "paid"
    ) {
      setActionError(
        "Payment verify না করে Approved করা যাবে না।"
      );
      return;
    }

    actionBusyRef.current = true;
    setActionBusy(true);
    setActionError("");
    setActionNotice(null);

    let restoredToPending = false;

    try {
      // First recover rejected admission.
      await callAdminStudentAPI(
        "/api/admin/students/recover",
        {
          id: dialog.student.id,
          target: recoverTarget,
        }
      );

      restoredToPending = true;

      if (recoverTarget === "approved") {
        // Reuse existing secure Approval API.
        const result = await callAdminStudentAPI(
          "/api/admin/students/approve",
          {
            id: dialog.student.id,
          }
        );

        setActiveTab("approved");

        setActionNotice({
          type: "success",
          message:
            `${dialog.student.student_name} has been approved. ` +
            `Student ID: ${result.studentID}`,
        });

        // Same credential display as existing flow.
        if (
          !result.alreadyApproved &&
          result.password
        ) {
          alert(
            `Admission Approved!\n\n` +
            `Student ID: ${result.studentID}\n` +
            `Password: ${result.password}`
          );
        }
      } else {
        setActiveTab("pending");

        setActionNotice({
          type: "success",
          message:
            `${dialog.student.student_name} ` +
            "has been restored to Pending.",
        });
      }

      setActionDialog(null);
      await loadStudents();

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      if (restoredToPending) {
        // Recovery succeeded but approval failed.
        setActiveTab("pending");

        setActionNotice({
          type: "warning",
          message:
            "Admission Pending-এ ফিরেছে, " +
            "কিন্তু Approve সম্পূর্ণ হয়নি। " +
            message +
            " Pending tab থেকে আবার Approve করুন।",
        });

        setActionDialog(null);
        await loadStudents();
      } else {
        setActionError(message);
      }

    } finally {
      actionBusyRef.current = false;
      setActionBusy(false);
    }
  }

  // =====================================
  // CONFIRM PERMANENT DELETE
  // =====================================

  async function confirmDelete() {
    const dialog = actionDialog;

    if (
      !dialog ||
      dialog.type !== "delete" ||
      actionBusyRef.current ||
      statusUpdatingRef.current ||
      deleteConfirmText !== "DELETE"
    ) {
      return;
    }

    actionBusyRef.current = true;
    setActionBusy(true);
    setActionError("");
    setActionNotice(null);

    try {
      const result = await callAdminStudentAPI(
        "/api/admin/students/delete",
        {
          id: dialog.student.id,
          expectedName:
            dialog.student.student_name,
          confirmation: "DELETE",
        }
      );

      setActionNotice({
        type: result.cleanupRequired
          ? "warning"
          : "success",
        message:
          result.message ||
          "Admission record deleted.",
      });

      setActionDialog(null);
      setActiveTab("rejected");

      await loadStudents();

    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Delete failed. Refresh and check."
      );

    } finally {
      actionBusyRef.current = false;
      setActionBusy(false);
    }
  }




// =======================================
// APPROVED STUDENT DELETE ACTIONS
// =======================================

function openApprovedDelete(student: any) {
  if (
    actionBusyRef.current ||
    statusUpdatingRef.current
  ) {
    return;
  }

  setApprovedDeleteStudent(student);
  setApprovedDeleteID("");
  setApprovedDeleteKeyword("");
  setApprovedDeleteAcknowledged(false);
  setActionError("");
}

function closeApprovedDelete() {
  if (actionBusyRef.current) return;

  setApprovedDeleteStudent(null);
  setActionError("");
}

// =======================================
// CONFIRM APPROVED STUDENT DELETE
// =======================================

async function confirmApprovedDelete() {
  const student = approvedDeleteStudent;

  if (
    !student ||
    actionBusyRef.current ||
    statusUpdatingRef.current
  ) {
    return;
  }

  if (
    approvedDeleteID !== String(student.student_id) ||
    approvedDeleteKeyword !== "DELETE" ||
    !approvedDeleteAcknowledged
  ) {
    setActionError(
      "Student ID, DELETE এবং confirmation যাচাই করুন।"
    );
    return;
  }

  actionBusyRef.current = true;
  setActionBusy(true);
  setActionError("");

  try {
    const result = await callAdminStudentAPI(
      "/api/admin/students/delete-approved",
      {
        id: student.id,
        studentID: student.student_id,
        expectedName: student.student_name,
        confirmation: "DELETE",
        noFinancialTransaction: true,
      }
    );

    setApprovedDeleteStudent(null);
    setActionNotice({
      type: result.cleanupRequired
        ? "warning"
        : "success",
      message:
        result.message ||
        "Approved student deletion completed.",
    });

    setActiveTab("approved");

    await loadStudents();

  } catch (error) {
    setActionError(
      error instanceof Error
        ? error.message
        : "Delete failed. Please refresh and retry."
    );

  } finally {
    actionBusyRef.current = false;
    setActionBusy(false);
  }
}




// ======================
// FILTER STUDENTS
// ======================


const filteredStudents = students.filter(student=>{


if(activeTab==="pending")

return student.status==="pending";



if(activeTab==="approved")

return student.status==="approved";



if(activeTab==="rejected")

return student.status==="rejected";



return true;


});






return (


<main className="
  tcc-admission
  min-h-screen
  p-6
  sm:p-8
">



<div className="
mx-auto
max-w-7xl
">


<h1 className="
mb-8
text-4xl
font-bold
text-gray-800
">

Admission Management

</h1>





{/* Tabs */}


<div className="
mb-8
flex
gap-4
flex-wrap
">


<button

onClick={()=>setActiveTab("pending")}

className="
rounded-xl
bg-yellow-500
px-6
py-3
font-bold
text-white
"

>

Pending

</button>




<button

onClick={()=>setActiveTab("approved")}

className="
rounded-xl
bg-green-600
px-6
py-3
font-bold
text-white
"

>

Approved

</button>





<button

onClick={()=>setActiveTab("rejected")}

className="
rounded-xl
bg-red-600
px-6
py-3
font-bold
text-white
"

>

Rejected

</button>



</div>










{/* ADMISSION ACTION NOTIFICATION */}

{actionNotice && (

  <div className={`
    mb-6
    flex
    items-start
    justify-between
    gap-4
    rounded-2xl
    border
    p-4
    shadow-sm
    ${actionNotice.type === "success"
      ? "border-green-200 bg-green-50"
      : "border-amber-200 bg-amber-50"}
  `}>

    <div className="flex items-start gap-3">

      <span className="text-xl">
        {actionNotice.type === "success"
          ? "✓"
          : "!"}
      </span>

      <div>

        <p className={`
          font-bold
          ${actionNotice.type === "success"
            ? "text-green-800"
            : "text-amber-800"}
        `}>
          {actionNotice.type === "success"
            ? "Action Completed"
            : "Attention Required"}
        </p>

        <p className="mt-1 text-sm text-slate-700">
          {actionNotice.message}
        </p>

      </div>

    </div>

    <button
      type="button"
      onClick={() => setActionNotice(null)}
      aria-label="Dismiss notification"
      className="
        rounded-lg
        px-2
        py-1
        text-slate-500
        hover:bg-white/60
      "
    >
      ✕
    </button>

  </div>

)}





{loading ? (
  <div className="rounded-xl bg-white p-10 text-center">
    Loading...
  </div>
) : filteredStudents.length === 0 ? (
  <div className="rounded-xl bg-white p-10 text-center">
    No Student Found
  </div>
) : (
  <div className="space-y-6">







{

filteredStudents.map(student=>(


<div

key={student.id}

className="
rounded-3xl
bg-white
p-6
shadow-lg
border
transition
hover:shadow-xl
"

>



<div className="
flex
flex-col
md:flex-row
gap-6
">



{/* INFORMATION LEFT */}


<div className="
flex-1
">


<h2 className="
text-2xl
font-bold
text-blue-700
">

{student.student_name}

</h2>



<div className="
mt-4
space-y-2
text-gray-700
">


<p>
🎓 Class:
<b>
{student.class}
</b>
</p>


<p>
📚 Batch:
<b>
{student.batch}
</b>
</p>


<p>
👨‍👩‍👦 Guardian:
{student.guardian_name}
</p>


<p>
📱 WhatsApp:
{student.whatsapp}
</p>


<p>
🏫 School:
{student.school}
</p>


</div>





<hr className="
my-5
"/>





<h3 className="
text-lg
font-bold
text-blue-700
">

💳 Payment Information

</h3>



<div className="
mt-3
space-y-2
">


<p>

Method:

<b>

{

student.payment_method==="bkash"

?

" bKash"

:

" Offline"

}

</b>

</p>





<p>

Status:


{

student.payment_status==="paid"


?


<span className="
ml-2
rounded-full
bg-green-100
px-3
py-1
text-green-700
font-bold
">

PAID

</span>


:


<span className="
ml-2
rounded-full
bg-yellow-100
px-3
py-1
text-yellow-700
font-bold
">

PENDING

</span>


}



</p>





{

student.payment_method==="bkash"

&&

<>

<p>

bKash Number:

{student.bkash_number}

</p>



<p>

Transaction ID:

{student.transaction_id}

</p>


</>


}



</div>



</div>





{/* PHOTO RIGHT */}


<div className="
md:w-56
flex
justify-center
">


<img


src={decodeURIComponent(student.student_photo)}
alt={student.student_name}
className="h-52 w-52 rounded-3xl object-cover border-4 border-blue-100 shadow"
onError={(e)=>{
  e.currentTarget.src="/placeholder.png";
}}
/>

</div>



</div>


<button

onClick={()=>setSelectedStudent(student)}

className="
mt-5
rounded-xl
bg-blue-600
px-5
py-3
font-bold
text-white
"

>

👁 View Full Details

</button>


{/* ======================
ACTION BUTTONS
====================== */}

{
activeTab==="pending"
&&


<div className="
mt-6
flex
gap-4
flex-wrap
">


<button

onClick={()=>markAsPaid(student.id)}

disabled={
student.payment_status==="paid"
}

className="
rounded-xl
bg-yellow-500
px-5
py-3
font-bold
text-white
disabled:bg-gray-300
"

>

{

student.payment_status==="paid"

?

"Payment Verified"

:

"Mark as Paid"

}


</button>





<button

onClick={()=>updateStatus(
student.id,
"approved"
)}

disabled={
student.payment_status!=="paid"
}

className="
rounded-xl
bg-green-600
px-5
py-3
font-bold
text-white
disabled:bg-gray-300
"

>

Approve

</button>






<button

onClick={()=>updateStatus(
student.id,
"rejected"
)}

className="
rounded-xl
bg-red-600
px-5
py-3
font-bold
text-white
"

>

Reject

</button>



</div>


}







{

activeTab==="approved"

&&


<div className="
mt-5
rounded-2xl
bg-green-50
p-5
border
border-green-200
">


<h3 className="
font-bold
text-green-700
text-lg
">

✅ Student Approved

</h3>



<p className="
mt-3
">

Student ID:

<b>

{student.student_id}

</b>

</p>




<p className="
mt-2
">

Password:

<b>

{student.password}

</b>

</p>



<p className="
mt-2
">

Login Status:

<span className="
ml-2
font-bold
text-green-700
">

Active

</span>


</p>


</div>


}


{/* APPROVED STUDENT DELETE BUTTON */}

{activeTab === "approved" && (

  <div className="
    mt-4
    flex
    justify-end
  ">

    <button
      type="button"
      onClick={() => openApprovedDelete(student)}
      disabled={actionBusy}
      className="
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        border
        border-red-500/30
        bg-red-500/10
        px-5
        py-3
        text-sm
        font-semibold
        text-red-300
        transition-all
        hover:border-red-400
        hover:bg-red-500/20
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      <span>✕</span>
      Delete Student
    </button>

  </div>

)}




{activeTab === "rejected" && (

  <div className="
    mt-5
    rounded-2xl
    border
    border-red-100
    bg-red-50
    p-5
  ">

    <div className="
      flex
      items-center
      gap-2
      font-bold
      text-red-700
    ">
      <span>✕</span>
      Admission Rejected
    </div>

    <div className="
      mt-4
      flex
      flex-col
      gap-3
      border-t
      border-red-200
      pt-4
      sm:flex-row
    ">

      {/* RECOVER BUTTON */}

      <button
        type="button"
        onClick={() =>
          openRejectedAction("recover", student)
        }
        disabled={actionBusy}
        className="
          flex
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-emerald-600
          px-6
          py-3
          font-semibold
          text-white
          shadow-sm
          transition-all
          hover:bg-emerald-700
          hover:shadow-md
          disabled:opacity-50
        "
      >
        <span>↻</span>
        Recover Admission
      </button>

      {/* DELETE BUTTON */}

      <button
        type="button"
        onClick={() =>
          openRejectedAction("delete", student)
        }
        disabled={actionBusy}
        className="
          flex
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-red-200
          bg-white
          px-6
          py-3
          font-semibold
          text-red-700
          transition-all
          hover:bg-red-100
          disabled:opacity-50
        "
      >
        <span>✕</span>
        Delete Permanently
      </button>

    </div>

  </div>

)}














</div>

))

}

</div>

)}

</div>





{/* ==============================
        STUDENT DETAILS MODAL
================================ */}


{

selectedStudent &&


<div

className="
fixed
inset-0
z-50
flex
items-center
justify-center
bg-black/60
p-5
"

>


<div

className="
max-h-[90vh]
w-full
max-w-5xl
overflow-y-auto
rounded-3xl
bg-white
p-8
shadow-2xl
"

>


{/* HEADER */}

<div className="
mb-8
flex
items-center
justify-between
border-b
pb-5
">


<h2 className="
text-3xl
font-bold
text-blue-700
">

🎓 Student Full Information

</h2>



<button

onClick={()=>setSelectedStudent(null)}

className="
rounded-full
bg-red-100
px-4
py-2
font-bold
text-red-600
"

>

✕

</button>


</div>





{/* TOP SECTION */}

<div className="
grid
gap-8
md:grid-cols-3
">


{/* PHOTO */}


<div className="
flex
justify-center
">


<img
src={decodeURIComponent(selectedStudent.student_photo)}
alt={selectedStudent.student_name}
className="h-64 w-64 rounded-3xl border-4 border-blue-100 object-cover shadow-xl"
onError={(e)=>{
  e.currentTarget.src="/placeholder.png";
}}
/>


</div>





{/* BASIC INFO */}

<div className="
md:col-span-2
grid
gap-3
md:grid-cols-2
">


<div className="rounded-xl bg-gray-50 p-4">

<p className="text-gray-500">
Name
</p>

<b>
{selectedStudent.student_name}
</b>

</div>



<div className="rounded-xl bg-gray-50 p-4">

<p className="text-gray-500">
Student ID
</p>

<b>
{
selectedStudent.student_id || "Not Generated"
}
</b>

</div>




<div className="rounded-xl bg-gray-50 p-4">

<p className="text-gray-500">
Class
</p>

<b>
{selectedStudent.class}
</b>

</div>




<div className="rounded-xl bg-gray-50 p-4">

<p className="text-gray-500">
Batch
</p>

<b>
{selectedStudent.batch}
</b>

</div>




<div className="rounded-xl bg-gray-50 p-4">

<p className="text-gray-500">
Guardian
</p>

<b>
{selectedStudent.guardian_name}
</b>

</div>




<div className="rounded-xl bg-gray-50 p-4">

<p className="text-gray-500">
WhatsApp
</p>

<b>
{selectedStudent.whatsapp}
</b>

</div>



<div className="rounded-xl bg-gray-50 p-4">

<p className="text-gray-500">
Date of Birth
</p>

<b>
{selectedStudent.date_of_birth}
</b>

</div>



<div className="rounded-xl bg-gray-50 p-4">

<p className="text-gray-500">
School
</p>

<b>
{selectedStudent.school}
</b>

</div>



</div>


</div>






{/* CONTACT */}

<div className="
mt-8
rounded-2xl
bg-blue-50
p-6
">


<h3 className="
mb-4
text-xl
font-bold
text-blue-700
">

📞 Contact Information

</h3>



<p>
<b>Email:</b> {selectedStudent.email || "N/A"}
</p>



<p className="mt-2">
<b>Facebook:</b> {selectedStudent.facebook_link || "N/A"}
</p>


</div>






{/* ADDRESS */}


<div className="
mt-6
grid
gap-5
md:grid-cols-2
">


<div className="
rounded-2xl
border
p-5
">


<h3 className="
font-bold
text-blue-700
">

🏠 Present Address

</h3>


<p className="mt-3">

{
selectedStudent.present_address || "N/A"
}

</p>


</div>




<div className="
rounded-2xl
border
p-5
">


<h3 className="
font-bold
text-blue-700
">

🏠 Permanent Address

</h3>


<p className="mt-3">

{
selectedStudent.permanent_address || "N/A"
}

</p>


</div>


</div>







{/* PAYMENT */}



<div className="
mt-6
rounded-2xl
border
bg-yellow-50
p-6
">


<h3 className="
mb-4
text-xl
font-bold
text-yellow-700
">

💳 Payment Information

</h3>



<p>

Method:

<b className="ml-2">

{
selectedStudent.payment_method==="bkash"
?
"bKash"
:
"Offline"
}

</b>

</p>




<p className="mt-3">

Status:


<b className="ml-2">


{
selectedStudent.payment_status==="paid"

?

<span className="text-green-600">
PAID
</span>

:

<span className="text-yellow-600">
PENDING
</span>

}


</b>


</p>






{

selectedStudent.payment_method==="bkash"

&&

<>


<p className="mt-3">

bKash Number:

<b>
{selectedStudent.bkash_number}
</b>

</p>



<p className="mt-3">

Transaction ID:

<b>
{selectedStudent.transaction_id}
</b>

</p>


</>


}



</div>





{/* LOGIN INFO */}


{

selectedStudent.status==="approved"

&&


<div className="
mt-6
rounded-2xl
bg-green-50
p-6
">


<h3 className="
text-xl
font-bold
text-green-700
">

✅ Login Information

</h3>


<p className="mt-3">

Student ID:

<b>
{selectedStudent.student_id}
</b>

</p>


<p className="mt-3">

Password:

<b>
{selectedStudent.password}
</b>

</p>



<button

onClick={()=>sendWhatsApp(selectedStudent)}

className="
mt-5
rounded-xl
bg-green-600
px-6
py-3
font-bold
text-white
hover:bg-green-700
"

>

📱 Send Login Info WhatsApp

</button>


</div>


}





</div>


</div>


}








{/* =====================================
    RECOVER / DELETE MODAL
===================================== */}

{actionDialog && (

  <div
    role="presentation"
    className="
      fixed
      inset-0
      z-[100]
      flex
      items-center
      justify-center
      overflow-y-auto
      bg-slate-950/70
      p-4
      backdrop-blur-sm
    "
  >

    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admission-action-title"
      className="
        w-full
        max-w-lg
        rounded-3xl
        bg-white
        p-6
        shadow-2xl
        sm:p-8
      "
    >

      {/* HEADER */}

      <div className="
        flex
        items-start
        justify-between
        gap-4
      ">

        <div>

          <p className="
            text-xs
            font-bold
            uppercase
            tracking-widest
            text-slate-400
          ">
            Admission Management
          </p>

          <h2
            id="admission-action-title"
            className="
              mt-2
              text-2xl
              font-bold
              text-slate-900
            "
          >
            {actionDialog.type === "recover"
              ? "Recover Admission"
              : "Delete Admission"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Student:{" "}
            <strong className="text-slate-800">
              {actionDialog.student.student_name}
            </strong>
          </p>

        </div>

        <button
          type="button"
          onClick={closeRejectedAction}
          disabled={actionBusy}
          aria-label="Close dialog"
          className="
            rounded-full
            bg-slate-100
            px-3
            py-2
            text-slate-600
            hover:bg-slate-200
            disabled:opacity-50
          "
        >
          ✕
        </button>

      </div>

      {/* RECOVERY OPTIONS */}

      {actionDialog.type === "recover" ? (

        <div className="mt-6 space-y-3">

          <p className="text-sm text-slate-600">
            Select the admission status:
          </p>

          <label className={`
            flex
            cursor-pointer
            items-start
            gap-3
            rounded-2xl
            border
            p-4
            transition
            ${recoverTarget === "pending"
              ? "border-amber-400 bg-amber-50"
              : "border-slate-200 hover:bg-slate-50"}
          `}>

            <input
              type="radio"
              name="recover-target"
              checked={recoverTarget === "pending"}
              onChange={() =>
                setRecoverTarget("pending")
              }
              disabled={actionBusy}
              className="mt-1"
            />

            <span>
              <strong className="
                block
                text-slate-900
              ">
                Restore to Pending
              </strong>

              <span className="
                mt-1
                block
                text-sm
                text-slate-500
              ">
                Application will return to the
                Pending Admission list.
              </span>
            </span>

          </label>

          <label className={`
            flex
            cursor-pointer
            items-start
            gap-3
            rounded-2xl
            border
            p-4
            transition
            ${recoverTarget === "approved"
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-200 hover:bg-slate-50"}
          `}>

            <input
              type="radio"
              name="recover-target"
              checked={recoverTarget === "approved"}
              onChange={() =>
                setRecoverTarget("approved")
              }
              disabled={actionBusy}
              className="mt-1"
            />

            <span>
              <strong className="
                block
                text-slate-900
              ">
                Restore & Approve
              </strong>

              <span className="
                mt-1
                block
                text-sm
                text-slate-500
              ">
                Verify payment and activate
                the student account.
              </span>
            </span>

          </label>

          {recoverTarget === "approved" &&
            actionDialog.student.payment_status
              !== "paid" && (

              <div className="
                rounded-xl
                bg-amber-50
                p-3
                text-sm
                text-amber-800
              ">
                Payment is not verified.
                Restore to Pending first,
                then Mark as Paid.
              </div>

          )}

        </div>

      ) : (

        /* DELETE CONFIRMATION */

        <div className="mt-6 space-y-4">

          <div className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            p-4
            text-sm
            text-red-800
          ">

            <strong>
              Permanent Delete
            </strong>

            <p className="mt-2">
              This action cannot be undone.
              The rejected admission record
              will be removed from Supabase.
              Deletion may be blocked if
              linked records require review.
            </p>

          </div>

          <label
            htmlFor="delete-confirm-input"
            className="
              block
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Type DELETE to confirm
          </label>

          <input
            id="delete-confirm-input"
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="DELETE"
            value={deleteConfirmText}
            onChange={(e) =>
              setDeleteConfirmText(e.target.value)
            }
            disabled={actionBusy}
            className="
              w-full
              rounded-xl
              border
              border-slate-300
              px-4
              py-3
              text-slate-900
              outline-none
              focus:border-red-400
              focus:ring-2
              focus:ring-red-100
            "
          />

        </div>

      )}

      {/* ERROR MESSAGE */}

      {actionError && (

        <div
          role="alert"
          className="
            mt-5
            rounded-xl
            border
            border-red-200
            bg-red-50
            p-4
            text-sm
            text-red-700
          "
        >
          {actionError}
        </div>

      )}

      {/* FOOTER ACTIONS */}

      <div className="
        mt-7
        flex
        flex-col-reverse
        gap-3
        sm:flex-row
        sm:justify-end
      ">

        <button
          type="button"
          onClick={closeRejectedAction}
          disabled={actionBusy}
          className="
            rounded-xl
            border
            border-slate-200
            px-5
            py-3
            font-semibold
            text-slate-700
            hover:bg-slate-50
            disabled:opacity-50
          "
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={
            actionDialog.type === "recover"
              ? confirmRecovery
              : confirmDelete
          }
          disabled={
            actionBusy ||
            (
              actionDialog.type === "delete" &&
              deleteConfirmText !== "DELETE"
            ) ||
            (
              actionDialog.type === "recover" &&
              recoverTarget === "approved" &&
              actionDialog.student.payment_status
                !== "paid"
            )
          }
          className={`
            rounded-xl
            px-6
            py-3
            font-bold
            text-white
            transition
            disabled:cursor-not-allowed
            disabled:opacity-50
            ${actionDialog.type === "delete"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-emerald-600 hover:bg-emerald-700"}
          `}
        >

          {actionBusy
            ? "Processing..."
            : actionDialog.type === "delete"
              ? "Delete Permanently"
              : recoverTarget === "approved"
                ? "Recover & Approve"
                : "Restore to Pending"}

        </button>

      </div>

    </div>

  </div>

)}





{/* ======================================
    APPROVED STUDENT DELETE MODAL
====================================== */}

{approvedDeleteStudent && (

  <div className="
    fixed
    inset-0
    z-[120]
    flex
    items-center
    justify-center
    overflow-y-auto
    bg-black/80
    p-4
    backdrop-blur-sm
  ">

    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="approved-delete-title"
      className="
        w-full
        max-w-lg
        rounded-3xl
        border
        border-slate-700
        bg-[#111b2e]
        p-6
        text-slate-100
        shadow-2xl
        sm:p-8
      "
    >

      <div className="
        flex
        items-start
        justify-between
        gap-4
      ">

        <div>
          <p className="
            text-xs
            font-bold
            uppercase
            tracking-widest
            text-red-400
          ">
            Danger Zone
          </p>

          <h2
            id="approved-delete-title"
            className="
              mt-2
              text-2xl
              font-bold
              text-white
            "
          >
            Delete Approved Student
          </h2>
        </div>

        <button
          type="button"
          onClick={closeApprovedDelete}
          disabled={actionBusy}
          aria-label="Close dialog"
          className="
            rounded-xl
            bg-slate-800
            px-3
            py-2
            text-slate-300
            hover:bg-slate-700
            disabled:opacity-50
          "
        >
          ✕
        </button>

      </div>

      {/* STUDENT INFORMATION */}

      <div className="
        mt-6
        rounded-2xl
        border
        border-slate-700
        bg-slate-900/70
        p-4
      ">

        <p className="
          font-bold
          text-white
        ">
          {approvedDeleteStudent.student_name}
        </p>

        <p className="
          mt-2
          text-sm
          text-slate-400
        ">
          Student ID:{" "}
          <span className="font-semibold text-blue-300">
            {approvedDeleteStudent.student_id}
          </span>
        </p>

        <p className="
          mt-1
          text-sm
          text-slate-400
        ">
          Class: {approvedDeleteStudent.class}
        </p>

      </div>

      {/* WARNING */}

      <div className="
        mt-5
        rounded-2xl
        border
        border-red-500/30
        bg-red-500/10
        p-4
      ">

        <p className="font-bold text-red-300">
          Permanent Deletion Warning
        </p>

        <p className="
          mt-2
          text-sm
          leading-6
          text-red-200
        ">
          This action permanently removes the
          student's database profile and attempts
          to remove the linked Supabase Auth
          account and photo.

          Deletion will be blocked if protected
          related records are found.
        </p>

      </div>

      {/* STUDENT ID CONFIRMATION */}

      <div className="mt-6">

        <label
          htmlFor="approved-delete-id"
          className="
            block
            text-sm
            font-semibold
            text-slate-200
          "
        >
          Enter Student ID to confirm
        </label>

        <input
          id="approved-delete-id"
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder={String(
            approvedDeleteStudent.student_id
          )}
          value={approvedDeleteID}
          onChange={(e) =>
            setApprovedDeleteID(e.target.value)
          }
          disabled={actionBusy}
          className="
            mt-2
            w-full
            rounded-xl
            border
            border-slate-600
            bg-slate-950
            px-4
            py-3
            text-white
            outline-none
            focus:border-red-400
            disabled:opacity-50
          "
        />

      </div>

      {/* DELETE KEYWORD */}

      <div className="mt-4">

        <label
          htmlFor="approved-delete-keyword"
          className="
            block
            text-sm
            font-semibold
            text-slate-200
          "
        >
          Type DELETE to continue
        </label>

        <input
          id="approved-delete-keyword"
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="DELETE"
          value={approvedDeleteKeyword}
          onChange={(e) =>
            setApprovedDeleteKeyword(e.target.value)
          }
          disabled={actionBusy}
          className="
            mt-2
            w-full
            rounded-xl
            border
            border-slate-600
            bg-slate-950
            px-4
            py-3
            text-white
            outline-none
            focus:border-red-400
            disabled:opacity-50
          "
        />

      </div>

      {/* FINANCIAL CONFIRMATION */}

      <label className="
        mt-5
        flex
        cursor-pointer
        items-start
        gap-3
        rounded-xl
        border
        border-slate-700
        bg-slate-900
        p-4
      ">

        <input
          type="checkbox"
          checked={approvedDeleteAcknowledged}
          onChange={(e) =>
            setApprovedDeleteAcknowledged(
              e.target.checked
            )
          }
          disabled={actionBusy}
          className="mt-1"
        />

        <span className="
          text-sm
          leading-6
          text-slate-300
        ">
          I have verified that this student has
          no actual financial transactions,
          including admission fees, requiring
          retention, and understand that
          deletion is permanent.
        </span>

      </label>

      {/* ERROR */}

      {actionError && (

        <div
          role="alert"
          className="
            mt-5
            rounded-xl
            border
            border-red-500/30
            bg-red-500/10
            p-4
            text-sm
            text-red-300
          "
        >
          {actionError}
        </div>

      )}

      {/* ACTION BUTTONS */}

      <div className="
        mt-7
        flex
        flex-col-reverse
        gap-3
        sm:flex-row
        sm:justify-end
      ">

        <button
          type="button"
          onClick={closeApprovedDelete}
          disabled={actionBusy}
          className="
            rounded-xl
            border
            border-slate-600
            bg-slate-800
            px-5
            py-3
            font-semibold
            text-slate-200
            hover:bg-slate-700
            disabled:opacity-50
          "
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={confirmApprovedDelete}
          disabled={
            actionBusy ||
            approvedDeleteID !==
              String(approvedDeleteStudent.student_id) ||
            approvedDeleteKeyword !== "DELETE" ||
            !approvedDeleteAcknowledged
          }
          className="
            rounded-xl
            bg-red-600
            px-6
            py-3
            font-bold
            text-white
            transition-all
            hover:bg-red-700
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >

          {actionBusy
            ? "Deleting..."
            : "Delete Permanently"}

        </button>

      </div>

    </div>

  </div>

)}






</main>


);


}