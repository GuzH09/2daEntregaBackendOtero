import { Router } from "express";
import ProductManagerDB from '../dao/ProductManagerDB.js';
import messageManagerDB from '../dao/MessageManagerDB.js';
import CartManagerDB from "../dao/CartManagerDB.js";
import productModel from "../dao/models/productModel.js";

const viewsRouter = Router();
const PM = new ProductManagerDB();
const CHM = new messageManagerDB();
const CM = new CartManagerDB();

// Show All Products
viewsRouter.get('/', async (req, res) => {
    let products = await PM.getProducts();
    res.render(
        "home",
        {
            products: products,
            style: "index.css"
        }
    );
});

// Crear una vista en el router de views ‘/products’ para visualizar 
// todos los productos con su respectiva paginación. ✅
// Cada producto mostrado puede resolverse de dos formas:
//     - Llevar a una nueva vista con el producto seleccionado 
//     con su descripción completa, detalles de precio, categoría, 
//     etc. Además de un botón para agregar al carrito.

//     - Contar con el botón de “agregar al carrito” directamente, 
//     sin necesidad de abrir una página adicional con los 
//     detalles del producto.
viewsRouter.get('/products', async (req, res) => {
    let { page = 1 } = req.query;
    page = parseInt(page);

    const result = await productModel.paginate({}, {page, limit: 5, lean: true});
    
    const baseURL = "http://localhost:8080/products";

    result.prevLink = result.hasPrevPage ? `${baseURL}?page=${result.prevPage}` : "";
    result.nextLink = result.hasNextPage ? `${baseURL}?page=${result.nextPage}` : "";
    result.title = "Productos";
    result.isValid = !(page <= 0 || page > result.totalPages);

    res.render(
        "products",
        {
            result,
            title: result.title,
            style: "products.css"
        }
    );
});

// Show All Products with Websockets
viewsRouter.get('/realtimeproducts', async (req, res) => {
    let products = await PM.getProducts();
    res.render(
        "realTimeProducts",
        {
            products: products,
            style: "realTimeProducts.css"
        }
    );
});

// Además, agregar una vista en ‘/carts/:cid (cartId) para visualizar 
// un carrito específico, donde se deberán listar SOLO los productos 
// que pertenezcan a dicho carrito. ✅
viewsRouter.get('/carts/:cid', async (req, res) => {
    let cartId = req.params.cid;
    const cart = await CM.getCartById(cartId);
    res.render(
        "cart",
        {
            id: cart._id.toString(),
            products: cart.products,
            style: "cart.css"
        }
    );
});

// Chat App with Websockets
viewsRouter.get('/chat', async (req, res) => {
    let messages = await CHM.getAllMessages();
    res.render(
        "chat",
        {
            messages: messages,
            style: "chat.css"
        }
    );
});

export default viewsRouter;