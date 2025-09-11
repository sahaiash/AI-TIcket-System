import React, { useState , useEffect} from 'react'
import { useNavigate } from 'react-router-dom'



function CheckAuth({children,protectedRoute}) {
  const navigate= useNavigate();
  const [isLoading,setLoading]=useState(true);
  useEffect(()=>{
    const token=localStorage.getItem("token");

    if(protectedRoute){
      if(!token){
        navigate("/login");
      }else{
        setLoading(false);
      }
    }else{
      if(token){
        navigate("/")
      }else{
        setLoading(false);
      }
    }


  },[navigate,protectedRoute])
    if(isLoading){
      return <div>Loading...</div>
    }
    return children;
  
}

export default CheckAuth
