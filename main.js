 function hidePhoto() {
        document.getElementById('photoBox').style.display = 'none';
    }

    function showPhoto() {

        document.getElementById("photo").src = bigImageSrc;
        document.getElementById('photoBox').style.display = 'block';
    }

    var bigImageSrc = '';

    mapboxgl.accessToken = 'pk.eyJ1IjoicGV0ZWhpbGxqbnIiLCJhIjoiY2swcjZtd3IxMDJjOTNjb3c1Z25wczQ3NyJ9.2Ut4kmGeVuvc7UUb-qezNw'
    var map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y', // style URL
        zoom: 14, // starting zoom
        pitch: 45,
        bearing: -112.73514940344154,
        center: [170.83682283801488, -45.41407759507942] // starting center
    });


    map.on('load', function() {
        map.addSource('rp_markers', {
            type: 'geojson',
            // Use a URL for the value for the `data` property.
            data: 'https://raw.githubusercontent.com/petehilljnr/katiki-portal/main/rp_markers.geojson'
        });

        map.addSource('puds', {
            type: 'geojson',
            // Use a URL for the value for the `data` property.
            data: 'https://raw.githubusercontent.com/petehilljnr/katiki-portal/main/puds.geojson'
        });

        map.addSource('uds', {
            type: 'geojson',
            // Use a URL for the value for the `data` property.
            data: 'https://raw.githubusercontent.com/petehilljnr/katiki-portal/main/uds.geojson'
        });

        map.addSource('photos', {
            type: 'geojson',
            // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
            // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
            data: 'https://raw.githubusercontent.com/petehilljnr/katiki-portal/main/photo_locations.geojson',
            cluster: true,
            clusterMaxZoom: 17, // Max zoom to cluster points on
            clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });

        map.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
        });

        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1 });

        map.addLayer({
            'id': 'rps-layer',
            'type': 'symbol',
            'source': 'rp_markers',
            'layout': {
                // These icons are a part of the Mapbox Light style.
                // To view all images available in a Mapbox style, open
                // the style in Mapbox Studio and click the "Images" tab.
                // To add a new image to the style at runtime see
                // https://docs.mapbox.com/mapbox-gl-js/example/add-image/
                'icon-image': '',
                'icon-allow-overlap': true,
                'text-field': ['get', 'rp'],
                'text-font': [
                    'Open Sans Bold',
                    'Arial Unicode MS Bold'
                ],
                'text-size': 11,
                'text-transform': 'uppercase',
                'text-letter-spacing': 0.05,
                'text-offset': [0, 0]
            },
            'paint': {
                'text-color': '#202',
                'text-halo-color': '#fff',
                'text-halo-width': 2
            }
        });

        map.addLayer({
            'id': 'puds-layer',
            'type': 'circle',
            'source': 'puds',
            'paint': {
                'circle-radius': 6,
                'circle-stroke-width': 1,
                'circle-color': 'orange',
                'circle-stroke-color': 'white'
            }
        });

        map.addLayer({
            'id': 'uds-layer',
            'type': 'circle',
            'source': 'uds',
            'paint': {
                'circle-radius': 9,
                'circle-stroke-width': 1,
                'circle-color': 'red',
                'circle-stroke-color': 'white'
            }
        });

        map.addLayer({
            'id': 'sky',
            'type': 'sky',
            'paint': {
                'sky-type': 'atmosphere',
                'sky-atmosphere-sun': [0.0, 0.0],
                'sky-atmosphere-sun-intensity': 15
            }
        });

        map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'photos',
            filter: ['has', 'point_count'],
            paint: {
                // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
                // with three steps to implement three types of circles:
                //   * Blue, 20px circles when point count is less than 100
                //   * Yellow, 30px circles when point count is between 100 and 750
                //   * Pink, 40px circles when point count is greater than or equal to 750
                'circle-color': '#11b4da',
                'circle-radius': 15
            }
        });

        map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'photos',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            }
        });

        map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'photos',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': '#11b4da',
                'circle-radius': 6,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff'
            }
        });

        map.on('click', 'uds-layer', function(e) {
            var coordinates = e.features[0].geometry.coordinates.slice();
            var rp = "01S-0635 / " + e.features[0].properties.rp + "m"
            var notes = e.features[0].properties.notes

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(
                    `
                    <strong>Uncontrolled Discharge Site</strong><br/>
                    <strong>${rp}</strong><br/>
                    <strong>Notes:</strong><br/>
                    ${notes}
                    `
                )
                .addTo(map);
        });

        map.on('click', 'puds-layer', function(e) {
            var coordinates = e.features[0].geometry.coordinates.slice();
            var rp = "01S-0635 / " + e.features[0].properties.rp + "m"
            var notes = e.features[0].properties.notes

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(
                    `
                    <strong>Possible Uncontrolled Discharge Site</strong><br/>
                    <strong>${rp}</strong><br/>
                    <strong>Notes:</strong><br/>
                    ${notes}
                    `
                )
                .addTo(map);
        });

        // inspect a cluster on click
        map.on('click', 'clusters', function(e) {
            console.log('clusters')
            var features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });
            var clusterId = features[0].properties.cluster_id;
            map.getSource('photos').getClusterExpansionZoom(
                clusterId,
                function(err, zoom) {
                    if (err) return;

                    map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom
                    });
                }
            );
        });

        map.on('click', 'unclustered-point', function(e) {

            var coordinates = e.features[0].geometry.coordinates.slice();
            var img = 'https://raw.githubusercontent.com/petehilljnr/katiki-portal/main/low/' + e.features[0].properties.img_path
            bigImageSrc = 'https://raw.githubusercontent.com/petehilljnr/katiki-portal/main/medium/' + e.features[0].properties.img_path
            var rp = e.features[0].properties.road + " / " + e.features[0].properties.location + "m"

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(
                    `
                    <strong>${rp}</strong><br/>
                    <img src="${img}" onclick="showPhoto();" />
                    `
                )
                .addTo(map);
        });

        map.on('mouseenter', 'clusters', function() {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'clusters', function() {
            map.getCanvas().style.cursor = '';
        });

        map.on('mouseenter', 'unclustered-point', function() {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'unclustered-point', function() {
            map.getCanvas().style.cursor = '';
        });

        map.on('mouseenter', 'uds-layer', function() {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'uds-layer', function() {
            map.getCanvas().style.cursor = '';
        });

        map.on('mouseenter', 'puds-layer', function() {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'puds-layer', function() {
            map.getCanvas().style.cursor = '';
        });


        map.loadImage('https://raw.githubusercontent.com/petehilljnr/katiki-portal/main/culvert.png',
            function(error, image) {
                if (error) throw error;

                map.addImage('culvert', image);

                map.addSource('culverts', {
                    type: 'geojson',
                    data: 'https://raw.githubusercontent.com/petehilljnr/katiki-portal/main/culverts.geojson'
                });

                map.addLayer({
                    'id': 'culverts-layer',
                    'type': 'symbol',
                    'source': 'culverts',
                    'layout': {
                        'icon-image': 'culvert',
                        "icon-size": ['interpolate', ['linear'],
                            ['zoom'], 10, 0.1, 15, 0.05
                        ]
                    }
                });

                map.on('mouseenter', 'culverts-layer', function() {
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', 'culverts-layer', function() {
                    map.getCanvas().style.cursor = '';
                });

                map.on('click', 'culverts-layer', function(e) {
                    var coordinates = e.features[0].geometry.coordinates.slice();
                    var rp = "01S-0635 / " + e.features[0].properties.rp + "m";
                    props = e.features[0].properties;

                    new mapboxgl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(
                            `
		                    <strong>Culvert</strong><br/>
		                    <strong>${rp}</strong><br/>
		                    <strong>Type: </strong>${props.cul_type}<br/>
		                    <strong>Number: </strong>${props.num}<br/>
		                    <strong>Diameter(mm): </strong>${props.dims}<br/>
		                    <strong>Length(m): </strong>${props.len_m}<br/>
		                    <strong>Notes: </strong> ${props.notes}<br/>
		                    
                    		`
                        )
                        .addTo(map);
                });
            }
        );
        map.addControl(new mapboxgl.ScaleControl());
        map.addControl(new mapboxgl.NavigationControl());
    });
