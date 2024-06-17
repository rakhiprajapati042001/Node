import React from 'react'

//rafce function component

const SignUp = () => {

//call api

// const fetchData = async () => {
//     try {
//       let result = await axios.post('http://localhost:9240/default_kyc_checkbox');
//       console.log(result.data.result);
//       setData(result.data.result);
//       console.log(data)
//     } catch (error) {
//       console.error('There was an error fetching the data:', error);
//       console.error('Error response:', error.response);
//       if (error.response && error.response.status === 404) {
//         console.error('Endpoint not found. Please check the URL.');
//       }
//     }
//   }

//   useEffect(() => {
//     // fetchData();
//   }, []);

  return (

    <form>
    <div className="mb-3">
      <label for="exampleInputEmail1" className="form-label">Email address</label>
      <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"/>
      <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
    </div>
    <div className="mb-3">
      <label for="exampleInputPassword1" className="form-label">Password</label>
      <input type="password" className="form-control" id="exampleInputPassword1"/>
    </div>
    <div className="mb-3">
      <label for="confirmPassword1" className="form-label">Confirm Password</label>
      <input type="password" className="form-control" id="confirmPassword1"/>
    </div>
    <div className="mb-3">
      <label for="userName" className="form-label">userName</label>
      <input type="text" className="form-control" id="userName"/>
    </div>
    <div className="mb-3 form-check">
      <input type="checkbox" className="form-check-input" id="exampleCheck1"/>
      <label className="form-check-label" for="exampleCheck1">Check me out</label>
    </div>
    <button type="submit" className="btn btn-primary">Submit</button>
  </form>
  )
}

export default SignUp