import axios from "axios";
import * as Carousel from "./Carousel.js";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY = "live_F7sMAYju6itWoksSPsbOWl9NOr3IEYAE68mE4FBsljoPOkFjXkJnVOxaRgdVGLlG";


/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using fetch().
 * - Create new <options> for each of these breeds, and append them to breedSelect.
 *  - Each option should have a value attribute equal to the id of the breed.
 *  - Each option should display text equal to the name of the breed.
 * This function should execute immediately.
 */
async function initialLoad() {
  try {
    // Use Axios to get a list of breeds from the cat API
    const response = await axios.get("https://api.thecatapi.com/v1/breeds");

    // Clear any existing options in the select element
    breedSelect.innerHTML = "";

    // Iterate through the response and create options for each breed
    response.data.forEach((breed) => {
      const option = document.createElement("option");
      option.value = breed.id;
      option.textContent = breed.name;
      breedSelect.appendChild(option);
    });

    // Call the event handler for breedSelect
    breedSelect.addEventListener("change", handleBreedSelect);
    // Initialize the carousel
    Carousel.init();
  } catch (error) {
    console.error("Error loading breeds:", error);
  }
}

/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using axios.
 * - For each object in the response array, create a new element for the carousel.
 * - Append each of these new elements to the carousel.
 * - Use the other data you have been given to create an informational section within the infoDump element.
 * - Each new selection should clear, re-populate, and restart the Carousel.
 */
async function handleBreedSelect() {
  const selectedBreedId = breedSelect.value;

  try {
    // Use Axios to get information about the selected breed
    const response = await axios.get(`https://api.thecatapi.com/v1/images/search?breed_ids=${selectedBreedId}`);

    // Clear the existing carousel
    Carousel.clear();

    // Iterate through the response and add images to the carousel
    response.data.forEach((imageData) => {
      const carouselItem = Carousel.createCarouselItem(imageData.url);
      Carousel.addToCarousel(carouselItem);
    });

    // Create an informational section within the infoDump element
    const breedInfo = response.data[0].breeds[0];
    infoDump.innerHTML = `
      <h2>${breedInfo.name}</h2>
      <p>Description: ${breedInfo.description}</p>
      <p>Life Span: ${breedInfo.life_span}</p>
      <p>Origin: ${breedInfo.origin}</p>
    `;
  } catch (error) {
    console.error("Error loading breed information:", error);
  }
}

// Call the initialLoad function to load breeds and initialize the carousel
initialLoad();

/**
 * 4. Change all of your fetch() functions to axios!
 * - axios has already been imported for you within index.js.
 * - If you've done everything correctly up to this point, this should be simple.
 * - If it is not simple, take a moment to re-evaluate your original code.
 * - Hint: Axios has the ability to set default headers. Use this to your advantage
 *   by setting a default header with your API key so that you do not have to
 *   send it manually with all of your requests! You can also set a default base URL!
 */
axios.defaults.headers.common["x-api-key"] = API_KEY;
axios.defaults.baseURL = "https://api.thecatapi.com/v1";

/**
 * 5. Add axios interceptors to log the time between request and response to the console.
 * - Hint: you already have access to code that does this!
 * - Add a console.log statement to indicate when requests begin.
 * - As an added challenge, try to do this on your own without referencing the lesson material.
 */
axios.interceptors.request.use((config) => {
  console.log("Request started at", new Date());
  return config;
});

axios.interceptors.response.use(
  (response) => {
    console.log("Response received at", new Date());
    return response;
  },
  (error) => {
    console.error("Response error at", new Date());
    return Promise.reject(error);
  }
);

/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 * - The progressBar element has already been created for you.
 *  - You need only to modify its "width" style property to align with the request progress.
 * - In your request interceptor, set the width of the progressBar element to 0%.
 *  - This is to reset the progress with each request.
 * - Research the axios onDownloadProgress config option.
 * - Create a function "updateProgress" that receives a ProgressEvent object.
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.
 * - console.log your ProgressEvent object within updateProgress, and familiarize yourself with its structure.
 *  - Update the progress of the request using the properties you are given.
 * - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
 *   once or twice per request to this API. This is still a concept worth familiarizing yourself
 *   with for future projects.
 */
axios.interceptors.request.use((config) => {
  progressBar.style.width = "0%";
  return config;
});

function updateProgress(event) {
  const percentCompleted = Math.round((event.loaded / event.total) * 100);
  progressBar.style.width = percentCompleted + "%";
}

axios.interceptors.request.use((config) => {
  config.onDownloadProgress = updateProgress;
  return config;
});

/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */
axios.interceptors.request.use((config) => {
  document.body.style.cursor = "progress";
  return config;
});

axios.interceptors.response.use(
  (response) => {
    document.body.style.cursor = "default";
    return response;
  },
  (error) => {
    document.body.style.cursor = "default";
    return Promise.reject(error);
  }
);

/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favorited,
 *   you delete that favorite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */
export async function favourite(imgId) {
  try {
    // Check if the image is already favorited
    const response = await axios.get(`/favourites`, {
      params: {
        image_id: imgId,
      },
    });

    if (response.data.length > 0) {
      // Image is already favorited, so delete the favorite
      await axios.delete(`/favourites/${response.data[0].id}`);
    } else {
      // Image is not favorited, so add it to favorites
      await axios.post(`/favourites`, { image_id: imgId });
    }
  } catch (error) {
    console.error("Error favoriting image:", error);
  }
}

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favorites from the cat API.
 * - Clear the carousel and display your favorites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */
getFavouritesBtn.addEventListener("click", getFavourites);

async function getFavourites() {
  try {
    // Use Axios to get all of your favorites from the cat API
    const response = await axios.get(`/favourites`);

    // Clear the existing carousel
    Carousel.clear();

    // Iterate through the response and add favorite images to the carousel
    response.data.forEach((favorite) => {
      const carouselItem = Carousel.createCarouselItem(favorite.image.url);
      Carousel.addToCarousel(carouselItem);
    });
  } catch (error) {
    console.error("Error getting favorites:", error);
  }
}

/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
