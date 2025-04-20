import express, { response } from 'express';
import bodyParser from 'body-parser';
import SpotifyWebApi from 'spotify-web-api-node';
import dotenv from 'dotenv';
import cors from 'cors';
import parser from 'any-date-parser';
import fetch from 'node-fetch'


dotenv.config();
const app = express();
const PORT = 3000;

app.use(cors({ origin:'http://localhost:5173'}));
 // Enable CORS
app.use(express.static('public'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

const scopes = ['playlist-read-private', 'user-read-recently-played', 'user-top-read' ];
const clientId = '31efb33b062d4da9a45cb8f69e7cf34d'
const clientSecret = '21c9d39137cb440b9898877d15d510e7';
// const userID = '31tqrlf27llzzbam6ixsw6a5xjvm';

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

spotifyApi.setCredentials({
    accessToken: '',
    refreshToken: '',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

let timersArr = [];
// console.log(timersArr)
// console.log(timeoutCollection)
app.get('/login', (req, res) => {
    const authURL = spotifyApi.createAuthorizeURL(scopes);

    res.json({URL : authURL})
})


let getTokens = async (authCode) => {
    try {
        const response = await spotifyApi.authorizationCodeGrant(authCode);
        const accessToken = response.body['access_token'];
        const refreshToken = response.body['refresh_token'];
        

        return [accessToken, refreshToken]
    } catch (error) {
        throw new Error('Error getting tokens.')
    }

};



let dateParser = (currDate) => {
    let date = (currDate.slice(0, 10)).replaceAll('-', '/');
    let time = currDate.slice(12, 16);

    return `${date} ${time}`
}

let timeouts = [];
app.get('/callback', async (req, res) => {
    const authCode = req.query.code;

    try {
        const [accessToken, refreshToken] = await getTokens(authCode);

        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);


        const timer = setTimeout(async () => {
            console.log('token has been refreshed')
            console.log(timeouts)
            timeouts = [];
            await refreshAccessToken();
        }, 3600000)
        timeouts.push(timer)

        console.log('loggedin')
        res.redirect('http://localhost:5173/')  
        } catch (error) {
            res.redirect('http://localhost:5173/');
            throw new Error('Error in callback');
        }
})

app.get('/userData', async (req, res) => {
    const response = await spotifyApi.getMyTopArtists(userID);
    const userData = response.body.items;

    const topArtists = userData.map(artist => {
        return {
            url: artist.href,
            image: artist.images[0],
            name: artist.name,
            followers: artist.followers.total,
            type: artist.type,
            popularity: artist.popularity,
        }
    })

    res.json(topArtists);
    // res.json(userData)
})


app.post('/submit', async (req, res) => {
    // console.log(req.body.userId)
    try {
        const userID = req.body.userId

        const accessToken = spotifyApi.getAccessToken();
    
        // direct https request to spotify api without the api
        const allRangeTopArtists = {
            long: null,
            medium: null,
            short: null,
        };
    
        // fetches top 20 top artist for the past year, 6months and 4 weeks
        for(const [key, value] of Object.entries(allRangeTopArtists)){
            try {
                const response = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${key}_term`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    },
                });
        
                if(!response.ok){
                    throw new Error(`Spotify API request failed: ${response.status} - ${response.statusText}`);
                }
                // console.log(response)
                const data = await response.json();
        
                // console.log(data)
                // allTimeTopArtists[key] = data.items;
                allRangeTopArtists[key] = data.items.map(artist => {
                    return {
                        url: artist.external_urls.spotify,
                        image: artist.images[0].url,
                        name: artist.name,
                        followers: artist.followers.total,
                        type: artist.type,
                        popularity: artist.popularity,
                    }
                });
                
            } catch (error) {
                throw new Error('error getting userData')
            }
        }
    
        const allRangeTopTracks = {
                long: null,
                medium: null,
                short: null,
        };
        
        // fetching top 20 top tracks for the past year, 6months and 4 weeks
        for(const [key, value] of Object.entries(allRangeTopTracks)){
            
            const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${key}_term`, {
                headers: {
                    'Authorization' : `Bearer ${accessToken}`
                }
            });
    
            const data = await response.json();
    
    
            // console.log(data.items)
            allRangeTopTracks[key] = data.items.map((track, index) => {
                // console.log(track.album.artists);
                const artists = [];
                track.album.artists.forEach(artist => {
                    artists.push(artist.name)
                });
    
                return {
                    name: track.name,
                    image: track.album.images[0].url,
                    artists: artists,
                }
            });
        };
    
        const listeningResponse = await spotifyApi.getMyRecentlyPlayedTracks();
        const listeningData = listeningResponse.body.items;
        console.log(listeningData[0].track.album)
        const formattedListeningData = listeningData.map(data => {
            const artists = [];
            data.track.artists.forEach(artist => artists.push(artist.name));
    
            const date = dateParser(data.played_at);
            return {
                track_name: data.track.name,
                artists: artists.join(', '),
                image: data.track.album.images[0].url,
                url: data.track.album.external_urls.spotify,
                date
            }
        })
        // console.log(allRangeTopTracks);
        // console.log(allRangeTopTracks.long);
        res.json({
            topArtists: allRangeTopArtists,
            topTracks: allRangeTopTracks,
            listeningHistory: formattedListeningData,
        });
    } catch (error) {
        throw new Error(error)
    }


    // try {
    //     const response = await spotifyApi.getMyTopArtists(userID);
    //     const userData = response.body.items;
    
    //     const topArtists = userData.map(artist => {
    //         return {
    //             url: artist.href,
    //             image: artist.images[0],
    //             name: artist.name,
    //             followers: artist.followers.total,
    //             type: artist.type,
    //             popularity: artist.popularity,
    //         }
    //     })
    
    //     console.log(topArtists)
    //     res.json(topArtists);
    // } catch (error) {
    //     throw new Error('Error getting userData: ', error)
    // }

})


app.get('/getTimers', async (req, res) => {
    res.json({ timers: timersArr.map((timer, index) => ({ id: index}))});
});

app.get('/accessToken', async (req, res) => {
    // console.log('here')
    const accessToken = spotifyApi.getAccessToken();

    // direct https request to spotify api without the api

    try {
        const response = await fetch('https://api.spotify.com/v1/me/top/artists?time_range=long_term', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
        });

        if(!response.ok){
            throw new Error(`Spotify API request failed: ${response.status} - ${response.statusText}`);
        }
        console.log(response)
        const data = await response.json();

        console.log(data)

    } catch (error) {
        throw new Error('error getting userData')
    }


})


//refrehs token stuff
let refreshAccessToken = async () => {
    try {
        const response = await spotifyApi.refreshAccessToken();
        const accessToken = response.body['access_token'];

        spotifyApi.setAccessToken(accessToken);
        console.log('access token refreshed successfully')
    } catch (error) {
        throw new Error('Error refreshing token: ', error)
    }
};

app.get('/refreshTokens', async (req, res) => {
    try{
        await refreshAccessToken();
    }catch(error){
        throw new Error(error)
    }
});

app.get('/clearTimeouts', async (req, res) => {
    timersArr.forEach(timeout => clearTimeout(timeout));
    timersArr = [];
    console.log('refreshed')
});


let client = null;

app.get('/status', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // req.on('close', ())
    client = res;

    req.on('close', () => {
        client = null;
    })
})
// Listen for termination signals

const shutdown = () =>{
    console.log('closing down server');
    console.log('the timeout has been cleared:', timeouts)
    clearTimeout(timeouts)
    if(client){
        client.write(`data: ${JSON.stringify({ status: "backend_stopped" })}\n\n`); 
    }
    setTimeout(() => process.exit(0), 500);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

app.listen(PORT, () => console.log(`running on port:${PORT}`));
