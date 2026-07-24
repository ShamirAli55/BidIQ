import {useEffect } from "react";
function App()
{
  useEffect(()=>{
     fetch("http://localhost:5000/api/auth/register")
     .then(res => res.json())
     .then(data => console.log(data.data))
  },[])

  return(
    <div>
     Data 
    </div>
  )
}
export default App;