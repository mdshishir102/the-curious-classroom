import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



export async function generateResultPDF({
              logo,
  className,
  subject,
  examType, 
  topic,
  date,
  students,
}: any) {


  const doc = new jsPDF("p", "mm", "a4");


if(logo){

  const img = new Image();

  img.src = logo;

  await new Promise((resolve)=>{
    img.onload = resolve;
  });


  const maxWidth = 30;
  const maxHeight = 30;


  let width = img.width;
  let height = img.height;


  const ratio = Math.min(
    maxWidth / width,
    maxHeight / height
  );


  width = width * ratio;
  height = height * ratio;


  doc.addImage(
    logo,
    "PNG",
    15,
    10,
    width,
    height
  );

}

  


  // Header

  doc.setFontSize(22);
  doc.text(
    "The Curious Classroom",
    110,
    22,
    {
      align: "center",
    }
  );


  doc.setFontSize(12);

  doc.text(
    "Academic Performance Report",
    105,
    28,
    {
      align:"center",
    }
  );



  // Exam Information Box

doc.setFillColor(240, 247, 255);

doc.roundedRect(
  15,
  42,
  180,
  35,
  3,
  3,
  "F"
);


doc.setFontSize(11);

doc.text(
  `Class: ${className}`,
  22,
  52
);

doc.text(
  `Subject: ${subject}`,
  22,
  60
);

doc.text(
  `Exam: ${examType}`,
  100,
  52
);

doc.text(
  `Topic: ${topic}`,
  100,
  60
);

doc.text(
  `Date: ${date}`,
  22,
  68
);




  // Table


  autoTable(doc,{

    startY:85,


    head:[

      [
        "Position",
        "Student ID",
        "Name",
        "CQ",
        "SAQ",
        "MCQ",
        "Total",
        "%",
        "Grade"
      ]

    ],


    body:

    students.map((student:any)=>(

      [

        student.position,

        student.student_id,

        student.student_name,

        student.cq,

        student.saq,

        student.mcq,

        student.total,

        student.percentage+"%",

        student.grade

      ]

    ))


  });




// Dynamic Footer

const pageHeight =
  doc.internal.pageSize.height;

const finalY = (doc as any).lastAutoTable.finalY;


let footerY = finalY + 30;


// Check page overflow

if(footerY > 250){

  doc.addPage();

  footerY = 40;

}



doc.setFontSize(11);

doc.text(
  "Prepared & Authorized By",
  15,
  footerY
);


doc.setFontSize(10);

doc.text(
  "MD. Mahfuz Shaharia Shishir",
  15,
  footerY + 8
);


doc.text(
  "Sir Salimullah Medical College",
  15,
  footerY + 14
);


doc.text(
  "Ex-Notre Damian",
  15,
  footerY + 20
);


doc.text(
  "CEO & Founder",
  15,
  footerY + 26
);


doc.text(
  "The Curious Classroom",
  15,
  footerY + 32
);



doc.text(
  "The Curious Classroom | Result Sheet",
  105,
  285,
  {
    align:"center"
  }
);


doc.save(
  `${className}_Result.pdf`
);

return doc;


}