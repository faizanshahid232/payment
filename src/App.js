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
    "on_behalf_of_name": localStorage.getItem("firstName") + " " + localStorage.getItem("lastName")
  };
  
  const getProfiles = async () => {
    if(success_message == 'succeeded')
    {
      console.log("Quantity: "+ localStorage.getItem("quantity"));
      try {
        const fetchData  = await axios.post('https://cors-chi.vercel.app/api/cors-post', { json },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
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
          const fetchEmail  = await axios.post('https://cors-chi.vercel.app/api/cors-post-email', { mergedObj },
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
  localStorage.setItem("emailAddress", emailAddress);
  localStorage.setItem("resAddress", resAddress);
  localStorage.setItem("quantity", quantity);
  
  fetch("https://cors-chi.vercel.app/api/payment/create", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ items: totalAmount+ "00" }),
  })
    .then((res) => res.json())
    .then((data) => setClientSecret(data.clientSecret));
  setproceedPaymentPage(false);
};

const totalAmountCalculate = (quantity) => {
  quantity = quantity * 12;
  settotalAmount(quantity);
}
  return (
    <div className='bg-[#f2f2f2]'>
    <div className="container mx-auto p-8">
      <div className="w-full text-center text-4xl py-4">Checkout</div>
      <div className="flex flex-col md:flex-row">
      <div className="w-1/6"></div>
        
        <div className="w-full md:w-1/3">
        <div className="w-full max-w-sm px-2 pb-3 pt-2 bg-[#a8c62e] rounded overflow-hidden shadow-lg">
        <div className='text-center pb-4'>Billing address</div>
        {emailSendSucess ? (
          <div className='w-full font-medium text-white text-center text-lg bg-[#28a745] p-1 rounded-xl'>
            {emailSendSucess}
          </div>
        ) : ''}
        {proceedPaymentPage ? (
        <form onSubmit={handleClick}>
        <div className="block tracking-wide leading-relaxed font-extrabold text-3xl ml-4">Raw Carbon</div>
        <div className="font-medium text-lg ml-4">Offsetting sea freight</div>
        <div className="text-palette-primary font-medium py-4 px-1 text-2xl ml-4">$12 <span className='text-xl text-palette-primary font-medium'>/tons</span></div>
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
          <div className="flex flex-wrap mb-1 mt-5">
            <div className="w-full md:w-1/2 px-3 mb-1 md:mb-0">
              <label className="text-base mb-2">
                First Name
              </label>
              <input required className="appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-first-name" 
              value={firstName}
              onChange={e => setfirstName(e.target.value)}
              type="text" />
            </div>
            <div className="w-full md:w-1/2 px-3">
              <label className="text-base mb-2">
                Last Name
              </label>
              <input required className="appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-last-name" 
              value={lastName}
              onChange={e => setlastName(e.target.value)}
              type="text" />
            </div>
          </div>
          <div className="flex flex-wrap mb-1">
            <div className="w-full px-3">
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
            <div className="w-full px-3 mb-1 md:mb-0">
                <label className="text-base mb-2">
                  Address
                </label>
                <input required className="appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-city" 
                value={resAddress}
                onChange={e => setresAddress(e.target.value)}
                type="text" />
              </div>
            </div>
            <div className="md:w-full px-3 py-3">
            <button type='submit' className="mt-2 w-full shadow bg-[#1b1a1a] hover:bg-[#1b1a1a] focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded">
              Proceed For Payment
            </button>
            </div>
            </form>
          ) : (
            <div className="md:w-full px-3 py-3">
            {clientSecret && (
                  <Elements options={options} stripe={stripePromise} key={clientSecret}>
                    <CheckoutForm />
                  </Elements>
              )}
            </div>
          )}
          </div>
        </div>
        <div className="w-full md:w-1/3">
              <Swiper
                spaceBetween={30}
                centeredSlides={true}
                autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                }}
                navigation={false}
                modules={[Autoplay, Pagination, Navigation]}
                className="mySwiper"
            >
                <SwiperSlide>
                    <img
                        className="object-fill w-full"
                        src="https://thecarboncollectiveco.com/wp-content/uploads/2022/10/green-tea-plantations-in-india-2022-02-02-05-09-31-utc.jpg.webp"
                        alt="image slide 1"
                    />
                </SwiperSlide>
                <SwiperSlide>
                    <img
                        className="object-fill w-full"
                        src="https://thecarboncollectiveco.com/wp-content/uploads/2022/10/sand-dunes-in-desert-2021-09-04-04-43-13-utc.jpg.webp"
                        alt="image slide 2"
                    />
                </SwiperSlide>
                <SwiperSlide>
                    <img
                        className="object-fill w-full"
                        src="https://thecarboncollectiveco.com/wp-content/uploads/2022/10/beautiful-waterfall-in-the-valley-of-waterfalls-in-2021-08-26-23-05-40-utc-1-min.jpg.webp"
                        alt="image slide 3"
                    />
                </SwiperSlide>
            </Swiper>
        </div>
        <div className="w-1/6"></div>
      </div>
    </div>
    </div>
  );
}

export default App;
