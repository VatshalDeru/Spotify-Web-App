export default function UserData({ selectedConfig, timeRange, userData }){

    let content = null;

    if (selectedConfig === 'listeningHistory'){
        content = userData[selectedConfig].data.map((item, index) => {
            return (
                <li key={index}>
                    <p>{item.track_name}</p>
                    <p>{item.artists}</p>
                    <p>{item.date}</p>
                    <a href={item.url} target="_blank" rel="noopener noreferrer"><img src={item.image} alt="" /></a>
                </li>
            )
        })
    } else { // sets up the content for the top artist/track mode
        content = userData[selectedConfig].data[timeRange].map((item, index) => {
            return (
                <li key={index}>
                    <p>{index+1}.</p>
                    <p>{item.name}</p>
                    <a href={item.url} target="_blank" rel="noopener noreferrer"><img src={item.image} alt="" /></a>
                </li>
            )
        })
    }

    let timeString = '';

    if(timeRange === 'short') timeString = '4 Weeks'
    else if(timeRange === 'medium') timeString = '6 Months'
    else if(timeRange === 'long') timeString = '12 Months'

    return (
        <div className="userDataContainer">
        <p>Your top {selectedConfig} for the past {timeString}</p>
            <ul style={{listStyle: "none"}}>
                {content}
            </ul>
        </div>
    );
}
