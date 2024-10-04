const routeForm = document.getElementById('route-form');
const destinationInput = document.getElementById('destination');
const getLocation = document.getElementById('get-location');

const map = L.map('map').setView([65.00849587940017, 25.494293018734233], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  subdomains: ['a', 'b', 'c']
}).addTo(map);

routeForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const destination = destinationInput.value.split(',').map(Number);

  if (destination.length !== 2 || isNaN(destination[0]) || isNaN(destination[1])) {
    alert('Please enter a valid destination latitude and longitude.');
    return;
  }

  // route fetch
  fetch(`https://router.project-osrm.org/route/v1/driving/${destination[1]},${destination[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`)
    .then(response => response.json())
    .then(data => {
      if (!data.routes || data.routes.length === 0) {
        alert('No route found.');
        return;
      }

      const route = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
      L.polyline(route, { color: 'blue' }).addTo(map);
      map.fitBounds(L.polyline(route).getBounds());
    })
    .catch(error => {
      alert('Error retrieving the route.');
      console.error(error);
    });
});

// user location
getLocation.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const start = [position.coords.latitude, position.coords.longitude];
      destinationInput.value = `${position.coords.latitude},${position.coords.longitude}`;
    }, error => {
      alert('Unable to retrieve your location.');
    });
  } else {
    alert('Geolocation is not supported by this browser.');
  }
});

document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', function() {
    const target = this.getAttribute('href').substring(1);

    // Hide all sections
    document.querySelectorAll('main > section').forEach(section => section.classList.add('hidden'));

    // Show related topics if not route-finder
    document.getElementById('related-topics').classList.toggle('hidden', target === 'route-finder');

    // Show the selected section
    const targetSection = document.getElementById(target);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }
  });
});