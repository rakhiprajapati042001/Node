import axios from 'axios';
import React, { useState } from 'react'

//rafce function component


const SignUp = () => {

  const [user_Name, setUser_Name] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [data, setData] = useState({});
//call api;

const handleSubmit = async (e) => {
e.preventDefault()

  let formData = new FormData();
    formData.append("userName", user_Name);
    formData.append("userEmail", userEmail);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);
    console.log(formData,"formdata")

  console.log(confirmPassword)
  console.log(user_Name)

    try {
      let result = await axios.post('http://localhost:9000/signUP', formData);
      console.log(formData)
      console.log(result.data);
      setData(result.data);
      console.log(data)
    } catch (error) {
      console.error('There was an error fetching the data:', error);
      console.error('Error response:', error.response);
      if (error.response && error.response.status === 404) {
        console.error('Endpoint not found. Please check the URL.');
      }
    }
  }

//   useEffect(() => {
//     // fetchData();
//   }, []);

  return (

    <form
    onSubmit={handleSubmit}>
    <div className="mb-3"><div className="mb-3">
      <label for="userName1" className="form-label">userName</label>
      <input type="text" className="form-control" id="userName1"
      value={user_Name}
       onChange={(e)=>
        setUser_Name(e.target.value)
      }
      />
    </div>

      <label for="exampleInputEmail1" className="form-label">Email address</label>
      <input type="email" className="form-control"  id="exampleInputEmail1" aria-describedby="emailHelp"
      value={userEmail} 
      onChange={(e)=>
        setUserEmail(e.target.value)
      }/>
      <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
    </div>
    <div className="mb-3">
      <label for="exampleInputPassword1" className="form-label">Password</label>
      <input type="password" className="form-control" id="exampleInputPassword1"
      value={password}
       onChange={(e)=>
        setPassword(e.target.value)
      }/>
    </div>
    <div className="mb-3">
      <label for="confirmPassword1" className="form-label">Confirm Password</label>
      <input type="password" className="form-control" id="confirmPassword1"
      value={confirmPassword}
       onChange={(e)=>
        setConfirmPassword(e.target.value)
      }/>
    </div>
    
    <div className="mb-3 form-check">
      <input type="checkbox" className="form-check-input" id="exampleCheck1"/>
      <label className="form-check-label" for="exampleCheck1">Check me out</label>
    </div>
    <button type="submit" className="btn btn-primary" >Submit</button>
  </form>
  )
}

export default SignUp