import { createSlice } from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit";
const initialNotificationState = {
    notification: null
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState: initialNotificationState,
    reducers:{
        showNotification(state, action){
            state.notification = { 
                status: action.payload.status, 
                title: action.payload.title,
                message: action.payload.message,
            }
        },
        hideNotification(state){
            state.notification = null;
        }
    },
})

const initialUserDataState = {
    userData: {
        topArtists: {
            data: null,
            timeRange: 'short'
        },
        topTracks: {
            data: null,
            timeRange: 'short'
        },
        listeningHistory: {
            data: null
        },
        selectedConfig: 'topArtists'
    },
    timeRange: 'short', // make this range specific to each config
    getDataButtonVisibility: true,
};

const userDataSlice = createSlice({
    name: 'userData',
    initialState: initialUserDataState,
    reducers:{
        storeUserData(state, action){
            // console.log(action.payload)
            state.userData.topArtists.data = action.payload.topArtists;        
            state.userData.topTracks.data = action.payload.topTracks;        
            state.userData.listeningHistory.data = action.payload.listeningHistory;        
        },
        changeTimeRange(state, action){
            // console.log(action.payload);
            const {timeRange, config} = action.payload; 
            // console.log(state.userData.topArtists.timeRange)
            // console.log(timeRange, config)
            state.userData[config].timeRange = timeRange;
        },
        changeSelectedConfig(state, action){
            // console.log(action.payload)
            state.userData.selectedConfig = action.payload;
        },
        HideGetDataBtn(state){
            state.getDataButtonVisibility = false;
        }
    },
})



const store = configureStore({
    reducer: {
        notification: notificationSlice.reducer,
        userData: userDataSlice.reducer
    }
});

export default store;
export const notificationAction = notificationSlice.actions;
export const userDataAction = userDataSlice.actions;