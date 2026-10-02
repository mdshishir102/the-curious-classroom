"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function AdmissionForm() {
    const [loading, setLoading] = useState(false);

    const [photoPreview, setPhotoPreview] = useState("");
    const [photo, setPhoto] = useState<File | null>(null);

    const [success, setSuccess] = useState(false);

    const [showRules, setShowRules] = useState(false);
    const [rulesRead, setRulesRead] = useState(false);
    const [countdown, setCountdown] = useState(30);

    const timerRef = useRef<NodeJS.Timeout | null>(null);


    const [form, setForm] = useState({
        student_name: "",
        guardian_name: "",

        whatsapp: "",
        facebook_link: "",
        email: "",

        date_of_birth: "",

        class: "",
        batch: "",

        present_address: "",
        permanent_address: "",

        school: "",
        college: "",


        // Admission Fee
        admission_fee_amount: "",
        admission_fee_paid: "",
        admission_fee_method: "",
        admission_fee_status: "pending",
        transaction_id: "",

        rules_accept: false,
    });



    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) {

        const {
            name,
            value
        } = e.target;


        if (name === "class") {

            let batch = "";
            let admissionFee = "";

            const year = new Date().getFullYear();



            if (
                value === "Class 9" ||
                value === "Class 10"
            ) {

                admissionFee = "500";


                const sscYear =
                    value === "Class 9"
                        ? year + 2
                        : year + 1;


                batch = `SSC ${String(sscYear).slice(-2)}`;

            }



            if (
                value === "Class 11" ||
                value === "Class 12"
            ) {

                admissionFee = "700";


                const hscYear =
                    value === "Class 11"
                        ? year + 2
                        : year + 1;


                batch = `HSC ${String(hscYear).slice(-2)}`;

            }



            setForm(prev => ({
                ...prev,

                class: value,

                batch,

                admission_fee_amount: admissionFee,


                college:
                    value === "Class 9" ||
                        value === "Class 10"
                        ? ""
                        : prev.college,

            }));


            return;
        }



        setForm(prev => ({
            ...prev,
            [name]: value
        }));

    }

    async function uploadPhoto() {

        if (!photo) {
            throw new Error("Student photo required");
        }


      const fileExt = photo.name
  .split(".")
  .pop()
  ?.trim()
  .toLowerCase();


const fileName =
`${Date.now()}-${Math.random()
.toString(36)
.substring(2)}.${fileExt}`;



        const {
            error
        } = await supabase.storage
            .from("student-photos")
            .upload(
                fileName,
                photo,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );



        if (error) {
            throw error;
        }



        const {
            data
        } = supabase.storage
            .from("student-photos")
            .getPublicUrl(fileName);



        return data.publicUrl;

    }







    function openRules() {

        setShowRules(true);
        setRulesRead(false);
        setCountdown(30);



        if (timerRef.current) {
            clearInterval(timerRef.current);
        }



        timerRef.current = setInterval(() => {


            setCountdown(prev => {


                if (prev <= 1) {


                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                    }


                    setRulesRead(true);


                    return 0;

                }



                return prev - 1;

            });


        }, 1000);

    }







    async function submitAdmission(
        e: React.FormEvent<HTMLFormElement>
    ) {

        e.preventDefault();


if(
form.admission_fee_method === "online" &&
!form.transaction_id
){

alert("Online payment এর জন্য Transaction ID দিতে হবে");

return;

}





        if (!rulesRead) {

            alert(
                "অনুগ্রহ করে কোচিংয়ের নিয়মাবলি পড়ে সম্মতি প্রদান করুন।"
            );

            return;

        }




        try {

            setLoading(true);



            // Duplicate WhatsApp Check

            const {
                data: existing,
                error: checkError

            } = await supabase

                .from("students")

                .select("id")

                .eq(
                    "whatsapp",
                    form.whatsapp
                )

                .maybeSingle();




            if (checkError) {
                throw checkError;
            }




            if (existing) {

                alert(
                    "এই WhatsApp নম্বর দিয়ে ইতিমধ্যে আবেদন করা হয়েছে।"
                );

                return;

            }





            const photoURL =
                await uploadPhoto();





            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];






            const {
                error

            } = await supabase

                .from("students")

                .insert({

                    student_name:
                        form.student_name,


                    student_photo:
                        photoURL,


                    guardian_name:
                        form.guardian_name,


                    whatsapp:
                        form.whatsapp,


                    email:
                        form.email || null,


                    facebook_link:
                        form.facebook_link || null,


                    date_of_birth:
                        form.date_of_birth,



                    class:
                        form.class,


                    batch:
                        form.batch,


                    school:
                        form.school || null,


                    college:
                        form.college || null,



                    present_address:
                        form.present_address,



                    permanent_address:
                        form.permanent_address,



                    admission_fee_amount:
                        Number(form.admission_fee_amount),



                    admission_fee_paid:
                        Number(form.admission_fee_paid),



                    admission_fee_method:
                        form.admission_fee_method,



                        transaction_id:
form.transaction_id,



                    admission_fee_status:
                        form.admission_fee_status,



                    status:
                        "pending",



                    admission_date:
                        today,

                });





            if (error) {
                throw error;
            }



            setSuccess(true);



        }


        catch (err: any) {

            alert(
                err.message ||
                "Something went wrong"
            );

        }



        finally {

            setLoading(false);

        }


    }

    return (

        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-5 py-10">


            <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-xl md:p-10">



                {success && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">




                        <div className="max-w-lg rounded-3xl bg-white p-8 text-center shadow-2xl">


                            <div className="text-6xl">
                                🎉
                            </div>


                            <h2 className="mt-5 text-3xl font-bold text-green-600">
                                আবেদন সফল হয়েছে
                            </h2>



                            <p className="mt-5 leading-8 text-gray-700">

                                আপনার ভর্তি আবেদনটি সফলভাবে গ্রহণ করা হয়েছে।

                                <br /><br />

                                আমাদের টিম আপনার তথ্য যাচাই করবে।

                            </p>



                            <button

                                onClick={() => window.location.href = "/"}

                                className="mt-6 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white"

                            >

                                Home

                            </button>



                        </div>

                    </div>

                )}





                <div className="mb-10 rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-8 text-center text-white">


                    <Image

                        src="/logo.png"

                        width={150}

                        height={150}

                        alt="The Curious Classroom"

                        className="mx-auto rounded-2xl bg-white p-3"

                    />



                    <h1 className="mt-5 text-4xl font-bold">

                        ভর্তি আবেদন

                    </h1>


                    <p className="mt-3 text-blue-100">

                        The Curious Classroom এর সাথে

                        <br />

                        আপনার শিক্ষার নতুন যাত্রা শুরু করুন

                    </p>


                </div>






                {
                    showRules && (

                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">


                            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">


                                <h2 className="mb-5 text-2xl font-bold text-blue-700">

                                    📌 The Curious Classroom এর কোচিংয়ের নিয়মাবলি

                                </h2>




                                <div className="h-80 overflow-y-auto rounded-xl bg-gray-50 p-5 text-gray-700 leading-7">


                                    
<p>
<b>১. নিয়মিত উপস্থিতির নিয়ম:</b><br/>
প্রত্যেক শিক্ষার্থীর নিয়মিত ক্লাসে উপস্থিত থাকা বাধ্যতামূলক।
টানা ৩ (তিন) দিনের বেশি অনুপস্থিত থাকলে কর্তৃপক্ষ প্রয়োজন অনুযায়ী ব্যবস্থা গ্রহণ করতে পারবে।
</p>


<p className="mt-4">

<b>২. অনুপস্থিতির ক্ষেত্রে করণীয়:</b><br/>
কোনো অনিবার্য কারণে ক্লাসে উপস্থিত হতে না পারলে অবশ্যই পূর্বেই শিক্ষক বা কর্তৃপক্ষকে অবহিত করতে হবে।

</p>


<p className="mt-4">

<b>৩. পরীক্ষায় অনুপস্থিতির নিয়ম:</b><br/>
কোনো পরীক্ষায় অনুপস্থিত থাকলে নির্ধারিত ১০০ টাকা জরিমানা প্রদান করতে হবে।
জরিমানা পরিশোধ না করা পর্যন্ত পরবর্তী ক্লাস বা পরীক্ষায় অংশগ্রহণের অনুমতি দেওয়া হবে না।

</p>


<p className="mt-4">

<b>৪. দীর্ঘ অনুপস্থিতির নিয়ম:</b><br/>
কোনো শিক্ষার্থী টানা ৬ (ছয়) দিন অনুপস্থিত থাকলে তার ভর্তি বাতিল করা হতে পারে।
পুনরায় ক্লাসে অংশগ্রহণের জন্য নতুন করে ভর্তি প্রক্রিয়া সম্পন্ন করতে হবে।

</p>


<p className="mt-4">

<b>৫. মাসিক ফি পরিশোধের নিয়ম:</b><br/>
প্রতি মাসের ১৫ তারিখের মধ্যে নির্ধারিত মাসিক ফি পরিশোধ করতে হবে।
কোনো বিশেষ সমস্যা থাকলে নির্ধারিত সময়ের পূর্বেই কর্তৃপক্ষকে জানাতে হবে।

</p>


<p className="mt-4">

<b>৬. শৃঙ্খলা ও আচরণবিধি:</b><br/>
The Curious Classroom-এর শিক্ষার পরিবেশ, নিয়ম-কানুন ও শৃঙ্খলা বজায় রাখা প্রত্যেক শিক্ষার্থীর দায়িত্ব।
সকল শিক্ষার্থীকে প্রতিষ্ঠানের নিয়মাবলি যথাযথভাবে মেনে চলতে হবে।

</p>



                                </div>





                                <div className="mt-5 text-center text-lg font-semibold text-blue-600">


                                    {
                                        rulesRead

                                            ?

                                            "আপনি নিয়মাবলি পড়েছেন।"

                                            :

                                            `অনুগ্রহ করে ${countdown} সেকেন্ড অপেক্ষা করুন`

                                    }


                                </div>





                                <button

                                    disabled={!rulesRead}

                                    onClick={() => {
                                        setShowRules(false);
                                        setRulesRead(true);
                                    }}

                                    className={`mt-5 w-full rounded-xl py-3 font-bold text-white ${rulesRead
                                        ?
                                        "bg-blue-600 hover:bg-blue-700"
                                        :
                                        "bg-gray-400"
                                        }`}

                                >

                                    আমি নিয়মাবলি পড়েছি

                                </button>



                            </div>

                        </div>

                    )

                }

                <form
                    onSubmit={submitAdmission}
                    className="space-y-8"
                >


                    {/* STUDENT INFO */}

                    <div className="rounded-2xl border p-6 shadow-sm">


                        <h2 className="mb-5 text-xl font-bold text-blue-700">

                            🎓 শিক্ষার্থীর তথ্য

                        </h2>



                        <input

                            required

                            name="student_name"

                            value={form.student_name}

                            onChange={handleChange}

                            placeholder="শিক্ষার্থীর নাম"

                            className="mb-4 w-full rounded-xl border p-3"

                        />





                        <label className="mb-2 block font-medium">

                            শিক্ষার্থীর ছবি *

                        </label>




                        <input

                            required

                            type="file"

                            accept="image/*"

                            onChange={(e) => {


                                const file =
                                    e.target.files?.[0];


                                if (file) {


                                    setPhoto(file);


                                    setPhotoPreview(
                                        URL.createObjectURL(file)
                                    );


                                }


                            }}

                            className="w-full rounded-xl border p-3"

                        />





                        {
                            photoPreview &&

                            <img

                                src={photoPreview}

                                alt="Preview"

                                className="mt-4 h-32 w-32 rounded-2xl object-cover"

                            />

                        }







                        <label className="mb-2 mt-4 block font-medium">

                            জন্ম তারিখ *

                        </label>




                        <input

                            required

                            type="date"

                            name="date_of_birth"

                            value={form.date_of_birth}

                            onChange={handleChange}

                            className="w-full rounded-xl border p-3"

                        />


                    </div>







                    {/* GUARDIAN */}

                    <div className="rounded-2xl border p-6 shadow-sm">


                        <h2 className="mb-5 text-xl font-bold text-blue-700">

                            👨‍👩‍👦 অভিভাবকের তথ্য

                        </h2>




                        <input

                            required

                            name="guardian_name"

                            value={form.guardian_name}

                            onChange={handleChange}

                            placeholder="অভিভাবকের নাম"

                            className="mb-4 w-full rounded-xl border p-3"

                        />




                        <input

                            required

                            name="whatsapp"

                            value={form.whatsapp}

                            onChange={handleChange}

                            placeholder="WhatsApp Number"

                            className="w-full rounded-xl border p-3"

                        />


                    </div>







                    {/* ACADEMIC */}

                    <div className="rounded-2xl border p-6 shadow-sm">


                        <h2 className="mb-5 text-xl font-bold text-blue-700">

                            📚 শিক্ষাগত তথ্য

                        </h2>




                        <select

                            required

                            name="class"

                            value={form.class}

                            onChange={handleChange}

                            className="mb-4 w-full rounded-xl border p-3"

                        >


                            <option value="">

                                শ্রেণি নির্বাচন করুন

                            </option>


                            <option value="Class 9">

                                Class 9

                            </option>


                            <option value="Class 10">

                                Class 10

                            </option>


                            <option value="Class 11">

                                Class 11

                            </option>


                            <option value="Class 12">

                                Class 12

                            </option>


                        </select>






                        {
                            form.batch &&

                            <div className="mb-4 rounded-xl bg-blue-50 p-4 text-blue-700">

                                আপনার ব্যাচ:

                                <b>
                                    {form.batch}
                                </b>

                            </div>

                        }






                        <input

                            required

                            name="school"

                            value={form.school}

                            onChange={handleChange}

                            placeholder="School Name"

                            className="mb-4 w-full rounded-xl border p-3"

                        />






                        {
                            (form.class === "Class 11" ||
                                form.class === "Class 12")

                            &&

                            <input

                                required

                                name="college"

                                value={form.college}

                                onChange={handleChange}

                                placeholder="College Name"

                                className="w-full rounded-xl border p-3"

                            />

                        }


                    </div>








                    {/* ADMISSION FEE */}

                    <div className="rounded-2xl border p-6 shadow-sm">


                        <h2 className="mb-5 text-xl font-bold text-blue-700">

                            💰 ভর্তি ফি

                        </h2>




                        <div className="mb-4 rounded-xl bg-blue-50 p-4 text-blue-700">


                            নির্ধারিত ভর্তি ফি:

                            <b>

                                {form.admission_fee_amount || 0}

                                টাকা

                            </b>


                        </div>






                        <input

                            required

                            type="number"

                            name="admission_fee_paid"

                            value={form.admission_fee_paid}

                            onChange={handleChange}

                            placeholder="প্রদত্ত ভর্তি ফি"

                            className="mb-4 w-full rounded-xl border p-3"

                        />





                        <select

                            required

                            name="admission_fee_method"

                            value={form.admission_fee_method}

                            onChange={handleChange}

                            className="w-full rounded-xl border p-3"

                        >


                            <option value="">

                                পেমেন্ট মাধ্যম নির্বাচন করুন

                            </option>


                            <option value="offline">

                                Offline

                            </option>


                            <option value="online">

                                Online

                            </option>


                        </select>



