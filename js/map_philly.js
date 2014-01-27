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
            

            var query = "SELECT * FROM wp_import";
            
            // create query based on data from the layer
            if(title !== 'All' && queryType == 'query asset') {
              query = "SELECT * FROM wp_import WHERE type = '" + title + "'";
              }
            else if (title != 'All' && queryType == 'query permit') {
               switch (title) {
                    case "num_other_within_500ft":
                        query = "SELECT * FROM wp_import WHERE " + title + " > 0";
                        break;
                    case "within_300ft_res":
                        query = "SELECT * FROM wp_import WHERE " + title;
                        break;
                    case "face_rule":
                        query = "SELECT * FROM wp_import WHERE " + title;
                        break;
               }
                        
            }
              console.log(query);
              layer.setSQL(query);
            });
          }
 
          cartodb.createVis('map', 'http://cityscan.cartodb.com/api/v2/viz/d08269c0-8789-11e3-b179-0edd25b1ac90/viz.json')
            .done(function(vis, layers) {
              var subLayer = layers[1].getSubLayer(0);
              subLayer.setInteraction(true);
              subLayer.interactivity = 'id,title,route_id,lat,lon,altimeter,timestamp,width,height,type,face_count,operator,mount_type,display_permit,hansen_license_num,address,license_status,license_expiration_date,tag_string,image_filename,brt_id,num_other_within_500ft,within_300ft_res,face_rule,imageurl';
              createSelector(subLayer);
              map = vis.getNativeMap();

              // TODO: add hover tooltips for fields in infowindow sidebar
              subLayer.on('featureClick', function(e, latlng, pos, data, idx) {
                  console.log(data.cartodb_id);
                  $.getJSON(encodeURI('http://cityscan.cartodb.com/api/v2/sql/?q=SELECT id,title,route_id,lat,lon,altimeter,timestamp,width,height,type,face_count,operator,mount_type,display_permit,hansen_license_num,address,license_status,license_expiration_date,tag_string,image_filename,brt_id,num_other_within_500ft,within_300ft_res,face_rule,imageurl FROM wp_import WHERE cartodb_id = ' + data.cartodb_id), function(data) { 
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
              /*
            var cities = $('.dropdown-menu a');
            cities.click(function(e) {
                var link = e.target;
                switch (link.text) {
                    case 'Chicago (Exelon)':
                        // Mapbox doesn't seem to like this...
                        map.setView(L.latLng(41.9,-87.7));
                        break;
                    case 'Milwaukee':
                        // mil function goes here
                        console.log('Milwaukee');
                        break;
                    case 'Philadelphia':
                        // PHI function goes here
                        console.log('Philadelphia');
                        break;
                    case 'Washington, D.C.':
                        console.log('DC');
                        break;
                }
                console.log(link.text);
            });
            */
              
              });
  



