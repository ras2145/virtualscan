$('document').ready( function() {

        // initialize status to "All"
        // set up event handler to watch for clicking buttons
        // if asset class is clicked, toggle it on and capture type
        // if permit status is clicked, toggle it on and capture type
        // if asset is toggled off, set asset_class to all but leave permit_status on; create SQL query
        // if permit status is toggled off, set permit_status to all but leave asset_class on; create SQL query
        //
        // create object of column names to query class, i.e. {'asviolation': 'permit'}
        // var title2column = {
        // 'permit': 'asviolation',
        // 'asset': 'type'
        // };
        //
        // $options[0].attributes['class'].value === "query asset" or "query permit"
        // if asset: sql = "SELECT * FROM nyc WHERE type = '" + title + "'";
        // if permit: sql = "SELECT * FROM nyc WHERE asviolation = '" + permit + "'";
        // if both: sql = "SELECT * FROM nyc WHERE type = '" + title + "' AND asviolation = '" + permit + "'";
        // if both, then toggle off one...
        


        function createSelector(layer) {
          var sql = new cartodb.SQL({ user: 'cityscan' });
          
          var $options = $('.query');
          $options.click(function(e) {
            // get the asset type
            // TODO: split this off as a function and return its value (asset_class) in this case
            // and pass it to another function that checks if anything else is toggled
            // before constructing SQL query
            var $a = $(e.target);
            var title = $a.attr('title');
            var queryType = $a.attr('class');
            
            //deselect all and select the clicked one
            $options.removeClass('selected');
            $a.addClass('selected');
            

            var query = "SELECT * FROM nyc";
            
            // create query based on data from the layer
            if(title !== 'All' && queryType == 'query asset') {
              query = "SELECT * FROM nyc WHERE type = '" + title + "'";
              }
            else if (title != 'All' && queryType == 'query permit') {
                query = "SELECT * FROM nyc WHERE asviolation = '" + title + "'";
            }
              layer.setSQL(query);
            });
          }

        var road = L.tileLayer('https://a.tiles.mapbox.com/v3/osaez.gkbm3gfn/{z}/{x}/{y}.png');
        var sat = L.tileLayer('http://a.tiles.mapbox.com/v3/osaez.gkblk7bk/{z}/{x}/{y}.png');
        
        var map = L.map('map', {
            center: new L.latLng(40.7397, -73.8896),
            zoom: 14,
        });
 
        var baseMaps = {
            'Satellite': sat,
            'Road': road
        };

        L.control.layers(baseMaps).setPosition('bottomleft').addTo(map);

        cartodb.createLayer(map, {
            user_name: 'cityscan',
            type: 'cartodb',
            sublayers: [
        
        {
                sql: "SELECT * FROM nyc",
                cartocss: "#nyc {marker-fill: blue;}",
                interactivity: "bin,lat,lon,address,asviolation,height_meters,imageurl,notes,permit_expiration_date,permit_issuance_date,type,width_meters,cartodb_id"
            }]
        }).addTo(map)
            .done(function(layer) {
                LAY = layer;
                layer.setZIndex(99);
                
                // needed to get cursor to turn to pointer when hovering over clickable map objects
                cartodb.vis.Vis.addCursorInteraction(map, layer);

                var subLayer = layer.getSubLayer(0);
                SUB = subLayer;
              createSelector(subLayer);

              // TODO: add hover tooltips for fields in infowindow sidebar
              subLayer.on('featureClick', function(e, latlng, pos, data, idx) {
                  $.getJSON(encodeURI('http://cityscan.cartodb.com/api/v2/sql/?q=SELECT bin,lat,lon,address,asviolation,height_meters,imageurl,notes,permit_expiration_date,permit_issuance_date,type,width_meters FROM nyc WHERE cartodb_id = ' + data.cartodb_id), function(data) {
                      $('#sidebar').html('');
                      $('#sidebar').append('<a href="' + data.rows[0].imageurl + '" target="_blank"><img src="' + data.rows[0].imageurl + '" height="250" width="300"></a>');
                      $.each(data.rows[0], function(key, val) {
                      $('#sidebar').append('<p>' + key + ': ' + val + '</p>');
                      });
                    });
                  // latlng parameter is where the mouse was clicked, not where the marker is
                  // the more you know...
              });
              subLayer.setInteraction(true);
              subLayer.infowindow.set('template', $('#infowindow_template').html());
             })
              .error(function(err) {
                console.log(err);
               });

              map.addLayer(sat, {insertAtTheBottom:true});
              map.addLayer(road, {insertAtTheBottom:true});


        /*
          cartodb.createVis('map', 'http://cityscan.cartodb.com/api/v2/viz/3cf649b6-7fa9-11e3-b800-ad11aa07e6f1/viz.json', {
                  zoom: 15
                  })
            .done(function(vis, layers) {
              var subLayer = layers[1].getSubLayer(0);
              createSelector(subLayer);
              map = vis.getNativeMap();

              // TODO: add hover tooltips for fields in infowindow sidebar
              subLayer.on('featureClick', function(e, latlng, pos, data, idx) {
                  $.getJSON(encodeURI('http://cityscan.cartodb.com/api/v2/sql/?q=SELECT bin,lat,lon,address,asviolation,height_meters,imageurl,notes,permit_expiration_date,permit_issuance_date,type,width_meters FROM nyc WHERE cartodb_id = ' + data.cartodb_id), function(data) {
                      $('#sidebar').html('');
                      $('#sidebar').append('<a href="' + data.rows[0].imageurl + '" target="_blank"><img src="' + data.rows[0].imageurl + '" height="250" width="300"></a>');
                      $.each(data.rows[0], function(key, val) {
                      $('#sidebar').append('<p>' + key + ': ' + val + '</p>');
                      });
                    });
                  // latlng parameter is where the mouse was clicked, not where the marker is
                  // the more you know...
              });
              subLayer.infowindow.set('template', $('#infowindow_template').html());
             })
              .error(function(err) {
                console.log(err);
               });
          */    
              });
  


