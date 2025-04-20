import { useSelector, useDispatch } from "react-redux"

import UserData from "./UserData";

import { userDataAction } from "../store"


export default function UserDataMenu(){
    const { selectedConfig } = useSelector(state => state.userData.userData);
    const { timeRange } = useSelector(state => state.userData.userData[selectedConfig])
    const { userData } = useSelector(state => state.userData);
    // if(userData[selectedConfig].data) {
    //     console.log(userData[selectedConfig].data[timeRange])
    // }
    // console.log(selectedConfig)
    // console.log(timeRange)
    // console.log(userData)

    const dispatch = useDispatch();
    if(!userData[selectedConfig].data){
        return (
            <></>
        )
    }
    // console.log(userData.long)

    const dispatchConfigHandler = (event) =>{
        // console.log(event.target.value)
        const payload = {
            config: selectedConfig,
            timeRange: event.target.value
        }
        dispatch(userDataAction.changeTimeRange(payload));
    }

    return(
        <div className="userDataWrapper">
            <div className="optionsContainer">
                <div className="categoryBtns">
                    <button
                        value={'topArtists'} 
                        className = {selectedConfig === 'topArtists' ? 'selected' : ''} 
                        onClick={(event) => dispatch(userDataAction.changeSelectedConfig(event.target.value))}
                    >
                        Top Artist
                    </button>
                    <button 
                        value={'topTracks'} 
                        className = {selectedConfig === 'topTracks' ? 'selected' : ''} 
                        onClick={(event) => dispatch(userDataAction.changeSelectedConfig(event.target.value))}
                    >
                        Top Tracks
                    </button>
                    <button 
                        value={'listeningHistory'} 
                        className = {selectedConfig === 'listeningHistory' ? 'selected' : ''} 
                        onClick={(event) => dispatch(userDataAction.changeSelectedConfig(event.target.value))}
                    >
                        Listening History
                    </button>
                </div>
                {selectedConfig !== 'listeningHistory' &&
                    <div className="timeBtns">
                        <button 
                            value={'short'} 
                            className = {timeRange === 'short' ? 'selected' : ''} 
                            onClick={(event) => dispatchConfigHandler(event)}
                        >
                            Last 4 Weeks
                        </button>
                        <button 
                            value={'medium'} 
                            className = {timeRange === 'medium' ? 'selected' : ''} 
                            onClick={(event) => dispatchConfigHandler(event)}
                        >
                            Last 6 Months
                        </button>
                        <button 
                            value={'long'} 
                            className = {timeRange === 'long' ? 'selected' : ''} 
                            onClick={(event) => dispatchConfigHandler(event)}
                        >
                            Last 12 Months
                        </button>
                    </div>
                }

            </div>
            <UserData selectedConfig={selectedConfig} timeRange={timeRange} userData={userData}/>

        </div>
    )
}