const db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const async = require("hbs/lib/async");
const { reject, promise } = require("bcrypt/promises");
const { response } = require("../app");
const { Db } = require("mongodb");
const moment = require("moment");
const ObjectId = require("mongodb").ObjectId;
const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: 'rzp_test_dvEiQE98PIBRAI',
 key_secret: 'RatXLbroi7okrk5DQHDQvwIh',
});

module.exports = {
  //------------------sign up check---------------------
  signUpCheck: (email) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      let Email = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: email.email });

      if (Email) {
        response.status = true;
        resolve(response);
      } else {
        resolve({ status: false });
      }
    });
  },

  //------------------login check---------------------
  loginCheck: (email) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      let Email = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: email.email });

      if (Email.status) {
        response.userstatus = true;
        resolve(response);
      } else {
        resolve({ userstatus: false });
      }
    });
  },

  //------------------sign up ---------------------

  doSignUp: (userData) => {
    return new Promise(async (resolve, reject) => {
      console.log("bcrypt");
      userData.password = await bcrypt.hash(userData.password, 10);
      userData.status = true;
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          resolve(data);
        });
    });
  },

  //------------------login ---------------------
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let loginStatus = false;

      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            response.user = user;
            response.status = true;
            resolve(response);
            console.log("Login succesful");
          } else {
            resolve({ status: false });
            console.log("Login failed");
          }
        });
      } else {
        resolve({ status: false });
        console.log("Login failed");
      }
    });
  },
  doPasswordCheck:(userData,bodyData)=>{
return new Promise(async(resolve,reject)=>{
  console.log(bodyData.oldPassword);
   console.log("0------------00000");

 await bcrypt.compare(bodyData.old_password, userData.password ).then((status) => {
   console.log(status);
   console.log("0000000000000");
  let response={}
   
    if (status) {
    
      response.status = true;
      resolve(response);
      console.log("Login succesful");
    } else {
      resolve({ status: false });
      console.log("Login failed");
    }
  })




})


  },
  changePassword:(userData,dataBody)=>{
  return new Promise(async(resolve,reject)=>{
    console.log("++++++++++++++++++++++++");
    console.log(dataBody);
    console.log("++++++++++++++++++++++++");

  let password = await bcrypt.hash(dataBody.password,10)

  await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userData._id)},{
    $set:{
       password:password
    }
  },{upsert:true}).then(
    resolve({status:true})
  )


  })



  }
  
  ,

  getPhone: (email) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: email })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getUserData: (userId) => {
    return new Promise(async (resolve, reject) => {
      let userData = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectId(userId) });

      resolve(userData);
    });
  },

  addNewAddress: (data, userId) => {
    data.userId = ObjectId(userId);

    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .insertOne(data)
        .then(resolve());
    });
  },
  getDefaultAddress: (id) => {
    return new Promise(async (resolve, reject) => {
      let address = await db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .findOne({ _id: ObjectId(id) });
      console.log(address);
      console.log("9999999999999");
      resolve(address);
    });
  },
  getAddress: (id) => {
    return new Promise(async (resolve, reject) => {
      let addresses = await db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .find({ userId: ObjectId(id) })
        .toArray();
      console.log(addresses);

      resolve(addresses);
    });
  },
  deleteAddress: (id) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .deleteOne({ _id: ObjectId(id) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  updateAddress: (id, data) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: {
              name: data.name,
              email: data.email,
              address: data.address,
              pincode: data.pincode,
              phone: data.phone,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  editProfile: (data, img, userId) => {
    console.log(data);
    console.log("2222222222222222222");

    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: {
              name: data.name,
              email: data.email,
              phone: data.phone,
              image: img.image,
            },
          },
          {
            upsert: true,
          }
        ).then(
          resolve()
        );
    });
  },

  //------------------add to cart helper---------------------

  getCartCount: (id) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(id) });

      if (cart) {
        count = cart.products.length;
      }

      resolve(count);
    });
  },
  addToCart: (proId, userId, product) => {
    let proObj = {
      item: ObjectId(proId),
      quantity: 1,
      productName: product.name,
      productPrice: product.price,
      productImage: product.images[0],
    };

    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });

      if (userCart) {
        let proExist = userCart.products.findIndex(
          (product) => product.item == proId
        );

        if (proExist != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              {
                user: ObjectId(userId),
                "products.item": ObjectId(proId),
              },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: ObjectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: ObjectId(userId),
          products: [proObj],
        };

        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then(() => {
            resolve();
          });
      }
    });
  },

  //------------------get product details --------------------

  getProductDetails: (id) => {
    console.log(id);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: ObjectId(id) })
        .then((data) => {
          resolve(data);
        });
    });
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();

      console.log("*****************");
      resolve(cartItems);
    });
  },

  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);
    // console.log(details);
    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              _id: ObjectId(details.cart),
            },
            {
              $pull: { products: { item: ObjectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              _id: ObjectId(details.cart),
              "products.item": ObjectId(details.product),
            },
            {
              $inc: { "products.$.quantity": details.count },
            }
          )
          .then((response) => {
            resolve({ status: true });
          });
      }
    });
  },
  removeCartProduct: (details) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          {
            _id: ObjectId(details.cart),
          },
          {
            $pull: { products: { item: ObjectId(details.product) } },
          }
        )
        .then((response) => {
          resolve({ removeCartProduct: true });
        });
    });
  },

  getCartProductTotal: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartProductTotalAmount = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          // {
          //   $group: {
          //     _id: null,
          //     total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
          //   }
          // }
        ])
        .toArray();
