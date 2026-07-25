import {useState} from "react";
function App()
{
  const [status,setStatus] = useState("");
  const handleFileChange = async (e)=>
  {
    const file = e.target.files[0];  
    const formdata = new FormData();

    formdata.append('rfpFile',file);
    const res = await fetch('http://localhost:5000/api/upload/pdf',{
      method:'POST',
      body:formdata
    });
    const data = await res.json();
    setStatus(`Uploaded: ${data.message}`);
  }

  return(
    <div>
     <input type="file" accept=".pdf" onChange={handleFileChange}/>
     <p>{status}</p>
    </div>
  )
}
export default App;