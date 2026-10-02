"use client";

import { motion } from "framer-motion";

export default function ExamsPage(){

return(

<div className="
min-h-screen
flex
items-center
justify-center
bg-gradient-to-br
from-blue-50
to-purple-50
px-5
">

<motion.div

initial={{
opacity:0,
scale:0.8
}}

animate={{
opacity:1,
scale:1
}}

transition={{
duration:0.5
}}

className="
bg-white
rounded-3xl
shadow-xl
p-10
max-w-md
w-full
text-center
"

>


<motion.div

animate={{
y:[0,-10,0]
}}

transition={{
duration:2,
repeat:Infinity
}}

className="
text-7xl
mb-6
"

>
📝
</motion.div>


<h1 className="
text-3xl
font-bold
text-blue-700
">

Online Exams

</h1>


<p className="
mt-4
text-gray-500
text-lg
">

Our online examination system is coming soon.

</p>



<motion.div

animate={{
scale:[1,1.05,1]
}}

transition={{
duration:1.5,
repeat:Infinity
}}

className="
mt-8
inline-block
bg-gradient-to-r
from-blue-600
to-purple-600
text-white
px-8
py-3
rounded-full
font-bold
"

>

🚀 Coming Soon

</motion.div>



<p className="
mt-6
text-sm
text-gray-400
">

Stay tuned for exciting features

</p>


</motion.div>


</div>

)

}