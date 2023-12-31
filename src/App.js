import React, {useState, useEffect} from 'react';
import './App.css';
import axios from 'axios';

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import CheckoutForm from "./CheckoutForm";
// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe("pk_test_51NOz1fIi4beyPjruUwHVsLWz5LE7PVZfIpiYIGjPYElEHisf5iMZdQAcmosFq8lK9mjpbPb98z8XR3XEuj9JuCUR00NwmFaPy5");

function App() {
  const [post, setPost] = useState([]);
  const [successFirstAPI, setsuccessFirstAPI] = useState([]);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [totalAmount, settotalAmount] = useState(12);
  const [emailSendSucess, setemailSendSucess] = useState('');
  const [clientSecret, setClientSecret] = useState("");
  const [proceedPaymentPage, setproceedPaymentPage] = useState(true);
  const [firstName, setfirstName] = useState('');
  const [lastName, setlastName] = useState('');
  const [emailAddress, setemailAddress] = useState('');
  const [companyName, setcompanyName] = useState('');
  const [resAddress, setresAddress] = useState('');
  const [success_message, setsuccess_message] = useState('');

  useEffect(() => {
    getProfiles2();
  },[successFirstAPI]);

  useEffect(() => {
    getProfiles()
  }, [success_message]);

  useEffect(() => {
    totalAmountCalculate(quantity)
  }, [quantity]);

  useEffect(() => {
    setsuccess_message(new URLSearchParams(window.location.search).get(
      "redirect_status",
    ));
  }, []);

  /*const paymenttest = async() => {
    await axios.post('https://coreservices.vercel.app/create-payment-intent', {items: totalAmount+ "00"}, {
      headers: { 
      "Content-Type": "application/x-www-form-urlencoded"
    }  
    }).then((data) => console.log("Data is: "+data));
  }*/
  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };
  const json = { 
        "calculator_id": "SCBRawCarbon_DT34",
        "item_description": "Offsetting sea freight",
        "carbon_tons": localStorage.getItem("quantity"),
        "quantity": "1",
   };
   const json2 = {
    "consumer_email": localStorage.getItem("emailAddress"),
    "on_behalf_of_name": firstName && lastName ? localStorage.getItem("firstName") + " " + localStorage.getItem("lastName") : localStorage.getItem("companyName")
  };
  
  const getProfiles = async () => {
    if(success_message == 'succeeded')
    {
      console.log("Quantity: "+ localStorage.getItem("quantity"));
      try {
        const fetchData  = await axios.post('https://coreservices.vercel.app/cors-post', { json },
        {
          headers: {
            'Content-Type': 'application/json'
            }
        });
        console.log(fetchData.data.data);
        console.log("second one");
        console.log(fetchData.data);
        setPost(fetchData.data.data);
        setsuccessFirstAPI(fetchData.data);
      } catch(error) {
        setError(error);
      }
      //success_message = '';
      console.log("success meaasge after first api null: "+success_message);
    }
  }

  const getProfiles2 = async () => {
      try {
        const mergedObj = {...post,...json2};
        console.log("email");
        if(JSON.stringify(successFirstAPI.success)) {
          console.log("email send one time only");
          const fetchEmail  = await axios.post('https://coreservices.vercel.app/cors-post-email', { mergedObj },
          {
            headers: {
              'Content-Type': 'application/json'
              }
          });
          setemailSendSucess(fetchEmail.data.message);
          setsuccessFirstAPI([]);
          console.log("success message null after email: "+ JSON.stringify(successFirstAPI.success));
        }
      } catch(error) {
        setError(error);
      }
}
  
const handleClick = () => {
  localStorage.setItem("firstName", firstName);
  localStorage.setItem("lastName", lastName);
  localStorage.setItem("companyName", companyName);
  localStorage.setItem("emailAddress", emailAddress);
  localStorage.setItem("resAddress", resAddress);
  localStorage.setItem("quantity", quantity);

  fetch("https://coreservices.vercel.app/create-payment-intent", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json"},
    body: JSON.stringify({"items": totalAmount+ "00"}),
  })
    .then((res) => res.json())
    .then((data) => setClientSecret(data.clientSecret));
    //paymenttest();
    setproceedPaymentPage(false);
};

