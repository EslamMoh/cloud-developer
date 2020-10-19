import { Request, Response } from 'express'

import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // filterimage Endpoint
  app.get( "/filteredimage", async ( req: Request, res: Response ) => {
    let image_url: string = req.query.image_url

    if (!image_url) {
      return res.status(400).send({ message: 'Image Url is required or malformed' });
    }

    let result = await filterImageFromURL(image_url)
    res.sendFile(result)
    setTimeout(function() {
      deleteLocalFiles([result]);
    }, 2000);
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req: Request, res: Response ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );


  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();