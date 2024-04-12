import express from 'express';
import handlebars from "express-handlebars";
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import __dirname from './utils/constantsUtil.js';
import { Server } from 'socket.io';
import websocket from './websocket.js';
import mongoose from 'mongoose';

const app = express();

//MongoDB connect
const uri = "mongodb+srv://guzh:Obx1BHkCra3bDkjI@cluster0.heazzce.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri);

//Handlebars Config
app.engine("handlebars", handlebars.engine());
app.set("views", `${__dirname}/../views`)
app.set("view engine", "handlebars");

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/static", express.static(`${__dirname}/../../public`));

//Routers
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

const PORT = 8080;
const httpServer = app.listen(PORT, () => {console.log(`Servidor activo en http://localhost:${PORT}`)});

const io = new Server(httpServer);

websocket(io);