import { Router } from "express";
import CartManagerDB from '../dao/CartManagerDB.js';
import ProductManagerDB from '../dao/ProductManagerDB.js';

const cartsRouter = Router();
const CM = new CartManagerDB();
const PM = new ProductManagerDB();

// Create New Empty Cart
cartsRouter.post('/', async (req, res) => {
    const result = await CM.addCart();
    result['success'] ? res.status(201).send(result) : res.status(400).send({error: "Cart couldn't be created."});
});

// Modificar la ruta /:cid para que al traer todos los productos, los traiga completos 
// mediante un “populate”. De esta manera almacenamos sólo el Id, pero al solicitarlo 
// podemos desglosar los productos asociados. ✅
// Get Cart By Id
cartsRouter.get('/:cid', async (req, res) => {
    let cartId = req.params.cid;
    // La ruta se mantuvo igual, y el populate fue hecho en el getCartById de CartManagerDB 
    const carts = await CM.getCartById(cartId);
    carts['error'] ? res.status(400).send(carts) : res.send({carts});
});

// Add Product to Cart
cartsRouter.post('/:cid/product/:pid', async (req, res) => {
    let cartId = req.params.cid;
    let productId = req.params.pid;
    const product = await PM.getProductById(productId);
    if ( product['error'] ) return res.status(400).send(product);
    const result = await CM.AddProductToCart(cartId, productId);
    result['success'] ? res.status(201).send(result) : res.status(400).send(result);
});

// Además, agregar al router de carts los siguientes endpoints:
// DELETE api/carts/:cid deberá eliminar todos los productos del carrito ✅
cartsRouter.delete('/:cid', async (req, res) => {
    let cartId = req.params.cid;
    // Se creo el metodo emptyCartById en el CartManager
    const carts = await CM.emptyCartById(cartId);
    carts['error'] ? res.status(400).send(carts) : res.send({carts});
});

// DELETE api/carts/:cid/product/:pid deberá eliminar del carrito el producto seleccionado. ✅
cartsRouter.delete('/:cid/product/:pid', async (req, res) => {
    let cartId = req.params.cid;
    let productId = req.params.pid;
    // Se creo el metodo deleteProductFromCart en el CartManager
    const carts = await CM.deleteProductFromCart(cartId, productId);
    carts['error'] ? res.status(400).send(carts) : res.send({carts});
});

// PUT api/carts/:cid deberá actualizar el carrito con un arreglo de productos con el formato 
// especificado: Validando que los productos existan. ✅
// {
//     "products": [
//         {
//             "product": "660ed7704dd7a94115c3116f",
//             "quantity": 1
//         },
//         {
//             "product": "660f00764793046b28a1aef7",
//             "quantity": 3
//         }
//     ]
// }
cartsRouter.put('/:cid', async (req, res) => {
    let { products } = req.body;
    let cartId = req.params.cid;

    // For loop, for every product id in products array
    for (const item of products) {
        const productId = item.product;
        const product = await PM.getProductById(productId);
        if ( product['error'] ) return res.status(400).send(product);
    } // If all products exist, we continue with the update
    
    const carts = await CM.updateProductsFromCart(cartId, products);
    carts['error'] ? res.status(400).send(carts) : res.send({carts});
});

// PUT api/carts/:cid/product/:pid deberá poder actualizar SÓLO la cantidad de ejemplares 
// del producto por cualquier cantidad pasada desde req.body ✅
cartsRouter.put('/:cid/product/:pid', async (req, res) => {
    let { quantity } = req.body;
    let cartId = req.params.cid;
    let productId = req.params.pid;
    // Se creo el metodo updateProductQuantityFromCart en el CartManager
    const carts = await CM.updateProductQuantityFromCart(cartId, productId, quantity);
    carts['error'] ? res.status(400).send(carts) : res.send({carts});
});

export default cartsRouter;