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
      email,
      password,
    } = body;



    // Create Auth Account

    const { data, error } =
      await supabaseAdmin.auth.admin.createUser({

        email,

        password,

        email_confirm: true,

      });



    if (error) {


      return NextResponse.json(

        {
          error: error.message
        },

        {
          status: 400
        }

      );

    }



    return NextResponse.json({

      success: true,

      userId: data.user.id,

    });



  } catch (error:any) {


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