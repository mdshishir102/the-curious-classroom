"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


export default function AdminPage(){

  const [students,setStudents] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);



  function generatePassword(){

    const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";


    let password="";


    for(let i=0;i<8;i++){

      password += chars[
        Math.floor(
          Math.random()*chars.length
        )
      ];

    }


    return password;

  }





  async function generateStudentID(student:any){


    let prefix="";


    if(student.batch.startsWith("SSC")){

      prefix="TCCS";

    }


    if(student.batch.startsWith("HSC")){

      prefix="TCCH";

    }



    const batchYear =
    student.batch.replace(/\D/g,"");




    const {count,error}=await supabase

    .from("students")

    .select(
      "id",
      {
        count:"exact",
        head:true
      }
    )

    .eq(
      "batch",
      student.batch
    )

    .eq(
      "status",
      "approved"
    );




    if(error){

      console.log(error);

    }




    const serial =

    String(
      (count || 0) + 1
    )

    .padStart(3,"0");





    return (

      prefix +

      batchYear +

      serial

    );


  }







  async function fetchStudents(){


    const {data,error}=await supabase

    .from("students")

    .select("*")

    .eq(
      "status",
      "pending"
    )

    .order(
      "created_at",
      {
        ascending:false
      }
    );




    if(error){

      console.log(error);

    }



    setStudents(data || []);

    setLoading(false);


  }







  async function updateStatus(
    id:number,
    status:string
  ){



    const student =

    students.find(
      item=>item.id===id
    );



    if(!student)

      return;





    let updateData:any={

      status

    };





    if(status==="approved"){



      const studentID =

      await generateStudentID(
        student
      );



      const password =

      generatePassword();





      updateData={


        status:"approved",


        student_id:studentID,


        password,


        login_enabled:true


      };





      alert(
`
Admission Approved!

Student ID:
${studentID}

Password:
${password}
`
      );


    }





    const {error}=await supabase

    .from("students")

    .update(updateData)

    .eq(
      "id",
      id
    );





    if(error){

      alert(error.message);

      return;

    }




    fetchStudents();



  }







  useEffect(()=>{


    fetchStudents();


  },[]);









  return (

    <main className="min-h-screen bg-gray-100 p-8">


      <div className="mx-auto max-w-6xl">



        <h1 className="mb-8 text-3xl font-bold">

          Pending Admissions

        </h1>





        {
          loading ?


          <p>
            Loading...
          </p>



          :



          students.length===0 ?


          <p className="rounded-xl bg-white p-6">

            No Pending Admission

          </p>




          :



          <div className="grid gap-6">



          {
            students.map((student)=>(


              <div

              key={student.id}

              className="
              rounded-2xl
              bg-white
              p-6
              shadow
              "

              >


                <h2 className="text-xl font-bold">

                  {student.student_name}

                </h2>



                <p>
                  Class: {student.class}
                </p>



                <p>
                  Batch: {student.batch}
                </p>



                <p>
                  Phone: {student.whatsapp}
                </p>





                <div className="mt-5 flex gap-4">



                  <button

                  onClick={()=>
                    updateStatus(
                      student.id,
                      "approved"
                    )
                  }

                  className="
                  rounded-lg
                  bg-green-600
                  px-5
                  py-2
                  text-white
                  "

                  >

                    Approve

                  </button>





                  <button

                  onClick={()=>
                    updateStatus(
                      student.id,
                      "rejected"
                    )
                  }

                  className="
                  rounded-lg
                  bg-red-600
                  px-5
                  py-2
                  text-white
                  "

                  >

                    Reject

                  </button>



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