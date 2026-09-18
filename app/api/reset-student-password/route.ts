import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);



export async function POST(req: Request) {

  try {


    const body = await req.json();


    const {
      userId,
      password,
      studentDbId
    } = body;




    if(!userId || !password){

      return NextResponse.json(
        {
          error:"Missing data"
        },
        {
          status:400
        }
      );

    }






    // Update Supabase Auth Password

    const {
      error:authError
    } =
    await supabaseAdmin.auth.admin.updateUserById(

      userId,

      {
        password
      }

    );






    if(authError){

      return NextResponse.json(

        {
          error:authError.message
        },

        {
          status:400
        }

      );

    }







    // Update students table password

    if(studentDbId){


      const {
        error:dbError
      } =
      await supabaseAdmin

      .from("students")

      .update({

        password

      })

      .eq(
        "id",
        studentDbId
      );




      if(dbError){

        return NextResponse.json(
          {
            error:dbError.message
          },
          {
            status:400
          }
        );

      }


    }








    return NextResponse.json({

      success:true

    });




  }

  catch(error:any){


    return NextResponse.json(

      {
        error:error.message
      },

      {
        status:500
      }

    );


  }

}