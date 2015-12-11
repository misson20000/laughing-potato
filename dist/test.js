(function(name,data){
 if(typeof onTileMapLoaded === 'undefined') {
  if(typeof TileMaps === 'undefined') TileMaps = {};
  TileMaps[name] = data;
 } else {
  onTileMapLoaded(name,data);
 }})("test",
{ "height":32,
 "layers":[
        {
         "compression":"zlib",
         "data":"eJzllFsKwEAIA7P3v3T\/pZatiYZ2BVlKwZnYxwKwzI3kZOfFmQj3pvnZ7Oj25Mrmn3yeHbvd5ccdTvIns8WcDm63R6WcbJUDW6fzWQdVuflVh9P5f3oH3N+B+1\/wdT7joWJXHNTsjo6uCu+7mdlOkJwsf3f2ZP43rtP5kVwz+TuyKfsCVRsCnw==",
         "encoding":"base64",
         "height":32,
         "name":"Tile Layer 1",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":32,
         "x":0,
         "y":0
        }],
 "nextobjectid":1,
 "orientation":"orthogonal",
 "properties":
    {

    },
 "renderorder":"right-down",
 "tileheight":16,
 "tilesets":[
        {
         "firstgid":1,
         "image":"devtile.png",
         "imageheight":16,
         "imagewidth":16,
         "margin":0,
         "name":"devtile",
         "properties":
            {
             "asset":"tiles.dev"
            },
         "spacing":0,
         "tilecount":9,
         "tileheight":16,
         "tilewidth":16
        }],
 "tilewidth":16,
 "version":1,
 "width":32
});