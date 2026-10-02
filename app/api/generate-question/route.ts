import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";


const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);
















export async function POST(req:Request){


try{


const body = await req.json();


const {
chapterContent,
questionType,
count,
difficulty
}=body;




const model = genAI.getGenerativeModel({

model:"gemini-3-flash-preview"

});



const prompt = `

তুমি বাংলাদেশের SSC/HSC Biology শিক্ষক।

নিচের chapter content থেকে বাংলা ভাষায় প্রশ্ন তৈরি করো।

Chapter Content:

${chapterContent}


Question Type:
${questionType}


Number of Questions:
${count}


Difficulty:
${difficulty}



নিয়ম:

- NCTB Biology standard follow করবে
- শুধুমাত্র দেওয়া content থেকে প্রশ্ন করবে
- বাংলা ভাষায় লিখবে
- JSON format ছাড়া কিছু লিখবে না


যদি MCQ হয়:

[
{
"question_bn":"",
"option_a":"",
"option_b":"",
"option_c":"",
"option_d":"",
"correct_answer":"",
"explanation_bn":"",
"marks":1
}
]


যদি SAQ হয়:

[
{
"question_bn":"",
"answer_bn":"",
"marks":2
}
]


যদি CQ হয়:

[
{
"question_bn":"",
"answer_bn":"",
"marks":10
}
]

`;



const result = await model.generateContent(prompt);



const text =
result.response.text();



const clean =
text.replace(/```json/g,"")
.replace(/```/g,"")
.trim();



const questions = JSON.parse(clean);



return NextResponse.json({

success:true,

questions

});


}


catch(error:any){


return NextResponse.json({

success:false,

error:error.message

});


}


}