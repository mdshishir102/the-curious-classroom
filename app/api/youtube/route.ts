import { NextResponse } from "next/server";


const CHANNEL_URL =
"https://www.youtube.com/@TheCuriousClassroom-s2s/videos";


export async function GET(){

try{


const response = await fetch(CHANNEL_URL,{
headers:{
"User-Agent":
"Mozilla/5.0"
},
cache:"no-store"
});


const html = await response.text();


// ytInitialData বের করা

const match = html.match(
/var ytInitialData = (.*?);<\/script>/
);


if(!match){

return NextResponse.json(
{
error:"ytInitialData not found"
},
{
status:500
}
);

}



const data = JSON.parse(match[1]);



const videos:any[]=[];



function findVideos(obj:any){


if(!obj || typeof obj !== "object")
return;



if(
obj.videoId &&
obj.thumbnail &&
obj.title
){


const title =
obj.title?.runs?.[0]?.text;


if(title){

videos.push({

id:obj.videoId,

title:title,

thumbnail:
`https://i.ytimg.com/vi/${obj.videoId}/hqdefault.jpg`,

url:
`https://youtube.com/watch?v=${obj.videoId}`

});

}


}



Object.values(obj).forEach(
(value:any)=>findVideos(value)
);


}



findVideos(data);




// duplicate remove + first 3

const result =
videos.filter(
(video,index,array)=>
array.findIndex(
(v)=>v.id===video.id
)===index
)
.slice(0,3);



return NextResponse.json(result);



}catch(error){


return NextResponse.json(
{
error:String(error)
},
{
status:500
}
);


}


}