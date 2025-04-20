import React from "react";
import { useSelector, useDispatch } from "react-redux";


import { notificationAction } from "../store";
import { userDataAction } from "../store";


export default function Form({ loggedIn }){
    const dispatch = useDispatch();
    const { getDataButtonVisibility } =  useSelector(state => state.userData)

    const submitFormHandler = async (event) => {
        event.preventDefault();
        dispatch(notificationAction.showNotification({
            status: "pending",
            title: "Pending!",
            message: "Data is being fetched...",
        }));
        try {
            const formData = new FormData(event.target);
            const userId = formData.get('userId')    
            
            const response = await fetch('http://localhost:3000/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'         
                },
                body: JSON.stringify({ userId }),
            });
            const userData = await response.json();
            
            dispatch(userDataAction.HideGetDataBtn());
            dispatch(userDataAction.storeUserData(userData));
            
            dispatch(notificationAction.showNotification({
                status: "success",
                title: "Success!",
                message: "Data Fetched Successfully",
            }));

            setTimeout(()=> {
                dispatch(notificationAction.hideNotification());
            }, 3000);

        } catch (error) {
            dispatch(notificationAction.showNotification({
                status: "error",
                title: "Failed!",
                message: "Failed to fetch data",
            }));
            throw new Error('error submitting form: ', error)
        }


    };

    if(!loggedIn){
        return <p>Please login</p>
    }

    if(getDataButtonVisibility){
        return (
            <form onSubmit={submitFormHandler}>
                <button type="submit">Get Started</button>
            </form>
        )
    }

}