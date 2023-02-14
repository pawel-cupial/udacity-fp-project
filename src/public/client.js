let store = Immutable.Map({
    apod: '',
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit', 'Perseverance']),
    selectedRover: ''
});

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (state, newState) => {
    store = state.merge(newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    // let { selectedRover, apod } = state
    if(!state.get('selectedRover')) {
        return `
        <header>
            <nav class="flex justify-between items-center container">
                <p>Mars Rovers</p>                
                <input type="checkbox" id="toggler">
                <ul class="nav-list flex">                    
                    ${generateLinks(state)}
                </ul>
                <div id="mobile-menu-trigger">                    
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </nav>
        </header>
        <main class="container">
            <div class="apod">
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(state.get('apod'))}                
            </div>
        </main>
        <footer></footer>
    `
    } else {
        return `
        <header>
            <nav class="flex justify-between items-center container">
                <p>Mars Rovers</p>
                <input type="checkbox" id="toggler">
                <ul class="nav-list flex">                    
                    ${generateLinks(state)}
                </ul>
                <div id="mobile-menu-trigger">                    
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </nav>
        </header>
        <main class="container">
            <h1 class="header"><b>${state.get('selectedRover').latest_photos[0].rover.name}</b></h1>
            <div class="rover-info">
                <p><b>Launch date:</b> ${state.get('selectedRover').latest_photos[0].rover.launch_date}</p>
                <p><b>Landing date:</b> ${state.get('selectedRover').latest_photos[0].rover.landing_date}</p>
                <p><b>Status:</b> ${state.get('selectedRover').latest_photos[0].rover.status}</p>
            </div>
            <div class="gallery">
                ${roverPhotos(state.get('selectedRover'))}
            </div>
        </main>
    `
    }
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})


// ------------------------------------------------------  COMPONENTS

const generateLinks = (state) => {
    return  state.get('rovers').map( item => generateLinksHtml(item)).join("")
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)

    if (!apod || photodate === today.getDate() ) {
        getImageOfTheDay(store)
    } if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else if (apod.image != undefined) {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    } else {
        return `<p>Something went wrong</p>`
    }
}

const roverPhotos = (rover) => {
    if(rover) {
        return rover.latest_photos.map((img) => 
        `
        <div class="gallery-image-wrapper flex">
            <img src="${img.img_src}" class="gallery-img" alt="Mars rover image">
            <p>taken: ${img.earth_date}</p>
        </div>
        `).join("")
    } else {
        return ``
    }
}

// ------------------------------------------------------ UTILS
const uppercase = (el) => {return el.toUpperCase()}
const generateLinksHtml = (el) => {
    return  `
        <li id=${el} onclick="getRoverInfo('${el.toLowerCase()}', store)">
            <a href="#">${uppercase(el)}</a>
        </li>
    `
}


// ------------------------------------------------------  API CALLS

//API call to get astronomy picture of the day 
const getImageOfTheDay = async (state) => {
    let { apod } = state;
    const response = await fetch(`http://localhost:3000/apod`)
    apod = await response.json()
    const newState = store.set('apod', apod);
    updateStore(store, newState)
    return apod;
}

const getRoverInfo = async (roverName, state) => {
    let { selectedRover } = state
    const response = await fetch(`http://localhost:3000/rovers/${roverName}`)
    selectedRover = await response.json()
    const newState = store.set('selectedRover', selectedRover);
    updateStore(store, newState)
    return selectedRover
}
