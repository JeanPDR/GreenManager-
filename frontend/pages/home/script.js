let map;
let markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -23.55052, lng: -46.633308 },
    zoom: 12,
  });
  loadPointsFromAPI();
}

function loadPointsFromAPI() {
  fetch("http://localhost:3000/api/pontos")
    .then((response) => response.json())
    .then((points) => {
      points.forEach((point) => {
        addMarkerToMap(point);
      });
    })
    .catch((error) => {
      console.error("Erro ao carregar pontos de coleta:", error);
    });
}

function addMarkerToMap(point) {
  const marker = new google.maps.Marker({
    position: { lat: point.lat, lng: point.lng },
    map,
    title: point.name,
  });
  markers.push(marker);
}

document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: data.address }, (results, status) => {
    if (status === "OK") {
      const location = results[0].geometry.location;
      data.lat = location.lat();
      data.lng = location.lng();

      fetch("http://localhost:3000/api/pontos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erro ao cadastrar ponto de coleta.");
          }
          return response.json();
        })
        .then((newPoint) => {
          addMarkerToMap(newPoint);
          loadPointsFromAPI();
          e.target.reset();
          document.getElementById("modal").classList.add("hidden");
        })
        .catch((error) => {
          console.error(error);
          alert("Não foi possível cadastrar o ponto de coleta.");
        });
    } else {
      alert("Endereço inválido. Verifique e tente novamente.");
    }
  });
});

document.getElementById("openModalBtn").addEventListener("click", () => {
  document.getElementById("modal").classList.remove("hidden");
});

document.getElementById("closeModalBtn").addEventListener("click", () => {
  document.getElementById("modal").classList.add("hidden");
});

document.getElementById("cancelModalBtn").addEventListener("click", () => {
  document.getElementById("modal").classList.add("hidden");
});

window.onload = initMap;
