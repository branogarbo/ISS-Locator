let featData = ["latitude","longitude","altitude","velocity"]
      featData.forEach(data => eval(`let ${data};`));

      let isOverlay = true;
      let follow = true;
      let firstCall = true;

      let apiURL = "https://api.wheretheiss.at/v1/satellites/25544";
      
      let issIcon = L.icon({
        iconUrl:'/images/issIcon.svg',
        iconSize:[100,100]
      });
      
      let marker = L.marker([0,0],{icon:issIcon});
      let mymap = L.map('issMap',{zoomControl:false}).setView([0,0],1);
      
      let earthNight = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
        attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
        bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
        minZoom: 1,
        maxZoom: 8,
        format: 'jpg',
        time: '',
        tilematrixset: 'GoogleMapsCompatible_Level'
      });
      let earthDay = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      });
      let earthTopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      });
      let overlay = L.tileLayer('https://maps.heigit.org/openmapsurfer/tiles/hybrid/webmercator/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> | Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });

      let mapSelection = [earthDay,earthNight,earthTopo];
      let mapIndex = 0;

      mapSelection[mapIndex].addTo(mymap);
      marker.addTo(mymap);
      overlay.addTo(mymap);
      
      getISS();
      setInterval(getISS,1000);
      
      document.onkeypress = event => {
        switch (event.key) {
          case 'f': follow = !follow; break;
          case 'c': centerISS(); break;
          case 'q': mymap.zoomOut(1); break;
          case 'w': mymap.zoomIn(1); break;
          case 's': switchMap(); break;
          case 'o': toggleOverlay(); break;
        }
      }
      
      async function getISS() {
        let res = await fetch(apiURL);
        let data = await res.json();
        ({latitude,longitude,altitude,velocity} = data);
        
        if (follow) {
          mymap.setView([latitude,longitude]);
        }
        
        if (firstCall) {
          centerISS();
          firstCall = false;
        }
        
        marker.setLatLng([latitude,longitude]);

        for (i=0; i<featData.length; i++) {
          document.getElementsByClassName('dataHTML')[i].innerHTML = eval(featData[i]).toFixed(2);
        }
      }

      function switchMap() {
        mapSelection[mapIndex].remove();
        overlay.remove();
        if (mapIndex == mapSelection.length-1) {
          mapIndex = 0;
        }
        else {
          mapIndex++;
        }
        mapSelection[mapIndex].addTo(mymap);
        if (isOverlay) {overlay.addTo(mymap)};
      };
      
      function toggleOverlay() {
        if (isOverlay) {
          overlay.remove();
        }
        else {
          overlay.addTo(mymap);
        }
        isOverlay = !isOverlay;
      }

      let centerISS = ()=> mymap.setView([latitude,longitude],5);