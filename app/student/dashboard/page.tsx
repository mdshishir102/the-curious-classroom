"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";



export default function StudentDashboard(){


  const router = useRouter();



  const [student,setStudent] = useState<any>(null);


  const [fees,setFees] = useState<any[]>([]);


  const [results,setResults] = useState<any[]>([]);

  const [notices,setNotices] = useState<any[]>([]);

  const [exams,setExams] = useState<any[]>([]);



async function downloadFullReportPDF(){


  const doc = new jsPDF();



  doc.setFontSize(18);


  doc.text(
    "The Curious Classroom",
    20,
    20
  );



  doc.setFontSize(14);


  doc.text(
    "Student Full Report Card",
    20,
    35
  );



  doc.line(
    20,
    42,
    190,
    42
  );



  doc.setFontSize(11);



  doc.text(
    `Student Name: ${student.student_name}`,
    20,
    60
  );


  doc.text(
    `Student ID: ${student.student_id}`,
    20,
    70
  );


  doc.text(
    `Class: ${student.class}`,
    20,
    80
  );


  doc.text(
    `Batch: ${student.batch}`,
    20,
    90
  );




  let y = 115;



  doc.text(
    "Academic Results",
    20,
    y
  );



  y += 15;



  results.forEach((result,index)=>{



    doc.text(

      `${index+1}. ${result.subject}`,

      20,

      y

    );


    y += 8;



    doc.text(

      `${result.exam_type} ${result.exam_number ? result.exam_number : ""}`,

      30,

      y

    );


    y += 8;



    doc.text(

      `Marks: ${result.marks}/${result.total_marks}   Percentage: ${result.percentage}%   Grade: ${result.grade}`,

      30,

      y

    );



    y += 15;



    if(y > 270){


      doc.addPage();


      y = 20;


    }



  });





  doc.line(

    20,

    y,

    190,

    y

  );



  doc.text(

    "Powered by The Curious Classroom",

    20,

    y + 15

  );



  doc.save(

    `${student.student_id}_Full_Report_Card.pdf`

  );



}

  async function downloadResultPDF(result:any){


    const doc = new jsPDF();



    doc.setFontSize(18);

    doc.text(
      "The Curious Classroom",
      20,
      20
    );



    doc.setFontSize(14);

    doc.text(
      "Student Result Card",
      20,
      35
    );



    doc.line(
      20,
      42,
      190,
      42
    );



    doc.setFontSize(11);



    doc.text(
      `Student Name: ${student.student_name}`,
      20,
      60
    );


    doc.text(
      `Student ID: ${student.student_id}`,
      20,
      70
    );


    doc.text(
      `Class: ${student.class}`,
      20,
      80
    );


    doc.text(
      `Batch: ${student.batch}`,
      20,
      90
    );



    doc.line(
      20,
      100,
      190,
      100
    );



    doc.text(
      `Subject: ${result.subject}`,
      20,
      120
    );


    doc.text(
      `Exam Type: ${result.exam_type}`,
      20,
      130
    );



    if(result.exam_number){


      doc.text(
        `Exam Number: ${result.exam_number}`,
        20,
        140
      );


    }



    doc.text(
      `Marks: ${result.marks}/${result.total_marks}`,
      20,
      155
    );


    doc.text(
      `Percentage: ${result.percentage}%`,
      20,
      165
    );


    doc.text(
      `Grade: ${result.grade}`,
      20,
      175
    );



    if(result.comment){


      doc.text(
        "Teacher Comment:",
        20,
        195
      );


      doc.text(
        result.comment,
        20,
        205
      );


    }



    doc.line(
      20,
      230,
      190,
      230
    );



    doc.text(
      "Powered by The Curious Classroom",
      20,
      245
    );



    doc.save(

      `${student.student_id}_Result_Card.pdf`

    );


  }






  useEffect(()=>{


    async function loadNotices(){


const {data,error}=await supabase

.from("notices")

.select("*")

.order(
"created_at",
{
ascending:false
}
)

.limit(5);



if(!error){

setNotices(data || []);

}


}

    async function loadStudent(){


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




      const studentData =
      JSON.parse(data);



      setStudent(studentData);
loadExams(studentData);




      const {data:feeData,error:feeError}=

      await supabase

      .from("fees")

      .select("*")

      .eq(
        "student_id",
        studentData.student_id
      );



      if(!feeError){

        setFees(
          feeData || []
        );

      }






      const {data:resultData,error:resultError}=

      await supabase

      .from("results")

      .select("*")

      .eq(
        "student_id",
        studentData.student_id
      )

      .order(
        "created_at",
        {
          ascending:false
        }
      );



      if(!resultError){

        setResults(
          resultData || []
        );

      }



    }



    loadStudent();

loadNotices();

  },[]);



async function loadExams(studentData:any){


const {data,error}=await supabase

.from("exam_schedule")

.select("*")

.eq(
"class",
studentData.class
)

.eq(
"batch",
studentData.batch
)

.order(
"exam_date",
{
ascending:true
}
)

.limit(5);





if(!error){

setExams(data || []);

}



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

    );


  }

    return (

    <main className="
    min-h-screen
    bg-gray-100
    p-6
    ">


      <div className="
      mx-auto
      max-w-5xl
      ">


        <div className="
        rounded-3xl
        bg-white
        p-8
        shadow-xl
        ">



          {/* Header */}


          <div className="
          flex
          flex-col
          items-center
          gap-5
          md:flex-row
          ">



            {
              student.student_photo ?


              <img

              src={student.student_photo}

              alt="Student"

              className="
              h-32
              w-32
              rounded-full
              object-cover
              border-4
              border-blue-100
              "

              />


              :


              <div className="
              flex
              h-32
              w-32
              items-center
              justify-center
              rounded-full
              bg-blue-100
              text-4xl
              font-bold
              text-blue-600
              ">

                {student.student_name?.charAt(0)}

              </div>


            }




            <div>


              <h1 className="
              text-3xl
              font-bold
              ">

                {student.student_name}

              </h1>



              <p className="text-gray-500">

                The Curious Classroom Student Portal

              </p>


            </div>


          </div>







          <hr className="my-8"/>






          {/* Student Information */}


          <h2 className="
          text-xl
          font-bold
          ">

          Student Information

          </h2>




          <div className="
          mt-5
          grid
          gap-4
          md:grid-cols-2
          ">



          <Info

          title="Student ID"

          value={student.student_id}

          />



          <Info

          title="Class"

          value={student.class}

          />



          <Info

          title="Batch"

          value={student.batch}

          />



          <Info

          title="Phone"

          value={student.whatsapp}

          />



          </div>








          <hr className="my-8"/>

{/* Notice Board */}


<div className="
mt-8
rounded-2xl
bg-blue-50
p-6
">


<h2 className="
text-xl
font-bold
text-blue-800
">

📢 Notice Board

</h2>




<div className="
mt-4
space-y-4
">


{

notices.length===0 ?


<p className="
text-gray-600
">

No notice available.

</p>


:


notices.map((notice)=>(


<div

key={notice.id}

className="
rounded-xl
bg-white
p-4
shadow-sm
"

>


<h3 className="
font-bold
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



</div>


{/* Upcoming Exam */}


<div className="
mt-8
rounded-2xl
bg-purple-50
p-6
">


<h2 className="
text-xl
font-bold
text-purple-800
">

📅 Upcoming Exam

</h2>




<div className="
mt-4
space-y-4
">


{

exams.length===0 ?


<p className="
text-gray-600
">

No upcoming exam available.

</p>


:


exams.map((exam)=>(


<div

key={exam.id}

className="
rounded-xl
bg-white
p-4
shadow-sm
"

>


<h3 className="
font-bold
">

{exam.subject}

</h3>



<p className="
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



</div>




          {/* Fee Section */}


<h2 className="
text-xl
font-bold
">

Monthly Fee Status

</h2>





<div className="
mt-5
grid
gap-5
md:grid-cols-2
">


<div className="
rounded-2xl
bg-green-50
p-6
">


<p className="
text-gray-500
">

Total Paid

</p>


<p className="
mt-2
text-3xl
font-bold
text-green-700
">

৳ {
fees
.filter(
fee=>fee.status==="paid"
)
.reduce(
(sum,fee)=>sum+Number(fee.amount),
0
)
}

</p>


</div>






<div className="
rounded-2xl
bg-yellow-50
p-6
">


<p className="
text-gray-500
">

Total Due

</p>


<p className="
mt-2
text-3xl
font-bold
text-yellow-700
">

৳ {
fees
.filter(
fee=>fee.status==="due"
)
.reduce(
(sum,fee)=>sum+Number(fee.amount),
0
)
}

</p>


</div>



</div>








<div className="
mt-6
space-y-4
">


{

fees.length===0 ?


<div className="
rounded-xl
bg-gray-50
p-5
">

No fee record available.

</div>



:


fees.map((fee)=>(


<div

key={fee.id}

className="
flex
items-center
justify-between
rounded-2xl
bg-gray-50
p-5
"


>


<div>


<p className="
font-bold
">

{fee.month}

</p>


<p>

Amount:
৳ {fee.amount}

</p>


</div>





<span

className={`
rounded-full
px-4
py-1
font-semibold

${
fee.status==="paid"

?

"bg-green-100 text-green-700"

:

"bg-yellow-100 text-yellow-700"

}

`}

>


{
fee.status==="paid"

?

"PAID"

:

"DUE"

}


</span>




</div>



))


}



</div>
          {/* Result Section */}


          <h2 className="
          text-xl
          font-bold
          ">

          Academic Progress

          </h2>


<button

onClick={downloadFullReportPDF}

className="
mb-5
rounded-lg
bg-purple-600
px-5
py-3
text-white
"

>

Download Full Report

</button>


          <div className="
          mt-5
          space-y-4
          ">



          {

          results.length===0 ?


          <div className="
          rounded-xl
          bg-blue-50
          p-5
          text-blue-700
          ">

          No result available yet.

          </div>



          :



          results.map((result)=>(



          <div

          key={result.id}

          className="
          rounded-xl
          bg-gray-50
          p-5
          ">



          <div className="
          flex
          justify-between
          ">



          <div>


          <h3 className="
          text-lg
          font-bold
          ">

          {result.subject}

          </h3>



          <p className="text-gray-600">

          {result.exam_type}

          {
            result.exam_number &&
            ` ${String(result.exam_number).padStart(2,"0")}`
          }

          </p>




          </div>







          <div className="
          text-right
          ">



          <p className="
          text-xl
          font-bold
          text-blue-600
          ">

          {result.marks}/{result.total_marks}

          </p>




          <p className="
          font-bold
          text-green-600
          ">

          {result.grade}

          </p>




          <p className="
          text-sm
          text-gray-500
          ">

          {result.percentage}%

          </p>






          <button

          onClick={()=>
            downloadResultPDF(result)
          }

          className="
          mt-3
          rounded-lg
          bg-blue-600
          px-4
          py-2
          text-sm
          text-white
          "

          >

          Download PDF

          </button>




          </div>




          </div>








          {

          result.chapter &&

          <p className="
          mt-3
          text-sm
          text-gray-600
          ">

          Chapter:
          {result.chapter}

          </p>

          }





          {

          result.comment &&

          <p className="
          mt-3
          text-sm
          text-gray-600
          ">

          {result.comment}

          </p>

          }





          </div>



          ))

          }



          </div>



<button

onClick={()=>router.push("/student/profile")}

className="
mt-8
mr-3
rounded-lg
bg-blue-600
px-6
py-3
text-white
"

>

My Profile

</button>




          <button

          onClick={logout}

          className="
          mt-8
          rounded-lg
          bg-red-600
          px-6
          py-3
          text-white
          "

          >

          Logout

          </button>






        </div>


      </div>


    </main>


  );


}







function Info({

title,

value

}:{

title:string;

value:string;

}){


return(

<div className="
rounded-xl
bg-gray-50
p-4
">


<p className="
text-sm
text-gray-500
">

{title}

</p>



<p className="
mt-1
font-semibold
">

{value || "Not Available"}

</p>


</div>


)

}