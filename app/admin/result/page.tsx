"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


export default function AdminResultPage(){

  const [students,setStudents] = useState<any[]>([]);
  const [loading,setLoading] = useState(false);


  const [form,setForm] = useState<any>({

    student_id:"",
    student_name:"",
    class:"",
    batch:"",

    subject:"",

    exam_type:"",
    exam_number:"",

    chapter:"",

    marks:"",
    total_marks:"",

    comment:""

  });



  useEffect(()=>{


    async function loadStudents(){


      const {data,error}=await supabase

      .from("students")

      .select("*")

      .eq("status","approved");



      if(!error){

        setStudents(data || []);

      }


    }


    loadStudents();


  },[]);





  function getSubjects(){


    if(
      form.class==="Class 9" ||
      form.class==="Class 10"
    ){

      return [
        "Biology"
      ];

    }



    if(
      form.class==="Class 11" ||
      form.class==="Class 12"
    ){

      return [

        "Biology 1st Paper",

        "Biology 2nd Paper"

      ];

    }



    return [];

  }






  function getExamTypes(){


    if(
      form.class==="Class 11" ||
      form.class==="Class 12"
    ){

      return [

        "Weekly Exam",

        "Chapter Final Exam",

        "Half Century Exam-01",

        "Half Century Exam-02",

        "Paper Final Exam",

        "Subject Final Exam"

      ];


    }



    return [

      "Weekly Exam",

      "Chapter Final Exam",

      "Half Century Exam-01",

      "Half Century Exam-02",

      "Subject Final Exam"

    ];


  }







  function calculateGrade(
    percentage:number
  ){


    if(percentage>=80)
      return "A+";


    if(percentage>=70)
      return "A";


    if(percentage>=60)
      return "A-";


    if(percentage>=50)
      return "B";


    if(percentage>=40)
      return "C";


    if(percentage>=33)
      return "D";


    return "F";


  }


function getPercentage(){


const marks = Number(form.marks);

const total = Number(form.total_marks);



if(!marks || !total){

return 0;

}



return Number(

((marks / total) * 100)

.toFixed(2)

);


}



  function selectStudent(e:any){


    const student = students.find(

      s=>s.student_id===e.target.value

    );


    setForm({

      ...form,

      student_id:student.student_id,

      student_name:student.student_name,

      class:student.class,

      batch:student.batch,

      subject:"",

      exam_type:""

    });


  }






  async function saveResult(){


    if(
      !form.student_id ||
      !form.subject ||
      !form.exam_type ||
      !form.marks ||
      !form.total_marks
    ){

      alert("Fill all required fields");

      return;

    }



    const marks =
    Number(form.marks);



    const total =
    Number(form.total_marks);
if(marks > total){


alert(
"Obtained marks cannot be greater than total marks"
);


return;


}


    const percentage =

    Number(
      (
        (marks / total) * 100
      )
      .toFixed(2)
    );



    const grade =
    calculateGrade(percentage);


    const {data:existing}=await supabase

.from("results")

.select("id")

.eq(
"student_id",
form.student_id
)

.eq(
"subject",
form.subject
)

.eq(
"exam_type",
form.exam_type
)

.eq(
"exam_number",
form.exam_number
?
Number(form.exam_number)
:
null
);



if(existing && existing.length>0){

alert(
"Result already exists"
);

return;

}



    setLoading(true);


    const {error}=await supabase

    .from("results")

    .insert({

      student_id:form.student_id,

      class:form.class,

      batch:form.batch,

      subject:form.subject,

      exam_type:form.exam_type,

      exam_number:
      form.exam_number
      ?
      Number(form.exam_number)
      :
      null,

      chapter:
      form.chapter || null,


      marks:marks,

      total_marks:total,

      percentage:percentage,

      grade:grade,

      comment:form.comment


    });



    setLoading(false);



    if(error){

      alert(error.message);

      return;

    }



    alert("Result Added Successfully");
setForm({

student_id:"",
student_name:"",
class:"",
batch:"",

subject:"",

exam_type:"",
exam_number:"",

chapter:"",

marks:"",
total_marks:"",

comment:""

});

  }

    return (

    <main className="
    min-h-screen
    bg-gray-100
    p-8
    ">

      <div className="
      mx-auto
      max-w-3xl
      rounded-3xl
      bg-white
      p-8
      shadow
      ">


        <h1 className="
        text-3xl
        font-bold
        ">
          Add Student Result
        </h1>




        {/* Student */}

        <select

        className="
        mt-6
        w-full
        rounded-lg
        border
        p-3
        "

        value={form.student_id}

        onChange={selectStudent}

        >

          <option>
            Select Student
          </option>


          {
            students.map(student=>(

              <option

              key={student.id}

              value={student.student_id}

              >

                {student.student_id} -
                {student.student_name}

              </option>

            ))
          }


        </select>





        {/* Subject */}

        <select

        className="
        mt-4
        w-full
        rounded-lg
        border
        p-3
        "

        value={form.subject}

        onChange={
          e=>setForm({
            ...form,
            subject:e.target.value
          })
        }

        >

          <option>
            Select Subject
          </option>


          {
            getSubjects().map(item=>(

              <option key={item}>
                {item}
              </option>

            ))
          }


        </select>






        {/* Exam Type */}

        <select

        className="
        mt-4
        w-full
        rounded-lg
        border
        p-3
        "

        value={form.exam_type}

        onChange={
          e=>setForm({
            ...form,
            exam_type:e.target.value
          })
        }

        >

          <option>
            Select Exam Type
          </option>


          {
            getExamTypes().map(item=>(

              <option key={item}>
                {item}
              </option>

            ))
          }


        </select>






        {/* Exam Number */}

        {
          form.exam_type==="Weekly Exam" &&

          <input

          className="
          mt-4
          w-full
          rounded-lg
          border
          p-3
          "

          type="number"

          placeholder="Exam Number"

          value={form.exam_number}

          onChange={
            e=>setForm({
              ...form,
              exam_number:e.target.value
            })
          }

          />

        }






        {/* Chapter */}

        {
          form.exam_type==="Chapter Final Exam" &&

          <input

          className="
          mt-4
          w-full
          rounded-lg
          border
          p-3
          "

          placeholder="Chapter Name"

          value={form.chapter}

          onChange={
            e=>setForm({
              ...form,
              chapter:e.target.value
            })
          }

          />

        }







        {/* Marks */}

        <input

        className="
        mt-4
        w-full
        rounded-lg
        border
        p-3
        "

        type="number"

        placeholder="Obtained Marks"

        value={form.marks}

        onChange={
          e=>setForm({
            ...form,
            marks:e.target.value
          })
        }

        />







        {/* Total Marks */}

        <input

        className="
        mt-4
        w-full
        rounded-lg
        border
        p-3
        "

        type="number"

        placeholder="Total Marks"

        value={form.total_marks}

        onChange={
          e=>setForm({
            ...form,
            total_marks:e.target.value
          })
        }

        />




<div className="
mt-5
rounded-xl
bg-blue-50
p-4
">


<p>

Percentage:

<span className="font-bold">

{getPercentage()}%

</span>

</p>



<p>

Grade:

<span className="font-bold">

{calculateGrade(getPercentage())}

</span>

</p>



</div>


        {/* Comment */}

        <textarea

        className="
        mt-4
        w-full
        rounded-lg
        border
        p-3
        "

        placeholder="Comment"

        value={form.comment}

        onChange={
          e=>setForm({
            ...form,
            comment:e.target.value
          })
        }

        />








        <button

        onClick={saveResult}

        disabled={loading}

        className="
        mt-6
        w-full
        rounded-lg
        bg-blue-600
        py-3
        text-white
        "

        >

          {
            loading
            ?
            "Saving..."
            :
            "Save Result"
          }


        </button>



      </div>


    </main>

  );


}