const totalAmountCalculate = (quantity) => {
  quantity = quantity * 12;
  settotalAmount(quantity);
}
  return (
    <div className='bg-[#f2f2f2]'>
    <div className="container mx-auto p-8">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4">
        <div className="w-full max-w-sm px-3 pb-3 pt-2 bg-[#a8c62e] rounded overflow-hidden shadow-lg">
        <div className='text-center pb-4'>Billing address</div>
        {emailSendSucess ? (
          <div className='w-full font-medium text-white text-center text-lg bg-[#28a745] p-1 rounded-xl'>
            Your transaction has been approved!<br></br>
            <p className='font-medium text-sm'>You will receive a payment receipt shortly and (if you opted for it) a verified emission reduction certificate.</p>
          </div>
        ) : ''}
        {proceedPaymentPage ? (
        <form onSubmit={handleClick}>
        <div className="block tracking-wide leading-relaxed font-extrabold text-3xl ml-4">Carbon Offset</div>
        <div className="text-palette-primary font-medium py-4 px-1 text-2xl ml-4">$12 <span className='text-xl text-palette-primary font-medium'>/ton</span></div>
        <div className='w-full ml-4'>
          <div className='flex justify-start space-x-2 w-full'>
            <div className='flex flex-col items-start space-y-1 flex-grow-0'>
              <div className="text-base">Qty</div>
              <input className="w-16 appearance-none block text-gray-700 border border-gray-200 rounded py-2 px-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                type="number" />
            </div>
            <div className='flex flex-col items-start space-y-1 space-x-4 flex-grow-0'>
              <div className="text-base ml-5">Total Amount</div>
              <div className='font-medium text-lg pt-1'>
                {"$12 x "+ quantity + " = $" +totalAmount}
              </div>
            </div>
          </div>
        </div>
          <div className="flex flex-wrap mb-1">
            <div className="w-11/12 px-3">
              <label className="text-base mb-2">
                First Name
              </label>
              <input className={companyName ? "pointer-events-none bg-gray-300 appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" : "appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"} id="grid-first-name" 
              value={firstName}
              onChange={e => setfirstName(e.target.value)}
              type="text" />
            </div>
            </div>
            <div className="flex flex-wrap mb-1">
            <div className="w-11/12 px-3">
              <label className="text-base mb-2">
                Last Name
              </label>
              <input className={companyName ? "pointer-events-none bg-gray-300 appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" : "appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"} id="grid-last-name" 
              value={lastName}
              onChange={e => setlastName(e.target.value)}
              type="text" />
            </div>
          </div>
          <div className="flex flex-wrap mb-1">
            <div className="w-11/12 px-3">
              <label className="text-base mb-2">
                Company
              </label>
              <input className={firstName && lastName ? "pointer-events-none bg-gray-300 appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" : "appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"} id="grid-company" 
              value={companyName}
              onChange={e => setcompanyName(e.target.value)}
              type="text" />
            </div>
          </div>
          <div className="flex flex-wrap mb-1">
            <div className="w-11/12 px-3">
              <label className="text-base mb-2">
                Email
              </label>
              <input required className="appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-email" 
              value={emailAddress}
              onChange={e => setemailAddress(e.target.value)}
              type="email" />
            </div>
          </div>
          <div className="flex flex-wrap mb-1">
            <div className="w-11/12 px-3 mb-1 md:mb-0">
                <label className="text-base mb-2">
                  Address
                </label>
                <input required className="appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-city" 
                value={resAddress}
                onChange={e => setresAddress(e.target.value)}
                type="text" />
              </div>
              <div className="w-full px-3 mt-2 mb-1 md:mb-0">
              <input
                  className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-primary checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-primary dark:checked:after:bg-primary dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
                  type="checkbox"
                  role="switch"
                  checked="enable"
                  id="flexSwitchCheckDefault" readOnly />
              <label
                  className="inline-block pl-[0.15rem] hover:cursor-pointer"
                  htmlFor="flexSwitchCheckDefault"
              >Email emission reduction certificate</label>
              </div>
            </div>
            <div className="w-11/12 px-3 py-3">
            <button type='submit' className="mt-2 w-full shadow bg-[#1b1a1a] hover:bg-[#1b1a1a] focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded">
              Proceed For Payment
            </button>
            </div>
            </form>
          ) : (
            <div className="w-11/12 px-3 py-3">
            {clientSecret && (
                  <Elements options={options} stripe={stripePromise} key={clientSecret}>
                    <CheckoutForm />
                  </Elements>
              )}
            </div>
          )}
          </div>
        </div>
        <div className="w-1/6"></div>
      </div>
    </div>
    </div>
  );
}

export default App;