{
form.admission_fee_method === "online" && (

<input

required

name="transaction_id"

value={form.transaction_id}

onChange={handleChange}

placeholder="Transaction ID"

className="
mt-4
w-full
rounded-xl
border
p-3
"

/>

)
}





                    </div>








                    {/* ADDRESS */}

                    <div className="rounded-2xl border p-6 shadow-sm">


                        <h2 className="mb-5 text-xl font-bold text-blue-700">

                            🏠 ঠিকানার তথ্য

                        </h2>




                        <textarea

                            required

                            name="present_address"

                            value={form.present_address}

                            onChange={handleChange}

                            placeholder="বর্তমান ঠিকানা"

                            className="mb-4 h-32 w-full rounded-xl border p-3"

                        />





                        <textarea

                            required

                            name="permanent_address"

                            value={form.permanent_address}

                            onChange={handleChange}

                            placeholder="স্থায়ী ঠিকানা"

                            className="h-32 w-full rounded-xl border p-3"

                        />


                    </div>



<button

type="button"

onClick={openRules}

className="mb-4 w-full rounded-xl border border-blue-600 py-3 font-bold text-blue-600 hover:bg-blue-50"

>

📌 কোচিংয়ের নিয়মাবলি পড়ুন

</button>



                    <button

                        disabled={loading}

                        type="submit"

                        className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white hover:bg-blue-700 disabled:bg-gray-400"

                    >


                        {
                            loading

                                ?

                                "Submitting..."

                                :

                                "ভর্তি আবেদন জমা দিন"

                        }


                    </button>



                </form>

                </div> 
</div>

)

}