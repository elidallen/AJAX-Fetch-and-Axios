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
const API_KEY =
  "live_F7sMAYju6itWoksSPsbOWl9NOr3IEYAE68mE4FBsljoPOkFjXkJnVOxaRgdVGLlG";

axios.defaults.headers.common["x-api-key"] = API_KEY;
axios.defaults.baseURL = "https://api.thecatapi.com/v1";

axios.interceptors.request.use((config) => {
  console.log("Request started at", new Date());
  progressBar.style.width = "0%";
  document.body.style.cursor = "progress";
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

axios.interceptors.response.use(
  (response) => {
    console.log("Response received at", new Date());
    document.body.style.cursor = "default";
    return response;
  },
  (error) => {
    console.error("Response error at", new Date());
    document.body.style.cursor = "default";
    return Promise.reject(error);
  }
);

async function initialLoad() {
  try {
    const response = await axios.get("/breeds");

    breedSelect.innerHTML = "";

    response.data.forEach((breed) => {
      const option = document.createElement("option");
      option.value = breed.id;
      option.textContent = breed.name;
      breedSelect.appendChild(option);
    });

    breedSelect.addEventListener("change", handleBreedSelect);
    Carousel.start();
  } catch (error) {
    console.error("Error loading breeds:", error);
  }
}

async function handleBreedSelect() {
  const selectedBreedId = breedSelect.value;

  try {
    const response = await axios.get(
      `/images/search?breed_id=${selectedBreedId}`
    );

    Carousel.clear();

    response.data.forEach((imageData) => {
      const carouselItem = Carousel.createCarouselItem(
        imageData.url,
        imageData.id
      );
      Carousel.appendCarousel(carouselItem);
    });

    if (response.data[0]?.breeds && response.data[0].breeds.length > 0) {
      const breedInfo = response.data[0].breeds[0];
      infoDump.innerHTML = `
        <h2>${breedInfo.name}</h2>
        <p>Description: ${breedInfo.description}</p>
        <p>Life Span: ${breedInfo.life_span}</p>
        <p>Origin: ${breedInfo.origin}</p>
      `;
    } else {
      infoDump.innerHTML = "No breed information available.";
    }
  } catch (error) {
    console.error("Error loading breed information:", error);
  }
}
async function getFavourites() {
  try {
    const response = await axios.get("/favourites");

    Carousel.clear();

    response.data.forEach((favorite) => {
      const carouselItem = Carousel.createCarouselItem(
        favorite.image.url,
        favorite.image.id
      );
      Carousel.appendCarousel(carouselItem);
    });
  } catch (error) {
    console.error("Error getting favorites:", error);
  }
}

getFavouritesBtn.addEventListener("click", getFavourites);

export async function favourite(imgId) {
  try {
    const response = await axios.get(`/favourites`, {
      params: {
        image_id: imgId
      }
    });

    if (response.data.length > 0) {
      await axios.delete(`/favourites/${response.data[0].id}`);
    } else {
      await axios.post(`/favourites`, { image_id: imgId });
    }
  } catch (error) {
    console.error("Error favoriting image:", error);
  }
}

initialLoad();