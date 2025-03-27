// Constantes globales
const NASA_APOD_URL = "https://api.nasa.gov/planetary/apod";
const nasaApiKey = process.env.NASA_API_KEY;
const googleTranslateApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

// Variables globales para elementos del DOM
let imageContainer;
let changeBtn;
let translateBtn;
let currentImage = null;

// Función isValidDate
function isValidDate(date) {
  console.log("Validando fecha:", date);
  const checkDate = new Date(date);
  const startDate = new Date("1995-06-16");
  const endDate = new Date();
  const isValid = checkDate >= startDate && checkDate <= endDate;
  console.log("Fecha válida:", isValid);
  return isValid;
}

// Función para traducir texto usando Google Cloud Translation API
async function translateText(text) {
  console.log("Iniciando traducción de:", text);
  const url = `https://translation.googleapis.com/language/translate/v2?key=${googleTranslateApiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: "en",
      target: "es"
    })
  });
  console.log("Respuesta de la API:", response);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al traducir: ${response.status} ${response.statusText} - ${errorText}`);
  }
  const data = await response.json();
  console.log("Datos de la traducción:", data);
  const translatedText = data.data.translations[0].translatedText;
  console.log("Texto traducido:", translatedText);
  return translatedText;
}


// Función para renderizar la imagen
function renderImage() {
  try {
    console.log("Renderizando imagen...");
    imageContainer.innerHTML = "";
    if (!currentImage || !currentImage.url) {
      throw new Error("Datos de imagen no válidos");
    }
    const { title, explanation, url, date, media_type } = currentImage;
    console.log("Datos de la imagen:", { title, explanation, url, date, media_type });
    const carouselContent = document.createElement("div");
    carouselContent.classList.add("carousel-content");
    if (media_type === "image") {
      const img = document.createElement("img");
      img.src = url;
      img.alt = title;
      img.loading = "lazy";
      carouselContent.appendChild(img);
    } else if (media_type === "video") {
      const iframe = document.createElement("iframe");
      iframe.src = url;
      iframe.title = title;
      iframe.width = "100%";
      iframe.height = "auto";
      iframe.allowFullscreen = true;
      carouselContent.appendChild(iframe);
    } else {
      throw new Error("Tipo de medio no soportado");
    }

    const caption = document.createElement("div");
    caption.classList.add("caption");
    const titleElement = document.createElement("h2");
    titleElement.textContent = title;
    titleElement.style.margin = "0";
    caption.appendChild(titleElement);
    const dateContainer = document.createElement("div"); 
    dateContainer.classList.add("date-container"); 
    const dateParagraph = document.createElement("p");
    dateParagraph.innerHTML = `<strong>Fecha:</strong> ${date}`;
    dateContainer.appendChild(dateParagraph);
    const translateBtn = document.createElement("button");
    translateBtn.id = "translate-btn";
    translateBtn.classList.add("translate-btn");
    translateBtn.textContent = "Traducir";
    translateBtn.addEventListener("click", async () => {
      try {
        console.log("Botón Traducir clickeado");
        const translatedTitle = await translateText(title);
        const translatedExplanation = await translateText(explanation);
        titleElement.textContent = translatedTitle;
        explanationElement.textContent = translatedExplanation;
        console.log("Traducción completada");
      } catch (error) {
        console.error("Error al traducir:", error);
        alert("Error al traducir el contenido. Por favor, intenta de nuevo más tarde.");
      }
    });
    dateContainer.appendChild(translateBtn); 
    caption.appendChild(dateContainer);
    const explanationElement = document.createElement("p");
    explanationElement.textContent = explanation;
    caption.appendChild(explanationElement);
    imageContainer.appendChild(carouselContent);
    imageContainer.appendChild(caption);
  } catch (error) {
    console.error("Error al renderizar la imagen:", error);
    imageContainer.innerHTML = `<p>Error al mostrar la imagen: ${error.message}</p>`;
  }
}

// Función para cargar la imagen
async function loadImage(isInitialLoad = false) {
  try {
    if (isInitialLoad) {
      console.log("Iniciando carga de la imagen del día...");
      imageContainer.innerHTML = '<div class="loading">Cargando imagen del día...</div>';
      const response = await fetch(`${NASA_APOD_URL}?api_key=${nasaApiKey}`);
      console.log("Respuesta de la API NASA:", response);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al cargar la imagen del día: ${response.status} ${response.statusText} - ${errorText}`);
      }
      const data = await response.json();
      console.log("Imagen del día cargada:", data);
      currentImage = data;
      renderImage();
    } else {
      console.log("Iniciando carga de imagen aleatoria...");
      imageContainer.innerHTML = '<div class="loading">Cargando imagen aleatoria...</div>';
      const startDate = new Date("1995-06-16"); 
      const endDate = new Date(); 
      let attempts = 0;
      const maxAttempts = 10;
      let formattedDate;
      do {
        const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        formattedDate = randomDate.toISOString().split('T')[0];
        attempts++;
      } while (attempts < maxAttempts && !isValidDate(formattedDate));
      if (attempts >= maxAttempts) {
        throw new Error("No se pudo encontrar una fecha válida después de varios intentos");
      }
      const response = await fetch(`${NASA_APOD_URL}?api_key=${nasaApiKey}&date=${formattedDate}`);
      console.log("Respuesta de la API NASA:", response);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al cargar la imagen aleatoria: ${response.status} ${response.statusText} - ${errorText}`);
      }
      const data = await response.json();
      console.log("Imagen aleatoria cargada:", data);
      currentImage = data;
      renderImage();
    }
  } catch (error) {
    console.error("Error al cargar la imagen:", error);
    imageContainer.innerHTML = `<p>Error al cargar la imagen: ${error.message}</p>`;
  }
}

// Inicialización cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded");
  imageContainer = document.getElementById("image-container");
  changeBtn = document.getElementById("change-btn");
  if (!imageContainer || !changeBtn) {
    console.error("No se pudieron encontrar elementos esenciales del DOM");
    alert("Error: No se pudieron encontrar elementos esenciales en la página. Verifica que los IDs 'image-container' y 'change-btn' existan.");
    return;
  }
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");
  if (changeBtn.parentNode) {
    changeBtn.parentNode.insertBefore(buttonContainer, changeBtn);
    buttonContainer.appendChild(changeBtn);
  }
  console.log("Evento click en changeBtn");
  changeBtn.addEventListener("click", () => loadImage(false));
  loadImage(true);
});
