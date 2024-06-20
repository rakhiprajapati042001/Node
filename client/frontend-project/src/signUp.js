import axios from 'axios';
import React, { useState } from 'react'

const SignUp = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const onSubmit=async(e)=>{
    e.preventDefault()
    const formData = {
      userName,
      userEmail,
      password,
      confirmPassword,
    };

    try{
      const response = await axios.post('http://localhost:9000/signUp', formData)

      console.log('Form Data:', formData);
      console.log('Response Data:', response.data);
    }catch(error){
console.log(error)
    }

  }

  return (
    <form
    onSubmit={onSubmit}>
    <div class="mb-3">
      <label for="exampleInputName1" class="form-label">UserName</label>
      <input type="name" class="form-control" id="nameInputEmail1" aria-describedby="nameHelp"  onChange={(e)=>setUserName(e.target.value)}/>
    </div>
    <div class="mb-3">
      <label for="exampleInputEmail1" class="form-label">UserEmail</label>
      <input type="email" class="form-control" id="exampleInputEmail1"  onChange={(e)=>setUserEmail(e.target.value)}/>
    </div>
    <div class="mb-3">
      <label for="exampleInputPassword1" class="form-label">Password</label>
      <input type="password" class="form-control" id="exampleInputPassword1" value={password} onChange={(e)=>setPassword(e.target.value)}/>
    </div>
    <div class="mb-3">
      <label for="exampleInputCPassword1" class="form-label">confirm Password</label>
      <input type="cpassword" class="form-control" id="exampleInputCPassword1" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)}/>
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
  </form>
  )
}

export default SignUp