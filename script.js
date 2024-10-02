// Get form elements
const form = document.getElementById('route-form');
const startInput = document.getElementById('start');
const endInput = document.getElementById('end');
const getLocationButton = document.getElementById('get-location');

// OSM Map
const map = L.map('map').setView([65.00849587940017, 25.494293018734233], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  subdomains: ['a', 'b', 'c']
}).addTo(map);


// Handle form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const start = startInput.value.split(',').map(Number);
  const end = endInput.value.split(',').map(Number);

  if (end.length !== 2 || isNaN(end[0]) || isNaN(end[1])) {
    alert('Please enter a valid destination latitude and longitude.');
    return;
  }

  // Fetch the route
  fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`)
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

// Get user's current location
getLocationButton.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      endInput.value = `${latitude},${longitude}`;
    }, error => {
      alert('Unable to retrieve your location.');
    });
  } else {
    alert('Geolocation is not supported by this browser.');
  }
});

// Show/hide sections
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', function() {
    const target = this.getAttribute('href').substring(1);
    
    // Hide all sections
    document.querySelectorAll('main > section').forEach(section => {
      section.style.display = 'none';
    });

    // Show related topics section unless it's the route-finder
    if (target !== 'route-finder') {
      document.getElementById('related-topics').style.display = 'block';
    } else {
      document.getElementById('related-topics').style.display = 'none';
    }

    // Show the selected section
    document.getElementById(target).style.display = 'block';
  });
});

// Show route-finder section when link is clicked
document.getElementById('route-finder-link').addEventListener('click', function() {
  // Hide all sections except for the route-finder
  document.querySelectorAll('main > section').forEach(section => {
    section.style.display = 'none';
  });

  // Hide the related topics section when on Route Finder
  document.getElementById('related-topics').style.display = 'none';

  // Show the route-finder section
  document.getElementById('route-finder').style.display = 'block';
});