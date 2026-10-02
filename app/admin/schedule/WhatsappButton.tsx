"use client";


function formatTime(time:string){

return new Date(
`1970-01-01T${time}`
)
.toLocaleTimeString(
"en-US",
{
hour:"2-digit",
minute:"2-digit",
hour12:true
}
);

}




export default function WhatsappButton({
item
}:any){



async function sendMessage(){


const date = new Date(
item.schedule_date
)
.toLocaleDateString(
"en-GB",
{
day:"2-digit",
month:"long",
year:"numeric"
}
);





const time =

item.start_time && item.end_time

?

`${formatTime(item.start_time)} - ${formatTime(item.end_time)}`

:

"";






const message =

`📚 Biology Class Update

আসসালামু আলাইকুম।

🏫 Class: ${item.class_name}

📖 Topic: ${item.topic || "N/A"}

📅 Date: ${date} (${item.days?.[0] || ""})

⏰ Time: ${time}


সকল শিক্ষার্থীকে নির্ধারিত সময়ে ক্লাসে উপস্থিত থাকার জন্য অনুরোধ করা হচ্ছে।

ধন্যবাদ।

MD. Mahfuz Shaharia Shishir Sir
Sir Salimullah Medical College
Ex-Notre Damian

The Curious Classroom`;





try{


await navigator.clipboard.writeText(message);


alert(
"✅ Class message copied. Paste it in WhatsApp group."
);



window.open(
item.whatsapp_group,
"_blank"
);



}

catch(error){


console.log(error);


alert(
"Message copy failed"
);


}




}



return(


<button

onClick={sendMessage}

className="
w-full
mt-5
bg-green-600
text-white
py-3
rounded-xl
font-bold
flex
items-center
justify-center
gap-2
hover:bg-green-700
transition
shadow-md
"

>

<span className="text-xl">
📱
</span>

Copy & Open WhatsApp

</button>


)


}