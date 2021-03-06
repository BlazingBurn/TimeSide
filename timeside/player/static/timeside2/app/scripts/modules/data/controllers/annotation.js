define([
  '#qt_core/controllers/all'
],

/*
    Controller en charge de poster des annotations
**/
function (A) {
  'use strict';

  return Marionette.Controller.extend({
    initialize: function (options)	 {
      A._i.setOnCfg('annotationControlller',this);
    },

    onDestroy : function() {
     
     
    },

    /////////////////////////////////////////////////////////////////////
    // create a track
    createTrackAnnotation:function(callback) {
      var currentItem = A._i.getOnCfg('currentItem');
      var data = {item : currentItem.get('url')};

      return $.post(/*'http://timeside-dev.telemeta.org/timeside/api/annotation_tracks/'*/
        A.getApiUrl()+'/annotation_tracks/',data,function(a,b,c) {
        var model = new A.models.annotationTrack(a);
        if (!currentItem.get('annotationTracksObjects'))
          currentItem.set('annotationTracksObjects',[]);
        currentItem.get('annotationTracksObjects').add(model);

        return callback(model);

      });
    },

    /////////////////////////////////////////////////////////////////////
    // delete a track
    deleteTrackAnnotation:function(trackModel,callback) {
     /* var data = {
          track : track.get('url'),
          start_time : timeStart,
          stop_time : timeEnd,
          uuid : itemUUID,
          title : "Annotation Title",
          description : text
        };*/
        return $.ajax({
          url : /*'http://timeside-dev.telemeta.org/timeside/api/annotation_tracks/'*/
            A.getApiUrl()+'/annotation_tracks/'
              +trackModel.get('uuid'),
          type : 'DELETE'/*,
          data : data*/,
          success : function(res) {
            console.log('delete done');
            return callback();
          }
        });
        
    },

    /////////////////////////////////////////////////////////////////////
    // get updated data for a track
    udpateTrackDataFromServer:function(oldTrackObject,callback) {
      var urlAnnotation = oldTrackObject.get('url');
      $.get(urlAnnotation,function(res) {
        var item = A._i.getOnCfg('currentItem');

        //Replace in item
        var oldTrack = item.get('annotationTracksObjects').find(function(annotationTrack) {
          return annotationTrack.get('uuid')==oldTrackObject.get('uuid');
        });

        if (!oldTrack) {
          return console.error('udpateTrackDataFromServer : old track not found on : '+oldTrackObject.get('uuid'));
        }

        oldTrack.set('annotations',res.annotations);
        return callback(oldTrack); //du coup, on garde oldTrack comme objet dans le modèle
      });
    },

    /////////////////////////////////////////////////////////////////////
    // create Items

    postAnnotation:function(track,timeStart,timeEnd,text,callback) {
        var data = {
          track : track.get('url'),
          start_time : timeStart,
          stop_time : timeEnd,
          title : "Annotation Title",
          description : text
        };

        
        return $.post(/*'http://timeside-dev.telemeta.org/timeside/api/annotations/'*/
          A.getApiUrl()+'/annotations/',data,function(res) {
          console.log('post done');
          return callback();
        });

    },

    updateAnnotation:function(track,timeStart,timeEnd,text,itemUUID,callback) {
      var data = {
          track : track.get('url'),
          start_time : timeStart,
          stop_time : timeEnd,
          uuid : itemUUID,
          title : "Annotation Title",
          description : text
        };
        return $.ajax({
          url : /*'http://timeside-dev.telemeta.org/timeside/api/annotations/'*/
          A.getApiUrl()+'/annotations/'
            +itemUUID,
          type : 'PUT',
          data : data,
          success : function(res) {
            console.log('post done');
            return callback();
          }
        });
        
        

    }

     /////////////////////////////////////////////////////////////////////
    // Get One Item & nivigate to view
    
  

   

  });
});