if(cartProductTotalAmount[0].total==undefined){
  resolve({status:true})
}else{
  console.log(cartProductTotalAmount);

        console.log("************asdasdfasdf*****");
        console.log(cartProductTotalAmount[0].total);
  
        resolve(cartProductTotalAmount[0].total);
}
      


        
     
    });
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
  let cartTotalAmount=     await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$product.price"] } },
            },
          },
        ])
        .toArray()
     
 console.log(cartTotalAmount[0]);

          if(cartTotalAmount[0]===undefined){
            resolve()
          }else{
            resolve( cartTotalAmount[0].total)
          }
    

        });

      // console.log("************asdasdfasdf*****");
      // console.log(cartTotalAmount[0].total);

     

  },
  //*****************************get  CArt product TOtal ------------------- */
  getCartProductTotal: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartProductTotal = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $project: {
              total: { $sum: { $multiply: ["$quantity", "$product.price"] } },
            },
          },
        ])
        .toArray();

      console.log(cartProductTotal);

      console.log("************asdasdfasdf*****");
      console.log(cartProductTotal);

      resolve(cartProductTotal);
    });
  },

  // ------------------place order--------------------
  placeOrder: (order, products, total) => {
    return new Promise(async (resolve, reject) => {
      
      let status = order["payment_method"] === "cod" ? "placed" : "pending";


      let orderObj = {
        deliveryDetails: {
          name: order.name,
          mobile: order.phone,
          address: order.address,
          email: order.email,
          pincode: order.pincode,
        },
        userId: ObjectId(order.userId),
        paymentMethod: order["payment_method"],
        products: products,
        totalAmount: total,
        date: moment().format("L"),
        time: moment().format(),
        status: status,
      };

      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          db.get()
            .collection(collection.CART_COLLECTION)
            .deleteOne({ user: ObjectId(order.userId) });
            console.log('333333333333333333333333333');
          console.log(response.insertedId.toString());
          resolve( response.insertedId.toString());
        });
    });


  },

  //---------------------razor Pay integration------------------

generateRazorPay:(orderId,totalPrice)=>{
  return new Promise((resolve,rject)=>{
    var options = {
      amount: totalPrice,  // amount in the smallest currency unit
      currency: "INR",
      receipt: orderId
    };
    instance.orders.create(options, function(err, order) {
      console.log("new order"); 
      console.log(order);
      resolve(order)
    });
  })

},



  
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      console.log(products);
      resolve(products);
    });
  },

  getOrderByUser: (user) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: ObjectId(user._id) })
        .sort({ time: -1 })
        .toArray();
      console.log(orders);
      resolve(orders);
    });
  },
  cancelOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderId) },
          {
            $set: {
              status: "cancelled",
            },
          }
        )
        .then(resolve());
    });
  },
  shipOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderId) },
          {
            $set: {
              status: "shipped",
            },
          }
        )
        .then(resolve());
    });
  },
};
